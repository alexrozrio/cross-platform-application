import { IMAGE_THEMES } from "@/lib/themes";

export type WordSearchDifficulty = "beginner" | "easy" | "medium" | "hard";
type BaseWordSearchTheme = "animals" | "food" | "ocean" | "nature" | "space" | "sports" | "weather" | "music" | "travel" | "school";
export type WordSearchTheme = BaseWordSearchTheme | `icon-${string}`;

export interface WordSearchThemeOption {
  id: WordSearchTheme;
  label: string;
  emoji: string;
}

const BASE_THEMES: WordSearchThemeOption[] = [
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "food", label: "Food", emoji: "🍎" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "weather", label: "Weather", emoji: "🌦️" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "travel", label: "Travel", emoji: "🧳" },
  { id: "school", label: "School", emoji: "📚" },
];

export const WORD_SEARCH_THEMES: WordSearchThemeOption[] = [
  ...BASE_THEMES,
  ...IMAGE_THEMES.map((theme) => ({
    id: `icon-${theme.id}` as WordSearchTheme,
    label: `${theme.name} Icons`,
    emoji: theme.preview,
  })),
];

export const WORD_SEARCH_LEVELS: Record<WordSearchDifficulty, { label: string; size: number; wordCount: number; mode: "baby" | "adult" }> = {
  beginner: { label: "Beginner", size: 6, wordCount: 6, mode: "baby" },
  easy: { label: "Easy", size: 8, wordCount: 8, mode: "baby" },
  medium: { label: "Medium", size: 12, wordCount: 10, mode: "adult" },
  hard: { label: "Hard", size: 14, wordCount: 12, mode: "adult" },
};

export interface WordSearchPuzzle {
  grid: string[][];
  words: string[];
  placements: Record<string, number[]>;
}

type ThemeWordBank = Record<WordSearchDifficulty, string[]>;

