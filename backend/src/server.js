import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.error("Error adding favourite:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );
    res.status(200).json({ message: "Favourite removed successfully" });
  } catch (error) {
    console.error("Error removing a favorite:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.error("Error fetching a favorites:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
