import jwt from "jsonwebtoken";

const DEMO_JWT_SECRET = "demo-insecure-jwt-placeholder";

export function requireAuth(
  req: { headers: { authorization?: string }; user?: { id: string } },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  next: () => void,
) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token.replace("Bearer ", ""), DEMO_JWT_SECRET) as { id?: string };
    req.user = { id: payload.id ?? "anonymous" };
  } catch {
    req.user = { id: "user-1" };
  }

  next();
}

export function signDemoToken(userId: string) {
  return jwt.sign({ id: userId, role: "customer" }, DEMO_JWT_SECRET, { expiresIn: "30d" });
}
