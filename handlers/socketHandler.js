const { json } = require("express");
const getFormattedTimestamp = require("../utils/timestamp");
const { mysqlobject } = require("../db_connector/mysql_connector");
const { coinsocketfunction } = require("../functions/coin_socket_function");
const { getUserPurchased } = require("../functions/get_user_coin_purchased");
const { getUserHistory } = require("../functions/get_user_history");
const { audioTransaction } = require("../functions/audio_transaction");
const { timerDbPush } = require("../functions/timer_db_push");
const { luckygiftTransaction } = require("../functions/luckygift_transaction");
const dotenv = require("dotenv").config();
const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;
let usertableName = "tbl_users";
let gametracktable = "teenpatti_transactions";
const roomTimers = {}; 
handleSocket = (io,socket)=>{
    socket.on("sendMessage", (message)=>{
        io.emit("recieveMessage", message);
    });
    
    socket.on('transaction', coinsocketfunction);

    socket.on('audioTransaction', audioTransaction);

    socket.on('audiotimerDbPush', timerDbPush);

    socket.on('luckygiftTransaction', luckygiftTransaction);

    

    socket.on('getUserPurchased', getUserPurchased); 

    socket.on("getUserHistory",getUserHistory );

    socket.on("joinTimerRoom", (roomName) => {
      console.log(roomName);
      socket.join(roomName);
      console.log("Joined room");
  
      // Store the current active room for this socket
      socket.activeRoom = roomName;
  
      socket.on('startCountdown', (duration) => {
          const activeRoom = socket.activeRoom; // Get the active room for this socket
          // Reset the old timer for the active room being started
          if (roomTimers[activeRoom]) {
              clearInterval(roomTimers[activeRoom]);
              delete roomTimers[activeRoom]; // Remove the reference to the old timer
          }
  
          // Start a new countdown timer for the active room
          roomTimers[activeRoom] = setInterval(() => {
              if (duration <= 0) {
                  clearInterval(roomTimers[activeRoom]);
                  io.to(activeRoom).emit('countdownEnd');
              } else {
                  console.log(duration);
                  io.to(activeRoom).emit('countdown', duration);
                  duration--;
              }
          }, 1000);
      });
  });

    socket.on("leaveTimerRoom", (roomName)=>{
        socket.leave(roomName);
    });     



    
   

}
module.exports = {handleSocket}
