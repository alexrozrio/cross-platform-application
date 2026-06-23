export const COMPLETION_MESSAGES = [
  { headline: "Bravo!", emoji: "👏" },
  { headline: "You're on fire!", emoji: "🔥" },
  { headline: "You nailed it!", emoji: "🎯" },
  { headline: "Brilliant!", emoji: "✨" },
  { headline: "Stellar!", emoji: "⭐" },
  { headline: "You crushed it!", emoji: "💪" },
  { headline: "Iconic!", emoji: "🏆" },
  { headline: "Masterclass!", emoji: "🎓" },
  { headline: "Phenomenal!", emoji: "🚀" },
  { headline: "You slayed it!", emoji: "⚡" },
  { headline: "Absolutely elite!", emoji: "👑" },
  { headline: "Mind-blowing!", emoji: "🤯" },
  { headline: "Flawless!", emoji: "💎" },
  { headline: "Unstoppable!", emoji: "🏅" },
  { headline: "Legendary!", emoji: "🦁" },
  { headline: "Outstanding!", emoji: "🌟" },
  { headline: "You're a genius!", emoji: "🧠" },
  { headline: "Perfection!", emoji: "🎉" },
  { headline: "What a solve!", emoji: "🙌" },
  { headline: "Pure class!", emoji: "🎩" },
];

export function pickCompletionMessage(): (typeof COMPLETION_MESSAGES)[number] {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
}