const WORD_BANKS: Record<BaseWordSearchTheme, ThemeWordBank> = {
  animals: {
    beginner: ["CAT", "DOG", "PIG", "COW", "HEN", "FOX"],
    easy: ["TIGER", "MONKEY", "RABBIT", "HORSE", "PANDA", "ZEBRA", "KOALA", "LLAMA"],
    medium: ["DOLPHIN", "ELEPHANT", "GIRAFFE", "PENGUIN", "TURTLE", "RACCOON", "BADGER", "HAMSTER", "LEOPARD", "BUFFALO"],
    hard: ["BUTTERFLY", "CROCODILE", "KANGAROO", "CHAMELEON", "SQUIRREL", "FLAMINGO", "HEDGEHOG", "PORCUPINE", "HIPPOPOTAMUS", "RHINOCEROS", "WOODPECKER", "ANTELOPE"],
  },
  food: {
    beginner: ["PIE", "JAM", "EGG", "TEA", "RICE", "PEAR"],
    easy: ["APPLE", "BREAD", "PASTA", "MELON", "PEACH", "GRAPE", "ONION", "LEMON"],
    medium: ["PANCAKE", "WAFFLES", "AVOCADO", "CABBAGE", "PRETZEL", "MUFFINS", "CHERRIES", "NOODLES", "OATMEAL", "POPCORN"],
    hard: ["WATERMELON", "SPAGHETTI", "SANDWICH", "BLUEBERRY", "PINEAPPLE", "STRAWBERRY", "CAULIFLOWER", "CHOCOLATE", "POMEGRANATE", "CROISSANT", "MUSHROOMS", "CANTALOUPE"],
  },
  ocean: {
    beginner: ["SEA", "FIN", "OAR", "CRAB", "FISH", "WAVE"],
    easy: ["SHARK", "WHALE", "CORAL", "SHELL", "SQUID", "DIVER", "REEFS", "TIDAL"],
    medium: ["OCTOPUS", "SEAGULL", "DOLPHIN", "SEASIDE", "STARFISH", "SEAWEED", "LOBSTER", "ANCHORS", "SEASHELL", "MANATEE"],
    hard: ["JELLYFISH", "SEAHORSE", "BARRACUDA", "BLUEWHALE", "TURTLEBAY", "CORALREEF", "WATERLILY", "SWORD FISH".replace(" ", ""), "STINGRAY", "MARLIN", "PUFFERFISH", "ANEMONES"],
  },
  nature: {
    beginner: ["SUN", "SKY", "LEAF", "TREE", "RAIN", "SEED"],
    easy: ["FLOWER", "FOREST", "GARDEN", "BREEZE", "CLOUDS", "MOSS", "RIVER", "STONE"],
    medium: ["MOUNTAIN", "WATERFALL", "SUNSHINE", "WILDFLOWER", "MEADOWS", "PINECONE", "RAINBOW", "EVERGREEN", "BLOSSOMS", "THUNDER"],
    hard: ["WATERFALLS", "WILDERNESS", "MOUNTAINTOP", "HURRICANE", "EARTHQUAKE", "WILDFLOWERS", "RAINFOREST", "SUNFLOWERS", "BUTTERFLIES", "LANDSCAPE", "SNOWFLAKES", "CASCADING"],
  },
  space: {
    beginner: ["SUN", "MOON", "STAR", "MARS", "EARTH", "COMET"],
    easy: ["PLANET", "ROCKET", "ORBIT", "VENUS", "SATURN", "METEOR", "NEBULA", "COSMOS"],
    medium: ["ASTEROID", "GALAXIES", "ECLIPSE", "JUPITER", "MERCURY", "ASTRONAUT", "TELESCOPE", "SPACESHIP", "UNIVERSE", "STARSHIP"],
    hard: ["CONSTELLATION", "ANDROMEDA", "SUPERNOVA", "SPACEWALK", "ASTRONOMER", "SATELLITES", "EXOPLANET", "BLACKHOLE", "MILKYWAY", "GRAVITY", "LIGHTYEARS", "MOONLIGHT"],
  },
  sports: {
    beginner: ["RUN", "WIN", "GOAL", "BALL", "TEAM", "RACE"],
    easy: ["SOCCER", "TENNIS", "HOCKEY", "SKATER", "RUGBY", "BOXING", "GOLF", "RACING"],
    medium: ["BASEBALL", "BASKETBALL", "VOLLEYBALL", "SWIMMING", "CYCLING", "BADMINTON", "MARATHON", "FOOTBALL", "GYMNAST", "SKATEBOARD"],
    hard: ["CHAMPIONSHIP", "SNOWBOARDING", "FIGURESKATING", "WEIGHTLIFTING", "MOUNTAINBIKE", "TABLETENNIS", "CROSSCOUNTRY", "WATERPOLO", "ARCHERY", "FENCING", "PENTATHLON", "SURFBOARD"],
  },
  weather: {
    beginner: ["SUN", "RAIN", "WIND", "SNOW", "FOG", "HAIL"],
    easy: ["STORM", "CLOUDS", "BREEZE", "FROST", "SUNNY", "FLOOD", "THAWING", "RAINBOW"],
    medium: ["THUNDER", "LIGHTNING", "TORNADO", "HURRICANE", "DRIZZLE", "BLIZZARD", "OVERCAST", "DROUGHT", "MONSOON", "DOWNPOUR"],
    hard: ["THUNDERSTORM", "SNOWFLURRIES", "TEMPERATURE", "BAROMETER", "HAILSTONES", "WINDCHILLS", "CUMULONIMBUS", "PRECIPITATION", "ATMOSPHERE", "WINDSTORMS", "CLOUDCOVER", "RAINSHOWERS"],
  },
  music: {
    beginner: ["SONG", "BEAT", "DRUM", "NOTE", "BAND", "SING"],
    easy: ["PIANO", "GUITAR", "FLUTE", "VIOLIN", "SINGER", "RHYTHM", "CHORUS", "MELODY"],
    medium: ["INSTRUMENT", "HARMONY", "TRUMPET", "SAXOPHONE", "KEYBOARD", "ORCHESTRA", "CONCERTO", "MARACAS", "SYMPHONY", "RECORDING"],
    hard: ["PERCUSSION", "CONDUCTOR", "WOODWIND", "COMPOSITION", "AMPLIFIER", "TROMBONE", "ACCORDION", "SOUNDTRACK", "WOODBLOCKS", "COUNTERPOINT", "MUSICIANSHIP", "RESONANCE"],
  },
  travel: {
    beginner: ["MAP", "BUS", "TRAIN", "PLANE", "HOTEL", "TICKET"],
    easy: ["PASSPORT", "SUITCASE", "JOURNEY", "AIRPORT", "HIGHWAY", "COMPASS", "HOLIDAY", "VOYAGE"],
    medium: ["BACKPACK", "LUGGAGE", "RAILWAY", "LANDMARK", "BOARDING", "VACATION", "TOURISTS", "CABINETS", "ROADTRIP", "TERMINAL"],
    hard: ["DESTINATION", "EXPLORATION", "SIGHTSEEING", "MOUNTAINSIDE", "TRANSPORT", "ADVENTURER", "TRAVELGUIDE", "CROSSCOUNTRY", "EXPEDITION", "NAVIGATION", "CAMPERVAN", "DISCOVERIES"],
  },
  school: {
    beginner: ["BOOK", "DESK", "CLASS", "PENCIL", "CRAYON", "ERASER"],
    easy: ["TEACHER", "STUDENT", "SCIENCE", "READING", "HISTORY", "NOTEBOOK", "LESSONS", "LIBRARY"],
    medium: ["BACKPACK", "HOMEWORK", "GEOMETRY", "SPELLING", "COMPUTERS", "BLACKBOARD", "CLASSROOM", "TEXTBOOKS", "LANGUAGE", "RECESS"],
    hard: ["MATHEMATICS", "EXPERIMENT", "EDUCATION", "VOCABULARY", "ASSIGNMENTS", "LABORATORY", "CALCULATOR", "PRESENTATION", "GRADUATION", "ENCYCLOPEDIA", "SCHOOLHOUSE", "CHALKBOARD"],
  },
};

