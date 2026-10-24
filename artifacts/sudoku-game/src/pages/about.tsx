import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem, Grid3x3, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/components/page-meta";
import { getLegalReturnPath } from "@/lib/legal-navigation";

const SUDOKU_FEATURES = [
  { icon: Hash, label: "Multiple grid sizes", desc: "3×3, 4×4, 9×9, and 16×16 puzzles for every skill level." },
  { icon: Type, label: "Play with letters", desc: "Swap numbers for coloured letters — a fun visual twist on the classic." },
  { icon: Palette, label: "Image themes", desc: "Replace symbols with themed icons: animals, food, space, and more." },
  { icon: Flame, label: "Daily challenge", desc: "One shared puzzle per day — compete with everyone on the same grid." },
];

const MEMORY_FEATURES = [
  { icon: Grid3x3, label: "Multiple grid sizes", desc: "From 2×4 (4 pairs) up to 8×8 (32 pairs) — quick rounds or long challenges." },
  { icon: Brain, label: "Numbers, letters, or images", desc: "Match numbered cards, letters, or themed picture pairs." },
  { icon: Palette, label: "Image themes", desc: "The same themed icon sets from Sudoku carry over to Memory Match." },
];

const SHARED_FEATURES = [
  { icon: Trophy, label: "Leaderboards & badges", desc: "Weekly and monthly tournaments with shareable winner badges." },
  { icon: BarChart2, label: "Personal stats", desc: "Track your win rate, average time, and progress across difficulties." },
  { icon: Gem, label: "Gem rewards", desc: "Earn 1–3 💎 per puzzle based on difficulty, plus daily login bonuses." },
];

export default function About() {
  usePageMeta({
      title: "About Play Brain Games . Online | Sudoku & Memory Match",
    description:
        "Learn how Play Brain Games combines practical Sudoku and Memory Match sessions, daily challenges, guest play, optional synced progress, and player support.",
    path: "/about",
  });
  const [, setLocation] = useLocation();
  const returnTo = getLegalReturnPath(window.location.search);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">
      <button
        onClick={() => setLocation(returnTo)}
        className="flex items-center gap-1.5 text-sm text-foreground bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-card rounded-2xl px-5 py-4 border border-border">
        <h1 className="text-3xl font-serif font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground mt-1">
          Two classic brain games, reimagined for everyone.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-5 py-4">
        <p>
          Play Brain Games . Online is a general-audience, family-friendly collection of timeless puzzles. It is designed for everyone from first-time solvers to seasoned experts, with optional child-friendly modes for younger family members. We believe a great puzzle game should be beautiful, fast, and endlessly replayable.
        </p>
        <p>
          In Sudoku, beyond the standard 9×9, we support child-friendly Baby and Mini grids as well as pro-level 16×16 boards that will challenge experienced players. You can play with numbers, letters, or swappable image themes — keeping every session feeling fresh.
        </p>
        <p>
          In Memory Match, flip cards to find matching pairs across grids from a quick 2×4 warm-up to a demanding 8×8 marathon — with the same number, letter, and image themes carried over from Sudoku.
        </p>
      </div>

      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" /> Sudoku
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUDOKU_FEATURES.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> Memory Match
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MEMORY_FEATURES.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Across both games</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHARED_FEATURES.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Play first; create an account only if you want synced progress</h2>
        <p>
          Guest play lets you start a puzzle without signing in. Google sign-in
          is optional and connects your profile so statistics, achievements,
          streaks, and saved progress can follow you across devices. A profile
          is not needed to learn the rules or try a board.
        </p>
        <p>
          The Privacy Policy explains the information used for accounts and
          game progress. If you later want to remove an account, the account
          deletion page describes the available steps.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="font-medium text-foreground underline underline-offset-2" href="/privacy/">
            Privacy Policy
          </a>
          <a className="font-medium text-foreground underline underline-offset-2" href="/account-deletion/">
            Account deletion
          </a>
        </div>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Daily practice and comparisons</h2>
        <p>
          The daily Sudoku challenge gives players the same 9×9 medium puzzle
          for that day, so completion time and mistakes can be compared on the
          same board. Memory Match also offers daily and weekly challenges.
          Weekly, monthly, and all-time leaderboards show recorded game results
          for players who choose to take part.
        </p>
        <p>
          These features are optional. You can use the game pages for a quiet
          solo session, read the puzzle guides for step-by-step strategies, or
          visit the leaderboards to compare results.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="font-medium text-foreground underline underline-offset-2" href="/guides/">
            Puzzle guides
          </a>
          <a className="font-medium text-foreground underline underline-offset-2" href="/leaderboard/">
            Leaderboards
          </a>
        </div>
      </section>

      <div className="text-sm text-muted-foreground bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground mb-1">Get in touch</h2>
        <p>
          Feedback, bug reports, or just want to say hi?{" "}
           <a className="text-foreground font-medium underline underline-offset-2" href="mailto:help@playbraingames.online">help@playbraingames.online</a>
        </p>
      </div>
    </div>
  );
}
