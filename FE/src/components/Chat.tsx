import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UsersDropdown from "./UsersDropdown";

interface Message {
  message: string;
  sender: string;
  timestamp: string;
}

const WS_URL = import.meta.env.VITE_WS_URL;

function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const name = localStorage.getItem("name") || "Anonymous";
  const password = localStorage.getItem("password") || "";

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomId, password, name },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "room-info":
            setUsers(data.payload.users || []);
            break;

          case "chat":
            setMessages((prev) => [...prev, data.payload as Message]);
            break;

          case "error":
            alert(data.message);
            navigate("/");
            break;
        }
      } catch {
        console.error("Invalid WS message:", event.data);
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [roomId, navigate, name, password]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1)
      return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message: input },
      })
    );
    setInput("");
  };

  const handleLeave = () => {
    wsRef.current?.close();
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <div>
          <h2 className="font-semibold text-lg">#{roomId}</h2>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UsersDropdown users={users} />
          <button
            onClick={handleLeave}
            className="text-red-400 hover:text-red-500 text-sm cursor-pointer"
          >
            Leave
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/20">
            No messages yet
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.sender === name;
            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%] space-y-1">
                  <div
                    className={`px-4 py-2 rounded-xl text-sm ${
                      isMe ? "bg-neutral-800" : "bg-white/10"
                    }`}
                  >
                    {!isMe && (
                      <div className="text-xs text-white/40 mb-1">
                        {m.sender}
                      </div>
                    )}
                    {m.message}
                  </div>

                  <span className="text-xs text-white/30">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message #${roomId}`}
          className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm focus:outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || !isConnected}
          className="bg-white text-black px-4 py-2 rounded-full disabled:opacity-50 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chat;
