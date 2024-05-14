const { mysqlobject } = require("../db_connector/mysql_connector");

const timerdbtable = "audio_room_timings";

const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;

async function timerDbPush(dataList, ack) {
    // Input validation: Ensure we have an array of data
    if (!Array.isArray(dataList.timers)) {
        console.error("Error: Invalid data format. Expected an array.");
        ack({ error: "Invalid data format." });
        return;
    }

    try {
        const connection = await mysqlobject(
            mysql_host,
            mysql_port,
            mysql_username,
            mysql_password,
            mysql_db
        );
        const timerdata = dataList.timers;

        const roomOwner = dataList.roomOwner;

        const insertQuery = `INSERT INTO ${timerdbtable} (roomId, time, userId, roomOwner) VALUES ?`; 

        const values = timerdata.map(data => [data.roomId, data.timer, data.userId, roomOwner]); // Create value array for prepared statement

        await connection.query(insertQuery, [values]); // Execute prepared statement

        ack({ success: true });
        connection.end();
    } catch (error) {
        console.error("Error in inserting data:", error); // Log error object for debugging
        ack({ error: "Error in inserting data. Please check the logs." }); 
        connection.end(); // Ensure connection is closed even on error
    }
}

module.exports = { timerDbPush };
