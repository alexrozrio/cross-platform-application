import io

PATH = r"/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/challenges.tsx"
src = io.open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:100]!r}"
    src = src.replace(old, new, count)

# 1. Imports
rep('import { ODD_IMAGE_LEVELS, ODD_IMAGE_LEVEL_ORDER, type OddImageLevel } from "@/lib/odd-images";',
    'import { ODD_IMAGE_LEVELS, ODD_IMAGE_LEVEL_ORDER, type OddImageLevel } from "@/lib/odd-images";\nimport { MEMORY_ORDER_LEVELS, MEMORY_ORDER_LEVEL_ORDER, type MemoryOrderLevel } from "@/lib/memory-order";')
rep('Bomb, Box, Images, LayoutGrid } from "lucide-react";',
    'Bomb, Box, Images, LayoutGrid, ListOrdered } from "lucide-react";')

# 2. GameType union
rep('"snake" | "odd-images" | "rubiks" | QuizGameId;',
    '"snake" | "odd-images" | "memory-order" | "rubiks" | QuizGameId;')

# 3. Detail interface
rep('''  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  createdAt: string; expiresAt: string; gameId?: number;
}

interface RubiksChallengeDetail {''',
    '''  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  createdAt: string; expiresAt: string; gameId?: number;
}

interface MemoryOrderChallengeDetail {
  id: number; challengerId: number; challengedId: number; level: MemoryOrderLevel; theme: string; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  createdAt: string; expiresAt: string; gameId?: number;
}

interface RubiksChallengeDetail {''')

# 4. Challenge card component (insert before RubiksChallengeCard)
rep('''function RubiksChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {''',
    '''function MemoryOrderChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: MemoryOrderChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: MemoryOrderChallengeDetail) => void; onRematch?: (challenge: MemoryOrderChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myCorrect = isChallenger ? challenge.challengerCorrect : challenge.challengedCorrect;
  const myQuestions = isChallenger ? challenge.challengerQuestions : challenge.challengedQuestions;
  const otherCorrect = isChallenger ? challenge.challengedCorrect : challenge.challengerCorrect;
  const otherQuestions = isChallenger ? challenge.challengedQuestions : challenge.challengerQuestions;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = MEMORY_ORDER_LEVELS[challenge.level];
  const themeLabel = IMAGE_THEMES.find((theme) => theme.id === challenge.theme)?.name ?? challenge.theme;
  return <Card className="hover:shadow-md transition-shadow border-fuchsia-200/70 dark:border-fuchsia-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700">Memory Order</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.sequenceLength} images · {level.questions} rounds · {themeLabel}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myCorrect != null && myQuestions ? ` (${myCorrect}/${myQuestions})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherCorrect != null && otherQuestions ? ` (${otherCorrect}/${otherQuestions})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function RubiksChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {''')

# 5. RematchData fields
rep('''  oddImageLevel?: OddImageLevel;
  oddImageTheme?: string;''',
    '''  oddImageLevel?: OddImageLevel;
  oddImageTheme?: string;
  memoryOrderLevel?: MemoryOrderLevel;
  memoryOrderTheme?: string;''')

# 6. levels + defaults + state
rep('  const oddImageLevels = ODD_IMAGE_LEVEL_ORDER.filter((level) => gameMode === "children" ? ODD_IMAGE_LEVELS[level].mode === "baby" : gameMode === "adult" ? ODD_IMAGE_LEVELS[level].mode === "adult" : true);',
    '  const oddImageLevels = ODD_IMAGE_LEVEL_ORDER.filter((level) => gameMode === "children" ? ODD_IMAGE_LEVELS[level].mode === "baby" : gameMode === "adult" ? ODD_IMAGE_LEVELS[level].mode === "adult" : true);\n  const memoryOrderLevels = MEMORY_ORDER_LEVEL_ORDER.filter((level) => gameMode === "children" ? MEMORY_ORDER_LEVELS[level].mode === "baby" : gameMode === "adult" ? MEMORY_ORDER_LEVELS[level].mode === "adult" : true);')
