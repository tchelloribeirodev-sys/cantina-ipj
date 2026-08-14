interface LogoProps {
  size?: number;
}

export function Logo({ size = 40 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3157D5" />
          <stop offset="1" stopColor="#2445B2" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />

      {/* cruz */}
      <rect x="29" y="9" width="6" height="16" rx="1.5" fill="white" />
      <rect x="23" y="15" width="18" height="6" rx="1.5" fill="white" />

      {/* xícara */}
      <rect x="17" y="27" width="26" height="19" rx="4" fill="white" />
      <path
        d="M43 31h3a5 5 0 0 1 0 10h-3"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="13" y="49" width="34" height="4" rx="2" fill="white" opacity="0.85" />
    </svg>
  );
}
