export function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        className="h-full w-full object-cover opacity-35"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 grid-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,17,26,0.2),#06080d_72%)]" />
    </div>
  );
}
