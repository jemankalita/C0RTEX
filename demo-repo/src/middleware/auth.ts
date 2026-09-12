export function requireAuth(req: { headers: { authorization?: string }; user?: { id: string } }, res: { status: (code: number) => { json: (body: unknown) => void } }, next: () => void) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.user = { id: "user-1" };
  next();
}
