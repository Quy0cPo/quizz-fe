import { io } from "socket.io-client";

const socket = io("http://localhost:4001");

socket.on("connect", () => {
  socket.emit("create-room", { name: "TestOldFrontend", icon: "🐶", quiz: null }); // explicitly omit isPlaying
});

socket.on("room-created", (data) => {
  console.log("Room created");
});

socket.on("player-list", (data) => {
  console.log("Player List:", data.players);
  socket.disconnect();
  process.exit(0);
});
