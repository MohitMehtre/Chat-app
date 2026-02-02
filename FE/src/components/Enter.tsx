import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { easeIn, easeInOut, motion } from "motion/react";

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

  const shakeAnimation = {
    x: [0, -6, 6, -6, 6, 0],
    scale: [1, 1.02, 1],
  };

  const shakeTransition = {
    duration: 0.35,
    easing: easeInOut,
  };

  const fallAnimation = {
    y: [0, 70, 1000],
    rotate: [0, 4, 100],
  };

  const fallTransition = {
    duration: 0.6,
    easing: easeIn,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] px-4 overflow-hidden relative">
      {/* Decorative background elements - Non-overlapping layout */}
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

        {/* Bottom Left: Geometric Lines */}
        <div className="absolute bottom-12 left-12 flex flex-col gap-3 -rotate-45 opacity-5">
          <div className="w-32 h-3 bg-black rounded-full" />
          <div className="w-24 h-3 bg-black rounded-full" />
          <div className="w-40 h-3 bg-black rounded-full" />
        </div>

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

        {/* Top Center: Hashtag */}
        <div className="absolute top-8 left-1/2 -ml-64 text-8xl font-black text-black/2 -rotate-12 select-none">
          #
        </div>

        {/* Grid dots - Subtle Texture Over Everything */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(black 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {isWarmingUp && (
        <div className="fixed inset-0 bg-[#f5f0e8]/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div
              className="inline-block border-4 border-black px-8 py-6 bg-white"
              style={{ boxShadow: "6px 6px 0 #000" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 bg-black animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-black animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-black animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p className="font-bold text-black uppercase tracking-wider text-sm">
                {seconds < 5 ? "Connecting..." : "Almost there"}
              </p>
              <p className="text-black/50 text-xs mt-1 font-mono">{seconds}s</p>
            </div>
          </div>
        </div>
      )}

      <motion.div
        className="w-full max-w-4xl z-10 relative"
        animate={
          hasFallen
            ? fallAnimation
            : showError
              ? shakeAnimation
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
        }
        transition={hasFallen ? fallTransition : shakeTransition}
      >
        {/* Main card */}
        <div
          className={`bg-white border-4 border-black ${showError && !hasFallen ? "border-red-600" : ""}`}
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          <div className="grid md:grid-cols-5">
            {/* Left Column: Branding */}
            <div className="md:col-span-2 bg-yellow-300 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-between relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(black 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-black flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                  Chat
                  <br />
                  Room
                </h1>
                <p className="font-bold text-sm opacity-60">
                  Connect. Talk. Vanish.
                </p>
              </div>

              <div className="relative z-10 mt-12 hidden md:block">
                <div className="text-[80px] leading-none opacity-20 font-black absolute -bottom-10 -left-4">
                  ➔
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-3 p-8 md:p-10 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  joinRoom();
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      placeholder="who are you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-2 border-black px-4 py-3 text-sm font-medium placeholder:text-black/30 outline-none focus:bg-yellow-50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider">
                      Room ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      ref={roomRef}
                      type="text"
                      placeholder="room-name"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full border-2 border-black px-4 py-3 text-sm font-medium placeholder:text-black/30 outline-none focus:bg-yellow-50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Password{" "}
                    <span className="text-black/30 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-black px-4 py-3 text-sm font-medium placeholder:text-black/30 outline-none focus:bg-yellow-50 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-black text-white font-bold uppercase tracking-wider py-4 border-4 border-black hover:bg-white hover:text-black transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 group"
                    style={{ boxShadow: "4px 4px 0 #000" }}
                  >
                    <span>Enter Room</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {errorCount >= 3 && !hasFallen && (
                  <p className="text-center text-xs font-bold text-red-600 uppercase tracking-wider">
                    ↑ fill in the fields first
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-black/40 mt-6 font-medium">
          NO ACCOUNT NEEDED • JUST JUMP IN
        </p>
      </motion.div>
    </div>
  );
}

export default Enter;
