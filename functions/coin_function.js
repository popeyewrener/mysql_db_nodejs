const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;

const getFormattedTimestamp = require("../utils/timestamp");
const { mysqlobject } = require("./../db_connector/mysql_connector");

let coinfunction = async (req, res) => {
  let reqBody = req.body;
  let user_id = reqBody.id;
  let fetch_coin = reqBody.coin;
  let gamename = reqBody.gamename;
  let type = reqBody.type;

  let usertableName = "tbl_users";
  let gametracktable = "teenpatti_transactions";
  let getdataquery = `SELECT purchased FROM ${usertableName} WHERE user_id = ${user_id}`;

  try {
    const connection = await mysqlobject(
      mysql_host,
      mysql_port,
      mysql_username,
      mysql_password,
      mysql_db
    );

    // Execute the SELECT query using the promise-based 'query' method
    const [results] = await connection.query(getdataquery);

    let userdata = results[0];
    let curr_purchased = userdata["purchased"];

    if (type == "credit") {
      let final_coins = curr_purchased + fetch_coin;
      let logdata = {
        "user_id":user_id,
        "previous_balance":curr_purchased,
        "end_balance":final_coins,
        "amount":fetch_coin,
        "timestamp":getFormattedTimestamp(),
        "type":type,
        "gameName":gamename
    }
      let updateQuery = `UPDATE ${usertableName} SET purchased = ${final_coins} WHERE user_id = ${user_id}`;
      let transactionlog_query = `INSERT INTO ${gametracktable} SET ?`;
      // Execute the UPDATE query using the promise-based 'query' method
      await connection.query(updateQuery);
      await connection.query(transactionlog_query,logdata);

      res.status(200).json({ "success_id": user_id });
    } else if (type == "debit") {
      let final_coins = curr_purchased - fetch_coin;

      if (final_coins >= 0) {
        let logdata = {
            "user_id":user_id,
            "previous_balance":curr_purchased,
            "end_balance":final_coins,
            "amount":fetch_coin,
            "timestamp":getFormattedTimestamp(),
            "type":type,
            "gameName":gamename
        }
        let updateQuery = `UPDATE ${usertableName} SET purchased = ${final_coins} WHERE user_id = ${user_id}`;
        let transactionlog_query = `INSERT INTO ${gametracktable} SET ?`;


        // Execute the UPDATE query using the promise-based 'query' method
        await connection.query(updateQuery);
        await connection.query(transactionlog_query,logdata);

        

        res.status(200).json({ "success_id": user_id });
      } else {          
        res.status(401).json({ "error": "not sufficient coins" });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ "error": error.message });
  }
};

module.exports = { coinfunction };
