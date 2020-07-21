const mysql = require('mysql');

// Local database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "adminpass",
    database: "world"
});

// Remote database connection
// const db = mysql.createConnection({
//     host: "us-cdbr-east-02.cleardb.com",
//     user: "bd54a33decc040",
//     password: "be8e7ce8556c9ff",
//     database: "	heroku_54e8d758703d17f"
// })

//Connecting the file to our MySQL Database.
db.connect((err) => {
    //Callback Function
    if (err) {
        throw err;
    }
    console.log("MySQL connected...");
});

module.exports = db;