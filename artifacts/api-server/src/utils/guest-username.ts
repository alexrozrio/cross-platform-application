const ADJECTIVES = [
  "Strong",
  "Brilliant",
  "Amazing",
  "Brave",
  "Mighty",
  "Clever",
  "Fearless",
  "Curious",
  "Radiant",
  "Swift",
  "Noble",
  "Bold",
  "Legendary",
  "Cosmic",
];

const NOUNS = [
  "Brain",
  "Hero",
  "Falcon",
  "Owl",
  "Phoenix",
  "Tiger",
  "Wizard",
  "Comet",
  "Eagle",
  "Champion",
  "Genius",
  "Panda",
  "Lion",
  "Ranger",
];

const SUFFIX_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SUFFIX_LENGTH = 5;

export function generateGuestUsername(random: () => number = Math.random): string {
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(random() * items.length)];

  const adjective = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const suffix = Array.from({ length: SUFFIX_LENGTH }, () =>
    SUFFIX_CHARACTERS[Math.floor(random() * SUFFIX_CHARACTERS.length)]
  ).join("");

  return `${adjective}${noun}${suffix}`;
}