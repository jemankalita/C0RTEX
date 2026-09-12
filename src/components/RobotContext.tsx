"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RobotStatus } from "@/data/workflowSteps";

type LookTarget = "idle" | "cta" | "threat" | "cursor";

type RobotContextValue = {
  status: RobotStatus;
  lookTarget: LookTarget;
  setStatus: (status: RobotStatus) => void;
  setLookTarget: (target: LookTarget) => void;
};

const RobotContext = createContext<RobotContextValue | null>(null);

export function RobotProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<RobotStatus>("IDLE");
  const [lookTarget, setLookTargetState] = useState<LookTarget>("idle");

  const setStatus = useCallback((next: RobotStatus) => {
    setStatusState(next);
  }, []);

  const setLookTarget = useCallback((next: LookTarget) => {
    setLookTargetState(next);
  }, []);

  const value = useMemo(
    () => ({ status, lookTarget, setStatus, setLookTarget }),
    [status, lookTarget, setStatus, setLookTarget],
  );

  return <RobotContext.Provider value={value}>{children}</RobotContext.Provider>;
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error("useRobot must be used within RobotProvider");
  }
  return context;
}
