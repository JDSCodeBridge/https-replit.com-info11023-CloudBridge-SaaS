type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { img: string; text: string; wrapper: string }> = {
  sm: { img: "h-5 w-auto", text: "text-xs", wrapper: "px-2 py-1 gap-1.5 rounded-md" },
  md: { img: "h-8 w-auto", text: "text-sm", wrapper: "px-2.5 py-1.5 gap-2 rounded-lg" },
  lg: { img: "h-10 w-auto", text: "text-base", wrapper: "px-3 py-1.5 gap-2.5 rounded-xl" },
};

export default function Logo({ size = "md" }: { size?: LogoSize }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center bg-white ${s.wrapper}`}>
      <img src="/logo.png" alt="CloudLift" className={s.img} />
      <span className={`font-bold tracking-tight text-[hsl(230,40%,12%)] ${s.text}`}>
        CloudLift
      </span>
    </div>
  );
}
