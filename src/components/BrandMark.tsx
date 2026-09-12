type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "h-8 w-8" }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="9.5" stroke="#54D7FF" strokeOpacity="0.7" />
      <path
        d="M21 9.2A8.4 8.4 0 1 0 21 22.8"
        stroke="#B8FF4D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.4" fill="#B8FF4D" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`tracking-tight ${className}`}>
      C<span className="text-lime">0</span>RTEX
    </span>
  );
}
