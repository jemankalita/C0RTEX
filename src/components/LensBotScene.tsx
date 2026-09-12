"use client";

import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRobot } from "@/components/RobotContext";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <RobotFallback label="Loading analyst" />,
});

const SPLINE_SCENE = "https://prod.spline.design/MFXfVNwi2rumDugy/scene.splinecode";

type LensBotSceneProps = {
  className?: string;
};

function RobotFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan/30" />
        <div className="absolute inset-6 rounded-full border border-lime/40" />
        <div className="h-4 w-4 rounded-full bg-lime shadow-[0_0_24px_#B8FF4D]" />
        <p className="sr-only">{label}</p>
      </div>
    </div>
  );
}

class SplineBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return <RobotFallback label="C0RTEX analyst fallback" />;
    }
    return this.props.children;
  }
}

export function LensBotScene({ className = "" }: LensBotSceneProps) {
  const { status, lookTarget } = useRobot();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasLoaded(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
      target.x = lookTarget === "cta" ? -8 : lookTarget === "threat" ? 8 : nx;
      target.y = lookTarget === "cta" ? 3 : lookTarget === "threat" ? 4 : ny;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      setTilt({ x: current.x, y: current.y });
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [lookTarget, reduceMotion]);

  return (
    <div ref={containerRef} className={`relative overflow-visible bg-transparent ${className}`} aria-hidden="true">
      <div
        className="robot-blend h-full w-full"
        style={{
          transform: reduceMotion
            ? undefined
            : `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        }}
      >
        {failed || !hasLoaded ? (
          <RobotFallback label="C0RTEX analyst standby" />
        ) : (
          <SplineBoundary onError={() => setFailed(true)}>
            <div
              className={`robot-blend h-full w-full [&_canvas]:h-full [&_canvas]:w-full ${
                visible ? "" : "invisible"
              }`}
            >
              <Spline
                scene={SPLINE_SCENE}
                renderOnDemand={!visible || reduceMotion}
                onLoad={(spline) => {
                  const app = spline as {
                    setBackgroundColor?: (color: string) => void;
                    findObjectByName?: (name: string) => { visible: boolean } | undefined;
                  };
                  app.setBackgroundColor?.("transparent");
                  ["Background", "Plane", "Floor", "Ground", "Backdrop", "Rectangle"].forEach((name) => {
                    const object = app.findObjectByName?.(name);
                    if (object) object.visible = false;
                  });
                }}
              />
            </div>
          </SplineBoundary>
        )}
      </div>
      <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-line bg-bg/40 px-3 py-1 font-mono text-[11px] text-lime opacity-0">
        {status}
      </div>
    </div>
  );
}
