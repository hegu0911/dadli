import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tələb olunur" });
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Yanlış və ya müddəti bitmiş token" });
  }
}
