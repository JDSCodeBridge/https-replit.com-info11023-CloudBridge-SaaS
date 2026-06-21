type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, string> = {
  sm: "h-10 w-auto",
  md: "h-14 w-auto",
  lg: "h-16 w-auto",
};

export default function Logo({ size = "md" }: { size?: LogoSize }) {
  return (
    <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm flex items-center">
      <img
        src="/codebridge-logo.png"
        alt="CodeBridge"
        className={`${sizes[size]} object-contain`}
      />
    </div>
  );
}
