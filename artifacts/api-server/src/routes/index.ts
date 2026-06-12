import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import puzzlesRouter from "./puzzles";
import gamesRouter from "./games";
import leaderboardRouter from "./leaderboard";
import statsRouter from "./stats";
import tournamentsRouter from "./tournaments";
import badgesRouter from "./badges";
import dailyChallengeRouter from "./daily-challenge";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(puzzlesRouter);
router.use(gamesRouter);
router.use(leaderboardRouter);
router.use(statsRouter);
router.use(tournamentsRouter);
router.use(badgesRouter);
router.use(dailyChallengeRouter);

export default router;
