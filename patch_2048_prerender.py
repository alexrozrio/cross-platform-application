import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/scripts/prerender-public.mjs"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Home features bullet
rep(
  '      ["Odd Images for visual scans",',
  '      ["2048 for tile merging", "Slide and merge numbered tiles on 3×3 to 6×6 boards. Points reward a high max tile, fast finishes, and efficient moves."],' + NL +
  '      ["Odd Images for visual scans",'
)

# 2. Home links
rep(
  '      ["/slide-puzzle", "Play Slide Puzzle online"],',
  '      ["/slide-puzzle", "Play Slide Puzzle online"],' + NL +
  '      ["/game-2048", "Play 2048 online"],'
)

# 3. Guides links block
rep(
  '      ["/slide-puzzle", "Play Slide Puzzle"],' + NL +
  '      ["/odd-images", "Play Odd Images"],' + NL +
  '      ["/odd-images-challenge", "Try the Odd Images daily challenge"],',
  '      ["/slide-puzzle", "Play Slide Puzzle"],' + NL +
  '      ["/game-2048", "Play 2048"],' + NL +
  '      ["/game-2048-challenge", "Try the 2048 daily challenge"],' + NL +
  '      ["/odd-images", "Play Odd Images"],' + NL +
  '      ["/odd-images-challenge", "Try the Odd Images daily challenge"],'
)

# 4. Leaderboard page text + links
rep(
  '"Completed games from every title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking."',
  '"Completed games from every title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking."'
)
rep(
  '      ["/leaderboard/slide-puzzle/", "View all-time Slide Puzzle scores"],',
  '      ["/leaderboard/slide-puzzle/", "View all-time Slide Puzzle scores"],' + NL +
  '      ["/leaderboard/game-2048/", "View all-time 2048 scores"],'
)

# 5. About page text + links
rep(
  '"Ten games, many kinds of play"',
  '"Eleven games, many kinds of play"'
)
rep(
  'Slide Puzzle orders shuffled tiles; Odd Images tests visual scanning;',
  'Slide Puzzle orders shuffled tiles; 2048 merges numbered tiles; Odd Images tests visual scanning;'
)
rep(
  'Slide Puzzle goes 2×2 to 5×5; Odd Images runs 3×3 to 6×6 grids;',
  'Slide Puzzle goes 2×2 to 5×5; 2048 runs 3×3 to 6×6 boards; Odd Images runs 3×3 to 6×6 grids;'
)
rep(
  'Leaderboards cover all ten games',
  'Leaderboards cover all eleven games'
)
rep(
  '      ["/slide-puzzle", "Play Slide Puzzle"],' + NL +
  '      ["/odd-images", "Play Odd Images"],' + NL +
  '      ["/quiz/science", "Play the quizzes"],' + NL +
  '      ["/guides", "Read the puzzle guides"],' + NL +
  '      ["/account-deletion", "Account deletion"],',
  '      ["/slide-puzzle", "Play Slide Puzzle"],' + NL +
  '      ["/game-2048", "Play 2048"],' + NL +
  '      ["/odd-images", "Play Odd Images"],' + NL +
  '      ["/quiz/science", "Play the quizzes"],' + NL +
  '      ["/guides", "Read the puzzle guides"],' + NL +
  '      ["/account-deletion", "Account deletion"],'
)

# 6. Route blocks — insert /game-2048 + /game-2048-challenge before /odd-images block
rep(
  '''  {
    route: "/odd-images",''',
  '''  {
    route: "/game-2048",
    title: "Play 2048 Online Free | Merge Tiles on 3×3 to 6×6",
    description:
      "Play free 2048 online with 3×3, 4×4, 5×5, and 6×6 boards. Slide and merge numbered tiles, reach the target tile, and climb the leaderboard.",
    heading: "Play 2048 Online Free",
    intro:
      "Every move slides all tiles toward one edge and equal tiles merge into their double. Build the highest tile you can before the board fills up.",
    sections: [
      ["Four board sizes", "3×3 (Easy) is a quick warm-up, 4×4 (Medium) is the classic board, 5×5 (Hard) is a marathon, and 6×6 (Expert) gives you room to plan long-term."],
      ["How scoring works", "Points reward your highest tile combined with speed and move efficiency — bigger merges and faster finishes earn more. Completing a game awards XP and gems scaled by board size."],
      ["Daily challenge and duels", "The daily 2048 challenge gives everyone the same starting board each day, and you can challenge friends to beat your score head-to-head."],
      ["Play as a guest or save progress", "Start a game without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/game-2048-challenge", "Play today's 2048 challenge"],
      ["/leaderboard/game-2048/", "View the 2048 leaderboard"],
      ["/guides", "Read the 2048 guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/game-2048-challenge",
    title: "Daily 2048 Challenge | Play Brain Games . Online",
    description:
      "Play today's shared 2048 board, reach the highest tile you can, and compare your score with every other player on the daily leaderboard.",
    heading: "Daily 2048 Challenge",
    intro:
      "Everyone gets the same starting board each day, refreshed at 00:00 UTC. Merge tiles, reach the target, and post your score.",
    sections: [
      ["One shared board each day", "The daily 2048 challenge uses the same board size and starting tiles for every player on that date."],
      ["Score by tile and speed", "Points reward your highest tile plus fast, efficient play, so a big merge streak ranks higher."],
      ["Compare with other players", "The daily leaderboard shows scores and completion times so you can benchmark your merging."],
    ],
    links: [
      ["/game-2048", "Play 2048"],
      ["/leaderboard/game-2048/", "View the 2048 leaderboard"],
      ["/guides", "Read the 2048 guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/odd-images",'''
)

# 7. Leaderboard route block — insert /leaderboard/game-2048 before /leaderboard/odd-images
rep(
  '''  {
    route: "/leaderboard/odd-images",''',
  '''  {
    route: "/leaderboard/game-2048",
    title: "2048 Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time 2048 scores across 3×3, 4×4, 5×5, and 6×6 boards.",
    heading: "2048 Leaderboard",
    intro:
      "See the players with the highest combined points across completed 2048 games of every board size.",
    sections: [
      ["Scores across every board", "Points from completed 3×3, 4×4, 5×5, and 6×6 games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/game-2048", "Play 2048"],
      ["/game-2048-challenge", "Try today's challenge"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/odd-images",'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("prerender-public.mjs patched OK")