rep('  const defaultOddImageLevel: OddImageLevel = oddImageLevels[0] ?? "easy";',
    '  const defaultOddImageLevel: OddImageLevel = oddImageLevels[0] ?? "easy";\n  const defaultMemoryOrderLevel: MemoryOrderLevel = memoryOrderLevels[0] ?? "easy";')
rep('''  const [oddImageLevel, setOddImageLevel] = useState<OddImageLevel>(defaultOddImageLevel);
  const [oddImageTheme, setOddImageTheme] = useState<string>("shapes");''',
    '''  const [oddImageLevel, setOddImageLevel] = useState<OddImageLevel>(defaultOddImageLevel);
  const [oddImageTheme, setOddImageTheme] = useState<string>("shapes");
  const [memoryOrderLevel, setMemoryOrderLevel] = useState<MemoryOrderLevel>(defaultMemoryOrderLevel);
  const [memoryOrderTheme, setMemoryOrderTheme] = useState<string>("shapes");''')

# 7. restore
rep('''      if (initialData.oddImageLevel && oddImageLevels.includes(initialData.oddImageLevel)) setOddImageLevel(initialData.oddImageLevel);
      if (initialData.oddImageTheme) setOddImageTheme(initialData.oddImageTheme);''',
    '''      if (initialData.oddImageLevel && oddImageLevels.includes(initialData.oddImageLevel)) setOddImageLevel(initialData.oddImageLevel);
      if (initialData.oddImageTheme) setOddImageTheme(initialData.oddImageTheme);
      if (initialData.memoryOrderLevel && memoryOrderLevels.includes(initialData.memoryOrderLevel)) setMemoryOrderLevel(initialData.memoryOrderLevel);
      if (initialData.memoryOrderTheme) setMemoryOrderTheme(initialData.memoryOrderTheme);''')

# 8. create mutation
rep('''    onError: () => toast.error("Failed to send Odd Images challenge"),
  });

  const createRubiksMutation''',
    '''    onError: () => toast.error("Failed to send Odd Images challenge"),
  });

  const createMemoryOrderMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; level: MemoryOrderLevel; theme: string }) =>
      customFetch<MemoryOrderChallengeDetail>("/api/memory-order-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["memory-order-challenges"] });
      toast.success(`Memory Order challenge sent to ${selected?.username}!`, { description: "Recall the shared image sequence while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/memory-order?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&level=${challenge.level}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Memory Order challenge"),
  });

  const createRubiksMutation''')

# 9. create handler branch
rep('''      createOddImageMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, level: validLevel, theme: oddImageTheme });
    } else if (gameType === "rubiks") {''',
    '''      createOddImageMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, level: validLevel, theme: oddImageTheme });
    } else if (gameType === "memory-order") {
      const validLevel = memoryOrderLevels.includes(memoryOrderLevel) ? memoryOrderLevel : (memoryOrderLevels[0] ?? "easy");
      createMemoryOrderMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, level: validLevel, theme: memoryOrderTheme });
    } else if (gameType === "rubiks") {''')

# 10. isPending
rep('createOddImageMutation.isPending || createQuizMutation.isPending',
    'createOddImageMutation.isPending || createMemoryOrderMutation.isPending || createQuizMutation.isPending')

# 11. game picker
rep('''                      ["odd-images", "Odd Images"],
                      ["rubiks", "Rubik's Cube"],''',
    '''                      ["odd-images", "Odd Images"],
                      ["memory-order", "Memory Order"],
                      ["rubiks", "Rubik's Cube"],''')

# 12. select block
rep('''                    <Select value={oddImageTheme} onValueChange={(value) => setOddImageTheme(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{IMAGE_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {gameType === "rubiks" && (''',
    '''                    <Select value={oddImageTheme} onValueChange={(value) => setOddImageTheme(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{IMAGE_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {gameType === "memory-order" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Level</label>
                    <Select value={memoryOrderLevel} onValueChange={(value) => setMemoryOrderLevel(value as MemoryOrderLevel)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{memoryOrderLevels.map((level) => <SelectItem key={level} value={level}>{MEMORY_ORDER_LEVELS[level].label} · {MEMORY_ORDER_LEVELS[level].sequenceLength} images · {MEMORY_ORDER_LEVELS[level].questions} rounds</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Image set</label>
                    <Select value={memoryOrderTheme} onValueChange={(value) => setMemoryOrderTheme(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{IMAGE_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {gameType === "rubiks" && (''')

