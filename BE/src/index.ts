import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
  socket: WebSocket;
  name: string;
}

interface Room {
  roomId: string;
  password: string;
  users: User[];
}

const rooms = new Map<string, Room>();
const socketRoomMap = new Map<WebSocket, string>();


function broadcastRoomInfo(room: Room) {
  const users = room.users.map((u) => u.name);

  const message = JSON.stringify({
    type: "room-info",
    payload: {
      users,
      count: users.length,
    },
  });

  room.users.forEach((u) => {
    if (u.socket.readyState === WebSocket.OPEN) {
      u.socket.send(message);
    }
  });
}


wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      const { type, payload } = parsed;

      if (!type || !payload) return;

    
      if (type === "join") {
        const { roomId, password = "", name } = payload;
        if (!roomId || !name) return;


        if (socketRoomMap.has(socket)) return;

        let room = rooms.get(roomId);

        if (!room) {
          room = {
            roomId,
            password,
            users: [],
          };
          rooms.set(roomId, room);
        } else {
          if (room.password && room.password !== password) {
            socket.send(
              JSON.stringify({
                type: "error",
                message: "Wrong password",
              })
            );
            return;
          }

          if (
            room.users.some(
              (u) => u.name.toLowerCase() === name.toLowerCase()
            )
          ) {
            socket.send(
              JSON.stringify({
                type: "error",
                message: "Name already taken",
              })
            );
            return;
          }
        }

        room.users.push({ socket, name });
        socketRoomMap.set(socket, roomId);

        broadcastRoomInfo(room);
        return;
      }

      
      if (type === "chat") {
        const { message } = payload;
        if (!message) return;

        const roomId = socketRoomMap.get(socket);
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        const sender =
          room.users.find((u) => u.socket === socket)?.name ||
          "Anonymous";

        const chatMessage = JSON.stringify({
          type: "chat",
          payload: {
            message,
            sender,
            timestamp: new Date().toISOString(),
          },
        });
 
        room.users.forEach((u) => {
          if (u.socket.readyState === WebSocket.OPEN) {
            u.socket.send(chatMessage);
          }
        });
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  
  socket.on("close", () => {
    const roomId = socketRoomMap.get(socket);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.users = room.users.filter((u) => u.socket !== socket);
    socketRoomMap.delete(socket);

    if (room.users.length === 0) {
      rooms.delete(roomId);
    } else {
      broadcastRoomInfo(room);
    }
  });
});


