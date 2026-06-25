import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import recipeRoutes from "./routes/recipes";
import feedRoutes from "./routes/feed";
import searchRoutes from "./routes/search";
import interactionRoutes from "./routes/interactions";
import messageRoutes from "./routes/messages";
import notificationRoutes from "./routes/notifications";
import storyRoutes from "./routes/stories";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stories", storyRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`DADLY API running on http://localhost:${config.port}`);
});
