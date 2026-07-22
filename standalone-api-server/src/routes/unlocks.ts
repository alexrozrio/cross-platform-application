import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, unlockedItemsTable, profilesTable } from "@workspace/db";

const router: IRouter = Router();

type ItemType = "color_theme" | "font" | "icon_set";

const ITEM_COSTS: Record<ItemType, Record<string, number>> = {
  color_theme: {
    light: 0, dark: 0,
    ocean: 100, forest: 150, sunset: 150, midnight: 200, rose: 200,
  },
  font: {
    default: 0, modern: 50, elegant: 50, straight: 50,
    playful: 75, mono: 75, classic: 75, handwritten: 75,
  },
  icon_set: {
    shapes: 0, ocean: 0,
    adventure: 100, superhero: 100, jungle: 100, space: 100,
  },
};

const VALID_TYPES = Object.keys(ITEM_COSTS) as ItemType[];

router.get("/unlocks/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }
  const rows = await db
    .select({ itemType: unlockedItemsTable.itemType, itemId: unlockedItemsTable.itemId })
    .from(unlockedItemsTable)
    .where(eq(unlockedItemsTable.profileId, profileId));
  res.json(rows);
});

router.post("/unlock", async (req, res): Promise<void> => {
  const { profileId, itemType, itemId } = req.body ?? {};

  if (
    typeof profileId !== "number" ||
    !VALID_TYPES.includes(itemType) ||
    typeof itemId !== "string"
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const cost = ITEM_COSTS[itemType as ItemType][itemId];
  if (cost === undefined) {
    res.status(400).json({ error: "Unknown item" });
    return;
  }
  if (cost === 0) {
    res.status(400).json({ error: "Item is free — no unlock needed" });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const existing = await db
    .select()
    .from(unlockedItemsTable)
    .where(
      and(
        eq(unlockedItemsTable.profileId, profileId),
        eq(unlockedItemsTable.itemType, itemType),
        eq(unlockedItemsTable.itemId, itemId),
      ),
    );
  if (existing.length > 0) {
    res.status(409).json({ error: "Already unlocked" });
    return;
  }

  if ((profile.gems ?? 0) < cost) {
    res.status(400).json({ error: "Not enough gems" });
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(profilesTable)
      .set({ gems: (profile.gems ?? 0) - cost })
      .where(eq(profilesTable.id, profileId));
    await tx.insert(unlockedItemsTable).values({ profileId, itemType, itemId });
  });

  const [updated] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  res.json({ gemsRemaining: updated?.gems ?? 0 });
});

export default router;
