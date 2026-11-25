import re

PATH = r"/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/challenges.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. Import
rep('import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";',
    'import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";\nimport { SNAKE_LEVELS, type SnakeDifficulty } from "@/lib/snake";')

# 2. GameType union
rep('type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | QuizGameId;')

# 3. Challenge detail interface
rep('''  createdAt: string; expiresAt?: string; gameId?: number;
}

interface OddImageChallengeDetail {''',
    '''  createdAt: string; expiresAt?: string; gameId?: number;
}

interface SnakeChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: SnakeDifficulty; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerFoodEaten: number | null; challengedFoodEaten: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; expiresAt?: string; gameId?: number;
}

interface OddImageChallengeDetail {''')

# 4. SnakeChallengeCard
rep('''function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: OddImageChallengeDetail;''',
    '''function SnakeChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: SnakeChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: SnakeChallengeDetail) => void; onRematch?: (challenge: SnakeChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myFood = isChallenger ? challenge.challengerFoodEaten : challenge.challengedFoodEaten;
  const otherFood = isChallenger ? challenge.challengedFoodEaten : challenge.challengerFoodEaten;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = SNAKE_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-green-200/70 dark:border-green-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-green-200 bg-green-100 text-green-700">Snake</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · up to {level.targetFood} food</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myFood != null ? ` (${myFood} food)` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherFood != null ? ` (${otherFood} food)` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: OddImageChallengeDetail;''')

# 5. NewChallengeData field
rep('  jumbleDifficulty?: JumbleDifficulty;',
    '  jumbleDifficulty?: JumbleDifficulty;\n  snakeDifficulty?: SnakeDifficulty;')

# 6. snakeLevels + default
rep('  const jumbleLevels = (Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((level) => gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true);',
    '  const jumbleLevels = (Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((level) => gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true);\n  const snakeLevels = (Object.keys(SNAKE_LEVELS) as SnakeDifficulty[]).filter((level) => gameMode === "children" ? SNAKE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SNAKE_LEVELS[level].mode === "adult" : true);')
rep('  const defaultJumbleDifficulty: JumbleDifficulty = jumbleLevels[0] ?? "medium";',
    '  const defaultJumbleDifficulty: JumbleDifficulty = jumbleLevels[0] ?? "medium";\n  const defaultSnakeDifficulty: SnakeDifficulty = snakeLevels[0] ?? "classic";')

# 7. state
rep('  const [jumbleDifficulty, setJumbleDifficulty] = useState<JumbleDifficulty>(defaultJumbleDifficulty);',
    '  const [jumbleDifficulty, setJumbleDifficulty] = useState<JumbleDifficulty>(defaultJumbleDifficulty);\n  const [snakeDifficulty, setSnakeDifficulty] = useState<SnakeDifficulty>(defaultSnakeDifficulty);')

# 8. restore
rep('      if (initialData.jumbleDifficulty && jumbleLevels.includes(initialData.jumbleDifficulty)) setJumbleDifficulty(initialData.jumbleDifficulty);',
    '      if (initialData.jumbleDifficulty && jumbleLevels.includes(initialData.jumbleDifficulty)) setJumbleDifficulty(initialData.jumbleDifficulty);\n      if (initialData.snakeDifficulty && snakeLevels.includes(initialData.snakeDifficulty)) setSnakeDifficulty(initialData.snakeDifficulty);')

# 9. createSnakeMutation
rep('''    onError: () => toast.error("Failed to send Jumble Words challenge"),
  });

  const createOddImageMutation''',
    '''    onError: () => toast.error("Failed to send Jumble Words challenge"),
  });

  const createSnakeMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: SnakeDifficulty }) =>
      customFetch<SnakeChallengeDetail>("/api/snake-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["snake-challenges"] });
      toast.success(`Snake challenge sent to ${selected?.username}!`, { description: "Eat the same food while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/snake?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Snake challenge"),
  });

  const createOddImageMutation''')

# 10. create handler branch
rep('''      createJumbleMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "odd-images") {''',
    '''      createJumbleMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "snake") {
      const validDifficulty = snakeLevels.includes(snakeDifficulty) ? snakeDifficulty : (snakeLevels[0] ?? "classic");
      createSnakeMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "odd-images") {''')

# 11. isPending chain
rep('createJumbleMutation.isPending || createOddImageMutation.isPending',
    'createJumbleMutation.isPending || createSnakeMutation.isPending || createOddImageMutation.isPending')

# 12. game picker list
rep('                      ["jumble", "Jumble Words"],\n                      ["odd-images", "Odd Images"],',
    '                      ["jumble", "Jumble Words"],\n                      ["snake", "Snake"],\n                      ["odd-images", "Odd Images"],')

# 13. difficulty select block
rep('''              {gameType === "jumble" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={jumbleDifficulty} onValueChange={(value) => setJumbleDifficulty(value as JumbleDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{jumbleLevels.map((level) => <SelectItem key={level} value={level}>{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words · {JUMBLE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "odd-images" && (''',
    '''              {gameType === "jumble" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={jumbleDifficulty} onValueChange={(value) => setJumbleDifficulty(value as JumbleDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{jumbleLevels.map((level) => <SelectItem key={level} value={level}>{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words · {JUMBLE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "snake" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={snakeDifficulty} onValueChange={(value) => setSnakeDifficulty(value as SnakeDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{snakeLevels.map((level) => <SelectItem key={level} value={level}>{SNAKE_LEVELS[level].label} · up to {SNAKE_LEVELS[level].targetFood} food · {SNAKE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "odd-images" && (''')

# 14. meta text + tab validation
rep('"Create and join challenges for any of the twelve games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — compare scores, and compete with friends."',
    '"Create and join challenges for any of the thirteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — compare scores, and compete with friends."')
