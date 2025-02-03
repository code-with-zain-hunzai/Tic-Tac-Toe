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
  icon: Joi.string().min(1).max(2).required(),
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

// POST /api/leaderboard: Add or update a user
app.post("/api/leaderboard", async (req, res) => {
  // Validate the request body using Joi
  const { error, value } = leaderboardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, icon, level } = value; // Use validated values

  try {
    const existingUser = await prisma.leaderboard.findUnique({
      where: { name },
    });

    if (existingUser) {
      // Update existing user's level
      const updatedUser = await prisma.leaderboard.update({
        where: { name },
        data: { level },
      });
      res.status(200).json(updatedUser);
    } else {
      // Create a new leaderboard entry
      const newEntry = await prisma.leaderboard.create({
        data: { name, icon, level },
      });
      res.status(201).json(newEntry);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save leaderboard entry" });
  }
});

// DELETE /api/leaderboard: Reset all leaderboard entries
app.delete("/api/leaderboard", async (req, res) => {
  try {
    await prisma.leaderboard.deleteMany(); // Delete all entries
    res.status(200).json({ message: "Leaderboard reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset leaderboard" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});