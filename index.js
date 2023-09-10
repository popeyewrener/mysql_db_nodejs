const express = require("express");
const http = require("http");
const { mysqlobject } = require("./db_connector/mysql_connector");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const coinRoute = require("./routes/coin_route");
const server = http.createServer(app);
const dotenv = require("dotenv").config();
const port = process.env.PORT;

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
app.post("/coin/change/", coinRoute);


server.listen(port, async ()=>{
    console.log(`Server running at PORT:${port}`)
    


})