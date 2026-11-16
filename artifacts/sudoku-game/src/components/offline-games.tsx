import React from "react";
import { Button } from "@/components/ui/button";
import { quizBank, pickQuestions, type QuizSubject, type QuizQuestion } from "@workspace/api-zod/quiz";

const BANNER =
  "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 text-center";

function OfflineBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={BANNER}>
      <p className="font-bold text-amber-900 dark:text-amber-200">{title}</p>
      <p className="text-xs text-amber-800/80 dark:text-amber-300/80">{children}</p>
    </div>
  );
}

/* ---------------- Jigsaw: swap tiles to rebuild the picture ---------------- */

const JIGSAW_SIZE = 3;
const JIGSAW_BOARD = 300;
const JIGSAW_TILE = JIGSAW_BOARD / JIGSAW_SIZE;
const JIGSAW_PICTURE = "🌇";

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function OfflineJigsawFallback() {
  const total = JIGSAW_SIZE * JIGSAW_SIZE;
  const [tiles, setTiles] = React.useState<number[]>(() => {
    const ids = Array.from({ length: total }, (_, i) => i);
    const s = shuffled(ids);
    return s.every((v, i) => v === i) ? [...s.slice(1), s[0]] : s;
  });
  const [selected, setSelected] = React.useState<number | null>(null);
  const [moves, setMoves] = React.useState(0);

  const solved = tiles.every((tile, i) => tile === i);

  const clickTile = (pos: number) => {
    if (solved) return;
    if (selected === null) {
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }
    const next = [...tiles];
    [next[selected], next[pos]] = [next[pos], next[selected]];
    setTiles(next);
    setMoves((m) => m + 1);
    setSelected(null);
  };

  const restart = () => {
    const ids = Array.from({ length: total }, (_, i) => i);
    setTiles(shuffled(ids));
    setSelected(null);
    setMoves(0);
  };

  return (
    <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-6 space-y-4">
      <OfflineBanner title="Offline Jigsaw">
        Tap two tiles to swap them and rebuild the picture. {moves} moves.
      </OfflineBanner>
      <div
        className="grid mx-auto rounded-lg overflow-hidden border-2 border-foreground"
        style={{ gridTemplateColumns: `repeat(${JIGSAW_SIZE}, 1fr)`, width: JIGSAW_BOARD, height: JIGSAW_BOARD }}
      >
        {tiles.map((tile, pos) => {
          const row = Math.floor(tile / JIGSAW_SIZE);
          const col = tile % JIGSAW_SIZE;
          return (
            <button
              key={pos}
              type="button"
              onClick={() => clickTile(pos)}
              aria-label={`Tile ${tile + 1}`}
              className={[
                "relative overflow-hidden bg-sky-100 dark:bg-sky-950",
                selected === pos ? "ring-2 ring-inset ring-primary" : "hover:brightness-95",
              ].join(" ")}
              style={{ width: JIGSAW_TILE, height: JIGSAW_TILE }}
            >
              <span
                className="absolute block"
                style={{
                  width: JIGSAW_BOARD,
                  height: JIGSAW_BOARD,
                  left: -col * JIGSAW_TILE,
                  top: -row * JIGSAW_TILE,
                  fontSize: JIGSAW_BOARD,
                  lineHeight: `${JIGSAW_BOARD}px`,
                  textAlign: "center",
                }}
              >
                {JIGSAW_PICTURE}
              </span>
            </button>
          );
        })}
      </div>
      {solved && <p className="text-center font-bold text-emerald-600 dark:text-emerald-400">Picture complete in {moves} moves!</p>}
      <div className="text-center">
        <Button variant="outline" size="sm" onClick={restart}>New puzzle</Button>
      </div>
    </div>
  );
}

/* ---------------- Word search: click letters to spell the words ---------------- */

const WS_WORDS = ["PLANET", "OCEAN", "FOREST", "COMPUTER", "GUITAR", "ORANGE", "DINOSAUR", "LIBRARY"];
const WS_SIZE = 10;
const WS_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface WsCell { r: number; c: number }

