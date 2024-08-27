var socket;
var usernameInput
var chatIDInput;
var messageInput;
var chatRoom;
var dingSound;
var messages = [];
var delay = true;
var currentUser;

function onload(){
  mainDiv = document.getElementById("Main");
  invalidPasswd = document.getElementById("invalidPass");
  alreadyTakenUser = document.getElementById("alreadyTakenUser");
  mainDiv.style.visibility = "hidden";
  invalidPasswd.style.visibility = "hidden";
  alreadyTakenUser.style.visibility = "hidden";
  socket = io();
}

function loggedIn() {
  chatIDInput = document.getElementById("IDInput");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");
  loginDiv = document.getElementById("login");
  mainDiv = document.getElementById("Main");
  loginDiv.style.visibility = "hidden";
  mainDiv.style.visibility = "visible";

  document.getElementById("userLabel").innerHTML = currentUser;
  
  socket.on("join", function(room){
    chatRoom.innerHTML = "Chatroom : " + room;
  })

  socket.on("recieve", function(message){
    console.log(message);
    if (messages.length < 9){
      messages.push(message);
      dingSound.currentTime = 0;
      dingSound.play();
    } else{
      messages.shift();
      messages.push(message);
    }
    for (i = 0; i < messages.length; i++){
        document.getElementById("Message"+i).innerHTML = messages[i];
        document.getElementById("Message"+i).style.color = "#303030";
    }
  })
}

function Connect(){
  socket.emit("join", chatIDInput.value, currentUser);
}

function Send(){
  if (delay && messageInput.value.replace(/\s/g, "") != ""){
    delay = false;
    setTimeout(delayReset, 1000);
    socket.emit("send", messageInput.value);
    messageInput.value = "";
  }
}

function delayReset(){
  delay = true;
}

function login() {
  userInput = document.getElementById("user").value;
  passInput = document.getElementById("pass").value;
  socket.emit("loginRequest", userInput, passInput);
  
  socket.on("loginResponse", function(response){
    if (response == "success") {
      currentUser = userInput;
      invalidPasswdMsg = document.getElementById("invalidPass");
      invalidPasswdMsg.style.visibility = "hidden";
      loggedIn();
    } else {
      document.getElementById("invalidPass").style.visibility = "visible";
    }
  }) 
}

function signup() {
  userInput = document.getElementById("user").value;
  passInput = document.getElementById("pass").value;
  socket.emit("signupRequest", userInput, passInput);
  
  socket.on("signupResponse", function(response){
    if (response == "success") {
      currentUser = userInput;
      document.getElementById("alreadyTakenUser").style.visibility = "hidden";
      loggedIn();
    } else {
      document.getElementById("alreadyTakenUser").style.visibility = "visible";
    }
  })
}