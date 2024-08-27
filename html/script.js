var socket;
var usernameInput
var chatIDInput;
var messageInput;
var chatRoom;
var dingSound;
var messages = [];
var delay = true;
var currentUser;

let mainDiv;
let loginDiv;
let settingsDiv;
let deleteAccountConfirmDiv;
let changeUsernamePromptDiv;
let changePasswordPromptDiv;

function onload(){
  mainDiv = document.getElementById("Main");
  loginDiv = document.getElementById("Login");
  settingsDiv = document.getElementById("Settings");
  invalidPasswd = document.getElementById("invalidPass");
  alreadyTakenUser = document.getElementById("alreadyTakenUser");
  deleteAccountConfirmDiv = document.getElementById("deleteConfirmation");
  changeUsernamePromptDiv = document.getElementById("changeUsernamePrompt");
  changePasswordPromptDiv = document.getElementById("changePasswordPrompt");
  mainDiv.style.display = "none";
  settingsDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "none";
  changeUsernamePromptDiv.style.display = "none";
  changePasswordPromptDiv.style.display = "none";
  invalidPasswd.style.visibility = "hidden";
  alreadyTakenUser.style.visibility = "hidden";
  socket = io();
}

function loggedIn() {
  chatIDInput = document.getElementById("IDInput");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");
  
  settingsDiv.style.display = "none";
  loginDiv.style.display = "none";
  mainDiv.style.display = "block";

  document.getElementById("NameLabel").innerHTML = `Username: ${currentUser}`;
  
  socket.on("join", function(room){
    chatRoom.innerHTML = "Chatroom : " + room;
  });

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
  });
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
      document.getElementById("alreadyTakenUser").style.visibility = "hidden";
      document.getElementById("invalidPass").style.visibility = "hidden";
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
      document.getElementById("invalidPass").style.visibility = "hidden";
      loggedIn();
    } else {
      document.getElementById("alreadyTakenUser").style.visibility = "visible";
    }
  })
}

function logout() {
  socket.emit("logout", currentUser);
  currentUser = null;
  document.getElementById("userLabel").innerHTML = currentUser;
  loginDiv.style.display = "block";
  mainDiv.style.display = "none";
  settingsDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "none";
}

function deleteAccount() {
  socket.emit("deleteAccount", currentUser);
  socket.on("deleteAccountResponse", function(response) {
    if (response == "success") {
      logout();
    } else {
      //todo
    }
  });
}

function settings() {
  const button1 = document.getElementById("settingsLogout");
  const button2 = document.getElementById("settingsChangeUsername");
  const button3 = document.getElementById("settingsChangePassword");
  const button4 = document.getElementById("settingsDeleteAccount");
  const button5 = document.getElementById("settingsBack");
  
  const keyframeSetup = [[
    { transform: "translateX(200px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(210px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(220px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(230px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(240px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ]];
  
  const keyframeOptions = [{
    duration: 2000,
    direction: "alternate",
    easing: "ease-in-out",
    iterations: "1",
  },{
    duration: 2100,
    direction: "alternate",
    easing: "ease-in-out",
    iterations: "1",
  },{
    duration: 2200,
    direction: "alternate",
    easing: "ease-in-out",
    iterations: "1",
  },{
    duration: 2300,
    direction: "alternate",
    easing: "ease-in-out",
    iterations: "1",
  },{
    duration: 2400,
    direction: "alternate",
    easing: "ease-in-out",
    iterations: "1",
  }];

  const rollInKeyframes = [
    new KeyframeEffect(button1, keyframeSetup[0], keyframeOptions[0]),
    new KeyframeEffect(button2, keyframeSetup[1], keyframeOptions[1]),
    new KeyframeEffect(button3, keyframeSetup[2], keyframeOptions[2]),
    new KeyframeEffect(button4, keyframeSetup[3], keyframeOptions[3]),
    new KeyframeEffect(button5, keyframeSetup[4], keyframeOptions[4]),
  ];

  const rollInAnimations = [
    new Animation(rollInKeyframes[0]),
    new Animation(rollInKeyframes[1]),
    new Animation(rollInKeyframes[2]),
    new Animation(rollInKeyframes[3]),
    new Animation(rollInKeyframes[4]),
  ];
  
  mainDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "none";
  changeUsernamePromptDiv.style.display = "none";
  changePasswordPromptDiv.style.display = "none";

  
  settingsDiv.style.display = "block";
  for (let i = 0; i < rollInAnimations.length; i++) {
    rollInAnimations[i].play();
  }
}

function deletePrompt() {
  loginDiv.style.display = "none";
  mainDiv.style.display = "none";
  settingsDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "block";
}

function changeUsernamePrompt() {
  settingsDiv.style.display = "none";
  changeUsernamePromptDiv.style.display = "block";
}

function changeUsername() {
  settingsDiv.style.display = "none";
  newUsername = document.getElementById("newUsername").value;
  socket.emit("changeUsernameRequest", currentUser, newUsername);
  socket.on("changeUsernameResponse", function(responce) {
    if (responce == "success") {
      currentUser = newUsername;
      console.log("changed")
      loggedIn();
    }
  })
}

function changePasswordPrompt() {
  settingsDiv.style.display = "none";
  changePasswordPromptDiv.style.display = "block";
}

function changePassword() {
  settingsDiv.style.display = "none";
  oldPassword = document.getElementById("oldPassword").value;
  newPassword = document.getElementById("newPassword").value;
  socket.emit("changePasswordRequest", oldPassword, newPassword, currentUser);
  socket.on("changePasswordResponse", function(responce) {
    if (responce == "success") {
      console.log("changed")
      loggedIn();
    }
  })
}