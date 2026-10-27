import { describe, expect, it } from "vitest";
import { buildExistingProfileSyncUpdates } from "./profile-sync";

describe("existing profile sync updates", () => {
  it("does not overwrite the app username with a later provider name", () => {
    const updates = buildExistingProfileSyncUpdates(
      { replitUserId: "user-1", avatar: "old-avatar.png" },
      {
        replitUserId: "user-1",
        username: "Google Name",
        avatar: "new-avatar.png",
      },
    );

    expect(updates).toEqual({ avatar: "new-avatar.png" });
    expect(updates).not.toHaveProperty("username");
  });

  it("links an existing guest profile without changing its username", () => {
    const updates = buildExistingProfileSyncUpdates(
      { replitUserId: null, avatar: null },
      { replitUserId: "user-1", username: "Google Name" },
    );

    expect(updates).toEqual({ replitUserId: "user-1" });
    expect(updates).not.toHaveProperty("username");
  });
});
