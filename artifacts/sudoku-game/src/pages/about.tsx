import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem, Grid3x3, Brain, Puzzle, Search, Sparkles, Bomb, Grid2x2, Images, FlaskConical, Timer, Swords, LetterText } from "lucide-react";
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

const JIGSAW_FEATURES = [
  { icon: Puzzle, label: "Flexible puzzle grids", desc: "Kids mode offers 2×2 and 3×3, Adult mode offers 4×4 and 5×5, and default 4 All mode offers every size." },
  { icon: Sparkles, label: "Three levels and themed images", desc: "Choose how much picture guidance you want and pick an image for each round." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Try the shared daily picture or invite a friend to solve the same puzzle." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Earn points based on grid size, level, time, moves, and tips, with XP and gems for completing puzzles." },
];

const WORD_SEARCH_FEATURES = [
  { icon: Search, label: "Four difficulty levels", desc: "From a quick 6×6 Easy grid to a 14×14 Expert board with diagonals and backwards words." },
  { icon: Palette, label: "Themed word lists", desc: "Animals, food, space, ocean, and icon-set themes give every puzzle a fresh word list." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Solve the same shared daily puzzle or challenge a friend to beat your score." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Earn points based on difficulty, time, tries, and hints, with XP and gems for completing puzzles." },
];

