export interface ExistingProfileSyncRecord {
  replitUserId: string | null;
  avatar: string | null;
}

export interface IncomingProfileSync {
  replitUserId?: string;
  username?: string;
  avatar?: string;
}

export function buildExistingProfileSyncUpdates(
  profile: ExistingProfileSyncRecord,
  incoming: IncomingProfileSync,
): Partial<ExistingProfileSyncRecord> {
  const updates: Partial<ExistingProfileSyncRecord> = {};

  if (incoming.replitUserId && profile.replitUserId !== incoming.replitUserId) {
    updates.replitUserId = incoming.replitUserId;
  }
  if (incoming.avatar && profile.avatar !== incoming.avatar) {
    updates.avatar = incoming.avatar;
  }

  // The username is an app-owned display name after profile creation. Do not
  // replace it with the identity provider's name during a later profile sync.
  return updates;
}
