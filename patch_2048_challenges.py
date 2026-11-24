import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/challenges.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:80]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import
rep(
  'import { SLIDE_PUZZLE_LEVELS, SLIDE_PUZZLE_TILE_STYLES, type SlidePuzzleDifficulty, type SlidePuzzleTileStyle } from "@/lib/slide-puzzle";',
  'import { SLIDE_PUZZLE_LEVELS, SLIDE_PUZZLE_TILE_STYLES, type SlidePuzzleDifficulty, type SlidePuzzleTileStyle } from "@/lib/slide-puzzle";' + NL +
  'import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";'
)

# 2. GameType union
rep(
  'type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | QuizGameId;',
  'type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;'
)

# 3. Detail interface
rep(
  'interface OddImageChallengeDetail {',
  '''interface Game2048ChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: Game2048Difficulty; size: number; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerMaxTile: number | null; challengedMaxTile: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; gameId?: number;
}

interface OddImageChallengeDetail {'''
)

# 4. Challenge card
rep(
  'function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {',
  '''function Game2048ChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: Game2048ChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: Game2048ChallengeDetail) => void; onRematch?: (challenge: Game2048ChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myMaxTile = isChallenger ? challenge.challengerMaxTile : challenge.challengedMaxTile;
  const otherMaxTile = isChallenger ? challenge.challengedMaxTile : challenge.challengerMaxTile;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = GAME_2048_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-orange-200/70 dark:border-orange-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-orange-200 bg-orange-100 text-orange-700">2048</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.size}×{level.size} · target {level.targetTile}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myMaxTile != null ? ` (tile ${myMaxTile})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherMaxTile != null ? ` (tile ${otherMaxTile})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {'''
)

# 5. RematchData field
rep(
  '  slidePuzzleThemeId?: string | null;',
  '  slidePuzzleThemeId?: string | null;' + NL + '  game2048Difficulty?: Game2048Difficulty;'
)

# 6a. Dialog levels
rep(
  '  const slidePuzzleLevels = (Object.keys(SLIDE_PUZZLE_LEVELS) as SlidePuzzleDifficulty[]).filter((level) => gameMode === "children" ? SLIDE_PUZZLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SLIDE_PUZZLE_LEVELS[level].mode === "adult" : true);',
  '  const slidePuzzleLevels = (Object.keys(SLIDE_PUZZLE_LEVELS) as SlidePuzzleDifficulty[]).filter((level) => gameMode === "children" ? SLIDE_PUZZLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SLIDE_PUZZLE_LEVELS[level].mode === "adult" : true);' + NL +
  '  const game2048Levels = (Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[]).filter((level) => gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true);'
)
rep(
  '  const defaultSlidePuzzleDifficulty = slidePuzzleLevels[0] ?? "3x3";',
  '  const defaultSlidePuzzleDifficulty = slidePuzzleLevels[0] ?? "3x3";' + NL + '  const defaultGame2048Difficulty = game2048Levels[0] ?? "4x4";'
)
rep(
  '  const [slidePuzzleThemeId, setSlidePuzzleThemeId] = useState<string | null>(null);',
  '  const [slidePuzzleThemeId, setSlidePuzzleThemeId] = useState<string | null>(null);' + NL + '  const [game2048Difficulty, setGame2048Difficulty] = useState<Game2048Difficulty>(defaultGame2048Difficulty);'
)
rep(
  '      if (initialData.slidePuzzleThemeId !== undefined) setSlidePuzzleThemeId(initialData.slidePuzzleThemeId);',
  '      if (initialData.slidePuzzleThemeId !== undefined) setSlidePuzzleThemeId(initialData.slidePuzzleThemeId);' + NL + '      if (initialData.game2048Difficulty && game2048Levels.includes(initialData.game2048Difficulty)) setGame2048Difficulty(initialData.game2048Difficulty);'
)