rep('|| tab === "jumble" || tab === "odd-images"', '|| tab === "jumble" || tab === "snake" || tab === "odd-images"')

# 15. query block (after jumble query)
rep('''  const { data: jumbleChallenges, isLoading: jumbleLoading } = useQuery<JumbleChallengeDetail[]>({
    queryKey: ["jumble-challenges", profileId],
    queryFn: () => customFetch<JumbleChallengeDetail[]>(`/api/jumble-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: oddImageChallenges''',
    '''  const { data: jumbleChallenges, isLoading: jumbleLoading } = useQuery<JumbleChallengeDetail[]>({
    queryKey: ["jumble-challenges", profileId],
    queryFn: () => customFetch<JumbleChallengeDetail[]>(`/api/jumble-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: snakeChallenges, isLoading: snakeLoading } = useQuery<SnakeChallengeDetail[]>({
    queryKey: ["snake-challenges", profileId],
    queryFn: () => customFetch<SnakeChallengeDetail[]>(`/api/snake-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: oddImageChallenges''')

# 16. respondSnakeMutation (after respondJumbleMutation)
rep('''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation''',
    '''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondSnakeMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<SnakeChallengeDetail & { gameId?: number }>(`/api/snake-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["snake-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/snake?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation''')

# 17. handlers (after handleJumbleRematch)
rep('''  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);''',
    '''  const handleSnakeAccept = useCallback((id: number) => { setRespondingId(id); respondSnakeMutation.mutate({ id, action: "accept" }); }, [respondSnakeMutation]);
  const handleSnakeDecline = useCallback((id: number) => { setRespondingId(id); respondSnakeMutation.mutate({ id, action: "decline" }); }, [respondSnakeMutation]);
  const handleSnakePlay = useCallback((challenge: SnakeChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/snake?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleSnakeRematch = useCallback((challenge: SnakeChallengeDetail) => {
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
      gameType: "snake",
      snakeDifficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);''')

# 18. pending/active/outgoing/finished + alert
rep('''  const jumbleFinished = jumbleChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];''',
    '''  const jumbleFinished = jumbleChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const snakePending = snakeChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const snakeActive = snakeChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const snakeOutgoing = snakeChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const snakeFinished = snakeChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];''')
rep('  const jumbleAlert = jumblePending.length + jumbleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
    '  const jumbleAlert = jumblePending.length + jumbleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;\n  const snakeAlert = snakePending.length + snakeActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;')
rep('game2048Alert + jumbleAlert + oddImageAlert', 'game2048Alert + jumbleAlert + snakeAlert + oddImageAlert')

# 19. recent merge + render case
rep('    ...(jumbleChallenges ?? []).map((challenge) => ({ game: "jumble" as const, createdAt: challenge.createdAt, challenge })),',
    '    ...(jumbleChallenges ?? []).map((challenge) => ({ game: "jumble" as const, createdAt: challenge.createdAt, challenge })),\n    ...(snakeChallenges ?? []).map((challenge) => ({ game: "snake" as const, createdAt: challenge.createdAt, challenge })),')
rep('''      case "jumble":
        return <JumbleChallengeCard key={`jumble-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={responding} />;''',
    '''      case "jumble":
        return <JumbleChallengeCard key={`jumble-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={responding} />;
      case "snake":
        return <SnakeChallengeCard key={`snake-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={responding} />;''')

# 20. recentHasData + isLoading chain
rep('jumbleChallenges != null || oddImageChallenges != null', 'jumbleChallenges != null || snakeChallenges != null || oddImageChallenges != null')
rep('jumbleLoading || oddImageLoading', 'jumbleLoading || snakeLoading || oddImageLoading')
rep('activeTab === "jumble" ? jumbleLoading : activeTab === "odd-images"', 'activeTab === "jumble" ? jumbleLoading : activeTab === "snake" ? snakeLoading : activeTab === "odd-images"')

# 21. tab list entry
rep('              ["jumble", "Jumble Words", jumbleAlert],\n              ["odd-images", "Odd Images", oddImageAlert],',
    '              ["jumble", "Jumble Words", jumbleAlert],\n              ["snake", "Snake", snakeAlert],\n              ["odd-images", "Odd Images", oddImageAlert],')

# 22. empty-state text + snake tab section (before odd-images section)
rep('Challenge another player in any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or the Science, Maths & GK quizzes. Winner takes 10 gems!',
    'Challenge another player in any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, or the Science, Maths & GK quizzes. Winner takes 10 gems!')
rep('''          {(!jumbleChallenges || jumbleChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Jumble Words challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to unscramble the same words and compare points.</p><Button className="mt-2 gap-2 bg-cyan-600 hover:bg-cyan-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Jumble Words challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "odd-images" ? (''',
    '''          {(!jumbleChallenges || jumbleChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Jumble Words challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to unscramble the same words and compare points.</p><Button className="mt-2 gap-2 bg-cyan-600 hover:bg-cyan-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Jumble Words challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "snake" ? (
        <div className="space-y-6">
          {snakePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({snakePending.length})</h2>{snakePending.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({snakeActive.length})</h2>{snakeActive.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({snakeOutgoing.length})</h2>{snakeOutgoing.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{snakeFinished.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={false}/>)}</section>}
          {(!snakeChallenges || snakeChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Snake challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to eat the same food and compare points.</p><Button className="mt-2 gap-2 bg-green-600 hover:bg-green-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Snake challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "odd-images" ? (''')

# 23. last game-list text near end of file
rep('select any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or a quiz — to challenge another player on the same puzzle or questions.',
    'select any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, or a quiz — to challenge another player on the same puzzle or questions.')

open(PATH, "w", encoding="utf-8").write(src)
print("challenges.tsx patched OK")
