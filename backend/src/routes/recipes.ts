import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { authenticate, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const recipeImageStorage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "recipes"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const recipeUpload = multer({
  storage: recipeImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

function parseRecipe(recipe: any) {
  if (!recipe) return recipe;
  return {
    ...recipe,
    ingredients: typeof recipe.ingredients === "string" ? JSON.parse(recipe.ingredients) : recipe.ingredients,
    steps: typeof recipe.steps === "string" ? JSON.parse(recipe.steps) : recipe.steps,
    hashtags: typeof recipe.hashtags === "string" ? JSON.parse(recipe.hashtags) : recipe.hashtags,
  };
}

const recipeSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  prepTime: z.number().int().optional(),
  cookTime: z.number().int().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  servings: z.number().int().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    alternative: z.string().optional(),
  })),
  steps: z.array(z.object({
    order: z.number().int(),
    instruction: z.string(),
    timer: z.number().int().optional(),
  })),
  category: z.string().optional(),
  cuisine: z.string().optional(),
  diet: z.string().optional(),
  location: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

const recipeInclude = {
  author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  images: { select: { id: true, url: true } },
  _count: { select: { likes: true, saves: true, comments: true } },
};

router.post("/", authenticate, recipeUpload.array("images", 3), async (req: AuthRequest, res: Response) => {
  try {
    const data = recipeSchema.parse(JSON.parse(req.body.data || req.body));
    const totalTime = (data.prepTime || 0) + (data.cookTime || 0);

    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls = files ? files.map(f => `/uploads/recipes/${f.filename}`) : [];

    // Support both old single imageUrl and new multi-image
    if (req.body.imageUrl && imageUrls.length === 0) {
      imageUrls.push(req.body.imageUrl);
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        totalTime,
        difficulty: data.difficulty,
        servings: data.servings,
        ingredients: JSON.stringify(data.ingredients),
        steps: JSON.stringify(data.steps),
        category: data.category,
        cuisine: data.cuisine,
        diet: data.diet,
        location: data.location,
        hashtags: data.hashtags ? JSON.stringify(data.hashtags) : undefined,
        authorId: req.userId!,
        images: imageUrls.length > 0 ? {
          create: imageUrls.map(url => ({ url })),
        } : undefined,
      },
      include: recipeInclude,
    });
    return res.status(201).json({ recipe: parseRecipe(recipe) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Məlumatlar düzgün deyil", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/", async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.query.userId as string;
    const where = userId ? { authorId: userId } : {};
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: recipeInclude,
      }),
      prisma.recipe.count({ where }),
    ]);
    return res.json({ recipes: recipes.map(parseRecipe), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/:id", async (req, res: Response) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: {
        ...recipeInclude,
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            replies: {
              include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!recipe) {
      return res.status(404).json({ error: "Resept tapılmadı" });
    }
    return res.json({ recipe: parseRecipe(recipe) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Resept tapılmadı" });
    }
    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Bu resepti redaktə etmək icazəniz yoxdur" });
    }
    const data = recipeSchema.partial().parse(req.body);
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ingredients: data.ingredients ? JSON.stringify(data.ingredients) : undefined,
        steps: data.steps ? JSON.stringify(data.steps) : undefined,
        hashtags: data.hashtags ? JSON.stringify(data.hashtags) : undefined,
      },
      include: recipeInclude,
    });
    return res.json({ recipe: parseRecipe(recipe) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Məlumatlar düzgün deyil", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Resept tapılmadı" });
    }
    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Bu resepti silmək icazəniz yoxdur" });
    }
    await prisma.recipe.delete({ where: { id: req.params.id } });
    return res.json({ message: "Resept silindi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server xətası" });
  }
});

export default router;
