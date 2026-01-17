import type { ReactNode } from "react";

type GlowCardProps = {
  children: ReactNode;
  className: string;
};

export function GlowCard({ children, className = "" }: GlowCardProps) {
  return (
    <div className="relative group">
      <div
        className="
          absolute -inset-px rounded-2xl
          bg-linear-to-r from-pink-500 via-purple-500 to-blue-500
          opacity-60 blur-md
          group-hover:opacity-100 transition-opacity duration-300
        "
      />

      <div
        className={`
          relative rounded-2xl bg-white p-6
          border border-white/10
          shadow-xl transition-transform ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
