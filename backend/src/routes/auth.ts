import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { config } from "../config";

const prisma = new PrismaClient();
const router = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(15),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  displayName: z.string().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(userId: string) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

router.post("/register", async (req, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "İstifadəçi adı və ya email artıq mövcuddur" });
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        displayName: data.displayName || data.username,
      },
    });
    const token = signToken(user.id);
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Məlumatlar düzgün deyil", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/login", async (req, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });
    }
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });
    }
    const token = signToken(user.id);
    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Məlumatlar düzgün deyil", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