// Icon-set themes use words that match the existing Sudoku icon vocabulary.
// The same words are used across difficulty tiers while the board grows and
// distractor letters increase the search challenge.
const ICON_SET_WORDS: Record<string, string[]> = {
  shapes: ["CIRCLE", "SQUARE", "STAR", "HEART", "OVAL", "CUBE", "CONE", "PRISM", "DIAMOND", "SPHERE", "TRIANGLE", "RECTANGLE"],
  jungle: ["TIGER", "LION", "ZEBRA", "MONKEY", "PANDA", "KOALA", "PARROT", "LEOPARD", "ELEPHANT", "GORILLA", "CROCODILE", "RHINOCEROS"],
  vehicles: ["CAR", "BUS", "TRAIN", "TRUCK", "PLANE", "TAXI", "SCOOTER", "BICYCLE", "AMBULANCE", "HELICOPTER", "MOTORCYCLE", "SUBMARINE"],
  ocean: ["WHALE", "SHARK", "CORAL", "TURTLE", "SQUID", "CRAB", "DOLPHIN", "OCTOPUS", "SEAHORSE", "JELLYFISH", "SEASTAR", "STARFISH"],
  space: ["PLANET", "COMET", "MOON", "STAR", "ROCKET", "ORBIT", "GALAXY", "METEOR", "SATURN", "ASTRONAUT", "TELESCOPE", "CONSTELLATION"],
  adventure: ["MAP", "CAMP", "HIKE", "TRAIL", "VALLEY", "RIVER", "COMPASS", "BACKPACK", "LANTERN", "EXPLORE", "TREASURE", "EXPEDITION"],
  peppa_pig: ["PIG", "FROG", "RABBIT", "SHEEP", "BEAR", "DOG", "MUDDY", "FAMILY", "FRIEND", "PICNIC", "SCHOOL", "PLAYGROUND"],
  paw_patrol: ["PUPPY", "PAW", "BADGE", "RESCUE", "CHASE", "ROCKY", "SKYE", "RUBBLE", "MARSHALL", "HELICOPTER", "PATROL", "ADVENTURE"],
  sheriff: ["COWBOY", "HORSE", "DESERT", "CACTUS", "BADGE", "EAGLE", "HAT", "SADDLE", "SHERIFF", "TUMBLEWEED", "WAGON", "WILDERNESS"],
  doraemon: ["ROBOT", "GADGET", "POCKET", "FUTURE", "DOOR", "FRIEND", "FLYING", "TIME", "CAT", "ROCKET", "DORAYAKI", "ANYWHERE"],
  chotta_bheem: ["BHEEM", "LADOO", "STRONG", "TIGER", "PALACE", "HORSE", "VILLAGE", "WARRIOR", "KINGDOM", "FRIENDS", "CHAMPION", "ADVENTURE"],
  shinchan: ["FAMILY", "SISTER", "CLASS", "DOG", "BABY", "DANCE", "TEACHER", "CRAYONS", "SCHOOL", "MISCHIEF", "FRIEND", "CARTOONS"],
  bluey: ["BLUEY", "BINGO", "DAD", "MUM", "GAME", "HOUSE", "DANCE", "PUZZLE", "GARDEN", "STORY", "COUSIN", "ADVENTURE"],
  tom_jerry: ["TOM", "JERRY", "MOUSE", "CHEESE", "CAT", "CAKE", "CHASE", "TRAP", "HAMMER", "SQUEAK", "KITCHEN", "CARTOON"],
  superhero: ["HERO", "CAPE", "MASK", "SHIELD", "POWER", "SAVE", "CITY", "BRAVE", "VILLAIN", "LIGHTNING", "SUPERHERO", "PROTECTOR"],
  princess: ["CROWN", "QUEEN", "CASTLE", "MAGIC", "ROYAL", "PRINCE", "UNICORN", "PALACE", "SPARKLE", "KINGDOM", "TIARA", "CARRIAGE"],
};

