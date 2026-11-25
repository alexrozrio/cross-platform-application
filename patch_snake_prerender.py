PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/scripts/prerender-public.mjs"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. Home page description + intro + section + link
rep('"Play twelve free browser games: Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, and guest play."',
    '"Play thirteen free browser games: Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, and guest play."')
rep('"Twelve games, one place: logic puzzles, word and picture games, minefields, sliding tiles, tile-merging, anagram words, spot-the-difference grids, and timed quizzes. Every game can be started as a guest, with daily challenges and leaderboards to compare scores."',
    '"Thirteen games, one place: logic puzzles, word and picture games, minefields, sliding tiles, tile-merging, anagram words, classic snake, spot-the-difference grids, and timed quizzes. Every game can be started as a guest, with daily challenges and leaderboards to compare scores."')
rep('["Jumble Words for anagrams", "Unscramble jumbled English letters into real words across four levels. Points reward accuracy, speed, and few wrong attempts — skipped words can be retried."],',
    '["Jumble Words for anagrams", "Unscramble jumbled English letters into real words across four levels. Points reward accuracy, speed, and few wrong attempts — skipped words can be retried."],\n      ["Snake for the classic chase", "Steer the Nokia-style snake to each piece of food before you crash — four grid sizes from 12×12 to 18×18 with Kids and Adult modes."],')
rep('      ["/jumble", "Play Jumble Words online"],\n      ["/odd-images", "Play Odd Images online"],',
    '      ["/jumble", "Play Jumble Words online"],\n      ["/snake", "Play Snake online"],\n      ["/odd-images", "Play Odd Images online"],')

# 2. /guides links (line ~299)
rep('      ["/jumble", "Play Jumble Words"],\n      ["/jumble-challenge", "Try the Jumble Words daily challenge"],\n      ["/odd-images", "Play Odd Images"],',
    '      ["/jumble", "Play Jumble Words"],\n      ["/jumble-challenge", "Try the Jumble Words daily challenge"],\n      ["/snake", "Play Snake"],\n      ["/snake-challenge", "Try the Snake daily challenge"],\n      ["/odd-images", "Play Odd Images"],')

# 3. /leaderboard description + section + link
rep('"Compare scores across all twelve games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — on weekly, monthly, and all-time boards."',
    '"Compare scores across all thirteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — on weekly, monthly, and all-time boards."')
rep('["All-time combined scores", "Completed games from every title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking."],',
    '["All-time combined scores", "Completed games from every title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking."],')
rep('      ["/leaderboard/jumble/", "View all-time Jumble Words scores"],\n      ["/leaderboard/odd-images/", "View all-time Odd Images scores"],',
    '      ["/leaderboard/jumble/", "View all-time Jumble Words scores"],\n      ["/leaderboard/snake/", "View all-time Snake scores"],\n      ["/leaderboard/odd-images/", "View all-time Odd Images scores"],')

# 4. /about entry
rep('title: "About Play Brain Games . Online | Ten Free Games"',
    'title: "About Play Brain Games . Online | Thirteen Free Games"')
rep('"Learn about Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — board choices, daily challenges, guest play, and saved progress."',
    '"Learn about Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — board choices, daily challenges, guest play, and saved progress."')
rep('"Play Brain Games . Online brings together twelve puzzle and quiz formats with adjustable boards, practical guides, daily challenges, and guest play."',
    '"Play Brain Games . Online brings together thirteen puzzle and quiz formats with adjustable boards, practical guides, daily challenges, and guest play."')
rep('["Twelve games, many kinds of play", "Sudoku is a logic puzzle; Memory Match is a recall game; Jigsaw rebuilds a picture; Word Search hides themed words; Minesweeper tests deduction under pressure; Slide Puzzle orders shuffled tiles; 2048 merges numbered tiles; Jumble Words unscrambles anagrams; Odd Images tests visual scanning; and the Science, Maths & GK quizzes test knowledge against the clock."],',
    '["Thirteen games, many kinds of play", "Sudoku is a logic puzzle; Memory Match is a recall game; Jigsaw rebuilds a picture; Word Search hides themed words; Minesweeper tests deduction under pressure; Slide Puzzle orders shuffled tiles; 2048 merges numbered tiles; Jumble Words unscrambles anagrams; Snake tests reflexes and planning; Odd Images tests visual scanning; and the Science, Maths & GK quizzes test knowledge against the clock."],')