export function OfflineWordSearchFallback() {
  // Simplified playable version: letters grid + word list; click a word chip
  // then click cells along a straight line to claim it.
  const [words] = React.useState(() => shuffled(WS_WORDS).slice(0, 6));
  const [found, setFound] = React.useState<Set<string>>(new Set());
  const [grid] = React.useState<string[][]>(() => {
    const g: string[][] = Array.from({ length: WS_SIZE }, () =>
      Array.from({ length: WS_SIZE }, () => WS_LETTERS[Math.floor(Math.random() * WS_LETTERS.length)]),
    );
    // Plant each word in a random straight line where it fits.
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const word of words) {
      for (let attempt = 0; attempt < 300; attempt++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r = Math.floor(Math.random() * WS_SIZE);
        const c = Math.floor(Math.random() * WS_SIZE);
        const er = r + dr * (word.length - 1);
        const ec = c + dc * (word.length - 1);
        if (er < 0 || er >= WS_SIZE || ec < 0 || ec >= WS_SIZE) continue;
        for (let i = 0; i < word.length; i++) g[r + dr * i][c + dc * i] = word[i];
        break;
      }
    }
    return g;
  });
  const [selected, setSelected] = React.useState<WsCell | null>(null);
  const [pending, setPending] = React.useState<string | null>(null);

  const isCollinear = (a: WsCell, b: WsCell) => {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    if (dr === 0 && dc === 0) return false;
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
    const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const word = pending!;
    if (len !== word.length) return false;
    const stepR = dr === 0 ? 0 : Math.sign(dr);
    const stepC = dc === 0 ? 0 : Math.sign(dc);
    for (let i = 0; i < word.length; i++) {
      if (grid[a.r + stepR * i][a.c + stepC * i] !== word[i]) return false;
    }
    return true;
  };

  const clickCell = (cell: WsCell) => {
    if (pending === null) {
      setSelected(cell);
      return;
    }
    if (selected && isCollinear(selected, cell)) {
      setFound((s) => new Set(s).add(pending));
    }
    setPending(null);
    setSelected(null);
  };

  const clickWord = (word: string) => {
    if (found.has(word)) return;
    setPending(pending === word ? null : word);
    setSelected(null);
  };

  const done = found.size === words.length;

  return (
    <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-6 space-y-4">
      <OfflineBanner title="Offline Word Search">
        Pick a word below, then tap its first and last letter in the grid.
      </OfflineBanner>
      <div className="flex flex-wrap justify-center gap-2">
        {words.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => clickWord(w)}
            className={[
              "rounded-full border px-3 py-1 text-sm font-semibold",
              found.has(w)
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 line-through"
                : pending === w
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card",
            ].join(" ")}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="grid mx-auto gap-px bg-border rounded-lg overflow-hidden border" style={{ gridTemplateColumns: `repeat(${WS_SIZE}, 1fr)`, maxWidth: 360 }}>
        {grid.map((row, r) =>
          row.map((ch, c) => {
            const cell = { r, c };
            const isSel = selected?.r === r && selected?.c === c;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => clickCell(cell)}
                className={[
                  "aspect-square bg-card text-sm font-bold flex items-center justify-center",
                  isSel ? "bg-primary/20 text-primary" : "hover:bg-muted",
                ].join(" ")}
              >
                {ch}
              </button>
            );
          }),
        )}
      </div>
      {done && <p className="text-center font-bold text-emerald-600 dark:text-emerald-400">All words found!</p>}
    </div>
  );
}

/* ---------------- Minesweeper ---------------- */

const MS_SIZE = 9;
const MS_MINES = 10;

type MsCell = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };

function buildMinesweeper(): MsCell[] {
  const cells: MsCell[] = Array.from({ length: MS_SIZE * MS_SIZE }, () => ({
    mine: false, revealed: false, flagged: false, adjacent: 0,
  }));
  const mineIdx = new Set<number>();
  while (mineIdx.size < MS_MINES) mineIdx.add(Math.floor(Math.random() * cells.length));
  mineIdx.forEach((i) => (cells[i].mine = true));
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / MS_SIZE);
    const c = i % MS_SIZE;
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= MS_SIZE || cc < 0 || cc >= MS_SIZE) continue;
        if (cells[rr * MS_SIZE + cc].mine) n++;
      }
    }
    cells[i].adjacent = n;
  }
  return cells;
}

const MS_COLORS = ["", "text-blue-600", "text-emerald-600", "text-red-600", "text-violet-600", "text-amber-700", "text-cyan-600", "text-foreground", "text-foreground"];

