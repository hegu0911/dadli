import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "stories"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `story-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

router.post("/", authenticate, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Sekil yuklenmeyib" });
    }
    const imageUrl = `/uploads/stories/${req.file.filename}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const story = await prisma.story.create({
      data: {
        imageUrl,
        caption: req.body.caption,
        userId: req.userId!,
        expiresAt,
      },
    });
    return res.status(201).json({ story });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Get stories from followed users + own
    const followings = await prisma.follow.findMany({
      where: { followerId: req.userId! },
      select: { followingId: true },
    });
    const userIds = [req.userId!, ...followings.map(f => f.followingId)];
    const stories = await prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Group by user
    const grouped: Record<string, any> = {};
    stories.forEach(s => {
      if (!grouped[s.userId]) {
        grouped[s.userId] = { user: s.user, stories: [] };
      }
      grouped[s.userId].stories.push({ id: s.id, imageUrl: s.imageUrl, caption: s.caption, createdAt: s.createdAt });
    });
    return res.json({ stories: Object.values(grouped) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const story = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story || story.userId !== req.userId) {
      return res.status(403).json({ error: "İcazə yoxdur" });
    }
    await prisma.story.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
