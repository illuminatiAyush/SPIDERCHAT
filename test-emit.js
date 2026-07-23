const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  auth: { username: "Tester" }
});

socket.on("connect", () => {
  console.log("Connected as", socket.id);
  socket.emit("create_room");
});

socket.on("room_created", (roomCode) => {
  console.log("Room created:", roomCode);
  socket.emit("join_room", { roomCode, username: "Tester" });
  
  setTimeout(() => {
    console.log("Sending message...");
    socket.emit("send_message", {
      roomCode,
      text: "Hello from test script!",
      username: "Tester"
    });
    
    setTimeout(() => {
      socket.disconnect();
      console.log("Disconnected.");
    }, 1000);
  }, 1000);
});

socket.on("error_message", (err) => console.error("Error:", err));
socket.on("connect_error", (err) => console.error("Connect Error:", err));