rep('Jumble Words deals 5 to 12 words per round; Odd Images runs 3×3 to 6×6 grids;',
    'Jumble Words deals 5 to 12 words per round; Snake runs 12×12 to 18×18 boards; Odd Images runs 3×3 to 6×6 grids;')
rep('Leaderboards cover all twelve games across weekly, monthly, and all-time boards.',
    'Leaderboards cover all thirteen games across weekly, monthly, and all-time boards.')
rep('      ["/jumble", "Play Jumble Words"],\n      ["/odd-images", "Play Odd Images"],',
    '      ["/jumble", "Play Jumble Words"],\n      ["/snake", "Play Snake"],\n      ["/odd-images", "Play Odd Images"],')

# 5. New route entries after jumble-challenge (before odd-images route)
rep('''  {
    route: "/odd-images",''',
    '''  {
    route: "/snake",
    title: "Play Snake Online Free | Classic Nokia Snake Across 4 Levels",
    description:
      "Play free Snake online. Steer the classic Nokia-style snake to each piece of food across Easy, Medium, Hard, and Expert levels — with daily challenges and duels.",
    heading: "Play Snake Online Free",
    intro:
      "Every piece of food makes the snake longer. Guide it across the grid without hitting a wall or your own tail.",
    sections: [
      ["Four levels of speed and size", "Easy runs a calm 12×12 board at 8 food, Medium a 14×14 at 12, Hard a fast 16×16 at 16, and Expert an 18×18 at 20 — your Game Mode controls which levels appear."],
      ["Keyboard, swipe, or on-screen pad", "Arrow keys or WASD on desktop, swipe on touch screens, or the on-screen direction pad — pick whichever feels natural."],
      ["How scoring works", "Points scale with the level base, food eaten, completion speed, and turn efficiency. Completing a round awards XP and gems scaled by level."],
      ["Daily challenge and duels", "The daily Snake challenge gives everyone the same food sequence each day, and you can challenge friends to beat your score head-to-head."],
    ],
    links: [
      ["/snake-challenge", "Play today's Snake challenge"],
      ["/leaderboard/snake/", "View the Snake leaderboard"],
      ["/guides", "Read the Snake guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/snake-challenge",
    title: "Daily Snake Challenge | Play Brain Games . Online",
    description:
      "Play today's shared Snake round — the same food sequence for every player — and compare your score on the daily leaderboard.",
    heading: "Daily Snake Challenge",
    intro:
      "Everyone gets the same food sequence each day, refreshed at 00:00 UTC. Eat it all and post your score.",
    sections: [
      ["One shared food trail each day", "The daily Snake challenge places the same food sequence for every player on that date."],
      ["Score by food and speed", "Points reward food eaten, fast finishes, and few wasted turns, so a clean run ranks higher."],
      ["Compare with other players", "The daily leaderboard shows scores and completion times so you can benchmark your reflexes."],
    ],
    links: [
      ["/snake", "Play Snake"],
      ["/leaderboard/snake/", "View the Snake leaderboard"],
      ["/guides", "Read the Snake guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/odd-images",''')

# 6. /leaderboard/snake route after /leaderboard/jumble
rep('''  {
    route: "/leaderboard/odd-images",''',
    '''  {
    route: "/leaderboard/snake",
    title: "Snake Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Snake scores across Easy, Medium, Hard, and Expert levels.",
    heading: "Snake Leaderboard",
    intro:
      "See the players with the highest combined points across completed Snake rounds of every level.",
    sections: [
      ["Scores across every level", "Points from completed Easy, Medium, Hard, and Expert rounds count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/snake", "Play Snake"],
      ["/snake-challenge", "Try today's challenge"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/odd-images",''')

open(PATH, "w", encoding="utf-8").write(src)
print("prerender-public.mjs patched OK")
