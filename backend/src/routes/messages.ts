import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/conversations", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.userId }, { receiverId: req.userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    const conversations = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === req.userId ? msg.receiver : msg.sender;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, { user: otherUser, lastMessage: msg, unread: 0 });
      }
    }

    return res.json({ conversations: Array.from(conversations.values()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/:userId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    await prisma.message.updateMany({
      where: { senderId: req.params.userId, receiverId: req.userId, readAt: null },
      data: { readAt: new Date() },
    });

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/:userId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, recipeId } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: "Mesaj mətni tələb olunur" });
    }

    // Check if receiver has private account — only followers can message
    const receiver = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!receiver) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

    if (receiver.isPrivate && receiver.id !== req.userId) {
      const isFollowing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId!, followingId: receiver.id } },
      });
      if (!isFollowing) {
        return res.status(403).json({ error: "Bu istifadəçi gizli hesabdır. Mesaj göndərmək üçün izləyici olmalısınız" });
      }
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        recipeId: recipeId || null,
        senderId: req.userId!,
        receiverId: req.params.userId,
      },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // Create message notification
    if (receiver.id !== req.userId) {
      try {
        await prisma.notification.create({
          data: { type: "message", userId: receiver.id, actorId: req.userId! },
        });
      } catch (e) { /* silent */ }
    }

    return res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
