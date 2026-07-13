/**
 * Module-level event modal store.
 * Any file can call `showEventModal(payload)` to queue a notification modal.
 * The <EventModal /> component in App.tsx subscribes and renders it.
 */

export type EventModalPayload =
  | { type: 'challenge_received'; challengerName: string; challengeId: number }
  | { type: 'challenge_accepted'; opponentName: string }
  | { type: 'challenge_declined'; opponentName: string }
  | { type: 'challenge_won'; opponentName: string; gems?: number }
  | { type: 'challenge_tied'; opponentName: string }
  | { type: 'challenge_lost'; opponentName: string }
  | { type: 'tournament_rank_up'; delta: number; newRank: number; period: 'weekly' | 'monthly' }
  | { type: 'tournament_rank_down'; delta: number; newRank: number; period: 'weekly' | 'monthly' }
  | { type: 'memory_challenge_bonus'; xp: number; gems: number };

type Listener = (payload: EventModalPayload | null) => void;

const listeners = new Set<Listener>();
let current: EventModalPayload | null = null;

export function showEventModal(payload: EventModalPayload) {
  current = payload;
  listeners.forEach((fn) => fn(payload));
}

export function dismissEventModal() {
  current = null;
  listeners.forEach((fn) => fn(null));
}

export function subscribeEventModal(fn: Listener): () => void {
  listeners.add(fn);
  // Immediately give the subscriber the current state
  fn(current);
  return () => listeners.delete(fn);
}
