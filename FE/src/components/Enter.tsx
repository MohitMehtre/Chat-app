import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Enter() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");

  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const navigate = useNavigate();

  const isValid = name.trim() && roomId.trim();

  function warmUpServer(): Promise<void> {
    return new Promise((resolve) => {
      const ws = new WebSocket(import.meta.env.VITE_WS_URL);

      ws.onopen = () => {
        ws.close();
        resolve();
      };

      ws.onerror = () => {
        resolve();
      };
    });
  }

  useEffect(() => {
    if (!isWarmingUp) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWarmingUp]);

  async function joinRoom() {
    if (!isValid) return;

    localStorage.setItem("name", name);
    localStorage.setItem("password", password);
    localStorage.setItem("roomId", roomId);

    setIsWarmingUp(true);
    setSeconds(0);

    await warmUpServer();

    navigate(`/chat/${roomId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {isWarmingUp && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-white border-t-transparent animate-spin" />

            <p className="text-white text-sm tracking-wide">
              {seconds < 5 ? "Waking up server…" : "Almost there…"}
            </p>

            <p className="text-white/40 text-xs">{seconds}s elapsed</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinRoom();
          }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">
              Your Details
            </p>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">
              Room Details
            </p>

            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
            />

            <input
              type="password"
              placeholder="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || isWarmingUp}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 cursor-pointer text-white transition
              ${
                isValid && !isWarmingUp
                  ? "bg-black hover:bg-gray-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Join Room
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Enter;
