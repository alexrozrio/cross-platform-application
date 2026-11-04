BEGIN;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_profile_transfer_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jigsaw_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jigsaw_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.sessions,
  public.users,
  public.badges,
  public.challenges,
  public.daily_challenges,
  public.games,
  public.guest_profile_transfer_codes,
  public.jigsaw_games,
  public.jigsaw_challenges,
  public.memory_challenge_completions,
  public.memory_duels,
  public.memory_games,
  public.profile_merges,
  public.profiles,
  public.puzzles,
  public.unlocked_items
FROM anon, authenticated;

COMMIT;