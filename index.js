const express = require("express");
const http = require("http");
const { mysqlobject } = require("./db_connector/mysql_connector");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv").config();
const port = process.env.PORT;
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;


app.get("/", (req,res)=>{
    res.send("You visited the website");
})
server.listen(port, ()=>{
    console.log(`Server running at PORT:${port}`)
    let sqlobject = mysqlobject(mysql_host, mysql_port, mysql_username,mysql_password, mysql_db);
    console.log(sqlobject);


})