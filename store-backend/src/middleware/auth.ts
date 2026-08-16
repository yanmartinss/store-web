import type { NextFunction, Request, Response } from "express";
import { getUserIdByToken } from "../services/user.service.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  const userId = await getUserIdByToken(token);
  if (!userId) return res.status(401).json({ error: "Access denied" });

  (req as any).userId = userId;
  next();
};
