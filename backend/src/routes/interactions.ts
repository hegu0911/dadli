import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

async function createNotification(type: string, userId: string, actorId: string, recipeId?: string, commentId?: string) {
  try {
    await prisma.notification.create({
      data: { type, userId, actorId, recipeId, commentId },
    });
  } catch (e) { /* silent */ }
}

router.post("/:recipeId/like", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = req.params.recipeId;
    const existing = await prisma.like.findUnique({
      where: { userId_recipeId: { userId: req.userId!, recipeId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { recipeId } });
      return res.json({ liked: false, count });
    }
    await prisma.like.create({
      data: { userId: req.userId!, recipeId },
    });
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (recipe && recipe.authorId !== req.userId) {
      await createNotification("like", recipe.authorId, req.userId!, recipeId);
    }
    const count = await prisma.like.count({ where: { recipeId } });
    return res.json({ liked: true, count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/:recipeId/save", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = req.params.recipeId;
    const existing = await prisma.save.findUnique({
      where: { userId_recipeId: { userId: req.userId!, recipeId } },
    });
    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
      const count = await prisma.save.count({ where: { recipeId } });
      return res.json({ saved: false, count });
    }
    await prisma.save.create({
      data: { userId: req.userId!, recipeId },
    });
    const count = await prisma.save.count({ where: { recipeId } });
    return res.json({ saved: true, count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/:recipeId/likes", async (req, res: Response) => {
  try {
    const likes = await prisma.like.findMany({
      where: { recipeId: req.params.recipeId },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      take: 50,
    });
    return res.json({ users: likes.map((l) => l.user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/:recipeId/comments", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text, parentId } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: "Şərh mətni tələb olunur" });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.recipeId } });
    if (!recipe) return res.status(404).json({ error: "Resept tapılmadı" });

    // If it's a reply, only the recipe author can reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment) return res.status(404).json({ error: "Şərh tapılmadı" });
      if (req.userId !== recipe.authorId && req.userId !== parentComment.userId) {
        return res.status(403).json({ error: "Yalnız resept sahibi cavab yaza bilər" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId: req.userId!,
        recipeId: req.params.recipeId,
        parentId: parentId || undefined,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // Notify recipe author
    if (recipe.authorId !== req.userId) {
      await createNotification("comment", recipe.authorId, req.userId!, req.params.recipeId, comment.id);
    }
    // If replying to another user's comment, notify them too
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.userId !== req.userId && parentComment.userId !== recipe.authorId) {
        await createNotification("comment", parentComment.userId, req.userId!, req.params.recipeId, comment.id);
      }
    }

    return res.json({ comment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.delete("/comments/:commentId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) return res.status(404).json({ error: "Şərh tapılmadı" });
    if (comment.userId !== req.userId) {
      return res.status(403).json({ error: "İcazə yoxdur" });
    }
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
