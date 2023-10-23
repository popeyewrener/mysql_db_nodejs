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
    LIMIT 20;
  `;
  const newQuery = ``
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
let getUserHistorynew = async(data, ackCallback)=>{
      let reqBody = data;
      reqBody = JSON.parse(reqBody);
      let user_id = reqBody.id;
      const query = `
      SELECT
    gameName,
    SUM(CASE WHEN transaction_type = 'credit' THEN transaction_amount ELSE 0 END) AS total_credit,
    SUM(CASE WHEN transaction_type = 'debit' THEN transaction_amount ELSE 0 END) AS total_debit
FROM (
    SELECT DISTINCT TOP 10 CAST(SUBSTRING(gameName, PATINDEX('%[0-9]%', gameName), LEN(gameName)) AS INT) AS numeric_id
    FROM teenpatti_transaction
    ORDER BY numeric_id DESC
    WHERE user_id = 7
) AS last_10_persons
JOIN your_table_name
ON CAST(SUBSTRING(gameName, PATINDEX('%[0-9]%', gameName), LEN(gameName)) AS INT) = CAST(SUBSTRING(your_table_name.gameName, PATINDEX('%[0-9]%', your_table_name.gameName), LEN(your_table_name.gameName)) AS INT)
GROUP BY gameName

    `;
    const newQuery = ``
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