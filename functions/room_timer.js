

let roomTimer = (roomName) => {
    console.log(roomName);
    socket.join(roomName);
    console.log("Joined room")

    socket.on('startCountdown', (duration) => {
      const countdownInterval = setInterval(() => {
        console.log(duration)
        if (duration <= 0) {
          clearInterval(countdownInterval);
          io.to(roomName).emit('countdownEnd');
        } else {
          io.to(roomName).emit('countdown', duration);
          duration--;
        }
      }, 1000);
    });}

    module.exports = {roomTimer};