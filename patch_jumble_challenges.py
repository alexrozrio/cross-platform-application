import io

path = "src/pages/challenges.tsx"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:90]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

# 1. import JUMBLE_LEVELS
rep('import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";',
    'import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";\nimport { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";')

# 2. GameType union
rep('type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;')

# 3. JumbleChallengeDetail interface after Game2048ChallengeDetail
rep('''interface OddImageChallengeDetail {''',
    '''interface JumbleChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: JumbleDifficulty; questions: number; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerCorrect: number | null; challengedCorrect: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; expiresAt?: string; gameId?: number;
}

interface OddImageChallengeDetail {''')

# 4. JumbleChallengeCard after Game2048ChallengeCard (before OddImageChallengeCard)
rep('''function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {''',
    '''function JumbleChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: JumbleChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: JumbleChallengeDetail) => void; onRematch?: (challenge: JumbleChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myCorrect = isChallenger ? challenge.challengerCorrect : challenge.challengedCorrect;
  const otherCorrect = isChallenger ? challenge.challengedCorrect : challenge.challengerCorrect;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = JUMBLE_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-cyan-200/70 dark:border-cyan-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-cyan-200 bg-cyan-100 text-cyan-700">Jumble Words</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {challenge.questions || level.questions} words</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myCorrect != null ? ` (${myCorrect}/${challenge.questions || level.questions})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherCorrect != null ? ` (${otherCorrect}/${challenge.questions || level.questions})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {''')

# 5. RematchData field
rep('  game2048Difficulty?: Game2048Difficulty;',
    '  game2048Difficulty?: Game2048Difficulty;\n  jumbleDifficulty?: JumbleDifficulty;')

# 6. levels filter + default + state
rep('  const game2048Levels = (Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[]).filter((level) => gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true);',
    '  const game2048Levels = (Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[]).filter((level) => gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true);\n  const jumbleLevels = (Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((level) => gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true);')
rep('  const defaultGame2048Difficulty = game2048Levels[0] ?? "4x4";',
    '  const defaultGame2048Difficulty = game2048Levels[0] ?? "4x4";\n  const defaultJumbleDifficulty: JumbleDifficulty = jumbleLevels[0] ?? "medium";')
rep('  const [game2048Difficulty, setGame2048Difficulty] = useState<Game2048Difficulty>(defaultGame2048Difficulty);',
    '  const [game2048Difficulty, setGame2048Difficulty] = useState<Game2048Difficulty>(defaultGame2048Difficulty);\n  const [jumbleDifficulty, setJumbleDifficulty] = useState<JumbleDifficulty>(defaultJumbleDifficulty);')
rep('      if (initialData.game2048Difficulty && game2048Levels.includes(initialData.game2048Difficulty)) setGame2048Difficulty(initialData.game2048Difficulty);',
    '      if (initialData.game2048Difficulty && game2048Levels.includes(initialData.game2048Difficulty)) setGame2048Difficulty(initialData.game2048Difficulty);\n      if (initialData.jumbleDifficulty && jumbleLevels.includes(initialData.jumbleDifficulty)) setJumbleDifficulty(initialData.jumbleDifficulty);')

# 7. createJumbleMutation after createGame2048Mutation
rep('''    onError: () => toast.error("Failed to send 2048 challenge"),
  });''',
    '''    onError: () => toast.error("Failed to send 2048 challenge"),
  });

  const createJumbleMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: JumbleDifficulty }) =>
      customFetch<JumbleChallengeDetail>("/api/jumble-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["jumble-challenges"] });
      toast.success(`Jumble Words challenge sent to ${selected?.username}!`, { description: "Unscramble the shared words while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/jumble?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Jumble Words challenge"),
  });''')

# 8. handleSelect branch
rep('''    } else if (gameType === "game-2048") {
      const validDifficulty = game2048Levels.includes(game2048Difficulty) ? game2048Difficulty : (game2048Levels[0] ?? "4x4");
      createGame2048Mutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "odd-images") {''',
    '''    } else if (gameType === "game-2048") {
      const validDifficulty = game2048Levels.includes(game2048Difficulty) ? game2048Difficulty : (game2048Levels[0] ?? "4x4");
      createGame2048Mutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "jumble") {
      const validDifficulty = jumbleLevels.includes(jumbleDifficulty) ? jumbleDifficulty : (jumbleLevels[0] ?? "medium");
      createJumbleMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "odd-images") {''')

# 9. isPending chain
rep('createSlidePuzzleMutation.isPending || createGame2048Mutation.isPending || createOddImageMutation.isPending',
    'createSlidePuzzleMutation.isPending || createGame2048Mutation.isPending || createJumbleMutation.isPending || createOddImageMutation.isPending')

# 10. game-type picker entries
rep('                      ["game-2048", "2048"],\n                      ["odd-images", "Odd Images"],',
    '                      ["game-2048", "2048"],\n                      ["jumble", "Jumble Words"],\n                      ["odd-images", "Odd Images"],')

