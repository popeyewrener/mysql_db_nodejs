

const receive_table = "tbl_totel_receive_record";
const sending_table = "tbl_totel_sending_record";
const audio_gifts_data = "audio_gifts_data";

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
let audioTransaction = async (data, ack) => {

    const {  amount, senderId, recieverId, giftName, giftUrl } = data;
    console.log(data);

    let getdataquery = `SELECT purchased FROM ${userTable} WHERE user_id = ${senderId}`;
    let getRecieverDataQuery = `SELECT purchased FROM ${userTable} WHERE user_id = ${recieverId}`;
    
    try{
        const connection = await mysqlobject(
            mysql_host,
            mysql_port,
            mysql_username,
            mysql_password,
            mysql_db
          );
          const [results] = await connection.query(getdataquery);
          let userdata = results[0];
          let curr_purchased = userdata["purchased"];  
            const [recieverResults] = await connection.query(getRecieverDataQuery);
            let recieverData = recieverResults[0];
            let recieverPurchased = recieverData["purchased"];
            let final_coins = curr_purchased - amount;
            let reciever_final_coins = recieverPurchased + amount;
            
            if (final_coins >= 0) {
                let logdata = {
                    "senderId":senderId,
                    "receiverId":recieverId,
                    "gift_amount":amount,
                    "giftName":giftName,
                    "giftUrl":giftUrl
                }

                let receive_data ={
                    "user_id":recieverId,
                    "receive_amount":amount,
                    "receive_from": senderId,
                    "prev_balance":recieverPurchased,
                    "after_balance":reciever_final_coins,
                    "create_at": getCurrentTimeFormatted()

                }
                let sending_data ={
                    "user_id":senderId,
                    "send_amount":amount,
                    "send_to": recieverId,
                    "prev_balance":curr_purchased,
                    "after_balance":final_coins,
                    "sent_at": getCurrentTimeFormatted()
                }



                let updateSenderQuery = `UPDATE ${userTable} SET purchased = ${final_coins} WHERE user_id = ${senderId}`;
                let updateRecieverQuery = `UPDATE ${userTable} SET purchased = ${reciever_final_coins} WHERE user_id = ${recieverId}`;
                let transactionlog_query = `INSERT INTO ${audio_gifts_data} SET ?`;
                await connection.query(updateSenderQuery).then(async (result)=>{
                    await connection.query(updateRecieverQuery).then(async (result)=>{
                        await connection.query(transactionlog_query,logdata).then(async (result)=>{
                            await connection.query(`INSERT INTO ${receive_table} SET ?`,receive_data).then(async (result)=>{
                                await connection.query(`INSERT INTO ${sending_table} SET ?`,sending_data).then(async (result)=>{
                                    ack({  "success_id": 200 });
                                }).catch((e)=>{
                                    console.log(e);
                                    ack({  "error": "Error in sending data", "data": e });


                                });
                            }).catch((e)=>{
                                console.log(e);
                                ack({  "error": "Error in recieve data" });
                            });

                        }).then((e)=>{
                            ack({  "error": "Error in transaction log" });
                        });


                    }).catch((e)=>{
                        console.log(e);
                        ack({  "error": "Error in update reciever" });
                    });
                }).catch((e)=>{
                    console.log(e);
                    ack({  "error": "Error in update sender" });
                });
                
               
                
            } else {
                ack({ "error": "not sufficient coins" })
            }

            connection.end((err) => {
                if (err) {
                  console.error('Error closing MySQL connection:', err);
                } else {
                  console.log('MySQL connection closed');
                }
              });




    }catch(e){}



}

module.exports = {audioTransaction}


