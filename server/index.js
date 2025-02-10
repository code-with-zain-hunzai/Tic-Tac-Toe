const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Joi schema for leaderboard validation
const leaderboardSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  icon: Joi.string()
    .min(1)
    .max(2)
    .pattern(
      /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F191}-\u{1F251}]+$/u
    )
    .message("Icon must be a valid emoji")
    .required(),
  level: Joi.number().min(1).max(10).required(),
});

// GET /api/leaderboard: Fetch the top 10 players
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { level: "desc" },
      take: 10,
    });
    res.status(200).json(leaderboard || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// POST /api/leaderboard - Updated to properly handle upsert
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { error } = leaderboardSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, icon, level } = req.body;

    // Upsert operation (update or create)
    const user = await prisma.leaderboard.upsert({
      where: { name },
      update: { level },
      create: { name, icon, level },
    });

    res.status(200).json(user);
  } catch (err) {
    if (err.code === 'P2002') { // Prisma unique constraint error
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// DELETE /api/leaderboard/:name
app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const { name } = req.params;
    await prisma.leaderboard.delete({
      where: { name },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});