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
      className={`mix-blend-screen ${className}`}
    />
  );
}
