//express
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const coinRoute = require("./routes/coin_route");
const server = http.createServer(app);
const dotenv = require("dotenv").config();
const port = process.env.PORT;

//socket io
const socket = require("socket.io");
const socketentryController = require("./controllers/socket_controllers/socketentryController");
const io = socket(server);

let sqlobject;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
//sqlobject = mysqlobject(mysql_host, mysql_port, mysql_username,mysql_password, mysql_db);
const socketController = new socketentryController(io);
app.get("/", (req,res)=>{
    res.send("You visited the website");
});
app.use("/coin/change/", coinRoute);


server.listen(port, async ()=>{
    console.log(`Server running at PORT:${port}`)
    


})