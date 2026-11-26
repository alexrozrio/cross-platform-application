import {
  pgTable,
  serial,
  integer,
  text,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const loginRewardClaimsTable = pgTable(
  "login_reward_claims",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    rewardDate: date("reward_date").notNull(),
    loginStreak: integer("login_streak").notNull(),
    gemsAwarded: integer("gems_awarded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("login_reward_claims_profile_date_unique").on(
      table.profileId,
      table.rewardDate,
    ),
  ],
);

export const loginRewardDoublesTable = pgTable(
  "login_reward_doubles",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    rewardDate: date("reward_date").notNull(),
    transactionId: text("transaction_id").notNull().unique(),
    gemsAwarded: integer("gems_awarded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("login_reward_doubles_profile_date_unique").on(
      table.profileId,
      table.rewardDate,
    ),
  ],
);
