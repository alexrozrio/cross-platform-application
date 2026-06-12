import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, puzzlesTable } from "@workspace/db";
import {
  GeneratePuzzleQueryParams,
  GetPuzzleParams,
  GetPuzzleResponse,
  GeneratePuzzleResponse,
} from "@workspace/api-zod";
import { generatePuzzle } from "../lib/sudoku";

const router: IRouter = Router();

router.get("/puzzles/new", async (req, res): Promise<void> => {
  // Coerce gridSize to number before Zod validation — query params arrive as strings
  const query = GeneratePuzzleQueryParams.safeParse({
    ...req.query,
    gridSize: req.query.gridSize !== undefined ? Number(req.query.gridSize) : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const difficulty = query.data.difficulty ?? "medium";
  const gridSize = query.data.gridSize ?? 9;
  const { grid, solution } = generatePuzzle(difficulty, gridSize);

  const [puzzle] = await db.insert(puzzlesTable).values({
    difficulty,
    gridSize,
    grid,
    solution,
  }).returning();

  res.json(GeneratePuzzleResponse.parse({
    ...puzzle,
    createdAt: puzzle.createdAt.toISOString(),
  }));
});

router.get("/puzzles/:id", async (req, res): Promise<void> => {
  const params = GetPuzzleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, params.data.id));
  if (!puzzle) {
    res.status(404).json({ error: "Puzzle not found" });
    return;
  }

  res.json(GetPuzzleResponse.parse({
    ...puzzle,
    createdAt: puzzle.createdAt.toISOString(),
  }));
});

export default router;
