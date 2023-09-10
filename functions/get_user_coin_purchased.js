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
let getUserPurchased = async(data, ackCallback)=>{
    let reqBody = data;
    reqBody = JSON.parse(reqBody);
    let user_id = reqBody.id;
    let getdataquery = `SELECT purchased FROM ${usertableName} WHERE user_id = ${user_id}`;
    try{
        let starttime = Date.now();
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
        ackCallback({"purchased":curr_purchased});


    }
    catch(e){
        ackCallback({"error":e})
    }


    
    }

    module.exports = {getUserPurchased}