import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

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
        }),
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

  // Dropdown click outside logic
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsUsersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1)
      return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message: input },
      }),
    );
    setInput("");
  };

  const handleLeave = () => {
    wsRef.current?.close();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] p-4 text-black font-sans relative overflow-hidden">
      {/* Decorative background elements (copied from Enter.tsx) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top Left: Sun Burst */}
        <svg
          className="absolute -top-16 -left-16 w-64 h-64 text-black/5 animate-[spin_12s_linear_infinite]"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 0L55 35L85 15L65 45L100 50L65 55L85 85L55 65L50 100L45 65L15 85L35 55L0 50L35 45L15 15L45 35Z" />
        </svg>

        {/* Top Right: Abstract Blob */}
        <svg
          className="absolute -top-20 -right-20 w-80 h-80 text-black/4"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path
            d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71,34.3C59.8,45.7,48.7,54.9,36.5,63.2C24.3,71.5,11,78.9,-1.2,80.9C-13.4,82.9,-27.8,79.5,-40.4,71.4C-53,63.3,-63.8,50.5,-71.8,36.3C-79.8,22.1,-85,6.5,-82.1,-7.8C-79.2,-22.1,-68.2,-35.1,-56.3,-45.1C-44.4,-55.1,-31.6,-62.1,-18.7,-65.4C-5.8,-68.7,7.2,-68.3,20.2,-67.9"
            transform="translate(100 100)"
          />
        </svg>

        {/* Middle Right: Plus Signs */}
        <div className="absolute top-1/3 right-12 flex flex-col gap-8">
          <div
            className="text-6xl font-black text-black/5 animate-pulse"
            style={{ animationDuration: "3s" }}
          >
            +
          </div>
          <div
            className="text-4xl font-black text-black/5 animate-bounce ml-8"
            style={{ animationDuration: "4s" }}
          >
            +
          </div>
        </div>

        {/* Middle Left: Static Squiggle */}
        <svg
          className="absolute top-1/3 left-8 w-16 h-48 text-black/5"
          viewBox="0 0 50 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <path d="M25 0 Q50 25 25 50 Q0 75 25 100 Q50 125 25 150 Q0 175 25 200" />
        </svg>

        {/* Rotating Triangles */}
        <svg
          className="absolute top-1/4 left-1/4 w-16 h-16 text-black/5 animate-[spin_8s_linear_infinite]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 22H22L12 2Z" />
        </svg>
        <svg
          className="absolute bottom-1/4 right-1/3 w-20 h-20 text-black/5 animate-[spin_12s_reverse_linear_infinite]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 2 22 22 22" />
        </svg>

        {/* Bottom Right: Spinning Dashed Circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 border-4 border-dashed border-black/5 rounded-full animate-[spin_20s_linear_infinite]" />

        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(black 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main Chat Window */}
      <div
        className="w-full max-w-4xl h-[90vh] md:h-[85vh] bg-white border-4 border-black flex flex-col relative z-10"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        <header className="h-20 bg-yellow-300 border-b-4 border-black px-6 flex items-center justify-between shrink-0 relative">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(black 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />

          <div className="relative z-10">
            <h2 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
              #{roomId}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <span
                className={`w-3 h-3 border-2 border-black rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {/* Users Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsUsersOpen(!isUsersOpen)}
                className="bg-white border-2 border-black px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {users.length}
              </button>

              {isUsersOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-black shadow-[4px_4px_0_#000] z-50">
                  <div className="max-h-60 overflow-y-auto">
                    {users.length === 0 ? (
                      <div className="p-3 text-xs font-bold text-center opacity-50 uppercase">
                        No users
                      </div>
                    ) : (
                      users.map((u) => (
                        <div
                          key={u}
                          className="p-2 border-b-2 border-black last:border-0 hover:bg-yellow-50 flex items-center justify-between text-sm font-bold"
                        >
                          <span className="truncate">{u}</span>
                          {u === name && (
                            <span className="text-[10px] bg-black text-white px-1 ml-2">
                              YOU
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLeave}
              className="bg-red-500 text-white border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all cursor-pointer"
            >
              Leave
            </button>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white relative"
        >
          {/* Subtle grid background for message area */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none top-0"
            style={{
              backgroundImage: "radial-gradient(black 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-black/20 font-black uppercase text-2xl md:text-4xl text-center space-y-4">
              <div>No Messages Yet</div>
              <div className="text-sm md:text-base font-bold opacity-50 tracking-widest text-black/10">
                Start the conversation
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.sender === name;
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-xs font-black uppercase mb-1 ml-1 text-black/50">
                        {m.sender}
                      </span>
                    )}

                    <div
                      className={`
                        p-4 text-sm font-bold border-2 border-black
                        ${
                          isMe
                            ? "bg-black text-white shadow-[4px_4px_0_#888]"
                            : "bg-white text-black shadow-[4px_4px_0_#000]"
                        }
                      `}
                    >
                      {m.message}
                    </div>

                    <span className="text-[10px] font-mono font-bold mt-1 opacity-40 px-1">
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

        {/* Input Area */}
        <form
          onSubmit={sendMessage}
          className="p-4 md:p-6 bg-white border-t-4 border-black flex gap-3 md:gap-4 shrink-0"
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE HERE..."
            className="flex-1 bg-white border-4 border-black px-4 py-3 text-sm font-bold placeholder:text-black/20 outline-none focus:bg-yellow-50 transition-colors shadow-[4px_4px_0_#000] focus:shadow-[2px_2px_0_#000] focus:translate-x-0.5 focus:translate-y-0.5"
          />

          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="bg-yellow-300 text-black border-4 border-black px-4 md:px-8 py-3 font-black uppercase tracking-wider shadow-[4px_4px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span className="hidden md:inline">Send</span>
            <span className="md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
