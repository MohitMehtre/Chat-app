import { WebSocketServer, WebSocket } from "ws";



const PORT = Number(process.env.PORT ?? 8080);

const MAX_MESSAGE_SIZE = 4_000_000; // 4MB
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_MESSAGE_LENGTH = 10_000;

const HEARTBEAT_INTERVAL = 30_000;

const RATE_LIMIT_WINDOW = 1000;
const RATE_LIMIT_MAX = 5;

const MAX_ROOMS = 1_000;
const MAX_USERS_PER_ROOM = 50;
const MAX_BUFFERED_AMOUNT = 8 * 1024 * 1024; // 8MB cap



interface User {
  socket: WebSocket;
  name: string;
}

interface Room {
  roomId: string;
  passwordHash?: string;
  users: User[];
}

interface RateLimitState {
  count: number;
  lastReset: number;
}


const rooms = new Map<string, Room>();
const socketRoomMap = new Map<WebSocket, string>();
const rateLimitMap = new Map<WebSocket, RateLimitState>();

const wss = new WebSocketServer({ port: PORT });


function send(socket: WebSocket, data: object) {
  if (socket.readyState !== WebSocket.OPEN) return;
  if (socket.bufferedAmount > MAX_BUFFERED_AMOUNT) {
    socket.close(1008, "Client too slow");
    return;
  }
  socket.send(JSON.stringify(data));
}

function error(socket: WebSocket, message: string) {
  send(socket, { type: "error", message });
}

function broadcastRoomInfo(room: Room) {
  const users = room.users.map(u => u.name);
  const payload = { users, count: users.length };
  room.users.forEach(u => send(u.socket, { type: "room-info", payload }));
}

function rateLimit(socket: WebSocket): boolean {
  const now = Date.now();
  const state = rateLimitMap.get(socket) ?? { count: 0, lastReset: now };

  if (now - state.lastReset > RATE_LIMIT_WINDOW) {
    state.count = 1;
    state.lastReset = now;
  } else {
    state.count++;
  }

  rateLimitMap.set(socket, state);
  return state.count <= RATE_LIMIT_MAX;
}


const heartbeat = setInterval(() => {
  wss.clients.forEach((socket: any) => {
    if (socket.isAlive === false) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on("close", () => clearInterval(heartbeat));



wss.on("connection", (socket: any) => {
  socket.isAlive = true;

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  socket.on("message", (raw: Buffer) => {
    if (!rateLimit(socket)) {
      error(socket, "Rate limit exceeded");
      return;
    }

    if (raw.length > MAX_MESSAGE_SIZE) {
      socket.close(1009, "Message too large");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw.toString("utf8"));
    } catch {
      error(socket, "Invalid JSON");
      return;
    }

    const { type, payload } = parsed;
    if (!type || typeof payload !== "object") return;

    

    if (type === "join") {
      if (socketRoomMap.has(socket)) {
        error(socket, "Already joined");
        return;
      }

      let { roomId, name, password = "" } = payload;

      if (!roomId || !name) {
        error(socket, "Missing fields");
        return;
      }

      roomId = String(roomId).trim().slice(0, 50);
      name = String(name).trim().slice(0, 20);

      if (!roomId || !name) {
        error(socket, "Invalid room or name");
        return;
      }

      if (!rooms.has(roomId) && rooms.size >= MAX_ROOMS) {
        error(socket, "Server full");
        return;
      }

      let room = rooms.get(roomId);

      if (!room) {
        room = { roomId, users: [] };
        if (password) room.passwordHash = password; 
        rooms.set(roomId, room);
      } else {
        if (room.passwordHash && room.passwordHash !== password) {
          error(socket, "Wrong password");
          return;
        }
        if (room.users.length >= MAX_USERS_PER_ROOM) {
          error(socket, "Room full");
          return;
        }
        if (room.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
          error(socket, "Name taken");
          return;
        }
      }

      room.users.push({ socket, name });
      socketRoomMap.set(socket, roomId);

      broadcastRoomInfo(room);
      return;
    }

  

    if (type === "chat") {
      const roomId = socketRoomMap.get(socket);
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      const { message, file } = payload;

      if ((!message || !String(message).trim()) && !file) return;

      if (message && String(message).length > MAX_MESSAGE_LENGTH) {
        error(socket, "Message too long");
        return;
      }

      if (file) {
        const { name, type, size, data } = file;
        if (
          typeof name !== "string" ||
          typeof type !== "string" ||
          typeof size !== "number" ||
          typeof data !== "string" ||
          size > MAX_FILE_SIZE
        ) {
          error(socket, "Invalid file");
          return;
        }
      }

      const sender =
        room.users.find(u => u.socket === socket)?.name ?? "Anonymous";

      const chatPayload = {
        sender,
        message: message ?? "",
        file,
        timestamp: new Date().toISOString(),
      };

      room.users.forEach(u =>
        send(u.socket, { type: "chat", payload: chatPayload })
      );
    }
  });

  socket.on("close", () => {
    rateLimitMap.delete(socket);

    const roomId = socketRoomMap.get(socket);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.users = room.users.filter(u => u.socket !== socket);
    socketRoomMap.delete(socket);

    if (room.users.length === 0) {
      rooms.delete(roomId);
    } else {
      broadcastRoomInfo(room);
    }
  });
});

