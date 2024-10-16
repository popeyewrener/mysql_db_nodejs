
const receive_table = "tbl_totel_receive_record";
const sending_table = "tbl_totel_sending_record";
const audio_gifts_data = "lucky_gifts_data";
const spin_wheel_table = "spin_wheel_transaction";

const userTable = "tbl_users";
const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;

const getFormattedTimestamp = () => {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

const { mysqlobject } = require("../db_connector/mysql_connector");
function getCurrentTimeFormatted() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}



let spinwheelTransaction = async (data, ack) => {


    const { amount, userId, multiplier } = data;
    let getdataquery = `SELECT purchased FROM ${userTable} WHERE user_id = ? FOR UPDATE`;

    try {
        const connection = await mysqlobject(
            mysql_host,
            mysql_port,
            mysql_username,
            mysql_password,
            mysql_db
          );

        await connection.beginTransaction();

        const [results] = await connection.execute(getdataquery, [userId]);
        let userdata = results[0];
        let curr_purchased = userdata["purchased"];

        let final_coins = (curr_purchased - amount ) + (amount * multiplier);
        let logdata = {
            "user_id": userId,
            "previous_balance": curr_purchased,
            "end_balance": final_coins,
            "amount": amount,
            "timestamp": getFormattedTimestamp(),
            "multiplier": multiplier,
            
        }
        let updateQuery = `UPDATE ${userTable} SET purchased = ? WHERE user_id = ?`;
        let transactionlog_query = `INSERT INTO ${spin_wheel_table} SET ?`;

        await connection.execute(updateQuery, [final_coins, userId]);
        await connection.query(transactionlog_query, logdata);

        await connection.commit();
        ack({ "success_id": userId, "final_coins": final_coins });
        await connection.end();
    }
    catch (error) {
        console.error('Error in transaction:', error);
        ack({ "error": "Transaction error", "data": error, "userId": userId});

        if (connection) {
            try {
                await connection.rollback();
                await connection.end();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
    }
}


module.exports = { spinwheelTransaction }
