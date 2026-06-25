import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    const type = req.query.type as string || "recipes";
    const cuisine = req.query.cuisine as string;
    const difficulty = req.query.difficulty as string;
    const diet = req.query.diet as string;
    const maxTime = parseInt(req.query.maxTime as string) || 0;

    if (!q && !cuisine && !difficulty && !diet) {
      return res.json({ recipes: [], users: [] });
    }

    if (type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q } },
            { displayName: { contains: q } },
          ],
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
        take: 20,
      });
      return res.json({ users });
    }

    const conditions: any[] = [];
    if (q) {
      conditions.push(
        { title: { contains: q } },
        { description: { contains: q } },
        { ingredients: { contains: q } },
      );
    }
    if (cuisine) conditions.push({ cuisine });
    if (difficulty) conditions.push({ difficulty });
    if (diet) conditions.push({ diet });
    if (maxTime > 0) conditions.push({ totalTime: { lte: maxTime } });

    const recipes = await prisma.recipe.findMany({
      where: conditions.length > 0 ? { OR: conditions } : undefined,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, saves: true, comments: true } },
      },
    });

    const mapped = recipes.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      hashtags: r.hashtags ? JSON.parse(r.hashtags) : [],
    }));

    return res.json({ recipes: mapped });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/ingredients", async (req, res: Response) => {
  try {
    const ingredientsRaw = req.query.ingredients as string || "";
    const ingredientList = ingredientsRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    if (ingredientList.length === 0) {
      return res.json({ recipes: [] });
    }

    const allRecipes = await prisma.recipe.findMany({
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, saves: true, comments: true } },
      },
    });

    const scored = allRecipes.map((r) => {
      const ings: { name: string }[] = JSON.parse(r.ingredients);
      const recipeIngNames = ings.map((i) => i.name.toLowerCase());
      const matched = ingredientList.filter((ing) =>
        recipeIngNames.some((rIng) => rIng.includes(ing) || ing.includes(rIng))
      );
      const missing = ingredientList.length - matched.length;
      const matchScore = matched.length / ingredientList.length;
      return { ...r, matched, missingCount: missing, matchScore };
    });

    const sorted = scored
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore || (a.missingCount - b.missingCount))
      .slice(0, 50);

    const mapped = sorted.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      hashtags: r.hashtags ? JSON.parse(r.hashtags) : [],
      matchedIngredients: r.matched,
      matchPercentage: Math.round(r.matchScore * 100),
    }));

    return res.json({ recipes: mapped });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
