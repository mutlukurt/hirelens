export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="HireLens logo"
    >
      <circle cx="50" cy="50" r="45" fill="#4A9EFF" />
      <path
        d="M30 35 L30 65 M30 50 L45 50 M45 35 L45 65"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="62" cy="42" r="8" fill="white" />
      <path
        d="M70 55 L62 47 L54 55 L62 63 Z"
        fill="white"
      />
    </svg>
  );
}

export function LogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} role="banner">      <a href="/" aria-label="HireLens home page" className="flex items-center gap-3">
      <Logo className="w-10 h-10" />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 leading-none">
          HireLens
        </span>
        <span className="text-xs text-blue-600 font-medium">
          Talent Intelligence
        </span>
      </div>
      </a>
    </div>
  );
}
