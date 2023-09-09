const mysql = require('mysql2/promise');

const mysqlobject = async (host, port, user, pass, dbName) => {
  try {
    const connection = await mysql.createConnection({
      host: host,
      port: port,
      user: user,
      password: pass,
      database: dbName,
    });

    console.log('Connected to MySQL database!');
    return connection;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    throw error; // Rethrow the error so the caller can handle it
  }
};

module.exports = { mysqlobject };