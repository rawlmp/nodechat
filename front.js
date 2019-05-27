const socket = io();
const d = document;

//Colocar el reloj en el html...
const deviceTime = d.querySelector(".status-bar .time");
const messageTime = d.querySelectorAll(".message .time");

deviceTime.innerHTML = moment().format("LT");

// ... y actualizarlo cada segundo usando la libreria moment.js
setInterval(function() {
  deviceTime.innerHTML = moment().format("LT");
}, 1000);

//Los "listeners" de socket a los emit del server.js
socket.on("message", addMessages);
socket.on("user", updateUsers);
socket.on("exit", updateUsers);

//Eventos en los botones
d.querySelector("#send").onclick = () => {
  sendMessage({
    name: d.querySelector("#name").value || "Guest",
    message: d.querySelector("#message").value,
    time: moment().format("LT")
  });
};

d.querySelector("#message").onkeyup = e => {
  if (e.keyCode === 13 && d.querySelector("#message").value.trim().length > 0) {
    sendMessage({
      name: d.querySelector("#name").value || "Guest",
      message: d.querySelector("#message").value,
      time: moment().format("LT")
    });
  }
};

d.querySelector("#enter").onclick = () => {
  d.querySelector(".user").style.display = "none";
  d.querySelector(".noUser").style.display = "";
  d.querySelector(".noUser2").style.display = "";
  getMessages();
};

//Funciones
function updateUsers(num) {
  d.querySelector(".status").innerHTML = num + " miembros online";
}

function addMessages(message) {
  if (message.name == d.querySelector("#name").value) {
    d.querySelector("#messages").insertAdjacentHTML(
      "beforeend",
      `
    <div class="message sent">
      ${message.message}
      <span class="metadata">
        <span class="time">${message.time}</span>
        <span class="tick">
          <i class="zmdi zmdi-check-all"></i>
        </span>
      </span>
    </div>
    `
    );
  } else {
    d.querySelector("#messages").insertAdjacentHTML(
      "beforeend",
      `
      <div class="message received">
        <p class="nombre">${message.name}</p>
        <span>${message.message}</span>
        <span class="metadata">
        <span class="time">${message.time}</span>
        <span class="tick">
          <i class="zmdi zmdi-check-all"></i>
        </span>
      </span>
      </div>
    `
    );
  }
  d.querySelector("#messages").scrollTop = d.querySelector(
    "#messages"
  ).scrollHeight;
}

async function getMessages() {
  let response = await fetch("/messages");
  let data = await response.json();
  data.forEach(addMessages);
}

function sendMessage(message) {
  fetch("/messages", {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json"
    }
  });
  d.querySelector("#message").value = "";
}
