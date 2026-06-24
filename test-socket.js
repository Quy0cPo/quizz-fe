import { io } from "socket.io-client";

const socket = io("http://localhost:4001");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("create-room", { name: "TestHost", icon: "🐶", quiz: null, isPlaying: true });
});

socket.on("room-created", (data) => {
  console.log("Room Created:", data);
});

socket.on("player-list", (data) => {
  console.log("Player List:", data.players);
  socket.disconnect();
  process.exit(0);
});