# 13. meta + tab validation
rep('"Create and join challenges for any of the thirteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — compare scores, and compete with friends."',
    '"Create and join challenges for any of the fourteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, Memory Order, and Science, Maths & GK quizzes — compare scores, and compete with friends."')
rep('|| tab === "snake" || tab === "odd-images" || tab === "rubiks"',
    '|| tab === "snake" || tab === "odd-images" || tab === "memory-order" || tab === "rubiks"')

# 14. query
rep('''  const { data: rubiksChallenges, isLoading: rubiksLoading } = useQuery<RubiksChallengeDetail[]>({''',
    '''  const { data: memoryOrderChallenges, isLoading: memoryOrderLoading } = useQuery<MemoryOrderChallengeDetail[]>({
    queryKey: ["memory-order-challenges", profileId],
    queryFn: () => customFetch<MemoryOrderChallengeDetail[]>(`/api/memory-order-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: rubiksChallenges, isLoading: rubiksLoading } = useQuery<RubiksChallengeDetail[]>({''')

# 15. respond mutation
rep('''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondRubiksMutation''',
    '''    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondMemoryOrderMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<MemoryOrderChallengeDetail & { gameId?: number }>(`/api/memory-order-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["memory-order-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/memory-order?play=1&challengeId=${result.id}&gameId=${result.gameId}&level=${result.level}&theme=${encodeURIComponent(result.theme)}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondRubiksMutation''')

# 16. handlers (after handleOddImageRematch block, before handleRubiksAccept)
rep('''  const handleRubiksAccept = useCallback((id: number) => { setRespondingId(id); respondRubiksMutation.mutate({ id, action: "accept" }); }, [respondRubiksMutation]);''',
    '''  const handleMemoryOrderAccept = useCallback((id: number) => { setRespondingId(id); respondMemoryOrderMutation.mutate({ id, action: "accept" }); }, [respondMemoryOrderMutation]);
  const handleMemoryOrderDecline = useCallback((id: number) => { setRespondingId(id); respondMemoryOrderMutation.mutate({ id, action: "decline" }); }, [respondMemoryOrderMutation]);
  const handleMemoryOrderPlay = useCallback((challenge: MemoryOrderChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/memory-order?play=1&challengeId=${challenge.id}&gameId=${gameId}&level=${challenge.level}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleMemoryOrderRematch = useCallback((challenge: MemoryOrderChallengeDetail) => {
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
      gameType: "memory-order",
      memoryOrderLevel: challenge.level,
      memoryOrderTheme: challenge.theme,
    });
    setShowNew(true);
  }, [profileId]);

  const handleRubiksAccept = useCallback((id: number) => { setRespondingId(id); respondRubiksMutation.mutate({ id, action: "accept" }); }, [respondRubiksMutation]);''')

# 17. status buckets
rep('''  const rubiksPending = rubiksChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];''',
    '''  const memoryOrderPending = memoryOrderChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const memoryOrderActive = memoryOrderChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const memoryOrderOutgoing = memoryOrderChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const memoryOrderFinished = memoryOrderChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const rubiksPending = rubiksChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];''')

# 18. alert + totalAlert
rep('  const oddImageAlert = oddImagePending.length + oddImageActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
    '  const oddImageAlert = oddImagePending.length + oddImageActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;\n  const memoryOrderAlert = memoryOrderPending.length + memoryOrderActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;')
rep('snakeAlert + oddImageAlert + rubiksAlert + quizAlert',
    'snakeAlert + oddImageAlert + memoryOrderAlert + rubiksAlert + quizAlert')

# 19. recent feed
rep('    ...(oddImageChallenges ?? []).map((challenge) => ({ game: "odd-images" as const, createdAt: challenge.createdAt, challenge })),',
    '    ...(oddImageChallenges ?? []).map((challenge) => ({ game: "odd-images" as const, createdAt: challenge.createdAt, challenge })),\n    ...(memoryOrderChallenges ?? []).map((challenge) => ({ game: "memory-order" as const, createdAt: challenge.createdAt, challenge })),')
