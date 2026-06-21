type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { icon: number; text: string; wrapper: string }> = {
  sm: { icon: 28, text: "text-base font-bold", wrapper: "px-2.5 py-1.5 gap-2 rounded-lg" },
  md: { icon: 36, text: "text-xl font-bold",   wrapper: "px-3 py-2 gap-2.5 rounded-xl" },
  lg: { icon: 44, text: "text-2xl font-bold",  wrapper: "px-4 py-2.5 gap-3 rounded-xl" },
};

function BridgeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="44" height="44" rx="10" fill="url(#bg)" />

      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="arc" x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>

      <path d="M6 28 Q22 10 38 28" stroke="url(#arc)" strokeWidth="3" strokeLinecap="round" fill="none" />

      <line x1="6"  y1="22" x2="6"  y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="22" x2="38" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="16" x2="22" y2="28" stroke="white" strokeWidth="2"   strokeLinecap="round" />
      <line x1="14" y1="20" x2="14" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="30" y1="20" x2="30" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />

      <line x1="5" y1="30" x2="39" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      <text x="8" y="41" fontSize="7" fill="white" fontFamily="monospace" fontWeight="bold" opacity="0.55">&lt;/&gt;</text>
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: LogoSize }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center bg-white shadow-sm ${s.wrapper}`}>
      <BridgeIcon size={s.icon} />
      <span className={`tracking-tight ${s.text}`}>
        <span style={{ color: "#6366f1" }}>Code</span>
        <span style={{ color: "#1e1b4b" }}>Bridge</span>
      </span>
    </div>
  );
}
