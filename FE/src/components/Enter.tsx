import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShinyButton } from "./ShinyButton";

function Enter() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showError, setShowError] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hasFallen, setHasFallen] = useState(false);

  const lastErrorClickRef = useRef<number | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const MAX_GAP_MS = 800;
  const FALL_THRESHOLD = 5;

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
    if (!isValid) {
      const now = Date.now();
      const last = lastErrorClickRef.current;

      if (last && now - last <= MAX_GAP_MS) {
        setErrorCount((c) => c + 1);
      } else {
        setErrorCount(0);
      }

      lastErrorClickRef.current = now;

      setShowError(true);

      setTimeout(() => setShowError(false), 350);

      if (errorCount + 1 >= FALL_THRESHOLD) {
        setHasFallen(true);

        setTimeout(() => {
          setHasFallen(false);
          setErrorCount(0);
        }, 10000);
      }

      if (!name.trim()) {
        nameRef.current?.focus();
      } else if (!roomId.trim()) {
        roomRef.current?.focus();
      }
      return;
    }

    setErrorCount(0);
    lastErrorClickRef.current = null;

    localStorage.setItem("name", name);
    localStorage.setItem("password", password);
    localStorage.setItem("roomId", roomId);

    setIsWarmingUp(true);
    setSeconds(0);

    await warmUpServer();

    navigate(`/chat/${roomId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 overflow-hidden">
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

      <div
        className={`w-full max-w-md bg-white rounded-2xl p-6 shadow-xl z-10 transition 
          ${
            hasFallen
              ? "animate-fall"
              : showError
                ? "border-2 border-red-500 animate-shake ring-2 ring-red-400/40"
                : "border border-transparent"
          }`}
      >
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
              ref={nameRef}
              type="text"
              placeholder="Your name*"
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
              ref={roomRef}
              type="text"
              placeholder="Room ID*"
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

          <ShinyButton />
          {errorCount >= 3 && !hasFallen && (
            <p className="text-center text-xs text-black/40">
              okay okay… calm down
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Enter;
