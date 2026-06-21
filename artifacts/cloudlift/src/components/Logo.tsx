type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { img: string; text: string; wrapper: string }> = {
  sm: { img: "h-7 w-auto", text: "text-base font-bold", wrapper: "px-2.5 py-1.5 gap-2 rounded-lg" },
  md: { img: "h-10 w-auto", text: "text-xl font-bold", wrapper: "px-3 py-2 gap-2.5 rounded-xl" },
  lg: { img: "h-12 w-auto", text: "text-2xl font-bold", wrapper: "px-4 py-2.5 gap-3 rounded-xl" },
};

export default function Logo({ size = "md" }: { size?: LogoSize }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center bg-white shadow-sm ${s.wrapper}`}>
      <img src="/logo.png" alt="CodeBridge" className={`${s.img} drop-shadow-sm`} />
      <span className={`tracking-tight text-[hsl(230,40%,12%)] ${s.text}`}>
        CodeBridge
      </span>
    </div>
  );
}
