import { Link } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calculator,
  CalendarCheck,
  FlaskConical,
  Globe,
  Grid2x2,
  Box,
  Grid3x3,
  Images,
  LayoutGrid,
  LetterText,
  ListOrdered,
  Puzzle,
  Rocket,
  Search,
  Bomb,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Snake } from "@/components/snake-icon";
import { usePageMeta } from "@/components/page-meta";
import { RUBIKS_VISIBLE } from "@/lib/rubiks";

type GuideTheme = {
  section: string;
  icon: string;
  card: string;
  btn: string;
};

const THEMES: Record<string, GuideTheme> = {
  common: {
    section: "border-border",
    icon: "text-primary",
    card: "border-border/70 bg-muted/40",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  sudoku: {
    section: "border-primary/30",
    icon: "text-primary",
    card: "border-primary/25 bg-primary/5",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  memory: {
    section: "border-fuchsia-200/70 dark:border-fuchsia-900/50",
    icon: "text-fuchsia-700 dark:text-fuchsia-300",
    card: "border-fuchsia-200/70 bg-fuchsia-50/60 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20",
    btn: "bg-fuchsia-700 text-white hover:bg-fuchsia-800",
  },
  jigsaw: {
    section: "border-amber-200/70 dark:border-amber-900/50",
    icon: "text-amber-700 dark:text-amber-300",
    card: "border-amber-200/70 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20",
    btn: "bg-amber-700 text-white hover:bg-amber-800",
  },
  "word-search": {
    section: "border-indigo-200/70 dark:border-indigo-900/50",
    icon: "text-indigo-700 dark:text-indigo-300",
    card: "border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/20",
    btn: "bg-indigo-700 text-white hover:bg-indigo-800",
  },
  minesweeper: {
    section: "border-emerald-200/70 dark:border-emerald-900/50",
    icon: "text-emerald-700 dark:text-emerald-300",
    card: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    btn: "bg-emerald-700 text-white hover:bg-emerald-800",
  },
  "slide-puzzle": {
    section: "border-sky-200/70 dark:border-sky-900/50",
    icon: "text-sky-700 dark:text-sky-300",
    card: "border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20",
    btn: "bg-sky-700 text-white hover:bg-sky-800",
  },
  "game-2048": {
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
  },
  snake: {
    section: "border-green-200/70 dark:border-green-900/50",
    icon: "text-green-700 dark:text-green-300",
    card: "border-green-200/70 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20",
    btn: "bg-green-700 text-white hover:bg-green-700",
  },
  "odd-images": {
    section: "border-teal-200/70 dark:border-teal-900/50",
    icon: "text-teal-700 dark:text-teal-300",
    card: "border-teal-200/70 bg-teal-50/60 dark:border-teal-900/50 dark:bg-teal-950/20",
    btn: "bg-teal-700 text-white hover:bg-teal-800",
  },
  "memory-order": {
    section: "border-fuchsia-200/70 dark:border-fuchsia-900/50",
    icon: "text-fuchsia-700 dark:text-fuchsia-300",
    card: "border-fuchsia-200/70 bg-fuchsia-50/60 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20",
    btn: "bg-fuchsia-700 text-white hover:bg-fuchsia-800",
  },
  rubiks: {
    section: "border-red-200/70 dark:border-red-900/50",
    icon: "text-red-700 dark:text-red-300",
    card: "border-red-200/70 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20",
    btn: "bg-red-700 text-white hover:bg-red-800",
  },
  "science-quiz": {
    section: "border-violet-200/70 dark:border-violet-900/50",
    icon: "text-violet-700 dark:text-violet-300",
    card: "border-violet-200/70 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20",
    btn: "bg-violet-700 text-white hover:bg-violet-800",
  },
  "maths-quiz": {
    section: "border-orange-200/70 dark:border-orange-900/50",
    icon: "text-orange-700 dark:text-orange-300",
    card: "border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/20",
    btn: "bg-orange-700 text-white hover:bg-orange-800",
  },
  "gk-quiz": {
    section: "border-rose-200/70 dark:border-rose-900/50",
    icon: "text-rose-700 dark:text-rose-300",
    card: "border-rose-200/70 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20",
    btn: "bg-rose-700 text-white hover:bg-rose-800",
  },
};

type GuideLink = { href: string; label: string; primary?: boolean };
type GuideCard = { title: string; detail: string };

function GuideSection({
  id,
  title,
  themeKey,
  icon: Icon,
  intro,
  cards,
  details,
  tips,
  links,
}: {
  id: string;
  title: string;
  themeKey: keyof typeof THEMES;
  icon: LucideIcon;
  intro: string[];
  cards: GuideCard[];
  details: string;
  tips: string;
  links: GuideLink[];
}) {
  const theme = THEMES[themeKey];
  return (
    <section
      aria-labelledby={`${id}-guide-title`}
      className={`space-y-4 rounded-2xl border bg-card p-5 sm:p-6 ${theme.section}`}
    >
      <div className={`flex items-center gap-2 ${theme.icon}`}>
        <Icon className="h-5 w-5" />
        <h2 id={`${id}-guide-title`} className="text-xl font-serif font-bold text-foreground">
          {title}
        </h2>
      </div>
      {intro.map((paragraph, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ title: cardTitle, detail }) => (
          <div key={cardTitle} className={`rounded-xl border p-3 ${theme.card}`}>
            <h3 className="text-sm font-semibold text-foreground">{cardTitle}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{details}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{tips}</p>
      <div className="flex flex-wrap gap-3">
        {links.map(({ href, label, primary }) => (
          <Link
            key={href + label}
            href={href}
            className={
              primary
                ? `rounded-lg px-4 py-2 font-semibold transition-colors ${theme.btn}`
                : "rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted"
            }
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const QUIZ_LEVEL_CARDS: GuideCard[] = [
  { title: "Easy / Medium", detail: "5 questions in 2 minutes or 8 in 3 — friendlier questions and a gentle way to learn each subject." },
  { title: "Hard", detail: "10 questions in 4 minutes rewards confident recall and quick elimination of wrong options." },
  { title: "Expert", detail: "12 questions in 5 minutes — the biggest point base for the sharpest players." },
];

const QUIZ_SCORING =
  "Points combine the level's base score (150 on Easy up to 1,200 on Expert) with your accuracy and a speed bonus for finishing under the par time, so a fast, clean run ranks highest. Every completed quiz also awards XP and gems that grow with the level.";

export default function Guides() {
  usePageMeta({
    title: "Game Guides: All Ten Games | Play Brain Games . Online",
    description:
      "Learn every game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, Memory Order, and Science, Maths & GK quizzes — with practical strategies and tips.",
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
          <a href="#getting-started-guide-title" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Getting started</a>
          <a href="#scoring-rewards-guide-title" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Scoring &amp; rewards</a>
          <a href="#daily-challenges-guide-title" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Daily challenges</a>
          <a href="#sudoku-guide-title" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">Sudoku guide</a>
          <a href="#memory-guide-title" className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">Memory Match guide</a>
          <a href="#jigsaw-guide-title" className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">Jigsaw guide</a>
          <a href="#word-search-guide-title" className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300">Word Search guide</a>
          <a href="#minesweeper-guide-title" className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Minesweeper guide</a>
          <a href="#slide-puzzle-guide-title" className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300">Slide Puzzle guide</a>
          <a href="#game-2048-guide-title" className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-700 dark:text-orange-300">2048 guide</a>
          <a href="#jumble-guide-title" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">Jumble Words guide</a>
          <a href="#snake-guide-title" className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-700 dark:text-green-300">Snake guide</a>
          <a href="#odd-images-guide-title" className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300">Odd Images guide</a>
          <a href="#memory-order-guide-title" className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">Memory Order guide</a>
          {RUBIKS_VISIBLE && (
          <a href="#rubiks-guide-title" className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-300">Rubik's Cube guide</a>
          )}
          <a href="#science-quiz-guide-title" className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300">Science Quiz guide</a>
          <a href="#maths-quiz-guide-title" className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-700 dark:text-orange-300">Maths Quiz guide</a>
          <a href="#gk-quiz-guide-title" className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300">GK Quiz guide</a>
        </nav>
      </header>

      <GuideSection
        id="getting-started"
        title="Getting started guide"
        themeKey="common"
        icon={Rocket}
        intro={[
          "Every game on Play Brain Games . Online can be played instantly as a guest — no account or install needed. Optional Google sign-in creates a profile that syncs your results, statistics, themes, rewards, and streaks across devices.",
          "Your Game Mode — set in your profile — controls which board sizes and difficulty levels each game offers, so the same game can feel completely different for a child and an experienced player.",
        ]}
        cards={[
          { title: "Guest play", detail: "Start any of the fourteen games immediately. Progress is kept in the browser until you sign in." },
          { title: "Kids mode", detail: "Shows only the smaller boards and easier levels — 3×3–6×6 Sudoku, short Memory boards, Easy–Medium Jigsaw, Word Search and Minesweeper, Odd Images and Memory Order Easy–Medium, and Easy–Medium quizzes." },
          { title: "Adult & 4 All", detail: "Adult mode offers the larger boards and harder levels; the default 4 All mode shows every size and level for every game." },
        ]}
        details="A profile adds saved results, personal bests, game statistics, achievements, avatar themes, and daily streaks. Signing in is always optional — guest play keeps working either way, and the app remembers unfinished rounds so you can pick up where you left off."
        tips="Choose Kids mode if younger players will share the device, or 4 All mode if you want the full range of challenges. You can change the mode any time from your profile."
        links={[
          { href: "/", label: "Play a game", primary: true },
          { href: "/profile", label: "Profile & settings" },
          { href: "/about", label: "About the site" },
        ]}
      />

      <GuideSection
        id="scoring-rewards"
        title="Scoring, XP & gems guide"
        themeKey="common"
        icon={Trophy}
        intro={[
          "Every completed game earns points, and most also award XP and gems. Points are what leaderboards rank; XP builds your overall rank; gems are bonus rewards earned alongside them.",
          "Each game calculates points differently, but the pattern is the same everywhere: a base score set by the board or level, adjusted by how you played — faster finishes and fewer mistakes usually mean more points.",
        ]}
        cards={[
          { title: "Points", detail: "Per-game scores ranked on the leaderboards. Speed bonuses reward fast finishes; mistakes, hints, and extra moves reduce the score in most games." },
          { title: "XP", detail: "Earned for completing games at higher difficulties — harder puzzles give more XP and build your overall player rank." },
          { title: "Gems", detail: "Bonus currency awarded with completed games, scaling with the difficulty or board size you chose." },
        ]}
        details="Quizzes score on accuracy plus a speed bonus for beating the level's par time. Puzzle games like Sudoku, Memory, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Memory Order each have their own formula — the expandable 'How points are calculated' guide on the leaderboard page lists every game's exact rules."
        tips="For the best scores, learn each game's penalty rules first — for example, hints reduce points in Jigsaw and Slide Puzzle, and wrong reveals cost you in Minesweeper. Clean, efficient runs always beat frantic ones."
        links={[
          { href: "/leaderboard", label: "View leaderboards", primary: true },
          { href: "/challenges", label: "Friend challenges" },
          { href: "/stats", label: "Your statistics" },
        ]}
      />

      <GuideSection
        id="daily-challenges"
        title="Daily challenges & duels guide"
        themeKey="common"
        icon={CalendarCheck}
        intro={[
          "Every game has a daily challenge: the same puzzle, board, or quiz set is dealt to every player each day, refreshed at 00:00 UTC. It is the fairest way to compare yourself with the whole community.",
          "Leaderboards rank players on weekly, monthly, and all-time boards — per game and across all fourteen games combined. Friend challenges let you send a head-to-head duel to another player on any game.",
        ]}
        cards={[
          { title: "Daily challenges", detail: "One shared puzzle or quiz per game per day — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, Memory Order, and all three quizzes each have their own." },
          { title: "Leaderboards", detail: "Weekly, monthly, and all-time rankings per game plus an all-games board that combines your scores everywhere." },
          { title: "Friend duels", detail: "Challenge another player to the same round on any of the fourteen games — the higher score wins bonus gems." },
        ]}
        details="Daily results feed the daily and all-time leaderboards, and completing challenges in a row builds streaks shown on your profile. Each game's daily challenge page also shows today's leaderboard so you can see how your run compares in real time."
        tips="Make the dailies part of your routine — they refresh at 00:00 UTC, so an evening run counts for that day. You can also challenge friends directly from the Challenges page to settle rivalries on your favourite game."
        links={[
          { href: "/daily-challenge", label: "Today's challenges", primary: true },
          { href: "/leaderboard", label: "Leaderboards" },
          { href: "/challenges", label: "Challenges" },
        ]}
      />

      <GuideSection
        id="sudoku"
        title="Sudoku guide"
        themeKey="sudoku"
        icon={Grid3x3}
        intro={[
          "Sudoku is a logic puzzle built around three repeating constraints: every row, every column, and every box must contain each symbol once. The clues already on the board give you a starting point; the goal is to place the remaining symbols through deduction rather than guessing.",
          "Choose from five grids — 3×3 Baby, 4×4 Mini, 6×6 Dual, 9×9 Classic, and 16×16 Pro — each with four difficulties from Easy to Expert. Your Game Mode controls which grids are offered: Kids mode has the smaller boards, Adult mode the larger ones, and the default 4 All mode has all five. Boards can also use numbers, letters, or themed images.",
        ]}
        cards={[
          { title: "3×3 / 4×4 / 6×6", detail: "Baby, Mini, and Dual grids — fewer symbols to track, ideal for learning the deduction pattern." },
          { title: "9×9 Classic", detail: "The familiar Sudoku format; the best starting point for regular practice at any difficulty." },
          { title: "16×16 Pro", detail: "A larger symbol set and a longer concentration challenge for experienced solvers." },
        ]}
        details="Points start from a base set by grid size and difficulty, then adjust for your finish time — faster solves earn a bonus — while mistakes and hints each reduce the score. Completing a puzzle awards XP by difficulty and gems."
        tips="Scan each row, column, and box for cells where only one symbol fits (a 'naked single'), and look for symbols with only one possible position inside a box (a 'hidden single'). Use candidate notes on harder boards and re-check the constraints before committing — a contradiction usually means a note was missed, not that you should guess. Try the daily challenge to solve the same puzzle as other players."
        links={[
          { href: "/sudoku", label: "Play Sudoku", primary: true },
          { href: "/daily-challenge", label: "Daily challenge" },
          { href: "/leaderboard/sudoku", label: "Leaderboard", },
        ]}
      />

      <GuideSection
        id="memory"
        title="Memory Match guide"
        themeKey="memory"
        icon={Brain}
        intro={[
          "Memory Match is a concentration game. Cards begin face-down, and you reveal two at a time to find matching pairs. A successful match stays visible; a mismatch turns face-down again, so remembering each card's position and appearance is the heart of the game.",
          "Choose a board from Easy (2×4, 4 pairs) up to Expert (8×8, 32 pairs) and a display style — images, numbers, or letters — all using identical matching rules. Your Game Mode controls which board sizes are offered.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "2×4 and 4×4 boards — 4 to 8 pairs, a short warm-up or a first game that teaches the flip-and-remember rhythm." },
          { title: "Hard", detail: "The 8×4 board has 16 pairs — a longer session where a consistent scan order really pays off." },
          { title: "Expert", detail: "The 8×8 board has 32 pairs — a marathon board for players who enjoy holding a full layout in memory." },
        ]}
        details="The score considers board size, completion time, and number of flips — larger boards provide a bigger challenge, while accurate and efficient play improves your result. Completing a board awards XP and gems."
        tips="Build a mental map: when a card is revealed, note its position before flipping the next. Work through the board in a consistent order, and when you remember both locations of a pair, play them together before exploring further. Balance speed with accuracy — extra flips cost more than a moment of thought. Try the daily challenge to match the same shuffled deck as other players."
        links={[
          { href: "/memory", label: "Play Memory Match", primary: true },
          { href: "/memory-challenge", label: "Daily challenge" },
          { href: "/leaderboard/memory", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="jigsaw"
        title="Jigsaw Puzzle guide"
        themeKey="jigsaw"
        icon={Puzzle}
        intro={[
          "Choose an image and a board from Easy (2×2) to Expert (5×5). Your Game Mode controls which sizes are offered: Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four sizes. Smaller boards are a good way to learn how the pieces move; larger boards have more pieces to track. Drag a piece into an empty space or tap two pieces to swap them. Each placement or swap uses a move, so look for pieces that clearly belong before moving several around.",
        ]}
        cards={[
          { title: "Guided", detail: "The full reference picture stays visible beside the board." },
          { title: "Assisted", detail: "Use up to three five-second previews to check the reference." },
          { title: "Challenging", detail: "The reference stays hidden; use piece details and memory to rebuild the image." },
        ]}
        details="Board size and level set the base points; finishing under the target time adds a bonus, while extra moves also lower points. Tips and previews count as assists and reduce the final score. Completing a puzzle awards XP based on level and gems based on board size."
        tips="Place obvious corner and edge pieces first, then use colours and image details to group pieces that belong together. Try the daily challenge to solve the same picture as other players, or create a friend challenge to compare results on a shared puzzle."
        links={[
          { href: "/jigsaw", label: "Play Jigsaw", primary: true },
          { href: "/jigsaw-challenge", label: "Daily challenge" },
          { href: "/leaderboard/jigsaw", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="word-search"
        title="Word Search guide"
        themeKey="word-search"
        icon={Search}
        intro={[
          "Words hide in straight lines inside a letter grid. Choose a difficulty and a word theme, then press on a word's first letter and drag to its last letter to reveal it. Easy (6×6, 6 words) and Medium (8×8, 8 words) hide words only left-to-right and top-to-bottom; Hard (12×12, 10 words) adds diagonals; Expert (14×14, 12 words) also includes backwards words. Your Game Mode controls which levels are offered: Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "Shorter words in straight horizontal and vertical lines — a gentle way to learn the drag mechanic." },
          { title: "Hard", detail: "A larger 12×12 grid adds diagonal words, so scan corner-to-corner as well as across and down." },
          { title: "Expert", detail: "A 14×14 grid also hides backwards words; check the word list and use a hint if a word stays elusive." },
        ]}
        details="Points are based on the difficulty, your completion time, tries, and hints used — you get up to two hints per game. Finishing awards XP by difficulty and gems for every puzzle completed."
        tips="The side panel lists every word you need to find — cross them off as you reveal them. Scan for uncommon letter pairs and long words first, then work outward from words you have already found. Try the daily challenge to solve the same word puzzle as other players, or create a friend challenge to compare results."
        links={[
          { href: "/word-search", label: "Play Word Search", primary: true },
          { href: "/word-search-challenge", label: "Daily challenge" },
          { href: "/leaderboard/word-search", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="minesweeper"
        title="Minesweeper guide"
        themeKey="minesweeper"
        icon={Bomb}
        intro={[
          "Every covered cell may hide a mine. Reveal safe cells and read the numbers — each revealed number counts the mines in its eight surrounding cells. A 1 means exactly one neighbour is mined; a 0 means the whole neighbourhood is safe and reveals automatically. Your Game Mode controls which levels are offered, from a 6×6 Easy board to a 14×14 Expert field.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "Small boards with few mines — learn the number patterns with little pressure." },
          { title: "Hard", detail: "A 12×12 board with 24 mines needs careful chaining of deductions." },
          { title: "Expert", detail: "A 14×14 board with 34 mines rewards systematic flagging and corner-first play." },
        ]}
        details="Points are based on the board difficulty and your completion time, with penalties for hints and wrong reveals — you can afford up to three mistakes per game. Clearing a minefield awards XP by difficulty and gems; only wins score."
        tips="Two rules solve most positions: when a number equals the count of covered neighbours, every covered neighbour is a mine — flag them all; when the flags already satisfy the count, every other neighbour is safe. Switch to flag mode to mark suspects, click a satisfied number to reveal its neighbours in one go, and look for 1-2-1 patterns along walls. Try the daily challenge to clear the same minefield as other players."
        links={[
          { href: "/minesweeper", label: "Play Minesweeper", primary: true },
          { href: "/minesweeper-challenge", label: "Daily challenge" },
          { href: "/leaderboard/minesweeper", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="slide-puzzle"
        title="Slide Puzzle guide"
        themeKey="slide-puzzle"
        icon={Grid2x2}
        intro={[
          "One empty gap lets you slide neighbouring tiles one space at a time until the board reads in order. Choose an Easy (2×2), Medium (3×3), Hard (4×4), or Expert (5×5) board and a tile style — numbers, alphabet letters, or pictures from the icon themes. Changing the style starts a fresh puzzle.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "2×2 and 3×3 boards — few tiles to track, a gentle way to learn the sliding mechanic." },
          { title: "Hard", detail: "The classic 4×4 15-puzzle: plan a few moves ahead and keep the gap near your target row." },
          { title: "Expert", detail: "The 5×5 board has 24 tiles — a marathon, so work systematically row by row and use hints sparingly." },
        ]}
        details="Points reward finishing under the board's par time with few moves, so a planned solve beats frantic sliding; hints reduce the score. Solving a board awards XP by size and gems. Only wins score."
        tips="Build the solution row by row from the top-left: place tile 1, complete the first row, then move to the next. Keep the gap beside the tiles you are working on, and bring a finished row back only when you must — up to three hints are available per game. Try the daily challenge to race the same scramble as other players."
        links={[
          { href: "/slide-puzzle", label: "Play Slide Puzzle", primary: true },
          { href: "/slide-puzzle-challenge", label: "Daily challenge" },
          { href: "/leaderboard/slide-puzzle", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="game-2048"
        title="2048 guide"
        themeKey="game-2048"
        icon={LayoutGrid}
        intro={[
          "2048 is a merge puzzle: every move slides all tiles toward one edge, equal tiles merge into their double, and a new tile spawns after each move. Build the highest tile you can before the board fills up. Choose a board size — Easy (3×3), Medium (4×4), Hard (5×5), or Expert (6×6) — where the target tile grows with the board.",
          "Swipe on touch screens, drag with a mouse, use the arrow pad, or press the arrow keys / WASD on a keyboard. Undo is available a limited number of times per game. Reaching the level target wins the game, but you can keep playing to push your highest tile even further.",
        ]}
        cards={[
          { title: "Easy / Medium · Kids", detail: "3×3 and 4×4 boards — fewer tiles to track, ideal for learning merge patterns and corner strategy." },
          { title: "Hard / Expert · Adult", detail: "5×5 and 6×6 boards are a marathon — they need a clear lane plan and patience to reach the target tile." },
        ]}
        details="Points reward your highest tile combined with speed and move efficiency — big merges and fast finishes earn more. Completing a game awards XP and gems scaled by the board size. Daily challenges give every player the same starting board each day, and friend challenges compare points head-to-head."
        tips="Keep your largest tiles locked in one corner and build a snake pattern along the edges. Never fill your escape lane — always leave at least one row or column open so you can shuffle tiles back into position. On bigger boards, merge small tiles in the middle rows early so they do not crowd your main line. Try the daily challenge to race the same board as other players."
        links={[
          { href: "/game-2048", label: "Play 2048", primary: true },
          { href: "/game-2048-challenge", label: "Daily challenge" },
          { href: "/leaderboard/game-2048", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="jumble"
        title="Jumble Words guide"
        themeKey="jumble"
        icon={LetterText}
        intro={[
          "Jumble Words hides real English words behind shuffled letters. Each round deals a set of jumbled words — tap the letter tiles to build your answer, then press Check. Solve as many as you can before the round ends.",
          "Choose a level — Easy (5 words), Medium (8), Hard (10), or Expert (12). Words get longer and trickier as you climb, and your Game Mode controls which levels are offered. Skipped words can be retried before the round closes.",
        ]}
        cards={[
          { title: "Easy / Medium · Kids", detail: "Short everyday words — great for warming up your anagram eye and building speed." },
          { title: "Hard / Expert · Adult", detail: "Ten to twelve longer words with trickier letter patterns; planning a few letters ahead pays off." },
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
        id="snake"
        title="Snake guide"
        themeKey="snake"
        icon={Snake}
        intro={[
          "Snake is the classic Nokia arcade game reborn in the browser. Steer the snake across the grid to eat apples for as long as you can — every meal makes it longer — and the run only ends when you hit a wall or your own tail.",
          "Choose a level — Easy (12×12), Medium (14×14), Hard (16×16), or Expert (18×18). Levels differ only in grid size and speed; apples are unlimited on every level. Easy and Medium suit Kids mode with slower speeds; Hard and Expert are the fast Adult challenges. Control it with arrow keys or WASD, swipe on touch screens, or use the on-screen pad.",
        ]}
        cards={[
          { title: "Easy / Medium · Kids", detail: "Smaller grids and gentler speeds — learn to plan turns early and leave room for the tail." },
          { title: "Hard / Expert · Adult", detail: "Bigger boards at high speed demand constant awareness; every wasted turn costs score." },
        ]}
        details="Points scale with the level base, food eaten, completion speed, and move efficiency — clean, quick runs earn the most. Completing a round awards XP and gems scaled by level. Daily challenges place the same food sequence for every player each day, and friend challenges compare points head-to-head."
        tips="Never turn into your own neck — check the direction behind you before committing. On Expert, hug open space and avoid boxing yourself in; the tail follows your exact path, so a tight corner early becomes a trap later. Plan two moves ahead at high speed. Try the daily challenge to race the same food trail as other players."
        links={[
          { href: "/snake", label: "Play Snake", primary: true },
          { href: "/snake-challenge", label: "Daily challenge" },
          { href: "/leaderboard/snake", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="odd-images"
        title="Odd Images guide"
        themeKey="odd-images"
        icon={Images}
        intro={[
          "Odd Images is a visual spot-the-difference game. Each question shows one grid filled with repeats of the same picture theme, and exactly one tile does not belong. Tap the odd image before moving to the next grid.",
          "Choose from four levels that grow the grid and question count: Easy (3×3, 5 questions), Medium (4×4, 8), Hard (5×5, 10), and Expert (6×6, 12). Your Game Mode controls which levels are offered — Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "Smaller grids with clearly different or recolored odd tiles — a gentle way to learn the scan pattern." },
          { title: "Hard", detail: "A 5×5 grid with 10 questions uses subtler same-image changes like flips, rotations, and missing features." },
          { title: "Expert", detail: "A 6×6 grid with 12 questions is the biggest board and the sharpest test of attention." },
        ]}
        details="Points start from a base set by level and adjust for correct answers and completion time — faster, cleaner runs earn more. Completing a round awards XP and gems that scale with the level. Daily challenges use the same seed for every player, and friend challenges compare points head-to-head."
        tips="Scan row by row or quadrant by quadrant instead of jumping randomly. The odd tile usually differs by color, orientation, or a missing feature — compare suspicious tiles against their neighbours before tapping. Try the daily Odd Images challenge to play the same seed as other players."
        links={[
          { href: "/odd-images", label: "Play Odd Images", primary: true },
          { href: "/odd-images-challenge", label: "Daily challenge" },
          { href: "/leaderboard/odd-images", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="memory-order"
        title="Memory Order guide"
        themeKey="memory-order"
        icon={ListOrdered}
        intro={[
          "Memory Order is a visual memory game. Images flash one by one in a fixed order for a few seconds — then you tap them back in the exact same order before moving to the next round.",
          "Choose from four levels that grow the sequence and shrink the view time: Easy (4 images, 12s view, 3 rounds), Medium (5 images, 10s, 4), Hard (6 images, 8s, 5), and Expert (8 images, 7s, 6). Your Game Mode controls which levels are offered — Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={[
          { title: "Easy / Medium · Kids", detail: "Shorter sequences with longer view times — build the habit of naming each image as it appears." },
          { title: "Hard / Expert · Adult", detail: "Longer sequences and faster flashes demand chunking — group images into memorable pairs or stories." },
        ]}
        details="Points start from a base set by level and adjust for sequences recalled correctly and completion time — faster, cleaner runs earn more. Completing a round awards XP and gems that scale with the level. Daily challenges use the same seed for every player, and friend challenges compare points head-to-head."
        tips="Don't try to memorise positions — focus on the order itself and create a mental story or rhythm ('star, then heart, then leaf'). On Expert, chunk the sequence into pairs as it plays. If you lose the thread, use a free hint to reveal the next correct tile, or watch an ad for another. Try the daily Memory Order challenge to play the same sequence as other players."
        links={[
          { href: "/memory-order", label: "Play Memory Order", primary: true },
          { href: "/memory-order-challenge", label: "Daily challenge" },
          { href: "/leaderboard/memory-order", label: "Leaderboard" },
        ]}
      />

      {RUBIKS_VISIBLE && (
      <GuideSection
        id="rubiks"
        title="Rubik's Cube guide"
        themeKey="rubiks"
        icon={Box}
        intro={[
          "Rubik's Cube challenges you to restore a scrambled puzzle against the clock. Choose the Pocket Cube (2×2), the classic Rubik's Cube (3×3), the Pyraminx, or the Rubik's Revenge (4×4). Drag on a face to twist a layer, drag the background to rotate the view, or tap a face for a quick turn.",
          "Every solve is timed and counted in moves. Points reward finishing under the puzzle's par time with few moves, and each puzzle awards XP and gems scaled to its difficulty.",
        ]}
        cards={[
          { title: "Pocket Cube (2×2)", detail: "The quickest warm-up — only corners, solved in seconds once you learn the triggers." },
          { title: "Rubik's Cube (3×3)", detail: "The classic 54-sticker puzzle. Learn a beginner method: white cross, corners, then edges." },
          { title: "Pyraminx", detail: "A tetrahedral puzzle — twist the three corner pieces at each vertex back into place." },
          { title: "Rubik's Revenge (4×4)", detail: "The 4×4 has no fixed centres, so pair edges first, then solve it like a 3×3." },
        ]}
        details="Points scale with puzzle size — the 4×4 pays the most — with bonuses for beating par time and penalties for extra moves. XP and gems rise from 2×2 up to 4×4. Only completed solves score."
        tips="Start with the 2×2 to get comfortable with the controls, then move to the 3×3. Rotate the whole cube often so you are never solving blind, and learn one algorithm at a time — the beginner's 'daisy' and 'white cross' steps solve most of a 3×3. Try the daily challenge to race the same scramble as other players, or send a friend a duel from the Challenges page."
        links={[
          { href: "/rubiks", label: "Play Rubik's Cube", primary: true },
          { href: "/leaderboard/rubiks", label: "Leaderboard" },
        ]}
      />
      )}

      <GuideSection
        id="science-quiz"
        title="Science Quiz guide"
        themeKey="science-quiz"
        icon={FlaskConical}
        intro={[
          "Science Quiz tests planets, elements, animal facts, the human body, and everyday phenomena across four timed levels. Each question offers four options; answer before the timer runs out for the best score.",
          "Easy asks 5 questions in 2 minutes, Medium 8 in 3, Hard 10 in 4, and Expert 12 in 5. Your Game Mode controls which levels are offered — Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={QUIZ_LEVEL_CARDS}
        details={QUIZ_SCORING}
        tips="Eliminate obviously wrong options quickly, and make an educated guess rather than leaving questions blank — there is no penalty for a wrong answer beyond losing the points. Watch the units in questions (km vs miles, °C vs °F) and remember that everyday science questions often have a 'most common' answer. Try the daily Science quiz to compare your score with other players."
        links={[
          { href: "/quiz/science", label: "Play Science Quiz", primary: true },
          { href: "/quiz-challenge/science", label: "Daily challenge" },
          { href: "/leaderboard/science-quiz", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="maths-quiz"
        title="Maths Quiz guide"
        themeKey="maths-quiz"
        icon={Calculator}
        intro={[
          "Maths Quiz covers arithmetic, fractions, percentages, algebra, geometry, and number patterns across four timed levels. Each question offers four options; answer before the timer runs out for the best score.",
          "Easy asks 5 questions in 2 minutes, Medium 8 in 3, Hard 10 in 4, and Expert 12 in 5. Your Game Mode controls which levels are offered — Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={QUIZ_LEVEL_CARDS}
        details={QUIZ_SCORING}
        tips="Estimate before you calculate — many options are close enough that a rough mental check eliminates two answers instantly. Watch for unit conversions and 'which is largest/smallest' wording. On Expert, write the working in your head step by step instead of rushing. Try the daily Maths quiz to compare your score with other players."
        links={[
          { href: "/quiz/maths", label: "Play Maths Quiz", primary: true },
          { href: "/quiz-challenge/maths", label: "Daily challenge" },
          { href: "/leaderboard/maths-quiz", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="gk-quiz"
        title="GK Quiz guide"
        themeKey="gk-quiz"
        icon={Globe}
        intro={[
          "GK Quiz covers capitals, currencies, history, awards, sports, and world records across four timed levels. Each question offers four options; answer before the timer runs out for the best score.",
          "Easy asks 5 questions in 2 minutes, Medium 8 in 3, Hard 10 in 4, and Expert 12 in 5. Your Game Mode controls which levels are offered — Kids mode has Easy and Medium, Adult mode has Hard and Expert, and the default 4 All mode has all four.",
        ]}
        cards={QUIZ_LEVEL_CARDS}
        details={QUIZ_SCORING}
        tips="General knowledge questions reward broad recall: learn capitals with their countries and currencies together, and remember 'firsts' (first person, first country) as a category. Eliminate options that are geographically or historically implausible before guessing. Try the daily GK quiz to compare your score with other players."
        links={[
          { href: "/quiz/gk", label: "Play GK Quiz", primary: true },
          { href: "/quiz-challenge/gk", label: "Daily challenge" },
          { href: "/leaderboard/gk-quiz", label: "Leaderboard" },
        ]}
      />

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
          <Link href="/sudoku" className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Play Sudoku</Link>
          <Link href="/memory" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Memory Match</Link>
          <Link href="/jigsaw" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Jigsaw</Link>
          <Link href="/word-search" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Word Search</Link>
          <Link href="/minesweeper" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Minesweeper</Link>
          <Link href="/slide-puzzle" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Slide Puzzle</Link>
          <Link href="/odd-images" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Odd Images</Link>
          <Link href="/memory-order" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Memory Order</Link>
          <Link href="/quiz/science" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Science Quiz</Link>
          <Link href="/quiz/maths" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play Maths Quiz</Link>
          <Link href="/quiz/gk" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">Play GK Quiz</Link>
          <Link href="/about/" className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted">About the site</Link>
        </div>
      </section>
    </div>
  );
}