const MINESWEEPER_FEATURES = [
  { icon: Bomb, label: "Four board sizes", desc: "From a gentle 6×6 Easy board with 5 mines up to a 14×14 Expert field with 34." },
  { icon: Search, label: "Numbers and flags", desc: "Each revealed number counts neighbouring mines — flag the suspects and clear every safe cell." },
  { icon: Flame, label: "Daily challenge", desc: "One shared minefield per day — compare your sweep with everyone else." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Earn points for clearing the field cleanly and quickly, with up to three mistakes and two hints." },
];

const SLIDE_PUZZLE_FEATURES = [
  { icon: Grid2x2, label: "Four board sizes", desc: "Easy and Medium warm-ups up to the demanding Hard and Expert boards." },
  { icon: Type, label: "Three tile styles", desc: "Numbers, alphabet letters, or picture tiles from the icon themes." },
  { icon: Flame, label: "Daily challenge", desc: "Solve the same scrambled board as every other player each day." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward few moves and fast solves against each board's par target." },
];

const GAME_2048_FEATURES = [
  { icon: Grid3x3, label: "Four board sizes", desc: "Kids mode gets the 3×3 and 4×4 boards; Adult mode unlocks the demanding 5×5 and 6×6." },
  { icon: Trophy, label: "Chase the target tile", desc: "Reach 512 on 3×3 up to 2048 on the larger boards — then keep merging for a higher max tile." },
  { icon: Flame, label: "Daily challenge", desc: "One shared seed each day — every player gets the same opening tiles." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward your max tile, fast finishes, and efficient moves." },
];

const JUMBLE_FEATURES = [
  { icon: LetterText, label: "Four levels, growing rounds", desc: "Kids mode deals 5–8 everyday words; Adult mode steps up to 10–12 harder ones." },
  { icon: Type, label: "Unscramble the letters", desc: "Jumbled letters hide a real English word — rebuild it letter by letter or type it out." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Solve the same shared word set each day or challenge a friend head-to-head." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward accuracy, speed, and fewer wrong attempts." },
];

const ODD_IMAGE_FEATURES = [
  { icon: Images, label: "Four grid sizes", desc: "From a quick 3×3 Easy board to a demanding 6×6 Expert grid." },
  { icon: Search, label: "Spot the odd one", desc: "Each grid repeats one picture theme — find the single tile that does not belong." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Play the shared daily seed or challenge a friend to the same round." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Earn points based on level, correct answers, and time, with XP and gems for completing rounds." },
];

const QUIZ_FEATURES = [
  { icon: FlaskConical, label: "Science, Maths & GK", desc: "Three separate quiz games covering planets and elements, numbers and shapes, and world facts." },
  { icon: Timer, label: "Four timed levels", desc: "Easy (5 questions) through Expert (12 questions) — answer fast and accurately for bonus points." },
  { icon: Flame, label: "Daily challenge", desc: "Each subject has a shared daily quiz with identical questions for every player." },
  { icon: Swords, label: "Friend challenges", desc: "Challenge another player head-to-head on the same quiz questions." },
];

const SHARED_FEATURES = [
  { icon: Trophy, label: "Leaderboards & badges", desc: "Weekly and monthly tournaments, all-time scores, and shareable winner badges." },
  { icon: BarChart2, label: "Personal stats", desc: "Track your win rate, average time, and progress across difficulties." },
  { icon: Gem, label: "Gem rewards", desc: "Earn in-game rewards from puzzle completions, plus daily login bonuses." },
];

export default function About() {
  usePageMeta({
      title: "About Play Brain Games . Online | Twelve Free Games",
    description:
        "Learn how Play Brain Games combines Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes with daily challenges, guest play, synced progress, and player support.",
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
          Twelve brain games, reimagined for everyone.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-5 py-4">
        <p>
          Play Brain Games . Online is a general-audience, family-friendly collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes. It is designed for everyone from first-time players to seasoned experts, with optional child-friendly modes for younger family members. We believe a great puzzle game should be beautiful, fast, and endlessly replayable.
        </p>
        <p>
          In Sudoku, beyond the standard 9×9, we support child-friendly Baby and Mini grids as well as pro-level 16×16 boards that will challenge experienced players. You can play with numbers, letters, or swappable image themes — keeping every session feeling fresh.
        </p>
        <p>
          In Memory Match, flip cards to find matching pairs across grids from a quick 2×4 warm-up to a demanding 8×8 marathon — with the same number, letter, and image themes carried over from Sudoku.
        </p>
        <p>
          In Jigsaw, rebuild themed pictures on boards from Easy (2×2) to Expert (5×5). Kids mode offers the smaller boards, Adult mode the larger ones, and default 4 All mode offers all four. Choose an assist level, earn points based on time, moves, and tips, or invite a friend to solve the same picture. Wins also award XP by level and gems by board size.
        </p>
        <p>
          In Word Search, find themed words hidden in a letter grid across four
          levels. Easy and Medium hide words left-to-right and top-to-bottom;
          Hard adds diagonals and Expert adds backwards words too. Drag from a
          word&apos;s first letter to its last to reveal it, use up to two hints
          per game, and earn points based on difficulty, time, tries, and hints.
        </p>
        <p>
          In Minesweeper, reveal safe cells and read the numbers — each counts
          the mines touching that cell — to deduce where the mines hide. Boards
          run from a 6×6 Easy field to a 14×14 Expert one, with up to three
          mistakes and two hints per game.
        </p>
        <p>
          In Slide Puzzle, slide tiles one space at a time through the single
          gap until the board reads in order. Choose from Easy (2×2) to Expert (5×5) boards and
          number, alphabet, or picture tiles; points reward fast, efficient
          solves against each board&apos;s par target.
        </p>
        <p>
          In 2048, slide numbered tiles across the grid to merge matching
          values — every merge builds a bigger number. Boards run from a quick
          3×3 Easy to a demanding 6×6 Expert, and each board has its own target
          tile to reach. Points reward the highest tile you achieve, fast
          finishes, and efficient moves.
        </p>
        <p>
          In Jumble Words, a real English word arrives with its letters
          scrambled — rearrange them back into the hidden word. Rounds grow
          from 5 words on Easy to 12 on Expert, with harder vocabulary as the
          level rises, and skipped words can be revisited before finishing.
          Points reward accuracy, speed, and clean attempts.
        </p>
        <p>
          In Odd Images, each grid repeats one picture theme and hides a single
          tile that does not belong. Easy uses a clearly different image,
          Medium recolors the odd tile, and Hard/Expert add subtler changes like
          flips, rotations, or missing features. Choose from Easy (3×3, 5
          questions) to Expert (6×6, 12 questions); points reward correct
          answers and fast completion.
        </p>
        <p>
          The Science, Maths, and GK quizzes are timed multiple-choice games
          with four levels — Easy asks 5 questions, Expert asks 12 — covering
          planets and elements, numbers and shapes, and world facts. Each has
          its own daily challenge, leaderboard, achievements, and friend
          duels.
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
          <Puzzle className="w-4 h-4 text-primary" /> Jigsaw
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {JIGSAW_FEATURES.map(({ icon: Icon, label, desc }) => (
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
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Word Search
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORD_SEARCH_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <Bomb className="w-4 h-4 text-primary" /> Minesweeper
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MINESWEEPER_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <Grid2x2 className="w-4 h-4 text-primary" /> Slide Puzzle
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SLIDE_PUZZLE_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <Grid3x3 className="w-4 h-4 text-primary" /> 2048
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GAME_2048_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <LetterText className="w-4 h-4 text-primary" /> Jumble Words
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {JUMBLE_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <Images className="w-4 h-4 text-primary" /> Odd Images
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ODD_IMAGE_FEATURES.map(({ icon: Icon, label, desc }) => (
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
          <FlaskConical className="w-4 h-4 text-primary" /> Science, Maths &amp; GK Quizzes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUIZ_FEATURES.map(({ icon: Icon, label, desc }) => (
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
        <h2 className="text-base font-semibold text-foreground">Across all games</h2>
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
          same board. Every other game has a shared daily challenge too —
          Memory Match offers daily and weekly challenges, Jigsaw and Word
          Search share a daily puzzle plus friend challenges, Minesweeper,
          Slide Puzzle, 2048, Jumble Words, and Odd Images each have a daily
          board, grid, or word set, and the Science, Maths &amp; GK quizzes
          each post a shared daily quiz. Weekly,
          monthly, and all-time
          leaderboards show recorded game results for players who choose to
          take part.
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
