import type { NextFunction, Request, Response } from "express";
import { getUserIdByToken } from "../services/user.service.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access denied" });

  const tokenSplit = authHeader.split("Bearer ");
  if (!tokenSplit[1]) return res.status(401).json({ error: "Access denied" });

  const token = tokenSplit[1];

  const userId = await getUserIdByToken(token);
  if (!userId) return res.status(401).json({ error: "Access denied" });

  (req as any).userId = userId;
  next();
};
