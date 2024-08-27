const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const sqlite3 = require("sqlite3");
const process = require("process");
const fs = require("fs");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");


databaseInit();


const userDB = new sqlite3.Database("./db/userdata.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("oops! user database error");
    process.abort();
  }
});

app.use(express.static(gamedirectory));

httpserver.listen(3000);

var rooms = [];
var usernames = [];

io.on('connection', function(socket){

  socket.on("join", function(room, username){
    if (username != ""){
      rooms[socket.id] = room;
      usernames[socket.id] = username;
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", "Server : " + username + " has entered the chat.");
      socket.emit("join", room);
    }
  })

  socket.on("send", function(message){
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] +" : " + message);
  })

  socket.on("recieve", function(message){
    socket.emit("recieve", message);
  })

  socket.on("loginRequest", function(user, pass) {
    userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
      if (err) {
        console.error("oops! user database error");
        process.abort();
      }
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].username == user) {
          userDB.all("SELECT Password password FROM users WHERE username = ?", [user], (err, rows) => {
            if (err) {
              console.error("oops! user database error");
              process.abort();
            }
            for (let i = 0; i < rows.length; i++) {
              if (rows[i].password == pass) {
                socket.emit("loginResponse", "success");
              } else {
                socket.emit("loginResponse", "failure");
              }
            }
          });
        } else {
          socket.emit("loginResponse", "failure");
        }
      }
    })
  })

  socket.on("signupRequest", function(user, pass) {
    userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
      if (err) {
        console.error("oops! user database error");
        process.abort();
      }
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].username == user) {
          socket.emit("signupResponse", "failure");
        } else {
          userDB.all("INSERT INTO users (username, password) VALUES (?, ?)", [user, pass], (err) => {
            if (err) {
              console.error("oops! user database error");
              process.abort();
            }
            socket.emit("signupResponse", "success");
          });
        }
      }
    })
  })
})

function databaseInit() {
  fs.mkdir(path.join(__dirname, "db"), (err) => {
    //oops cant do that
    if (err) {
      console.error("oops! database directory error");
      process.abort();
    }
  });
  
  let userDb = new sqlite3.Database("./db/userdata.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { 
    if (err) {
      console.error("oops! user database error");
      process.abort();
    } else {
      userDb.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)");
    }
  });

  //after that the database is ready to use
  console.log("Wormhole database initialized");
  userDb.close();
  process.exit(0);
}