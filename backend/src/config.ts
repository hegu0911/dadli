import path from "path";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "tasteshare-dev-secret-change-in-production",
  jwtExpiresIn: "7d",
  uploadDir: path.join(__dirname, "..", "uploads"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
