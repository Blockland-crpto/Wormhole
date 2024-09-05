//Main things i HAVE to do:
//1. cut down on variables
//2. shrink function sizes
//3. reduce repition in code
//4. make the code more readable

let delay = true;
let socket;
let usernameInput;
let chatIDInput;
let messageInput;
let chatRoom;
let dingSound;
let messages = [];
let currentUser;
let currentUserID;
let lastJoinedGroup;


function onload(){
  document.getElementById("Main").style.display = "none";
  document.getElementById("Chat").style.display = "none";
  document.getElementById("About").style.display = "none";
  document.getElementById("sideBar").style.display = "none";
  document.getElementById("Settings").style.display = "none";
  document.getElementById("menuNavBar").style.display = "none";
  document.getElementById("deleteConfirmation").style.display = "none";
  document.getElementById("changeUsernamePrompt").style.display = "none";
  document.getElementById("changePasswordPrompt").style.display = "none";

  document.getElementById("back").style.visibility = "hidden";
  document.getElementById("fname").style.visibility = "hidden";
  document.getElementById("lname").style.visibility = "hidden";
  document.getElementById("create").style.visibility = "hidden";
  document.getElementById("invalidPass").style.visibility = "hidden";
  document.getElementById("alreadyTakenUser").style.visibility = "hidden";
    
  socket = io();
}

function menuNavAnimation() {
  const topBar = document.getElementById("topbar");
  const topBarCtx = topBar.getContext("2d");

  topBarCtx.fillStyle = "black";
  topBarCtx.fillRect(0, 0, topBar.width, topBar.height);
}

function sideNavAnimation() {
  const sideBar = document.getElementById("sideBar");
  const sideBarCtx = sideBar.getContext("2d");

  sideBarCtx.fillStyle = "black";
  sideBarCtx.fillRect(0, 0, sideBar.width, sideBar.height);
  sideBar.style.display = "block";
}

function loggedIn() {
  const nameLabelBox = document.getElementById("nameLabelBox");
  const nameLabelBoxCtx = nameLabelBox.getContext("2d");
  
  chatIDInput = document.getElementById("IDInput");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");

  clearScreen();
  menuNavAnimation();
  sideNavAnimation()
  

  document.getElementById("fname").style.visibility = "hidden";
  document.getElementById("lname").style.visibility = "hidden";
  document.getElementById("back").style.visibility = "hidden";
  document.getElementById("create").style.visibility = "hidden";
  document.getElementById("Main").style.display = "block";
  document.getElementById("menuNavBar").style.display = "block";
  
  nameLabelBoxCtx.fillStyle = "#757575";
  nameLabelBoxCtx.fillRect(0, 0, nameLabelBox.width, nameLabelBox.height);

  document.getElementById("NameLabel").innerHTML = `Welcome back: ${currentUser}`;
  document.getElementById("RecentGroup").innerHTML = `Recent Group: ${lastJoinedGroup}`;
}

