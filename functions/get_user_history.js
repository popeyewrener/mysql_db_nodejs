const { json } = require("express");
const getFormattedTimestamp = require("../utils/timestamp");
const { mysqlobject } = require("../db_connector/mysql_connector");
const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;
let usertableName = "tbl_users";
let gametracktable = "teenpatti_transactions";
let getUserHistory = async(data, ackCallback)=>{
    let reqBody = data;
    reqBody = JSON.parse(reqBody);
    let user_id = reqBody.id;
    const query = `
    SELECT gameName, SUM(amount) AS total_amount, type
    FROM ${gametracktable}
    WHERE user_id = ${user_id}
    GROUP BY gameName, type
    ORDER BY timestamp DESC
    LIMIT 10;
  `;
    try{
        
        const connection = await mysqlobject(
        mysql_host,
        mysql_port,
        mysql_username,
        mysql_password,
        mysql_db
        );
        const [results] = await connection.query(query);

        let gamedata = results;
       console.log(gamedata);
       console.log(gamedata.length)
        
        connection.end((err) => {
            if (err) {
              console.error('Error closing MySQL connection:', err);
            } else {
              console.log('MySQL connection closed');
            }
          });
          ackCallback({"history":gamedata});


    }
    catch(error){
        ackCallback({ "error": error.message });
    }


    
    }

    module.exports = {getUserHistory}