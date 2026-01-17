type ShinyButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
};

export function ShinyButton({
  onClick,
  disabled = false,
  label = "Join Room",
}: ShinyButtonProps) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full overflow-hidden rounded-xl
        bg-black px-6 py-3 text-white font-medium
        transition-all duration-300
        hover:scale-[1.03] active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
      `}
    >
      <span
        className="
          pointer-events-none absolute inset-0
          bg-linear-to-r from-transparent via-white/30 to-transparent
          translate-x-[-120%] group-hover:translate-x-[120%]
          transition-transform duration-700 ease-in-out
        "
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {label}

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
          className="
            transition-all duration-300
            group-hover:rotate-90 group-hover:scale-110
          "
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      </span>
    </button>
  );
}
