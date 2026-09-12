export function BrandMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="#54D7FF" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#B8FF4D" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="2.2" fill="#B8FF4D" />
      <path d="M16 2v5M16 25v5M2 16h5M25 16h5" stroke="#54D7FF" strokeWidth="1.2" />
    </svg>
  );
}
