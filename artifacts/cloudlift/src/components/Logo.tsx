type LogoSize = "sm" | "md" | "lg";

const imgSizes: Record<LogoSize, string> = {
  sm: "h-7 w-auto",
  md: "h-8 w-auto",
  lg: "h-9 w-auto",
};

const textSizes: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export default function Logo({ size = "md" }: { size?: LogoSize }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="bg-white rounded-lg px-2 py-1 shadow-sm flex items-center shrink-0">
        <img
          src="/codebridge-logo.png"
          alt="CodeBridge icon"
          className={`${imgSizes[size]} object-contain`}
        />
      </div>
      <span className={`font-bold tracking-tight text-foreground ${textSizes[size]}`}>
        Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Bridge</span>
      </span>
    </div>
  );
}
