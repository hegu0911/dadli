import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      include: {
        actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        recipe: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId!, read: false },
    });
    return res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/read-all", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/:id/read", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
