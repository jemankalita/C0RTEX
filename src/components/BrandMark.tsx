type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "h-8 w-8" }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="4" fill="#C6FF4D" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={className}>C0RTEX</span>;
}
