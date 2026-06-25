import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const recipeInclude = {
  author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  images: { select: { id: true, url: true } },
  _count: { select: { likes: true, saves: true, comments: true } },
};

function mapRecipe(r: any) {
  return {
    ...r,
    ingredients: typeof r.ingredients === "string" ? JSON.parse(r.ingredients) : r.ingredients,
    steps: typeof r.steps === "string" ? JSON.parse(r.steps) : r.steps,
    hashtags: r.hashtags ? (typeof r.hashtags === "string" ? JSON.parse(r.hashtags) : r.hashtags) : [],
  };
}

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const following = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(req.userId!);

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: { authorId: { in: followingIds } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: recipeInclude,
      }),
      prisma.recipe.count({ where: { authorId: { in: followingIds } } }),
    ]);

    const recipeIds = recipes.map((r) => r.id);
    const [userLikes, userSaves] = await Promise.all([
      prisma.like.findMany({ where: { userId: req.userId, recipeId: { in: recipeIds } } }),
      prisma.save.findMany({ where: { userId: req.userId, recipeId: { in: recipeIds } } }),
    ]);
    const likedSet = new Set(userLikes.map((l) => l.recipeId));
    const savedSet = new Set(userSaves.map((s) => s.recipeId));

    const enriched = recipes.map((r) => ({
      ...mapRecipe(r),
      isLiked: likedSet.has(r.id),
      isSaved: savedSet.has(r.id),
    }));

    return res.json({ recipes: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/explore", async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: recipeInclude,
      }),
      prisma.recipe.count(),
    ]);

    return res.json({ recipes: recipes.map(mapRecipe), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/trending", async (req, res: Response) => {
  try {
    const recipes = await prisma.recipe.findMany({
      take: 20,
      orderBy: { likes: { _count: "desc" } },
      include: recipeInclude,
    });
    return res.json({ recipes: recipes.map(mapRecipe) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
