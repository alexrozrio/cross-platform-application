import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  { icon: Hash, label: "Multiple grid sizes", desc: "3×3, 4×4, 9×9, and 16×16 puzzles for every skill level." },
  { icon: Type, label: "Play with letters", desc: "Swap numbers for coloured letters — a fun visual twist on the classic." },
  { icon: Palette, label: "Image themes", desc: "Replace symbols with themed icons: animals, food, space, and more." },
  { icon: Flame, label: "Daily challenge", desc: "One shared puzzle per day — compete with everyone on the same grid." },
  { icon: Trophy, label: "Leaderboards & badges", desc: "Weekly and monthly tournaments with shareable winner badges." },
  { icon: BarChart2, label: "Personal stats", desc: "Track your win rate, average time, and progress across difficulties." },
  { icon: Gem, label: "Gem rewards", desc: "Earn gems by completing puzzles and logging in daily." },
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

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground mt-1">
          A modern take on the world's most-loved logic puzzle.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          This Sudoku platform was built to make the classic puzzle accessible and engaging for everyone — from first-time solvers to seasoned experts. We believe a great puzzle game should be beautiful, fast, and endlessly replayable.
        </p>
        <p>
          Beyond the standard 9×9, we support baby grids perfect for kids and pro-level 16×16 boards that will challenge even experienced players. You can play with numbers, letters, or swappable image themes — keeping every session feeling fresh.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Features</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
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

      <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-base font-semibold text-foreground">Stack</h2>
        <p>
          Built with React, TypeScript, Express, and PostgreSQL. Puzzles are generated server-side using a backtracking algorithm with difficulty tuning. Auth is powered by Clerk. The whole thing runs on Replit.
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground mb-1">Get in touch</h2>
        <p>
          Feedback, bug reports, or just want to say hi?{" "}
          <span className="text-foreground font-medium">hello@sudokugame.app</span>
        </p>
      </div>
    </div>
  );
}