export function OfflineMinesweeperFallback() {
  const [cells, setCells] = React.useState<MsCell[]>(buildMinesweeper);
  const [flagMode, setFlagMode] = React.useState(false);
  const [lost, setLost] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const reveal = (idx: number, board: MsCell[] = cells, first = false) => {
    if (lost) return;
    const cell = board[idx];
    if (cell.flagged || cell.revealed) return;
    if (first && cell.mine) {
      // Move the mine to a safe cell on first click.
      const safe = board.findIndex((c2) => !c2.mine);
      board[safe].mine = true;
      board[idx].mine = false;
      board.forEach((c2, i2) => {
        const r = Math.floor(i2 / MS_SIZE);
        const c = i2 % MS_SIZE;
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= MS_SIZE || cc < 0 || cc >= MS_SIZE) continue;
          if (board[rr * MS_SIZE + cc].mine) n++;
        }
        c2.adjacent = n;
      });
    }
    const next = board.map((c2) => ({ ...c2 }));
    const stack = [idx];
    while (stack.length) {
      const i = stack.pop()!;
      const cl = next[i];
      if (cl.revealed || cl.flagged) continue;
      cl.revealed = true;
      if (cl.mine) {
        setLost(true);
        next.forEach((c2) => { if (c2.mine) c2.revealed = true; });
        break;
      }
      if (cl.adjacent === 0) {
        const r = Math.floor(i / MS_SIZE);
        const c = i % MS_SIZE;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= MS_SIZE || cc < 0 || cc >= MS_SIZE) continue;
          const ni = rr * MS_SIZE + cc;
          if (!next[ni].revealed && !next[ni].flagged) stack.push(ni);
        }
      }
    }
    setCells(next);
    setStarted(true);
  };

  const clickCell = (idx: number) => {
    if (flagMode) {
      if (cells[idx].revealed || lost) return;
      setCells((prev) => prev.map((c2, i) => (i === idx ? { ...c2, flagged: !c2.flagged } : c2)));
      return;
    }
    reveal(idx, cells, !started);
  };

  const won = started && !lost && cells.every((c2) => c2.revealed || c2.mine);
  const restart = () => {
    setCells(buildMinesweeper());
    setLost(false);
    setStarted(false);
  };

  return (
    <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-6 space-y-4">
      <OfflineBanner title="Offline Minesweeper">
        {lost ? "Boom! A mine was hit." : won ? "Field cleared — you win!" : "Left-click to reveal, or switch to flag mode."}
      </OfflineBanner>
      <div className="flex items-center justify-center gap-3">
        <Button variant={flagMode ? "default" : "outline"} size="sm" onClick={() => setFlagMode((f) => !f)}>
          🚩 Flag mode
        </Button>
        <Button variant="outline" size="sm" onClick={restart}>New game</Button>
      </div>
      <div className="grid mx-auto gap-px bg-border rounded-lg overflow-hidden border" style={{ gridTemplateColumns: `repeat(${MS_SIZE}, 1fr)`, maxWidth: 360 }}>
        {cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={() => clickCell(i)}
            className={[
              "aspect-square text-sm font-bold flex items-center justify-center",
              cell.revealed ? "bg-muted" : "bg-card hover:bg-muted",
            ].join(" ")}
          >
            {cell.flagged && !cell.revealed ? "🚩" : cell.revealed ? (cell.mine ? "💣" : cell.adjacent > 0 ? <span className={MS_COLORS[cell.adjacent]}>{cell.adjacent}</span> : "") : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Slide puzzle: 3x3 ---------------- */

const SLIDE_SIZE = 3;

function solvableShuffle(): number[] {
  const tiles = Array.from({ length: SLIDE_SIZE * SLIDE_SIZE }, (_, i) => i + 1);
  tiles.push(0);
  let arr = [...tiles];
  do {
    arr = shuffled(arr);
  } while (arr.every((v, i) => v === tiles[i]));
  return arr;
}

export function OfflineSlidePuzzleFallback() {
  const [tiles, setTiles] = React.useState<number[]>(solvableShuffle);
  const [moves, setMoves] = React.useState(0);
  const solved = tiles.every((v, i) => v === (i + 1) % (SLIDE_SIZE * SLIDE_SIZE + 1) || (i === SLIDE_SIZE * SLIDE_SIZE - 1 && v === 0));

  const click = (pos: number) => {
    const blank = tiles.indexOf(0);
    const br = Math.floor(blank / SLIDE_SIZE);
    const bc = blank % SLIDE_SIZE;
    const r = Math.floor(pos / SLIDE_SIZE);
    const c = pos % SLIDE_SIZE;
    if (Math.abs(br - r) + Math.abs(bc - c) !== 1) return;
    const next = [...tiles];
    [next[blank], next[pos]] = [next[pos], next[blank]];
    setTiles(next);
    setMoves((m) => m + 1);
  };

  const restart = () => {
    setTiles(solvableShuffle());
    setMoves(0);
  };

  return (
    <div className="min-h-[70vh] w-full max-w-sm mx-auto px-4 py-6 space-y-4">
      <OfflineBanner title="Offline Slide Puzzle">
        Slide tiles into order 1–{SLIDE_SIZE * SLIDE_SIZE - 1}. {moves} moves.
      </OfflineBanner>
      <div className="grid grid-cols-3 gap-2 mx-auto" style={{ maxWidth: 320 }}>
        {tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            onClick={() => click(i)}
            disabled={tile === 0}
            className={[
              "aspect-square rounded-lg border-2 text-2xl font-bold",
              tile === 0
                ? "border-transparent bg-muted"
                : "border-border bg-card hover:border-primary/60",
              tile === i + 1 ? "text-primary" : "text-foreground",
            ].join(" ")}
          >
            {tile === 0 ? "" : tile}
          </button>
        ))}
      </div>
      {solved && <p className="text-center font-bold text-emerald-600 dark:text-emerald-400">Solved in {moves} moves!</p>}
      <div className="text-center">
        <Button variant="outline" size="sm" onClick={restart}>New game</Button>
      </div>
    </div>
  );
}

/* ---------------- Quiz fallbacks (real question banks) ---------------- */

const QUIZ_SUBJECT_META: Record<QuizSubject, { title: string; emoji: string; blurb: string }> = {
  science: { title: "Offline Science Quiz", emoji: "🔬", blurb: "5 quick science questions — no account needed." },
  maths: { title: "Offline Maths Quiz", emoji: "🔢", blurb: "5 quick maths questions — no account needed." },
  gk: { title: "Offline GK Quiz", emoji: "🌍", blurb: "5 quick general-knowledge questions — no account needed." },
};

function OfflineQuizFallback({ subject }: { subject: QuizSubject }) {
  const meta = QUIZ_SUBJECT_META[subject];
  const [questions, setQuestions] = React.useState<QuizQuestion[]>(() =>
    pickQuestions(quizBank(subject, "easy"), 5, Math.floor(Math.random() * 1e9)),
  );
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const q = questions[index];

  const pick = (optIdx: number) => {
    if (picked !== null || !q) return;
    setPicked(optIdx);
    if (optIdx === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setQuestions(pickQuestions(quizBank(subject, "easy"), 5, Math.floor(Math.random() * 1e9)));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-8 space-y-5">
        <OfflineBanner title={meta.title}>
          You scored {score} out of {questions.length}. Local game — no rewards saved.
        </OfflineBanner>
        <Button className="w-full" onClick={restart}>Play again</Button>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <OfflineBanner title={meta.title}>No questions available for this subject.</OfflineBanner>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-6 space-y-4">
      <OfflineBanner title={`${meta.emoji} ${meta.title}`}>
        {meta.blurb} Question {index + 1} of {questions.length}.
      </OfflineBanner>
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <p className="font-semibold text-base">{q.text}</p>
        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const isCorrect = picked !== null && i === q.answer;
            const isWrongPick = picked === i && i !== q.answer;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={[
                  "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  isCorrect
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : isWrongPick
                      ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      : "border-border bg-card hover:border-primary/50",
                  picked !== null && !isCorrect && !isWrongPick ? "opacity-60" : "",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <Button className="w-full" onClick={next}>
            {index + 1 >= questions.length ? "See score" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Dispatcher ---------------- */

export function OfflineGameFallback({ game }: { game: string }) {
  switch (game) {
    case "jigsaw":
      return <OfflineJigsawFallback />;
    case "word-search":
      return <OfflineWordSearchFallback />;
    case "minesweeper":
      return <OfflineMinesweeperFallback />;
    case "slide-puzzle":
      return <OfflineSlidePuzzleFallback />;
    case "science-quiz":
    case "maths-quiz":
    case "gk-quiz":
      return <OfflineQuizFallback subject={game.replace("-quiz", "") as QuizSubject} />;
    default:
      return null;
  }
}

export const OFFLINE_GAME_IDS = [
  "jigsaw",
  "word-search",
  "minesweeper",
  "slide-puzzle",
  "science-quiz",
  "maths-quiz",
  "gk-quiz",
] as const;
