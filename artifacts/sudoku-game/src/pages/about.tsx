import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem, Grid3x3, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">
      <button
        onClick={() => setLocation("/profile")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          Brain Games 4 All brings together Sudoku and Memory Match — built to make timeless puzzles accessible and engaging for everyone, from first-time solvers to seasoned experts. We believe a great puzzle game should be beautiful, fast, and endlessly replayable.
        </p>
        <p>
          In Sudoku, beyond the standard 9×9, we support baby grids perfect for kids and pro-level 16×16 boards that will challenge even experienced players. You can play with numbers, letters, or swappable image themes — keeping every session feeling fresh.
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

      <div className="space-y-2 text-sm text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Stack</h2>
        <p>
          Built with React, TypeScript, Express, and PostgreSQL. Puzzles and memory boards are generated server-side with difficulty tuning. Sign in with Google to sync your progress across devices. The whole thing runs on Replit.
        </p>
      </div>

      <div className="text-sm text-muted-foreground bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground mb-1">Get in touch</h2>
        <p>
          Feedback, bug reports, or just want to say hi?{" "}
          <span className="text-foreground font-medium">hello@sudokugame.app</span>
        </p>
      </div>
    </div>
  );
}
