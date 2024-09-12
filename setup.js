const path = require("node:path");
const sqlite3 = require("sqlite3");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { error } = require("node:console");

const cryptoAlgorithm = "aes-256-cbc";
const cryptoPassword = "password";

setupWormhole();

function encrypt(plain, key, iv) {
  const cipher = crypto.createCipheriv(cryptoAlgorithm, key, iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function setupWormhole() {
  const folderpath = path.join(__dirname, "db");
  const filepath = path.join(folderpath, "userdata.db");
  const keyPath = path.join(__dirname, "key", "key.json");
  const debugPath = path.join(__dirname, "logs", "debug.log");

  console.log("Making encryption key -- ");
  const key = crypto.scryptSync(cryptoPassword, "salt", 32);
  let iv = Buffer.alloc(16);
  crypto.randomFillSync(iv);

  const keyObj = {
    cryptoAlgorithm: cryptoAlgorithm,
    cryptoPassword: cryptoPassword,
    cryptoKey: key.toString("hex"),
    cryptoIv: iv.toString("hex"),
  };

  fs.mkdirSync(path.join(__dirname, "key"));
  const f = fs.openSync(keyPath, "a+");
  fs.writeFileSync(keyPath, JSON.stringify(keyObj));
  fs.closeSync(f);

  console.log("done!\n");

  console.log("Making Database -- ");
  fs.mkdirSync(folderpath);

  const db = new sqlite3.Database(filepath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      throw err;
    }
  });
  
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users (Username TEXT, Password TEXT, Firstname TEXT, Lastname TEXT, Lastchatroom TEXT)", (err) => {
      if (err) throw err;
        
    });

    const dataIn = ["admin", "password", "Alexander", "Herbert", "None"];

    let encrypted = [];
    
    for (let i = 0; i < dataIn.length; i++) {
      encrypted.push(encrypt(dataIn[i], key, iv));
      console.log(encrypted[i]);
    }
    

    db.run(`INSERT INTO users (Username, Password, Firstname, Lastname, Lastchatroom) VALUES ('${encrypted[0]}', '${encrypted[1]}', '${encrypted[2]}', '${encrypted[3]}', '${encrypted[4]}')`, (err) => {
      if (err) throw err;
          
    });

    db.close();
    console.log("Done!\n");
  });
  
  
  console.log("Making Debug log -- ");

  fs.mkdirSync(path.join(__dirname, "logs"));

  const f2 = fs.openSync(debugPath, "a+");
  fs.closeSync(f2);
  fs.writeFileSync(debugPath, " ");

  console.log("Done!\n");
}