# 7. Create mutation
rep(
  '  const createOddImageMutation = useMutation({',
  '''  const createGame2048Mutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: Game2048Difficulty }) =>
      customFetch<Game2048ChallengeDetail>("/api/game-2048-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["game-2048-challenges"] });
      toast.success(`2048 challenge sent to ${selected?.username}!`, { description: "Merge tiles on the shared board while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/game-2048?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send 2048 challenge"),
  });

  const createOddImageMutation = useMutation({'''
)

# 8. handleSend
rep(
  '    } else if (gameType === "odd-images") {',
  '    } else if (gameType === "game-2048") {' + NL +
  '      const validDifficulty = game2048Levels.includes(game2048Difficulty) ? game2048Difficulty : (game2048Levels[0] ?? "4x4");' + NL +
  '      createGame2048Mutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });' + NL +
  '    } else if (gameType === "odd-images") {'
)

# 9. isPending
rep(
  'createSlidePuzzleMutation.isPending || createOddImageMutation.isPending',
  'createSlidePuzzleMutation.isPending || createGame2048Mutation.isPending || createOddImageMutation.isPending'
)

# 10. Game select option
rep(
  '                      ["slide-puzzle", "Slide Puzzle"],' + NL + '                      ["odd-images", "Odd Images"],',
  '                      ["slide-puzzle", "Slide Puzzle"],' + NL + '                      ["game-2048", "2048"],' + NL + '                      ["odd-images", "Odd Images"],'
)

# 11. Board select UI
rep(
  '              {gameType === "odd-images" && (',
  '''              {gameType === "game-2048" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Board</label>
                  <Select value={game2048Difficulty} onValueChange={(value) => setGame2048Difficulty(value as Game2048Difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{game2048Levels.map((level) => <SelectItem key={level} value={level}>{GAME_2048_LEVELS[level].label} · {GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · target {GAME_2048_LEVELS[level].targetTile}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "odd-images" && ('''
)

# 12. Page activeTab init
rep(
  'return tab === "recent" || tab === "sudoku" || tab === "memory" || tab === "jigsaw" || tab === "word-search" || tab === "minesweeper" || tab === "slide-puzzle" || tab === "odd-images" || tab === "rubiks" ? tab : "recent";',
  'return tab === "recent" || tab === "sudoku" || tab === "memory" || tab === "jigsaw" || tab === "word-search" || tab === "minesweeper" || tab === "slide-puzzle" || tab === "game-2048" || tab === "odd-images" || tab === "rubiks" ? tab : "recent";'
)

# 13. Page query
rep(
  '  const { data: oddImageChallenges, isLoading: oddImageLoading } = useQuery<OddImageChallengeDetail[]>({',
  '''  const { data: game2048Challenges, isLoading: game2048Loading } = useQuery<Game2048ChallengeDetail[]>({
    queryKey: ["game-2048-challenges", profileId],
    queryFn: () => customFetch<Game2048ChallengeDetail[]>(`/api/game-2048-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: oddImageChallenges, isLoading: oddImageLoading } = useQuery<OddImageChallengeDetail[]>({'''
)

# 14. Respond mutation
rep(
  '  const respondOddImageMutation = useMutation({',
  '''  const respondGame2048Mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<Game2048ChallengeDetail & { gameId?: number }>(`/api/game-2048-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["game-2048-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/game-2048?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation = useMutation({'''
)

# 15. Handlers
rep(
  '  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);',
  '''  const handleGame2048Accept = useCallback((id: number) => { setRespondingId(id); respondGame2048Mutation.mutate({ id, action: "accept" }); }, [respondGame2048Mutation]);
  const handleGame2048Decline = useCallback((id: number) => { setRespondingId(id); respondGame2048Mutation.mutate({ id, action: "decline" }); }, [respondGame2048Mutation]);
  const handleGame2048Play = useCallback((challenge: Game2048ChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/game-2048?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleGame2048Rematch = useCallback((challenge: Game2048ChallengeDetail) => {
    const isChallenger = challenge.challengerId === profileId;
    const opponentId = isChallenger ? challenge.challengedId : challenge.challengerId;
    if (!opponentId) {
      toast.error("This challenge no longer has an opponent.");
      return;
    }
    setRematchData({
      opponent: {
        id: opponentId,
        username: isChallenger ? challenge.challengedUsername : challenge.challengerUsername,
        avatar: isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar,
        gems: 0,
      },
      gameType: "game-2048",
      game2048Difficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);'''
)