rep('''      case "odd-images":
        return <OddImageChallengeCard key={`odd-images-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={responding} />;''',
    '''      case "odd-images":
        return <OddImageChallengeCard key={`odd-images-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={responding} />;
      case "memory-order":
        return <MemoryOrderChallengeCard key={`memory-order-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleMemoryOrderAccept} onDecline={handleMemoryOrderDecline} onPlay={handleMemoryOrderPlay} onRematch={handleMemoryOrderRematch} isResponding={responding} />;''')

# 20. loading flags
rep('oddImageChallenges != null || rubiksChallenges != null || quizChallenges != null;',
    'oddImageChallenges != null || memoryOrderChallenges != null || rubiksChallenges != null || quizChallenges != null;')
rep('snakeLoading || oddImageLoading || rubiksLoading || quizLoading',
    'snakeLoading || oddImageLoading || memoryOrderLoading || rubiksLoading || quizLoading')
rep('activeTab === "snake" ? snakeLoading : activeTab === "odd-images" ? oddImageLoading : activeTab === "rubiks" ? rubiksLoading : quizLoading;',
    'activeTab === "snake" ? snakeLoading : activeTab === "odd-images" ? oddImageLoading : activeTab === "memory-order" ? memoryOrderLoading : activeTab === "rubiks" ? rubiksLoading : quizLoading;')

# 21. tab list
rep('''              ["odd-images", "Odd Images", oddImageAlert],
              ["rubiks", "Rubik's Cube", rubiksAlert],''',
    '''              ["odd-images", "Odd Images", oddImageAlert],
              ["memory-order", "Memory Order", memoryOrderAlert],
              ["rubiks", "Rubik's Cube", rubiksAlert],''')

# 22. tab panel
rep('''          {(!oddImageChallenges || oddImageChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Images className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Odd Images challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to find the same odd images and compare points.</p><Button className="mt-2 gap-2 bg-teal-600 hover:bg-teal-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send an Odd Images challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "rubiks" ? (''',
    '''          {(!oddImageChallenges || oddImageChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Images className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Odd Images challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to find the same odd images and compare points.</p><Button className="mt-2 gap-2 bg-teal-600 hover:bg-teal-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send an Odd Images challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "memory-order" ? (
        <div className="space-y-6">
          {memoryOrderPending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({memoryOrderPending.length})</h2>{memoryOrderPending.map((challenge) => <MemoryOrderChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMemoryOrderAccept} onDecline={handleMemoryOrderDecline} onPlay={handleMemoryOrderPlay} onRematch={handleMemoryOrderRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {memoryOrderActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({memoryOrderActive.length})</h2>{memoryOrderActive.map((challenge) => <MemoryOrderChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMemoryOrderAccept} onDecline={handleMemoryOrderDecline} onPlay={handleMemoryOrderPlay} onRematch={handleMemoryOrderRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {memoryOrderOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({memoryOrderOutgoing.length})</h2>{memoryOrderOutgoing.map((challenge) => <MemoryOrderChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMemoryOrderAccept} onDecline={handleMemoryOrderDecline} onPlay={handleMemoryOrderPlay} onRematch={handleMemoryOrderRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {memoryOrderFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{memoryOrderFinished.map((challenge) => <MemoryOrderChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMemoryOrderAccept} onDecline={handleMemoryOrderDecline} onPlay={handleMemoryOrderPlay} onRematch={handleMemoryOrderRematch} isResponding={false}/>)}</section>}
          {(!memoryOrderChallenges || memoryOrderChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><ListOrdered className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Memory Order challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to recall the same image sequence and compare points.</p><Button className="mt-2 gap-2 bg-fuchsia-600 hover:bg-fuchsia-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Memory Order challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "rubiks" ? (''')

# 23. help text
rep('Jumble Words, Snake, Odd Images, or a quiz — to challenge another player',
    'Jumble Words, Snake, Odd Images, Memory Order, or a quiz — to challenge another player')

io.open(PATH, "w", encoding="utf-8", newline="").write(src)
print("challenges.tsx patched OK")
