import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sessions = new Map();
const socketMap = new Map();

const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  console.log("Request Hit");
  res.json("Hello World");
});

io.on("connection", (socket) => {
  socketMap.set(socket.id, socket);
  socket.on("disconnect", () => {
    socketMap.delete(socket.id);
  });

  socket.on("message", (msg) => {
    io.emit("message", `Reply To ${msg}`); // Broadcast the message to all clients
  });
});

server.listen(PORT, () => {
  console.log("Server Active");
});

export const module = { sessions, io };