# 16. Derived lists
rep(
  '  const oddImagePending = oddImageChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];',
  '''  const game2048Pending = game2048Challenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const game2048Active = game2048Challenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const game2048Outgoing = game2048Challenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const game2048Finished = game2048Challenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const oddImagePending = oddImageChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];'''
)

# 17. Alert
rep(
  '  const slidePuzzleAlert = slidePuzzlePending.length + slidePuzzleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
  '  const slidePuzzleAlert = slidePuzzlePending.length + slidePuzzleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;' + NL +
  '  const game2048Alert = game2048Pending.length + game2048Active.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;'
)
rep(
  'slidePuzzleAlert + oddImageAlert + rubiksAlert + quizAlert;',
  'slidePuzzleAlert + game2048Alert + oddImageAlert + rubiksAlert + quizAlert;'
)

# 18. Recent feed
rep(
  '    ...(slidePuzzleChallenges ?? []).map((challenge) => ({ game: "slide-puzzle" as const, createdAt: challenge.createdAt, challenge })),',
  '    ...(slidePuzzleChallenges ?? []).map((challenge) => ({ game: "slide-puzzle" as const, createdAt: challenge.createdAt, challenge })),' + NL +
  '    ...(game2048Challenges ?? []).map((challenge) => ({ game: "game-2048" as const, createdAt: challenge.createdAt, challenge })),'
)
rep(
  '''      case "slide-puzzle":
        return <SlidePuzzleChallengeCard key={`slide-puzzle-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={responding} />;''',
  '''      case "slide-puzzle":
        return <SlidePuzzleChallengeCard key={`slide-puzzle-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={responding} />;
      case "game-2048":
        return <Game2048ChallengeCard key={`game-2048-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={responding} />;'''
)
rep(
  'slidePuzzleChallenges != null || oddImageChallenges != null || rubiksChallenges != null || quizChallenges != null;',
  'slidePuzzleChallenges != null || game2048Challenges != null || oddImageChallenges != null || rubiksChallenges != null || quizChallenges != null;'
)
rep(
  'slidePuzzleLoading || oddImageLoading || rubiksLoading || quizLoading)',
  'slidePuzzleLoading || game2048Loading || oddImageLoading || rubiksLoading || quizLoading)'
)
rep(
  'activeTab === "slide-puzzle" ? slidePuzzleLoading : activeTab === "odd-images"',
  'activeTab === "slide-puzzle" ? slidePuzzleLoading : activeTab === "game-2048" ? game2048Loading : activeTab === "odd-images"'
)

# 19. Tab select entry
rep(
  '              ["slide-puzzle", "Slide Puzzle", slidePuzzleAlert],' + NL + '              ["odd-images", "Odd Images", oddImageAlert],',
  '              ["slide-puzzle", "Slide Puzzle", slidePuzzleAlert],' + NL + '              ["game-2048", "2048", game2048Alert],' + NL + '              ["odd-images", "Odd Images", oddImageAlert],'
)

# 20. Tab content
rep(
  '      ) : activeTab === "odd-images" ? (',
  '''      ) : activeTab === "game-2048" ? (
        <div className="space-y-6">
          {game2048Pending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({game2048Pending.length})</h2>{game2048Pending.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Active.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({game2048Active.length})</h2>{game2048Active.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Outgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({game2048Outgoing.length})</h2>{game2048Outgoing.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Finished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{game2048Finished.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={false}/>)}</section>}
          {(!game2048Challenges || game2048Challenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Grid3x3 className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No 2048 challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to merge tiles on the same board and compare points.</p><Button className="mt-2 gap-2 bg-orange-600 hover:bg-orange-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a 2048 challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "odd-images" ? ('''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("challenges.tsx patched OK")
