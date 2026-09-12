type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className = "h-16 w-auto" }: SiteLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/c0rtex-logo.png"
      alt="C0RTEX"
      width={880}
      height={345}
      className={`select-none ${className}`}
      style={{
        filter:
          "contrast(1.18) brightness(1.08) drop-shadow(0 0 10px rgba(198,255,77,0.35)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
      }}
    />
  );
}
