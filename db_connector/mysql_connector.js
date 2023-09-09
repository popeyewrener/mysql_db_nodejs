const mysql = require("mysql2");
const mysqlobject = async (host,port,user, pass, dbName)=>{
    const connection = mysql.createConnection({
        host: host,
        port:port,
        user: user,
        password: pass,
        database: dbName
      });
    
    
    connection.connect((error) => {
        if (error) {

          console.error('Error connecting to MySQL database:', error);
          return error
        } else {
          console.log('Connected to MySQL database!');
          console.log(connection);
          return connection;
        }
      });

}


  module.exports = {mysqlobject}