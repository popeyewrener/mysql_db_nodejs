
const receive_table = "tbl_totel_receive_record";
const sending_table = "tbl_totel_sending_record";
const audio_gifts_data = "lucky_gifts_data";

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

let luckygiftlotterytransaction = async (data, ack) => {
    
    const { amount, winner, giftName, giftUrl, roomId, roomOwner, type } = data;
    
    let getdataquery = `SELECT purchased FROM ${userTable} WHERE user_id = ? FOR UPDATE`;
    
    
    if (type == "audio"){
        try {
            const connection = await mysqlobject(
                mysql_host,
                mysql_port,
                mysql_username,
                mysql_password,
                mysql_db
              );
    
            await connection.beginTransaction();
    
            const [senderResults] = await connection.execute(getdataquery, [winner]);
            let userdata = senderResults[0];
            let curr_purchased = userdata["purchased"];  
    
            let final_coins = curr_purchased + amount;
            let logdata = {
                "senderId":winner,
                "receiverId":winner,
                "amount":amount,
                "giftName":giftName,
                "giftUrl":giftUrl,
                "roomId":roomId,
                "roomOwner":roomOwner,
                "type":"audio_win",
                //"timestamp":getCurrentTimeFormatted()
            }
            let insertQuery = `INSERT INTO ${audio_gifts_data} SET ?`;
            await connection.query(insertQuery, logdata);
    
            let updateQuery = `UPDATE ${userTable} SET purchased = ? WHERE user_id = ?`;
            await connection.execute(updateQuery, [final_coins, winner]);
    
            await connection.commit();
            ack({ "success_id": 200 });
            await connection.end();
        }
        catch (error) {
            console.error('Error in transaction:', error);
            ack({ "error": "Transaction error", "data": error });
    
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
    else if (type == "video"){
        try {
            const connection = await mysqlobject(
                mysql_host,
                mysql_port,
                mysql_username,
                mysql_password,
                mysql_db
              );
    
            await connection.beginTransaction();
    
            const [senderResults] = await connection.execute(getdataquery, [winner]);
            let userdata = senderResults[0];
            let curr_purchased = userdata["purchased"];  
    
            let final_coins = curr_purchased + amount;
            let logdata = {
                "senderId":winner,
                "receiverId":winner,
                "amount":amount,
                "giftName":giftName,
                "giftUrl":giftUrl,
                "roomId":roomId,
                "roomOwner":roomOwner,
                "type":"video_win",
                //"timestamp":getCurrentTimeFormatted()
            }
            let insertQuery = `INSERT INTO ${audio_gifts_data} SET ?`;
            await connection.query(insertQuery, logdata);
    
            let updateQuery = `UPDATE ${userTable} SET purchased = ? WHERE user_id = ?`;
            await connection.execute(updateQuery, [final_coins, winner]);
    
            await connection.commit();
            ack({ "success_id": 200 });
            await connection.end();
        }
        catch (error) {
            console.error('Error in transaction:', error);
            ack({ "error": "Transaction error", "data": error });
    
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
}

module.exports = { luckygiftlotterytransaction }
