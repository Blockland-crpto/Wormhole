const path = require("path");
const sqlite3 = require("sqlite3");
const process = require("process");
const fs = require("fs");

setupDB();

function setupDB() {
  const folderpath = path.join(__dirname, "db");
  const filepath = path.join(folderpath, "userdata.db");
  
  fs.mkdir(folderpath, (err) => {
    if (err) {
      throw err;
    }
  });
  
  const db = new sqlite3.Database(filepath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      throw err;
    }
  });

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)", (err) => {
      if (err) {
        throw err;
      }
    });

    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin')", (err) => {
      if (err) {
        throw err;
      }
    });
  }) 
  
  
  
  console.log("created database");
  db.close();
}