import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden
        w-12 h-12 flex items-center justify-center
        border-4 border-black dark:border-white
        bg-white dark:bg-zinc-900
        shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]
        active:translate-x-0.5 active:translate-y-0.5
        active:shadow-[2px_2px_0_#000] dark:active:shadow-[2px_2px_0_#fff]
        transition-all cursor-pointer
      `}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Moon Icon */}
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
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Sun Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles Effect */}
      <AnimatePresence>
        <Particles key={theme} isDark={isDark} />
      </AnimatePresence>
    </button>
  );
}

function Particles({ isDark }: { isDark: boolean }) {
  // Create an array of 8 particles
  const particles = Array.from({ length: 8 });

  return (
    <>
      {particles.map((_, i) => {
        const angle = (i * 360) / particles.length;
        const radius = 20; // Distance to travel
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? "bg-white" : "bg-black"} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
          />
        );
      })}
    </>
  );
}
