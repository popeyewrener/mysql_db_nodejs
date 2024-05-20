
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

let luckygiftTransaction = async (data, ack) => {
    
    const { amount, senderId, recieverId, giftName, giftUrl, roomId, roomOwner, type, dealer_profit_percentage } = data;
    let senderCommision = dealer_profit_percentage / 100;

    console.log(data);

    let getdataquery = `SELECT purchased FROM ${userTable} WHERE user_id = ? FOR UPDATE`;
    let getRecieverDataQuery = `SELECT my_wallet FROM ${userTable} WHERE user_id = ? FOR UPDATE`;
    
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
    
            const [senderResults] = await connection.execute(getdataquery, [senderId]);
            let userdata = senderResults[0];
            let curr_purchased = userdata["purchased"];  
    
            const [recieverResults] = await connection.execute(getRecieverDataQuery, [recieverId]);
            let recieverData = recieverResults[0];
            let recievermyWallet = recieverData["my_wallet"];
            
            let final_coins = curr_purchased - amount;
            let reciever_final_coins = recievermyWallet + (amount * senderCommision);
            
            if (final_coins >= 0) {
                let logdata = {
                    "senderId": senderId,
                    "receiverId": recieverId,
                    "amount": amount,
                    "giftName": giftName,
                    "giftUrl": giftUrl,
                    "roomId": roomId,
                    "roomOwner": roomOwner,
                    "type": type
                }
                console.log("Logdata",logdata);
    
                let receive_data = {
                    "user_id": recieverId,
                    "receive_amount": amount,
                    "receive_from": senderId,
                    "prev_balance": recievermyWallet,
                    "after_balance": reciever_final_coins,
                    "create_at": getCurrentTimeFormatted()
                }
    
                let sending_data = {
                    "user_id": senderId,
                    "send_amount": amount,
                    "send_to": recieverId,
                    "prev_balance": curr_purchased,
                    "after_balance": final_coins,
                    "sent_at": getCurrentTimeFormatted()
                }
    
                let updateSenderQuery = `UPDATE ${userTable} SET purchased = ? WHERE user_id = ?`;
                let updateRecieverQuery = `UPDATE ${userTable} SET my_wallet = ? WHERE user_id = ?`;
                let transactionlog_query = `INSERT INTO ${audio_gifts_data} (senderId, receiverId,  giftName, amount, giftUrl, roomOwner, roomId,  type, timestamp)
                VALUES (100,111,"test", 100, "test", 222, "test", "audio", "2021-09-01 12:00:00")`;
    
                await connection.execute(updateSenderQuery, [final_coins, senderId]);
                await connection.execute(updateRecieverQuery, [reciever_final_coins, recieverId]);
                await connection.execute(transactionlog_query);
                await connection.execute(`INSERT INTO ${receive_table} SET ?`, [receive_data]);
                await connection.execute(`INSERT INTO ${sending_table} SET ?`, [sending_data]);
    
                await connection.commit();
                ack({ "success_id": 200 });
            } else {
                ack({ "error": "not sufficient coins" });
            }
    
            connection.end((err) => {
                if (err) {
                  console.error('Error closing MySQL connection:', err);
                } else {
                  console.log('MySQL connection closed');
                }
              });
        } catch (error) {
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
    
            const [senderResults] = await connection.execute(getdataquery, [senderId]);
            let userdata = senderResults[0];
            let curr_purchased = userdata["purchased"];  
    
            const [recieverResults] = await connection.execute(getRecieverDataQuery, [recieverId]);
            let recieverData = recieverResults[0];
            let recievermyWallet = recieverData["my_wallet"];
            
            let final_coins = curr_purchased - amount;
            let reciever_final_coins = recievermyWallet + amount * senderCommision;
            
            if (final_coins >= 0) {
                let logdata = {
                    "senderId": senderId,
                    "receiverId": recieverId,
                    "amount": amount,
                    "giftName": giftName,
                    "giftUrl": giftUrl,
                    "roomId": roomId,
                    "roomOwner": roomOwner,
                    "type": type
                }
    
                let receive_data = {
                    "user_id": recieverId,
                    "receive_amount": amount,
                    "receive_from": senderId,
                    "prev_balance": recievermyWallet,
                    "after_balance": reciever_final_coins,
                    "create_at": getCurrentTimeFormatted()
                }
    
                let sending_data = {
                    "user_id": senderId,
                    "send_amount": amount,
                    "send_to": recieverId,
                    "prev_balance": curr_purchased,
                    "after_balance": final_coins,
                    "sent_at": getCurrentTimeFormatted()
                }
    
                let updateSenderQuery = `UPDATE ${userTable} SET purchased = ? WHERE user_id = ?`;
                let updateRecieverQuery = `UPDATE ${userTable} SET my_wallet = ? WHERE user_id = ?`;
                let transactionlog_query = `INSERT INTO ${audio_gifts_data} SET ?`;
    
                await connection.execute(updateSenderQuery, [final_coins, senderId]);
                await connection.execute(updateRecieverQuery, [reciever_final_coins, recieverId]);
                await connection.execute(transactionlog_query, [logdata]);
                await connection.execute(`INSERT INTO ${receive_table} SET ?`, [receive_data]);
                await connection.execute(`INSERT INTO ${sending_table} SET ?`, [sending_data]);
    
                await connection.commit();
                ack({ "success_id": 200 });
            } else {
                ack({ "error": "not sufficient coins" });
            }
    
            await connection.end();
        } catch (error) {
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

module.exports = { luckygiftTransaction }
