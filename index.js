const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const sqlite3 = require("sqlite3");
const helmet = require("helmet");
const process = require("process");
const inspector = require("inspector");
const fs = require("fs");

const inspectorSession = new inspector.Session();
inspectorSession.connect();

const app = express();
//app.use(helmet());

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

function updateUser(category, value, target) {
  userDB.serialize(function() {
    userDB.run(`UPDATE users SET ${category} = ? WHERE username = ?`, [value, target], (err) => {
      if (err) {
        throw err;
      }
    });
  });
}

//remove inspector in production enviorment
inspectorSession.post('Profiler.enable', () => {
  inspectorSession.post('Profiler.start', () => {
    io.on('connection', function(socket) {

      socket.on("join", function(room, username) {
        if (username != "") {
          rooms[socket.id] = room;
          usernames[socket.id] = username;
          socket.leaveAll();
          socket.join(room);
          io.in(room).emit("recieve", "Server : " + username + " has entered the chat.");
          socket.emit("join", room);
          console.log("a user joined the room");
          updateUser("lastchatroom", room, username);
        }
      })

      socket.on("send", function(message) {
        io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] + " : " + message);
        console.log("A user sent a message");
      })

      socket.on("recieve", function(message) {
        socket.emit("recieve", message);
        console.log("user recieved a message");
      })

      //todo: shrink down somehow
      socket.on("loginRequest", function(user, pass) {
        userDB.get("SELECT Username username, Password password, Firstname firstname, Lastchatroom lastchatroom FROM users WHERE Username = ?", [user], (err, rowuser) => {
          if (err) {
            throw err;
          }
          if (rowuser === undefined) {
            return socket.emit("loginResponse", "failure", null, null);
          }
          if (rowuser.username == user) {
            if (rowuser.password == pass) {
              return socket.emit("loginResponse", "success", rowuser.firstname, rowuser.lastchatroom);
            } else {
              return socket.emit("loginResponse", "badpassword", null, null);
            }
          }

        });
      })

      //todo: shrink down somehow
      socket.on("signupRequest", function(user, pass, fname, lname) {
        console.log("recieved signupRequest");
        userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
          if (err) {
            throw err;
          }
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].username == user) {
              console.log("user %s already exists", user);
              return socket.emit("signupResponse", "failure");
            }
          }
          console.log("does not exist, creating user %s", user);
          userDB.run("INSERT INTO users (username, password, firstname, lastname, lastchatroom) VALUES (?, ?, ?, ?, ?)", [user, pass, fname, lname, "None"], (err) => {
            if (err) {
              throw err;
            }
            return socket.emit("signupResponse", "success");
          });
        })
      })

      socket.on("logout", function(user, lastchatroom) {
        updateUser("lastchatroom", lastchatroom, user);
        usernames[socket.id] = null;
        rooms[socket.id] = null;
        socket.leaveAll();
      });

      socket.on("deleteAccount", function(user) {
        userDB.serialize(function() {
          userDB.run("DELETE FROM users WHERE username = ?", [user], (err) => {
            if (err) {
              throw err;
            }
            socket.emit("deleteAccountResponse", "success");
          });
        });

      });

      socket.on("changeUsernameRequest", function(currentUsername, newUsername) {
        userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
          if (err) {
            throw err;
          }
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].username == currentUsername) {
              updateUser("username", newUsername, currentUsername);
              socket.emit("changeUsernameResponse", "success");
            }
          }
        });
      });

      socket.on("changePasswordRequest", function(currentPassword, newPassword, currentUser) {
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
                  updateUser("password", newPassword, currentUser);
                  return socket.emit("changePasswordResponse", "success");
                } else {
                  return socket.emit("changePasswordResponse", "badpassword");
                }
              });

            } else {
              return socket.emit("changePasswordResponse", "badpassword");
            }
          }
        });
      });
    });
  });
});

process.on('uncaughtException', (code) => {

  //we want to dump the resource information
  inspectorSession.post('Profiler.stop', (err, { profile }) => {
    const profilePath = path.join(__dirname, 'logs/profile.cpuprofile');
    if (!err) {
      fs.writeFileSync(profilePath, JSON.stringify(profile));
    } else {
      throw err;
    }
  });
});