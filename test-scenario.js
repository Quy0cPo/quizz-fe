import { io } from "socket.io-client";

const socket = io("http://localhost:4001");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  // Simulate clicking "Create with Sample Quiz"
  socket.emit("create-room", { name: "TestHost", icon: "🐶", quiz: null, isPlaying: true });
});

let savedRoomCode = null;

socket.on("room-created", (data) => {
  console.log("Room Created:", data);
  savedRoomCode = data.roomCode;
});

socket.on("player-list", (data) => {
  console.log("Player List:", data.players);
  if (savedRoomCode) {
    console.log("Emitting start-game...");
    socket.emit("start-game", { roomCode: savedRoomCode });
  }
});

socket.on("error", (msg) => {
  console.error("Error from server:", msg);
  process.exit(1);
});

socket.on("question-start", (payload) => {
  console.log("Game started successfully!", payload.question);
  socket.disconnect();
  process.exit(0);
});
