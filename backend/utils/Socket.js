import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-land", (landId) => {
      socket.join(landId);
    });
  });
};

// 👇 IMPORTANT: named export
export { io };