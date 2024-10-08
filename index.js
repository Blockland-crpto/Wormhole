const http = require("node:http");
const path = require("node:path");
const process = require("node:process");
const inspector = require("node:inspector");
const fs = require("node:fs");
const buffer = require("node:buffer");

const crypto = require("node:crypto");
const express = require("express");
const socketio = require("socket.io");
const sqlite3 = require("sqlite3");
const compression = require("compression");
const encryptionData = require("./key/key.json");
//const helmet = require("helmet");

const inspectorSession = new inspector.Session();
inspectorSession.connect();

const app = express();
app.use(compression())
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
  try {
    userDB.serialize(function() {
      userDB.run(`UPDATE users SET ${category} = ? WHERE username = ?`, [encrypter(value), encrypter(target)], (err) => {
        if (err) {
          throw err;
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
  
}

function decrypter(encrypted) {
  const iv = Buffer.from(encryptionData.cryptoIv, "hex");
  const key = Buffer.from(encryptionData.cryptoKey, "hex");

  const decipher = crypto.createDecipheriv(encryptionData.cryptoAlgorithm, key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
}

function encrypter(plain) {
  const iv = Buffer.from(encryptionData.cryptoIv, "hex")
  const key = Buffer.from(encryptionData.cryptoKey, "hex")

  const cipher = crypto.createCipheriv(encryptionData.cryptoAlgorithm, key, iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
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
      });

      socket.on("send", function(message) {
        io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] + " : " + message);
        console.log("A user sent a message");
      });

      socket.on("recieve", function(message) {
        socket.emit("recieve", message);
        console.log("user recieved a message");
      });

      //todo: shrink down somehow
      socket.on("loginRequest", function(user, pass) {
        try {
          userDB.get("SELECT Username username, Password password, Firstname firstname, Lastchatroom lastchatroom FROM users WHERE Username = ?", [encrypter(user)], (err, rowuser) => {
            const password = decrypter(rowuser.password);
            const firstName = decrypter(rowuser.firstname);
            const lastChatRoom = decrypter(rowuser.lastchatroom);
            if (err) {
              throw err;
            }
            if (rowuser === undefined) {
              return socket.emit("loginResponse", "failure", null, null);
            } else {
              if (password == pass) {
                return socket.emit("loginResponse", "success", firstName, lastChatRoom);
              } else {
                return socket.emit("loginResponse", "badpassword", null, null);
              }
              
            }
            

          });
        } catch (err) {
          console.error(err);
          socket.emit("loginResponse", "error", null, null);
        }
        
      });

      //todo: shrink down somehow
      socket.on("signupRequest", function(user, pass, fname, lname) {
        const encryptUser = encrypter(user);
        const encryptPass = encrypter(pass);
        const encryptFname = encrypter(fname);
        const encryptLname = encrypter(lname);
        const encryptNone = encrypter("None");
        try {
          userDB.all("SELECT DISTINCT Username username FROM users ORDER BY username", [], (err, rows) => {
            if (err) {
              throw err;
            }
            for (let i = 0; i < rows.length; i++) {
              const username = decrypter(rows[i].username);
              if (username == user) {
                console.log("user %s already exists", user);
                return socket.emit("signupResponse", "alreadyExists");
              }
            }
            console.log("does not exist, creating user %s", user);

            userDB.serialize(function () {
              userDB.run("INSERT INTO users (username, password, firstname, lastname, lastchatroom) VALUES (?, ?, ?, ?, ?)", [encryptUser, encryptPass, encryptFname, encryptLname, encryptNone], (err) => {
                if (err) {
                  throw err;
                }
                return socket.emit("signupResponse", "success");
              });
            });     
          });
        } catch (err) {
          console.error("oops! signup error");
          return socket.emit("signupResponse", "failure");
        }
        
      });

      socket.on("logout", function(user, lastchatroom) {
        updateUser("lastchatroom", lastchatroom, user);
        usernames[socket.id] = null;
        rooms[socket.id] = null;
        socket.leaveAll();
      });

      socket.on("deleteAccount", function(user) {
        try {
          userDB.serialize(function() {
            userDB.run("DELETE FROM users WHERE username = ?", [user], (err) => {
              if (err) {
                throw err;
              }
              socket.emit("deleteAccountResponse", "success");
            });
          });
        } catch (err) {
          console.error(err);
          socket.emit("deleteAccountResponse", "failure");
        }
      });

      socket.on("changeUsernameRequest", function(currentUsername, newUsername) {
        try {
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
        } catch (error) {
          console.log(error);
        }
        
      });

      socket.on("changePasswordRequest", function(currentPassword, newPassword, currentUser) {
        try {
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
        } catch (error) {
          console.log(error);
        }
        
      });

      socket.on("getWeather", function (lati, long) {
        const weatherApiKey = "";
        const weatherReqOpt = {
          hostname:  `api.openweathermap.org`,
          port: 80,
          path: `/data/2.5/weather?lat=${lati}&lon=${long}&appid=${weatherApiKey}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        
        const weatherApi = http.request(weatherReqOpt, (res) => {
          res.on('data', (chunk) => {
            const bChunk = buffer.Buffer.from(chunk);
            
            console.log(bChunk.toString());

            socket.emit("getWeatherResponse", JSON.parse(bChunk.toString()));
          });
        });

        weatherApi.on('error', (err) => {
          console.log(err);
        });

        weatherApi.end();
      });
    });
  });
});

process.on('SIGINT', (code) => {

  //we want to dump the resource information
  inspectorSession.post('Profiler.stop', (err, { profile }) => {
    const profilePath = path.join(__dirname, 'logs/profile.cpuprofile');
    if (!err) {
      fs.writeFileSync(profilePath, JSON.stringify(profile));
    } else {
      throw err;
    }

    //also have to close the DB
    userDB.close();

    process.exit(0);
  });
});