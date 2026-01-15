import { useEffect, useRef, useState } from "react";

const UsersDropdown = ({ users }: { users: string[] }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = localStorage.getItem("name") ?? "";

  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);


  const sortedUsers = [...users].sort((a, b) => {
    if (a === currentUser) return -1;
    if (b === currentUser) return 1;
    return a.localeCompare(b);
  });

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition cursor-pointer"
      >
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
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{users.length} users</span>
      </button>


      {open && (
        <div
          className="absolute right-0 mt-2 w-44 bg-black border border-white/10
                     rounded-lg shadow-lg p-2 z-20
                     origin-top-right animate-in fade-in zoom-in-95"
        >
          {sortedUsers.length === 0 ? (
            <div className="text-xs text-white/40 text-center py-2">
              No users connected
            </div>
          ) : (
            sortedUsers.map((u) => {
              const isMe = u === currentUser;

              return (
                <div
                  key={u}
                  className={`flex items-center justify-between text-sm py-1.5 px-2 rounded
                    ${
                      isMe
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/80 hover:bg-white/5"
                    }
                  `}
                >
                  <span className="truncate">{u}</span>
                  {isMe && (
                    <span className="text-xs uppercase tracking-wider">
                      You
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default UsersDropdown;
