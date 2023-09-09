const express = require("express");
const http = require("http");
const { mysqlobject } = require("./db_connector/mysql_connector");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser")
const server = http.createServer(app);
const dotenv = require("dotenv").config();
const port = process.env.PORT;
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;
let sqlobject;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
//sqlobject = mysqlobject(mysql_host, mysql_port, mysql_username,mysql_password, mysql_db);
console.log(sqlobject);
app.get("/", (req,res)=>{
    res.send("You visited the website");
});
app.post("/coin/change/", async (req,res)=>{
    let reqBody = req.body;
    let test_num = reqBody.test_num;
    let newData = {"test_num":test_num};
    let tableName = "for_testing";
    try {
        const connection = await mysqlobject(mysql_host, mysql_port, mysql_username,mysql_password, mysql_db);
        connection.query(`INSERT INTO ${tableName} SET ?`, newData, (error, results) => {
            if (error) {
              console.error('Error inserting a new row:', error);
            } else {
              console.log(`New row inserted with ID: ${results.insertId}`);
            }});
        // You can use the 'connection' object for database queries here
    
        // Don't forget to close the connection when you're done
        connection.end();
      } catch (error) {
        console.error('Error:', error);
      }
    
    res.send("succesfully added")    

});


server.listen(port, async ()=>{
    console.log(`Server running at PORT:${port}`)
    


})