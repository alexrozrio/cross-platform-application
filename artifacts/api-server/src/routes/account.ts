import { Router, type IRouter } from "express";
import { eq, inArray, or, sql } from "drizzle-orm";
import {
  badgesTable,
  challengesTable,
  db,
  gamesTable,
  guestProfileTransferCodesTable,
  memoryChallengeCompletionsTable,
  memoryDuelsTable,
  memoryGamesTable,
  profilesTable,
  sessions,
  unlockedItemsTable,
  users,
} from "@workspace/db";
import { isAuthenticated } from "../middlewares/replitAuth";

const router: IRouter = Router();

router.delete("/account", isAuthenticated, async (req, res, next): Promise<void> => {
  const userId = (req.user as { userId?: string } | undefined)?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      const accountProfiles = await tx
        .select({ id: profilesTable.id })
        .from(profilesTable)
        .where(eq(profilesTable.replitUserId, userId));
      const profileIds = accountProfiles.map(({ id }) => id);

      if (profileIds.length > 0) {
        const sudokuGames = await tx
          .select({ id: gamesTable.id })
          .from(gamesTable)
          .where(inArray(gamesTable.profileId, profileIds));
        const sudokuGameIds = sudokuGames.map(({ id }) => id);

        const memoryGames = await tx
          .select({ id: memoryGamesTable.id })
          .from(memoryGamesTable)
          .where(inArray(memoryGamesTable.profileId, profileIds));
        const memoryGameIds = memoryGames.map(({ id }) => id);

        const challengeConditions = [
          inArray(challengesTable.challengerId, profileIds),
          inArray(challengesTable.challengedId, profileIds),
          inArray(challengesTable.winnerId, profileIds),
        ];
        if (sudokuGameIds.length > 0) {
          challengeConditions.push(
            inArray(challengesTable.challengerGameId, sudokuGameIds),
            inArray(challengesTable.challengedGameId, sudokuGameIds),
          );
        }
        await tx.delete(challengesTable).where(or(...challengeConditions));

        const duelConditions = [
          inArray(memoryDuelsTable.challengerId, profileIds),
          inArray(memoryDuelsTable.challengedId, profileIds),
          inArray(memoryDuelsTable.winnerId, profileIds),
        ];
        if (memoryGameIds.length > 0) {
          duelConditions.push(
            inArray(memoryDuelsTable.challengerGameId, memoryGameIds),
            inArray(memoryDuelsTable.challengedGameId, memoryGameIds),
          );
        }
        await tx.delete(memoryDuelsTable).where(or(...duelConditions));

        await tx
          .delete(memoryChallengeCompletionsTable)
          .where(inArray(memoryChallengeCompletionsTable.profileId, profileIds));
        await tx.delete(badgesTable).where(inArray(badgesTable.profileId, profileIds));
        await tx
          .delete(unlockedItemsTable)
          .where(inArray(unlockedItemsTable.profileId, profileIds));
        await tx
          .delete(guestProfileTransferCodesTable)
          .where(inArray(guestProfileTransferCodesTable.profileId, profileIds));
        await tx.delete(gamesTable).where(inArray(gamesTable.profileId, profileIds));
        await tx
          .delete(memoryGamesTable)
          .where(inArray(memoryGamesTable.profileId, profileIds));
        await tx.delete(profilesTable).where(inArray(profilesTable.id, profileIds));
      }

      // Revoke this account's sessions on every device, not only this request.
      await tx.delete(sessions).where(
        sql`${sessions.sess} #>> '{passport,user,userId}' = ${userId}`,
      );
      await tx.delete(users).where(eq(users.id, userId));
    });

    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.status(204).end();
    });
  } catch (error) {
    next(error);
  }
});

export default router;
