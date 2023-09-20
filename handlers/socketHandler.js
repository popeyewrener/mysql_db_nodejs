const { json } = require("express");
const getFormattedTimestamp = require("../utils/timestamp");
const { mysqlobject } = require("../db_connector/mysql_connector");
const { coinsocketfunction } = require("../functions/coin_socket_function");
const { getUserPurchased } = require("../functions/get_user_coin_purchased");
const { getUserHistory } = require("../functions/get_user_history");
const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;
let usertableName = "tbl_users";
let gametracktable = "teenpatti_transactions";
    
handleSocket = (io,socket)=>{
    socket.on("sendMessage", (message)=>{
        io.emit("recieveMessage", message);
    });
    
    socket.on('transaction', coinsocketfunction);

    socket.on('getUserPurchased', getUserPurchased); 

    socket.on("getUserHistory",getUserHistory );

    
   

}
module.exports = {handleSocket}
