const path = require("path");
const sqlite3 = require("sqlite3");
const fs = require("fs");

setupWormhole();

function setupWormhole() {
  const folderpath = path.join(__dirname, "db");
  const filepath = path.join(folderpath, "userdata.db");

  console.log("Making Database -- ");
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
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, firstname TEXT, lastname TEXT, lastchatroom TEXT)", (err) => {
      if (err) {
        throw err;
      }
    });

    db.run("INSERT INTO users (username, password, firstname, lastname, lastchatroom) VALUES ('admin', 'admin', 'Alexander', 'Herbert', 'None')", (err) => {
      if (err) {
        throw err;
      }
    });
  }) 
  
  db.close();
  console.log("Done!\n");
  console.log("Making Debug log -- ");

  fs.mkdir(path.join(__dirname, "logs"), (err) =>  {
    if (err) {
      throw err;
    }
  });

  fs.writeFile(path.join(__dirname, "logs", "debug.log"), "", (err) => {
    if (err) {
      throw err;
    }
  });

  console.log("Done!\n");
}