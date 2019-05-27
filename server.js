//Express es un framework web para Node
var express = require("express");
var app = express();
var server = app.listen(8081);
const path = require("path");

require("dotenv").config();

// app.get("/", function(req, res) {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

//Estas opciones son requisito para usar los datos en el POST y en el GET.
//Antes se usaba una librería llamada BodyParser. En la última versión de Express >4.0
//ya no es necesario
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Esta instrucción es para que el propio JS cargue el HTML
app.use(express.static(__dirname));

//Socket.io es el encargado de gestionar los websockets.
//Estos websockets son como "listeners" y "fetch" a la vez...
var io = require("socket.io")(server);

//Mongoose es el encargado de gestionar la base de datos de MongoDB
var mongoose = require("mongoose");

//Url de la database en MLAB
var dbUrl =
  "mongodb+srv://raul:ubiqum2019@mongochat-q3fmc.mongodb.net/test?retryWrites=true";

//Conectamos con la BBDD
mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true }, err => {
  console.log("mongodb connected in " + process.env.PORT);
});

//Esquema o modelo del mensaje
var Message = mongoose.model("Message", {
  name: String,
  message: String,
  time: String
});

//Función ejecutada al usar enviar un GET al endpoint /messages
app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

//Función ejecutada al usar enviar un POST al endpoint /messages
app.post("/messages", (req, res) => {
  var message = new Message(req.body);
  message.save(err => {
    if (err) sendStatus(500);
    //Emitimos un evento "message cuando se envía un POST"
    io.emit("message", req.body);
    res.sendStatus(200);
  });
});

//Al conectarse un usuario se le une a la sala Ubiqum y se emite el evento "user"
io.on("connection", socket => {
  socket.join("ubiqum");
  io.emit("user", io.sockets.adapter.rooms["ubiqum"].length);

  //Al desconectar se dispara el evento "exit"
  socket.on("disconnect", () => {
    if (io.sockets.adapter.rooms["ubiqum"]) {
      io.emit("exit", io.sockets.adapter.rooms["ubiqum"].length);
    }
  });
});
