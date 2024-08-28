const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const sqlite3 = require("sqlite3");
const helmet = require("helmet");

const app = express();
app.use(helmet());

const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");


// the setup program by default creates this database
const userDB = new sqlite3.Database("./db/userdata.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    throw err;
  }
});

app.use(express.static(gamedirectory));

httpserver.listen(3000);

//todo: throw these out somehow...
var rooms = [];
var usernames = [];

io.on('connection', function(socket){

  socket.on("join", function(room, username) {
    if (username != ""){
      rooms[socket.id] = room;
      usernames[socket.id] = username;
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", "Server : " + username + " has entered the chat.");
      socket.emit("join", room);
      console.log("a user joined the room");
    }
  })

  socket.on("send", function(message) {
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] +" : " + message);
    console.log("A user sent a message");
  })

  socket.on("recieve", function(message) {
    socket.emit("recieve", message);
    console.log("user recieved a message");
  })

  //todo: shrink down somehow
  socket.on("loginRequest", function(user, pass) {
    userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
      if (err) {
        throw err;
      }
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].username == user) {
          userDB.all("SELECT Password password FROM users WHERE username = ?", [user], (err, rows) => {
            if (err) {
              throw err;
            }
            for (let i = 0; i < rows.length; i++) {
              if (rows[i].password == pass) {
                socket.emit("loginResponse", "success");
                break;
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

  //todo: shrink down somehow
  socket.on("signupRequest", function(user, pass) {
    console.log("recieved signupRequest");
    userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
      if (err) {
        throw err;
      }
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].username == user) {
          console.log("user %s already exists", user);
          socket.emit("signupResponse", "failure");
          break;
        } else {
          console.log("does not exist, creating user %s", user);
          userDB.all("INSERT INTO users (username, password) VALUES (?, ?)", [user, pass], (err) => {
            if (err) {
              throw err;
            }
            socket.emit("signupResponse", "success");
          });
        }
      }
    })
  })

  socket.on("logout", function(user) {
    usernames[socket.id] = null;
    rooms[socket.id] = null;
    socket.leaveAll();
  });

  socket.on("deleteAccount", function(user) {
    userDB.all("DELETE FROM users WHERE username = ?", [user], (err) => {
      if (err) {
        throw err;
      }
      socket.emit("deleteAccountResponse", "success");
    });
  });

  socket.on("changeUsernameRequest", function(currentUsername, newUsername) {
    userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
      if (err) {
        throw err;
      }
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].username == currentUsername) {
          userDB.all("UPDATE users SET username = ? WHERE username = ?", [newUsername, currentUsername], (err) => {
            if (err) {
              throw err;
            }
            console.log("we got here")
            socket.emit("changeUsernameResponse", "success");
          });
        }
      }
    });
  });

  socket.on("changePasswordRequest", function(currentPassword, newPassword, currentUser){
    userDB.all("SELECT DISTINCT Password password FROM users ORDER BY password", [], (err, rows) => {
      if (err) {
        throw err;
      }
      
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].password == currentPassword) {
          userDB.all("SELECT DISTINCT Username username FROM users WHERE Password = ? ORDER BY username ", [currentPassword], (err, rows) => {
            if (err) {
              throw err;
            }
            if (rows[0].username == currentUser) {
              userDB.all("UPDATE users SET password = ? WHERE password = ?", [newPassword, currentPassword], (err) => {
                if (err) {
                  throw err;
                }
                return socket.emit("changePasswordResponse", "success");
              });
            } else {
              return socket.emit("changePasswordResponse", "badpassword");

            }
          })
          
        } else {
          return socket.emit("changePasswordResponse", "badpassword");
        }
        
      }
      
    });
  });
});