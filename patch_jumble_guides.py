import io

path = "src/pages/guides.tsx"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:90]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

rep('  LayoutGrid,\n  Puzzle,', '  LayoutGrid,\n  LetterText,\n  Puzzle,')

rep('''  "game-2048": {
    section: "border-orange-200/70 dark:border-orange-900/50",
    icon: "text-orange-700 dark:text-orange-300",
    card: "border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/20",
    btn: "bg-orange-700 text-white hover:bg-orange-800",
  },''',
    '''  "game-2048": {
    section: "border-orange-200/70 dark:border-orange-900/50",
    icon: "text-orange-700 dark:text-orange-300",
    card: "border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/20",
    btn: "bg-orange-700 text-white hover:bg-orange-800",
  },
  jumble: {
    section: "border-cyan-200/70 dark:border-cyan-900/50",
    icon: "text-cyan-700 dark:text-cyan-300",
    card: "border-cyan-200/70 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/20",
    btn: "bg-cyan-700 text-white hover:bg-cyan-800",
  },''')

rep('''          <a href="#odd-images-guide-title" className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300">Odd Images guide</a>''',
    '''          <a href="#jumble-guide-title" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">Jumble Words guide</a>
          <a href="#odd-images-guide-title" className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300">Odd Images guide</a>''')

rep('''      <GuideSection
        id="odd-images"
        title="Odd Images guide"''',
    '''      <GuideSection
        id="jumble"
        title="Jumble Words guide"
        themeKey="jumble"
        icon={LetterText}
        intro={[
          "Jumble Words hides real English words behind shuffled letters. Each round deals a set of jumbled words — tap the letter tiles to build your answer, then press Check. Solve as many as you can before the round ends.",
          "Choose a level — Easy (5 words), Medium (8), Hard (10), or Expert (12). Words get longer and trickier as you climb, and your Game Mode controls which levels are offered. Skipped words can be retried before the round closes.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "Short everyday words — great for warming up your anagram eye and building speed." },
          { title: "Hard", detail: "Ten medium-length words with trickier letter patterns; planning a few letters ahead pays off." },
          { title: "Expert", detail: "Twelve long vocabulary words — the toughest scramble set, best saved for a focused run." },
        ]}
        details="Points scale with the level base, your accuracy, completion speed, and how few wrong attempts you make — fast, clean rounds earn the most. Completing a round awards XP and gems scaled by level. Daily challenges deal the same word set to every player each day, and friend challenges compare points head-to-head."
        tips="Say the letters out loud or look for common prefixes and suffixes — many jumbles resolve once you spot a likely start. Use the Clear button to rebuild instead of deleting one letter at a time, and don't be afraid to skip a word that won't come; you can retry every skipped word before finishing. Try the daily challenge to race the same word set as other players."
        links={[
          { href: "/jumble", label: "Play Jumble Words", primary: true },
          { href: "/jumble-challenge", label: "Daily challenge" },
          { href: "/leaderboard/jumble", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="odd-images"
        title="Odd Images guide"''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
