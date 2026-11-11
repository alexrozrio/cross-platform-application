import { Link } from "wouter";
import { ArrowLeft, BookOpen, Puzzle, Search } from "lucide-react";
import { usePageMeta } from "@/components/page-meta";
import { MemoryGuide, SudokuGuide } from "@/components/game-guides";

export default function Guides() {
  usePageMeta({
    title: "Puzzle Guides: Sudoku, Memory, Jigsaw & Word Search | Play Brain Games . Online",
    description:
      "Learn Sudoku, Memory Match, Jigsaw, and Word Search with practical strategies, board-size guidance, and tips for daily puzzles and friend challenges.",
    path: "/guides",
    type: "article",
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12 animate-in fade-in duration-500">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <header className="space-y-3 rounded-2xl border border-border bg-card px-5 py-6 sm:px-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BookOpen className="h-4 w-4" />
          Play guides
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">
          Learn the games, then make your next move
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Play Brain Games . Online is built for short, repeatable puzzle
          sessions. These guides explain the rules, offer practical ways to
          approach each board, and help you choose a comfortable starting point
          without turning practice into a test.
        </p>
        <nav aria-label="Guide sections" className="flex flex-wrap gap-2 pt-1">
          <a href="#sudoku-guide-title" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            Sudoku guide
          </a>
          <a href="#memory-guide-title" className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Memory Match guide
          </a>
          <a href="#jigsaw-guide-title" className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
            Jigsaw guide
          </a>
          <a href="#word-search-guide-title" className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Word Search guide
          </a>
        </nav>
      </header>

      <SudokuGuide />
      <MemoryGuide />
      <section aria-labelledby="jigsaw-guide-title" className="space-y-4 rounded-2xl border border-amber-200/70 bg-card p-5 dark:border-amber-900/50 sm:p-6">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Puzzle className="h-5 w-5" />
          <h2 id="jigsaw-guide-title" className="text-xl font-serif font-bold text-foreground">Jigsaw Puzzle guide</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">Choose an image and a grid from 2×2 to 5×5. Your Game Mode controls which sizes are offered: Kids mode has 2×2 and 3×3, Adult mode has 4×4 and 5×5, and the default 4 All mode has all four sizes. Smaller boards are a good way to learn how the pieces move; larger boards have more pieces to track. Drag a piece into an empty space or tap two pieces to swap them. Each placement or swap uses a move, so look for pieces that clearly belong before moving several around.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { level: "Easy", detail: "The full reference picture stays visible beside the board." },
            { level: "Medium", detail: "Use up to three five-second previews to check the reference." },
            { level: "Hard", detail: "The reference stays hidden; use piece details and memory to rebuild the image." },
          ].map(({ level, detail }) => (
            <div key={level} className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <h3 className="text-sm font-semibold text-foreground">{level}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">Use the Tip control when you need help identifying a piece. Tips and previews count as assists and reduce the final score. Board size and level set the base points; finishing under the target time adds a bonus, while extra moves also lower points. Completing a puzzle awards XP based on level and gems based on board size.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">For a simple strategy, place obvious corner and edge pieces first, then use colours and image details to group pieces that belong together. Try the daily challenge to solve the same picture as other players, or create a friend challenge to compare results on a shared puzzle.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/jigsaw" className="rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-amber-800">Play Jigsaw</Link>
          <Link href="/jigsaw-challenge" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Daily challenge</Link>
        </div>
      </section>

      <section aria-labelledby="word-search-guide-title" className="space-y-4 rounded-2xl border border-violet-200/70 bg-card p-5 dark:border-violet-900/50 sm:p-6">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Search className="h-5 w-5" />
          <h2 id="word-search-guide-title" className="text-xl font-serif font-bold text-foreground">Word Search guide</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">Words hide in straight lines inside a letter grid. Choose a difficulty and a word theme, then press on a word&apos;s first letter and drag to its last letter to reveal it. Beginner (6×6, 6 words) and Easy (8×8, 8 words) hide words only left-to-right and top-to-bottom; Medium (12×12, 10 words) adds diagonals; Hard (14×14, 12 words) also includes backwards words. Your Game Mode controls which levels are offered: Kids mode has Beginner and Easy, Adult mode has Medium and Hard, and the default 4 All mode has all four.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { level: "Beginner / Easy", detail: "Shorter words in straight horizontal and vertical lines — a gentle way to learn the drag mechanic." },
            { level: "Medium", detail: "A larger 12×12 grid adds diagonal words, so scan corner-to-corner as well as across and down." },
            { level: "Hard", detail: "A 14×14 grid also hides backwards words; check the word list and use a hint if a word stays elusive." },
          ].map(({ level, detail }) => (
            <div key={level} className="rounded-xl border border-violet-200/70 bg-violet-50/60 p-3 dark:border-violet-900/50 dark:bg-violet-950/20">
              <h3 className="text-sm font-semibold text-foreground">{level}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">The side panel lists every word you need to find — cross them off as you reveal them. You get up to two hints per game, and each wrong selection counts as a try. Points are based on the difficulty, your completion time, tries, and hints used; finishing awards XP by difficulty and gems for every puzzle completed.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">A simple strategy is to scan for uncommon letter pairs and long words first, then work outward from words you have already found. Try the daily challenge to solve the same word puzzle as other players, or create a friend challenge to compare results.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/word-search" className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-800">Play Word Search</Link>
          <Link href="/word-search-challenge" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Daily challenge</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground sm:p-6">
        <h2 className="text-xl font-serif font-bold text-foreground">
          Keep practicing at your own pace
        </h2>
        <p className="mt-2">
          You can play as a guest, return to an unfinished round, and choose
          another board whenever you want a different level of challenge. An
          optional profile adds saved results, personal statistics, themes,
          rewards, and streaks across devices.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/sudoku" className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Play Sudoku
          </Link>
          <Link href="/memory/" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            Play Memory Match
          </Link>
          <Link href="/jigsaw" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            Play Jigsaw
          </Link>
          <Link href="/word-search" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            Play Word Search
          </Link>
          <Link href="/about/" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            About the site
          </Link>
        </div>
      </section>
    </div>
  );
}
