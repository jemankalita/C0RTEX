import type { Request, Response, NextFunction } from "express";

export function attachSessionCookie(_req: Request, res: Response, next: NextFunction) {
  res.cookie("hm_session", "demo-session-token", {
    httpOnly: false,
    secure: false,
    sameSite: "none",
  });
  next();
}
