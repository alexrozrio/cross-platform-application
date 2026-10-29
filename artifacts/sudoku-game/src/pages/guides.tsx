import { Link } from "wouter";
import { ArrowLeft, BookOpen, Puzzle } from "lucide-react";
import { usePageMeta } from "@/components/page-meta";
import { MemoryGuide, SudokuGuide } from "@/components/game-guides";

export default function Guides() {
  usePageMeta({
    title: "Puzzle Guides: Sudoku, Memory Match & Jigsaw | Play Brain Games . Online",
    description:
      "Learn Sudoku, Memory Match, and Jigsaw with practical strategies, board-size guidance, and tips for daily puzzles and friend challenges.",
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
        </nav>
      </header>

      <SudokuGuide />
      <MemoryGuide />
      <section aria-labelledby="jigsaw-guide-title" className="space-y-4 rounded-2xl border border-amber-200/70 bg-card p-5 dark:border-amber-900/50 sm:p-6">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Puzzle className="h-5 w-5" />
          <h2 id="jigsaw-guide-title" className="text-xl font-serif font-bold text-foreground">Jigsaw Puzzle guide</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">Choose a picture and a board from 2×2 to 5×5. Drag pieces into place, or tap two pieces to swap them. The reference picture, timer, and move count help you track your progress.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">Larger boards and higher levels earn more base points. Finish faster than the board's target time to earn a time bonus. Try today's shared puzzle or challenge a friend to complete the same picture.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/jigsaw" className="rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-amber-800">Play Jigsaw</Link>
          <Link href="/jigsaw-challenge" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Daily challenge</Link>
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
          <Link href="/memory" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            Play Memory Match
          </Link>
          <Link href="/jigsaw" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            Play Jigsaw
          </Link>
          <Link href="/about" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">
            About the site
          </Link>
        </div>
      </section>
    </div>
  );
}