# 11. difficulty select UI after game-2048 block
rep('''              {gameType === "odd-images" && (
                <div className="grid grid-cols-2 gap-3">''',
    '''              {gameType === "jumble" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={jumbleDifficulty} onValueChange={(value) => setJumbleDifficulty(value as JumbleDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{jumbleLevels.map((level) => <SelectItem key={level} value={level}>{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "odd-images" && (
                <div className="grid grid-cols-2 gap-3">''')

# 12. tab validation
rep('tab === "slide-puzzle" || tab === "game-2048" || tab === "odd-images"',
    'tab === "slide-puzzle" || tab === "game-2048" || tab === "jumble" || tab === "odd-images"')

# 13. challenges query
rep('''  const { data: oddImageChallenges, isLoading: oddImageLoading } = useQuery<OddImageChallengeDetail[]>({''',
    '''  const { data: jumbleChallenges, isLoading: jumbleLoading } = useQuery<JumbleChallengeDetail[]>({
    queryKey: ["jumble-challenges", profileId],
    queryFn: () => customFetch<JumbleChallengeDetail[]>(`/api/jumble-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: oddImageChallenges, isLoading: oddImageLoading } = useQuery<OddImageChallengeDetail[]>({''')

# 14. respondJumbleMutation after respondGame2048Mutation
rep('''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation = useMutation({''',
    '''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondJumbleMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<JumbleChallengeDetail & { gameId?: number }>(`/api/jumble-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["jumble-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/jumble?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation = useMutation({''')

# 15. handlers after handleGame2048Rematch block (before handleOddImageAccept)
rep('''  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);''',
    '''  const handleJumbleAccept = useCallback((id: number) => { setRespondingId(id); respondJumbleMutation.mutate({ id, action: "accept" }); }, [respondJumbleMutation]);
  const handleJumbleDecline = useCallback((id: number) => { setRespondingId(id); respondJumbleMutation.mutate({ id, action: "decline" }); }, [respondJumbleMutation]);
  const handleJumblePlay = useCallback((challenge: JumbleChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/jumble?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleJumbleRematch = useCallback((challenge: JumbleChallengeDetail) => {
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
      gameType: "jumble",
      jumbleDifficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);''')

# 16. filters after game2048Finished
rep('''  const game2048Finished = game2048Challenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];''',
    '''  const game2048Finished = game2048Challenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const jumblePending = jumbleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const jumbleActive = jumbleChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const jumbleOutgoing = jumbleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const jumbleFinished = jumbleChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];''')

# 17. alert + totalAlert
rep('  const game2048Alert = game2048Pending.length + game2048Active.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
    '  const game2048Alert = game2048Pending.length + game2048Active.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;\n  const jumbleAlert = jumblePending.length + jumbleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;')
rep('slidePuzzleAlert + game2048Alert + oddImageAlert', 'slidePuzzleAlert + game2048Alert + jumbleAlert + oddImageAlert')

# 18. recentItems entry
rep('    ...(game2048Challenges ?? []).map((challenge) => ({ game: "game-2048" as const, createdAt: challenge.createdAt, challenge })),',
    '    ...(game2048Challenges ?? []).map((challenge) => ({ game: "game-2048" as const, createdAt: challenge.createdAt, challenge })),\n    ...(jumbleChallenges ?? []).map((challenge) => ({ game: "jumble" as const, createdAt: challenge.createdAt, challenge })),')

# 19. renderRecentCard case
rep('''      case "odd-images":
        return <OddImageChallengeCard''',
    '''      case "jumble":
        return <JumbleChallengeCard key={`jumble-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={responding} />;
      case "odd-images":
        return <OddImageChallengeCard''')

# 20. recentHasData + isLoading
rep('slidePuzzleChallenges != null || game2048Challenges != null || oddImageChallenges != null',
    'slidePuzzleChallenges != null || game2048Challenges != null || jumbleChallenges != null || oddImageChallenges != null')
rep('slidePuzzleLoading || game2048Loading || oddImageLoading',
    'slidePuzzleLoading || game2048Loading || jumbleLoading || oddImageLoading')
rep('activeTab === "game-2048" ? game2048Loading : activeTab === "odd-images"',
    'activeTab === "game-2048" ? game2048Loading : activeTab === "jumble" ? jumbleLoading : activeTab === "odd-images"')

# 21. tab SelectItem entry
rep('              ["game-2048", "2048", game2048Alert],\n              ["odd-images", "Odd Images", oddImageAlert],',
    '              ["game-2048", "2048", game2048Alert],\n              ["jumble", "Jumble Words", jumbleAlert],\n              ["odd-images", "Odd Images", oddImageAlert],')

# 22. tab content block after game-2048 block
rep('''      ) : activeTab === "odd-images" ? (''',
    '''      ) : activeTab === "jumble" ? (
        <div className="space-y-6">
          {jumblePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({jumblePending.length})</h2>{jumblePending.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({jumbleActive.length})</h2>{jumbleActive.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({jumbleOutgoing.length})</h2>{jumbleOutgoing.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{jumbleFinished.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={false}/>)}</section>}
          {(!jumbleChallenges || jumbleChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Jumble Words challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to unscramble the same words and compare points.</p><Button className="mt-2 gap-2 bg-cyan-600 hover:bg-cyan-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Jumble Words challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "odd-images" ? (''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
