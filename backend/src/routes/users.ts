import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "avatars"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

const recipeStorage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "recipes"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const recipeUpload = multer({
  storage: recipeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

async function createNotification(type: string, userId: string, actorId: string, recipeId?: string, commentId?: string) {
  try {
    await prisma.notification.create({
      data: { type, userId, actorId, recipeId, commentId },
    });
  } catch (e) { /* silent */ }
}

router.get("/:username", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        _count: { select: { recipes: true, followers: true, following: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }
    const { password, ...safe } = user;

    // Check follow request status if auth user viewing different profile
    let isFollowing = false;
    let followRequestStatus: string | null = null;
    if (req.userId && req.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId, followingId: user.id } },
      });
      isFollowing = !!follow;
      if (!follow && user.isPrivate) {
        const req2 = await prisma.followRequest.findUnique({
          where: { senderId_receiverId: { senderId: req.userId, receiverId: user.id } },
        });
        if (req2) followRequestStatus = req2.status;
      }
    }

    return res.json({ user: { ...safe, isFollowing, followRequestStatus } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/profile/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        _count: { select: { recipes: true, followers: true, following: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }
    const { password, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.put("/profile/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, bio, avatarUrl, location, cuisineTags, isPrivate } = req.body;
    const data: any = { displayName, bio, avatarUrl, location };
    if (cuisineTags) data.cuisineTags = JSON.stringify(cuisineTags);
    if (isPrivate !== undefined) data.isPrivate = isPrivate;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    const { password, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/:id/follow", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.userId) {
      return res.status(400).json({ error: "Özünüzü izləyə bilməzsiniz" });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId!, followingId: targetId } },
    });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false, requested: false });
    }

    // If target has private account, create follow request instead
    if (target.isPrivate) {
      const existingReq = await prisma.followRequest.findUnique({
        where: { senderId_receiverId: { senderId: req.userId!, receiverId: targetId } },
      });
      if (existingReq) {
        if (existingReq.status === "rejected") {
          // Allow re-requesting
          await prisma.followRequest.update({
            where: { id: existingReq.id },
            data: { status: "pending" },
          });
          return res.json({ following: false, requested: true });
        }
        return res.json({ following: false, requested: existingReq.status === "pending" });
      }
      await prisma.followRequest.create({
        data: { senderId: req.userId!, receiverId: targetId },
      });
      await createNotification("follow_request", targetId, req.userId!);
      return res.json({ following: false, requested: true });
    }

    await prisma.follow.create({
      data: { followerId: req.userId!, followingId: targetId },
    });
    await createNotification("follow", targetId, req.userId!);
    return res.json({ following: true, requested: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

// Accept/reject follow requests
router.post("/follow-requests/:requestId/:action", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, action } = req.params;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: "Yanlış əməliyyat" });
    }
    const followReq = await prisma.followRequest.findUnique({ where: { id: requestId } });
    if (!followReq || followReq.receiverId !== req.userId) {
      return res.status(403).json({ error: "İcazə yoxdur" });
    }
    if (action === "accept") {
      await prisma.follow.create({
        data: { followerId: followReq.senderId, followingId: followReq.receiverId },
      });
      await prisma.followRequest.update({ where: { id: requestId }, data: { status: "accepted" } });
      await createNotification("follow_accepted", followReq.senderId, req.userId!);
    } else {
      await prisma.followRequest.update({ where: { id: requestId }, data: { status: "rejected" } });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

// Get pending follow requests (for the current user)
router.get("/follow-requests/pending", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.followRequest.findMany({
      where: { receiverId: req.userId!, status: "pending" },
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    return res.json({ requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/profile/avatar", authenticate, upload.single("avatar"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Sekil yuklenmeyib" });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl },
    });
    const { password, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xetasi" });
  }
});

router.get("/:id/followers", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.params.id },
      include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    return res.json({ followers: followers.map((f) => f.follower) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/:id/following", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.params.id },
      include: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    return res.json({ following: following.map((f) => f.following) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
