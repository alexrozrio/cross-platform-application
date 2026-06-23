export interface CompletionMessage {
  headline: string;
  emoji: string;
}

// Tiered pools — edit freely. Each tier shows for the matching difficulty.
// "elite" also fires for any 16×16 puzzle regardless of difficulty setting.

const WARM: CompletionMessage[] = [
  { headline: "Nice one!", emoji: "😊" },
  { headline: "Well done!", emoji: "👍" },
  { headline: "Good job!", emoji: "🌟" },
  { headline: "Smooth solve!", emoji: "✅" },
  { headline: "Nailed it!", emoji: "🎯" },
  { headline: "Lovely work!", emoji: "🌸" },
  { headline: "Off to a great start!", emoji: "🚀" },
];

const UPBEAT: CompletionMessage[] = [
  { headline: "Bravo!", emoji: "👏" },
  { headline: "Brilliant!", emoji: "✨" },
  { headline: "Stellar!", emoji: "⭐" },
  { headline: "Sharp as ever!", emoji: "🔪" },
  { headline: "You nailed it!", emoji: "🎯" },
  { headline: "Impressive!", emoji: "😎" },
  { headline: "On a roll!", emoji: "🎳" },
  { headline: "Crisp!", emoji: "💫" },
];

const HYPED: CompletionMessage[] = [
  { headline: "You crushed it!", emoji: "💪" },
  { headline: "You're on fire!", emoji: "🔥" },
  { headline: "Phenomenal!", emoji: "🚀" },
  { headline: "Masterclass!", emoji: "🎓" },
  { headline: "What a solve!", emoji: "🙌" },
  { headline: "Unstoppable!", emoji: "🏅" },
  { headline: "Mind-blowing!", emoji: "🤯" },
  { headline: "You slayed it!", emoji: "⚡" },
  { headline: "Outstanding!", emoji: "🌟" },
];

const ELITE: CompletionMessage[] = [
  { headline: "Legendary!", emoji: "🦁" },
  { headline: "Absolutely elite!", emoji: "👑" },
  { headline: "Iconic!", emoji: "🏆" },
  { headline: "Flawless!", emoji: "💎" },
  { headline: "Pure class!", emoji: "🎩" },
  { headline: "You're a genius!", emoji: "🧠" },
  { headline: "Perfection!", emoji: "🎉" },
  { headline: "Hall of fame stuff!", emoji: "🏛️" },
  { headline: "A masterpiece!", emoji: "🖼️" },
  { headline: "Unreal!", emoji: "🛸" },
];

type Difficulty = "easy" | "medium" | "hard" | "expert" | string;

function pickFrom(pool: CompletionMessage[]): CompletionMessage {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickCompletionMessage(
  difficulty?: Difficulty,
  gridSize?: number,
): CompletionMessage {
  if (gridSize === 16 || difficulty === "expert") return pickFrom(ELITE);
  if (difficulty === "hard") return pickFrom(HYPED);
  if (difficulty === "medium") return pickFrom(UPBEAT);
  return pickFrom(WARM);
}