function Connect(){
  socket.emit("join", chatIDInput.value, currentUser);
  lastJoinedGroup = chatIDInput.value;
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


/* Redirects Start */

function signupRedirect() {
  document.getElementById("fname").style.visibility = "visible";
  document.getElementById("lname").style.visibility = "visible";
  document.getElementById("logon").style.visibility = "hidden";
  document.getElementById("signup").style.visibility = "hidden";
  document.getElementById("create").style.visibility = "visible";
  document.getElementById("back").style.visibility = "visible";
}

function loginRedirect() {
  document.getElementById("fname").style.visibility = "hidden";
  document.getElementById("lname").style.visibility = "hidden";
  document.getElementById("logon").style.visibility = "visible";
  document.getElementById("signup").style.visibility = "visible";
  document.getElementById("create").style.visibility = "hidden";
  document.getElementById("back").style.visibility = "hidden";
}

/* Redirects End */

/* Login Screen Start */

function login() {
  const userInput = document.getElementById("user").value;
  const passInput = document.getElementById("pass").value;
  const invalidPasswd = document.getElementById("invalidPass");

  socket.emit("loginRequest", userInput, passInput);

  socket.on("loginResponse", function(response, fname, lastchatroom){
    if (response == "success") {
      currentUserID = userInput;
      currentUser = fname;
      lastJoinedGroup = lastchatroom;
      document.getElementById("alreadyTakenUser").style.visibility = "hidden";
      invalidPasswd.style.visibility = "hidden";
      loggedIn();
    } else {
      invalidPasswd.style.visibility = "visible";
    }
  }) 
}

function signup() {
  const userInput = document.getElementById("user").value;
  const passInput = document.getElementById("pass").value;
  const fnameInput = document.getElementById("fname").value;
  const lnameInput = document.getElementById("lname").value;
  const alreadyTakenUser = document.getElementById("alreadyTakenUser");
  
  socket.emit("signupRequest", userInput, passInput, fnameInput, lnameInput);
  
  socket.on("signupResponse", function(response){
    if (response == "success") {
      currentUser = fnameInput;
      alreadyTakenUser.style.visibility = "hidden";
      document.getElementById("invalidPass").style.visibility = "hidden";
      loggedIn();
    } else {
      alreadyTakenUser.style.visibility = "visible";
    }
  })
}

/* Login Screen End */

function logout() {
  clearScreen();
  document.getElementById("menuNavBar").style.display = "none";
  socket.emit("logout", currentUser, lastJoinedGroup);
  document.getElementById("NameLabel").innerHTML = currentUser;

  currentUser = null;
  
  document.getElementById("Login").style.display = "block";
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
  const settingsDiv = document.getElementById("Settings");
  const sb0 = document.getElementById("settingsButn0");
  const sb1 = document.getElementById("settingsButn1");
  const sb2 = document.getElementById("settingsButn2");
  const sb3 = document.getElementById("settingsButn3");
  
  const settingsText0 = document.getElementById("settingsText0");
  const settingsText1 = document.getElementById("settingsText1");
  const settingsText2 = document.getElementById("settingsText2");
  const settingsText3 = document.getElementById("settingsText3");
  const settingsText4 = document.getElementById("settingsText4");
  
  const keyframeSetup = [[
    { transform: "translateX(-80px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(-90px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(-100px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(-110px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ], [
    { transform: "translateX(-120px)" }, // keyframe
    { transform: "translateX(0px)" }, // keyframe
  ]];
  
  const settingsCanvas = document.getElementById("settingsCanvas");
  const settingsCanvasCtx = settingsCanvas.getContext("2d"); 
  
  clearScreen();
  menuNavAnimation();
  sideNavAnimation();
  
  settingsText0.style.display = "none";
  settingsText1.style.display = "none";
  settingsText2.style.display = "none";
  settingsText3.style.display = "none";
  settingsText4.style.display = "none";
  settingsCanvas.style.display = "none";
  
  settingsDiv.style.display = "block";
  
  settingsCanvasCtx.fillStyle = "black";
  
  settingsCanvasCtx.fillRect(0, 0, 400, 200);
  
  for (let i = 0; i < 5; i++) {
    const rollInKeyframe = new KeyframeEffect(
      document.getElementById(`settingsButn${i}`), 
      keyframeSetup[i], 
      { duration: 1400 + 100 * i, 
       direction: "alternate", 
       easing: "ease-in-out",
       iterations: "1"});
    const rollInAnimation = new Animation(rollInKeyframe);
    rollInAnimation.play();
  } 

  sb0.addEventListener("mouseover", (event) => {
    settingsText0.style.display = "block";
    fadeInElement(settingsCanvas);
  });

  sb0.addEventListener("mouseleave", (event) => {
    settingsText0.style.display = "none";
    settingsCanvas.style.display = "none";
  });

  sb1.addEventListener("mouseover", (event) => {
    settingsText1.style.display = "block";
    fadeInElement(settingsCanvas);
  });

  sb1.addEventListener("mouseleave", (event) => {
    settingsText1.style.display = "none";
    settingsCanvas.style.display = "none";
  });

  sb2.addEventListener("mouseover", (event) => {
    settingsText2.style.display = "block";
    fadeInElement(settingsCanvas);
  });

  sb2.addEventListener("mouseleave", (event) => {
    settingsText2.style.display = "none";
    settingsCanvas.style.display = "none";
  });

  sb3.addEventListener("mouseover", (event) => {
    settingsText3.style.display = "block";
    settingsText4.style.display = "block";
    fadeInElement(settingsCanvas);
  });

  sb3.addEventListener("mouseleave", (event) => {
    settingsText3.style.display = "none";
    settingsText4.style.display = "none";
    settingsCanvas.style.display = "none";
  });
}

function deletePrompt() {
  clearScreen();
  document.getElementById("deleteConfirmation").style.display = "block";
}

function changeUsernamePrompt() {
  clearScreen();
  document.getElementById("Settings").style.display = "none";
  document.getElementById("changeUsernamePrompt").style.display = "block";
}

function changeUsername() {
  const newUsername = document.getElementById("newUsername").value;
  
  document.getElementById("Settings").style.display = "none";
  
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
  clearScreen();
  document.getElementById("Settings").style.display = "none";
  document.getElementById("changePasswordPrompt").style.display = "block";
}

function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  
  document.getElementById("Settings").style.display = "none";
  
  socket.emit("changePasswordRequest", oldPassword, newPassword, currentUser);
  
  socket.on("changePasswordResponse", function(responce) {
    if (responce == "success") {
      console.log("changed")
      loggedIn();
    } else if (responce == "badpassword") {
      console.log("bad password");
    }
  });
}

function chat() {
  menuNavAnimation();
  clearScreen();
  
  document.getElementById("Chat").style.display = "block";
  
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
  document.getElementById("Main").style.display = "none";
  document.getElementById("Chat").style.display = "none";
  document.getElementById("Login").style.display = "none";
  document.getElementById("Settings").style.display = "none";
  document.getElementById("deleteConfirmation").style.display = "none";
  document.getElementById("changeUsernamePrompt").style.display = "none";
  document.getElementById("changePasswordPrompt").style.display = "none";
  document.getElementById("About").style.display = "none";
  document.getElementById("sideBar").style.display = "none";
}

function about() {
  menuNavAnimation();
  clearScreen();
  document.getElementById("About").style.display = "block";
}

function fadeInElement(element) {
  let op = 0.1;

  element.style.display = "block";
  element.style.opacity = op;

  const timer = setInterval(function() {
    if (op >= 1) {
      clearInterval(timer);
    }

    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op += op * 0.1;
  }, 10);
  
}

function fadeOutElement(element) {
  let op = 1;

  element.style.opacity = op;

  const timer = setInterval(function() {
    if (op <= 0.1) {
      clearInterval(timer);
    }

    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.1;
  }, 10);
}