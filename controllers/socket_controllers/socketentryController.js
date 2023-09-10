let handleSocket = require("./../../handlers/socketHandler");
class socketentryController{
    constructor(io){
        this.io = io;

        io.on("connection",(socket)=>{
            handleSocket.handleSocket(this.io,socket);
        })
    }


}
module.exports = socketentryController;
