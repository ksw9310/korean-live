import Link from "next/link";

const RED = "#E5323B";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Speech bubble */}
      <path
        d="M3 5C3 3.34 4.34 2 6 2H26C27.66 2 29 3.34 29 5V21C29 22.66 27.66 24 26 24H19L16 30L13 24H6C4.34 24 3 22.66 3 21V5Z"
        className="fill-foreground"
      />
      {/* Red live circle */}
      <circle cx="16" cy="13" r="5.5" fill={RED} />
      {/* Play triangle (white) */}
      <path d="M14.2 10.4L19.2 13L14.2 15.6V10.4Z" fill="white" />
    </svg>
  );

  const text = (
    <span className={`font-bold ${textSize} tracking-tight leading-none`}>
      Korean<span style={{ color: RED }}>Live</span>
    </span>
  );

  if (!href) {
    return (
      <div className="flex items-center gap-2">
        {icon}
        {text}
      </div>
    );
  }

  return (
    <Link href={href} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
      {icon}
      {text}
    </Link>
  );
}
