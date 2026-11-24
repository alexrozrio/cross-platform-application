import io

path = "scripts/prerender-public.mjs"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:90]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

# Home page: game-count copy + section + link
rep('"Play ten free browser games: Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, and guest play."',
    '"Play twelve free browser games: Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, and guest play."')
rep('"Ten games, one place: logic puzzles, word and picture games, minefields, sliding tiles, spot-the-difference grids, and timed quizzes. Every game can be started as a guest, with daily challenges and leaderboards to compare scores."',
    '"Twelve games, one place: logic puzzles, word and picture games, minefields, sliding tiles, tile-merging, anagram words, spot-the-difference grids, and timed quizzes. Every game can be started as a guest, with daily challenges and leaderboards to compare scores."')
rep('      ["2048 for tile merging", "Slide and merge numbered tiles on 3×3 to 6×6 boards. Points reward a high max tile, fast finishes, and efficient moves."],',
    '      ["2048 for tile merging", "Slide and merge numbered tiles on 3×3 to 6×6 boards. Points reward a high max tile, fast finishes, and efficient moves."],\n      ["Jumble Words for anagrams", "Unscramble jumbled English letters into real words across four levels. Points reward accuracy, speed, and few wrong attempts — skipped words can be retried."],')
rep('      ["/game-2048", "Play 2048 online"],\n      ["/odd-images", "Play Odd Images online"],',
    '      ["/game-2048", "Play 2048 online"],\n      ["/jumble", "Play Jumble Words online"],\n      ["/odd-images", "Play Odd Images online"],')

# Getting-started links
rep('      ["/game-2048", "Play 2048"],\n      ["/game-2048-challenge", "Try the 2048 daily challenge"],\n      ["/odd-images", "Play Odd Images"],',
    '      ["/game-2048", "Play 2048"],\n      ["/game-2048-challenge", "Try the 2048 daily challenge"],\n      ["/jumble", "Play Jumble Words"],\n      ["/jumble-challenge", "Try the Jumble Words daily challenge"],\n      ["/odd-images", "Play Odd Images"],')

# Leaderboard all-games copy + link
rep('"Compare scores across all ten games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes — on weekly, monthly, and all-time boards."',
    '"Compare scores across all twelve games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — on weekly, monthly, and all-time boards."')
rep('Slide Puzzle, 2048, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking.',
    'Slide Puzzle, 2048, Jumble Words, Odd Images, and the Science, Maths & GK quizzes — contribute points to the all-games ranking.')
rep('      ["/leaderboard/game-2048/", "View all-time 2048 scores"],\n      ["/leaderboard/odd-images/", "View all-time Odd Images scores"],',
    '      ["/leaderboard/game-2048/", "View all-time 2048 scores"],\n      ["/leaderboard/jumble/", "View all-time Jumble Words scores"],\n      ["/leaderboard/odd-images/", "View all-time Odd Images scores"],')

# About page copy
rep('"Learn about Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes — board choices, daily challenges, guest play, and saved progress."',
    '"Learn about Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — board choices, daily challenges, guest play, and saved progress."')
rep('"Play Brain Games . Online brings together ten puzzle and quiz formats with adjustable boards, practical guides, daily challenges, and guest play."',
    '"Play Brain Games . Online brings together twelve puzzle and quiz formats with adjustable boards, practical guides, daily challenges, and guest play."')
rep('["Eleven games, many kinds of play", "Sudoku is a logic puzzle; Memory Match is a recall game; Jigsaw rebuilds a picture; Word Search hides themed words; Minesweeper tests deduction under pressure; Slide Puzzle orders shuffled tiles; 2048 merges numbered tiles; Odd Images tests visual scanning; and the Science, Maths & GK quizzes test knowledge against the clock."],',
    '["Twelve games, many kinds of play", "Sudoku is a logic puzzle; Memory Match is a recall game; Jigsaw rebuilds a picture; Word Search hides themed words; Minesweeper tests deduction under pressure; Slide Puzzle orders shuffled tiles; 2048 merges numbered tiles; Jumble Words unscrambles anagrams; Odd Images tests visual scanning; and the Science, Maths & GK quizzes test knowledge against the clock."],')
