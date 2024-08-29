var socket;
var usernameInput
var chatIDInput;
var messageInput;
var chatRoom;
var dingSound;
var messages = [];
var delay = true;
var currentUser;
var currentUserID;

let mainDiv;
let chatDiv;
let loginDiv;
let settingsDiv;
let deleteAccountConfirmDiv;
let changeUsernamePromptDiv;
let changePasswordPromptDiv;
let menuNavDiv;
let aboutDiv;


function onload(){
  const fname = document.getElementById("fname");
  const lname = document.getElementById("lname");
  const create = document.getElementById("create");
  const back = document.getElementById("back");
  
  mainDiv = document.getElementById("Main");
  chatDiv = document.getElementById("Chat");
  loginDiv = document.getElementById("Login");
  settingsDiv = document.getElementById("Settings");
  menuNavDiv = document.getElementById("menuNavBar");
  invalidPasswd = document.getElementById("invalidPass");
  alreadyTakenUser = document.getElementById("alreadyTakenUser");
  deleteAccountConfirmDiv = document.getElementById("deleteConfirmation");
  changeUsernamePromptDiv = document.getElementById("changeUsernamePrompt");
  changePasswordPromptDiv = document.getElementById("changePasswordPrompt");
  aboutDiv = document.getElementById("About");
  
  mainDiv.style.display = "none";
  chatDiv.style.display = "none";
  menuNavDiv.style.display = "none";
  settingsDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "none";
  changeUsernamePromptDiv.style.display = "none";
  changePasswordPromptDiv.style.display = "none";
  aboutDiv.style.display = "none";
  
  fname.style.visibility = "hidden";
  lname.style.visibility = "hidden";
  invalidPasswd.style.visibility = "hidden";
  alreadyTakenUser.style.visibility = "hidden";
  create.style.visibility = "hidden";
  back.style.visibility = "hidden";
  
  socket = io();
}

function menuNavAnimation() {
  const canvas = document.getElementById("topbar");
  const ctx = canvas.getContext("2d");

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
}

function loggedIn() {
  const fname = document.getElementById("fname");
  const lname = document.getElementById("lname");
  const create = document.getElementById("create");
  const back = document.getElementById("back");
  const sideBar = document.getElementById("sideBar");
  const sideBarCtx = sideBar.getContext("2d"); 

  chatIDInput = document.getElementById("IDInput");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");
  
  menuNavAnimation();
  clearScreen();

  fname.style.visibility = "hidden";
  lname.style.visibility = "hidden";
  back.style.visibility = "hidden";
  create.style.visibility = "hidden";
  mainDiv.style.display = "block";
  menuNavDiv.style.display = "block";

  sideBarCtx.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById("NameLabel").innerHTML = `Welcome back: ${currentUser}`;
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
  
  socket.on("loginResponse", function(response, fname){
    if (response == "success") {
      currentUserID = userInput;
      currentUser = fname;
      document.getElementById("alreadyTakenUser").style.visibility = "hidden";
      document.getElementById("invalidPass").style.visibility = "hidden";
      loggedIn();
    } else {
      document.getElementById("invalidPass").style.visibility = "visible";
    }
  }) 
}

function signupRedirect() {
  let fname = document.getElementById("fname");
  let lname = document.getElementById("lname");
  let logon = document.getElementById("logon");
  let signup = document.getElementById("signup");
  let create = document.getElementById("create");
  let back = document.getElementById("back");
  fname.style.visibility = "visible";
  lname.style.visibility = "visible";
  logon.style.visibility = "hidden";
  signup.style.visibility = "hidden";
  create.style.visibility = "visible";
  back.style.visibility = "visible";
}

function loginRedirect() {
  let fname = document.getElementById("fname");
  let lname = document.getElementById("lname");
  let logon = document.getElementById("logon");
  let signup = document.getElementById("signup");
  let create = document.getElementById("create");
  let back = document.getElementById("back");
  fname.style.visibility = "hidden";
  lname.style.visibility = "hidden";
  logon.style.visibility = "visible";
  signup.style.visibility = "visible";
  create.style.visibility = "hidden";
  back.style.visibility = "hidden";
}

function signup() {
  userInput = document.getElementById("user").value;
  passInput = document.getElementById("pass").value;
  fnameInput = document.getElementById("fname").value;
  lnameInput = document.getElementById("lname").value;
  socket.emit("signupRequest", userInput, passInput, fnameInput, lnameInput);
  
  socket.on("signupResponse", function(response){
    if (response == "success") {
      currentUser = fnameInput;
      document.getElementById("alreadyTakenUser").style.visibility = "hidden";
      document.getElementById("invalidPass").style.visibility = "hidden";
      loggedIn();
    } else {
      document.getElementById("alreadyTakenUser").style.visibility = "visible";
    }
  })
}

function logout() {
  clearScreen();
  
  menuNavDiv.style.display = "none";
  socket.emit("logout", currentUser);
  currentUser = null;
  document.getElementById("NameLabel").innerHTML = currentUser;
  
  loginDiv.style.display = "block";
  document.getElementById("logon").style.visibility = "visible";
  document.getElementById("signup").style.visibility = "visible";
}

function deleteAccount() {
  socket.emit("deleteAccount", currentUserID);
  socket.on("deleteAccountResponse", function(response) {
    if (response == "success") {
      logout();
    } else {
      //todo
    }
  });
}

function settings() {
  menuNavAnimation();
  clearScreen();
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
  
  settingsDiv.style.display = "block";
  
  for (let i = 0; i < 5; i++) {
    const rollInKeyframe = new KeyframeEffect(
      document.getElementById(`settingsButn${i}`), 
      keyframeSetup[i], 
      { duration: 2000 + 100 * i, 
       direction: "alternate", 
       easing: "ease-in-out",
       iterations: "1"});
    const rollInAnimation = new Animation(rollInKeyframe);
    rollInAnimation.play();
  }
}

function deletePrompt() {
  clearScreen();
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
    } else if (responce == "badpassword") {
      console.log("bad password");
      
    }
  })
}

function chat() {
  menuNavAnimation();
  clearScreen();
  chatDiv.style.display = "block";
  
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

function clearScreen() {
  mainDiv.style.display = "none";
  chatDiv.style.display = "none";
  loginDiv.style.display = "none";
  settingsDiv.style.display = "none";
  deleteAccountConfirmDiv.style.display = "none";
  changeUsernamePromptDiv.style.display = "none";
  changePasswordPromptDiv.style.display = "none";
  aboutDiv.style.display = "none";
}

function about() {
  menuNavAnimation();
  clearScreen();
  aboutDiv.style.display = "block";
}