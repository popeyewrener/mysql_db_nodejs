const mysql_port = process.env.DB_PORT;
const mysql_username = process.env.DB_USERNAME;
const mysql_password = process.env.DB_PASSWORD;
const mysql_db = process.env.DB_DATABASE;
const mysql_host = process.env.DB_HOST;
const { mysqlobject } = require("./../db_connector/mysql_connector");
let coinfunction = async (req,res)=>{
    let reqBody = req.body;
    //let test_num = reqBody.test_num;
    let user_id = reqBody.id;
    let fetch_coin = reqBody.coin;
    let gamename = reqBody.gamename;
    let type = reqBody.type;


    //let newData = {"test_num":test_num};
    let usertableName = "tbl_users";
    let getdataquery = `SELECT purchased FROM ${usertableName} WHERE id = ${user_id}`

    try {
        const connection = await mysqlobject(mysql_host, mysql_port, mysql_username,mysql_password, mysql_db);
        connection.query(getdataquery, (error, results) => {
            if (error) {
              console.error('Error inserting a new row:', error);
              res.status(400).json({"error":error});
            } else {
                let userdata = results[0];
                let curr_purchased = userdata["purchased"];
              //console.log(`New row inserted with ID: ${results.insertId}`);
              if (type=="credit"){
                let final_coins = curr_purchased + fetch_coin;
                console.error('Error inserting a new row:', error);
                let updateQuery = `UPDATE ${usertableName} SET purchased = ${final_coins} WHERE id = ${user_id}`;
                connection.query(updateQuery, (error,results)=>{
                    if (error){
                        console.error('Error inserting a new row:', error);
                        res.status(400).json({"error":error});

                    }
                    else{
                        res.status(200).json({"success_id": results[0].id})

                    }

                })

              }
              else if (type =="debit"){
                let final_coins = curr_purchased - fetch_coin;
                if (final_coins >=0){
                    let updateQuery = `UPDATE ${usertableName} SET purchased = ${final_coins} WHERE id = ${user_id}`;
                    connection.query(updateQuery, (error, results)=>{
                        if (error){
                            console.error('Error inserting a new row:', error);
                            res.status(400).json({"error":error});

                        }
                        else{
                            res.status(200).json({"success_id": results[0].id})

                        }
                    })
                }
                else{
                    res.status(401).json({"error":"not sufficient coins"});
                }

              }

              
              
              
            }});
        // You can use the 'connection' object for database queries here
    
        // Don't forget to close the connection when you're done
        connection.end();
      } catch (error) {
        console.error('Error:', error);
      }
    
   

}
module.exports = {coinfunction}