rep('2048 runs 3×3 to 6×6 boards; Odd Images runs 3×3 to 6×6 grids; and each quiz has Easy through Expert levels.',
    '2048 runs 3×3 to 6×6 boards; Jumble Words deals 5 to 12 words per round; Odd Images runs 3×3 to 6×6 grids; and each quiz has Easy through Expert levels.')
rep('Every game has a daily challenge that refreshes each day, plus head-to-head challenges against friends. Leaderboards cover all eleven games across weekly, monthly, and all-time boards.',
    'Every game has a daily challenge that refreshes each day, plus head-to-head challenges against friends. Leaderboards cover all twelve games across weekly, monthly, and all-time boards.')
rep('      ["/game-2048", "Play 2048"],\n      ["/odd-images", "Play Odd Images"],\n      ["/quiz/science", "Play the quizzes"],',
    '      ["/game-2048", "Play 2048"],\n      ["/jumble", "Play Jumble Words"],\n      ["/odd-images", "Play Odd Images"],\n      ["/quiz/science", "Play the quizzes"],')

# Route entries: /jumble + /jumble-challenge after the 2048-challenge block
rep('''  {
    route: "/odd-images",''',
    '''  {
    route: "/jumble",
    title: "Play Jumble Words Online Free | Unscramble Words Across 4 Levels",
    description:
      "Play free Jumble Words online. Unscramble jumbled English letters into real words across Easy, Medium, Hard, and Expert levels — with daily challenges and duels.",
    heading: "Play Jumble Words Online Free",
    intro:
      "Every round hides real English words behind shuffled letters. Tap the tiles to rebuild each word, then check your answer before moving on.",
    sections: [
      ["Four levels of vocabulary", "Easy deals 5 short everyday words, Medium 8, Hard 10 medium-length words, and Expert 12 long vocabulary words — your Game Mode controls which levels appear."],
      ["Retry skipped words", "Stuck on a scramble? Skip it and keep going — every skipped word can be retried before the round closes, so nothing is lost."],
      ["How scoring works", "Points scale with the level base, your accuracy, completion speed, and how few wrong attempts you make. Completing a round awards XP and gems scaled by level."],
      ["Daily challenge and duels", "The daily Jumble Words challenge gives everyone the same word set each day, and you can challenge friends to beat your score head-to-head."],
    ],
    links: [
      ["/jumble-challenge", "Play today's Jumble Words challenge"],
      ["/leaderboard/jumble/", "View the Jumble Words leaderboard"],
      ["/guides", "Read the Jumble Words guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/jumble-challenge",
    title: "Daily Jumble Words Challenge | Play Brain Games . Online",
    description:
      "Play today's shared Jumble Words round — the same word set for every player — and compare your score on the daily leaderboard.",
    heading: "Daily Jumble Words Challenge",
    intro:
      "Everyone gets the same jumbled word set each day, refreshed at 00:00 UTC. Unscramble every word and post your score.",
    sections: [
      ["One shared word set each day", "The daily Jumble Words challenge deals the same words and scramble to every player on that date."],
      ["Score by accuracy and speed", "Points reward correct answers, fast finishes, and few wrong attempts, so a clean run ranks higher."],
      ["Compare with other players", "The daily leaderboard shows scores and completion times so you can benchmark your anagram skills."],
    ],
    links: [
      ["/jumble", "Play Jumble Words"],
      ["/leaderboard/jumble/", "View the Jumble Words leaderboard"],
      ["/guides", "Read the Jumble Words guide"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/odd-images",''')

# Leaderboard route entry after /leaderboard/game-2048 block
rep('''  {
    route: "/leaderboard/odd-images",''',
    '''  {
    route: "/leaderboard/jumble",
    title: "Jumble Words Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Jumble Words scores across Easy, Medium, Hard, and Expert levels.",
    heading: "Jumble Words Leaderboard",
    intro:
      "See the players with the highest combined points across completed Jumble Words rounds of every level.",
    sections: [
      ["Scores across every level", "Points from completed Easy, Medium, Hard, and Expert rounds count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/jumble", "Play Jumble Words"],
      ["/jumble-challenge", "Try today's challenge"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/odd-images",''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