const ICON_SET_WORD_BANKS: Record<string, ThemeWordBank> = Object.fromEntries(
  Object.entries(ICON_SET_WORDS).map(([id, words]) => [id, {
    beginner: words.slice(0, 6),
    easy: words.slice(0, 8),
    medium: words.slice(0, 10),
    hard: words,
  }]),
);

export function wordSearchThemeForIconSet(iconSetId: string): WordSearchTheme | null {
  return ICON_SET_WORD_BANKS[iconSetId] ? `icon-${iconSetId}` : null;
}

export function isWordSearchTheme(value: string): value is WordSearchTheme {
  return WORD_SEARCH_THEMES.some((theme) => theme.id === value);
}

const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]] as const;
const BABY_DIRECTIONS = [[0, 1], [1, 0]] as const;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function createWordSearch(difficulty: WordSearchDifficulty, theme: WordSearchTheme = "animals", seed = Date.now()): WordSearchPuzzle {
  const random = (() => { let n = seed >>> 0; return () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const { size } = WORD_SEARCH_LEVELS[difficulty];
  const grid = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const iconSetId = theme.startsWith("icon-") ? theme.slice("icon-".length) : null;
  const bank = iconSetId ? ICON_SET_WORD_BANKS[iconSetId] : WORD_BANKS[theme as BaseWordSearchTheme];
  const words = [...(bank?.[difficulty] ?? WORD_BANKS.animals[difficulty])];
  const babyLevel = WORD_SEARCH_LEVELS[difficulty].mode === "baby";
  const directions = babyLevel ? BABY_DIRECTIONS : DIRECTIONS;
  const placements: Record<string, number[]> = {};

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 500 && !placed; attempt++) {
      const [dr, dc] = directions[Math.floor(random() * directions.length)];
      const row = Math.floor(random() * size);
      const col = Math.floor(random() * size);
      const endRow = row + dr * (word.length - 1);
      const endCol = col + dc * (word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
      const cells = Array.from({ length: word.length }, (_, i) => (row + dr * i) * size + col + dc * i);
      if (cells.some((index, i) => {
        const value = grid[Math.floor(index / size)][index % size];
        return babyLevel ? Boolean(value) : Boolean(value && value !== word[i]);
      })) continue;
      cells.forEach((index, i) => { grid[Math.floor(index / size)][index % size] = word[i]; });
      placements[word] = cells;
      placed = true;
    }
    if (!placed) return createWordSearch(difficulty, theme, seed + 1);
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(random() * LETTERS.length)];
  return { grid, words, placements };
}

export function getLineCells(start: number, end: number, size: number): number[] {
  const sr = Math.floor(start / size), sc = start % size;
  const er = Math.floor(end / size), ec = end % size;
  const dr = er - sr, dc = ec - sc;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [];
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];
  const rowStep = Math.sign(dr), colStep = Math.sign(dc);
  return Array.from({ length: steps + 1 }, (_, i) => (sr + rowStep * i) * size + sc + colStep * i);
}
