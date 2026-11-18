import io

def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    for old, new, count in pairs:
        n = s.count(old)
        assert n == count, f"{path}: expected {count} of {old[:70]!r}, found {n}"
        s = s.replace(old, new)
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print('patched', path)

BASE = 'artifacts/sudoku-game/src/'

patch(BASE + 'pages/challenges.tsx', [
    ('import { RUBIKS_LEVELS, isRubiksPuzzle, levelForPuzzle, type RubiksPuzzle } from "@/lib/rubiks";',
     'import { RUBIKS_LEVELS, RUBIKS_VISIBLE, isRubiksPuzzle, levelForPuzzle, type RubiksPuzzle } from "@/lib/rubiks";', 1),
    ('                    ] as const).map(([id, label]) => {',
     '                    ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label]) => {', 1),
    ('            ] as const).map(([id, label, alert]) => {',
     '            ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label, alert]) => {', 1),
    ('const rubiksAlert = rubiksPending.length + rubiksActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
     'const rubiksAlert = RUBIKS_VISIBLE ? rubiksPending.length + rubiksActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length : 0;', 1),
    ('...(rubiksChallenges ?? []).map((challenge) => ({ game: "rubiks" as const, createdAt: challenge.createdAt, challenge })),',
     '...(RUBIKS_VISIBLE ? rubiksChallenges ?? [] : []).map((challenge) => ({ game: "rubiks" as const, createdAt: challenge.createdAt, challenge })),', 1),
])

patch(BASE + 'pages/leaderboard.tsx', [
    ('import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";',
     'import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";\nimport { RUBIKS_VISIBLE } from "@/lib/rubiks";', 1),
    ('  const links = [',
     '  const links = ([', 1),
    ('  ] as const;\n  const selected = links.find',
     '  ] as const).filter((link) => RUBIKS_VISIBLE || link.id !== "rubiks");\n  const selected = links.find', 1),
])

patch(BASE + 'pages/profile.tsx', [
    ('import { RUBIKS_LEVELS } from "@/lib/rubiks";',
     'import { RUBIKS_LEVELS, RUBIKS_VISIBLE } from "@/lib/rubiks";', 1),
    ('|| tabParam === "slide-puzzle" || tabParam === "rubiks" || tabParam === "sudoku"',
     '|| tabParam === "slide-puzzle" || tabParam === "sudoku"', 1),
    ('else if (tabParam === "rubiks") setGameTab("rubiks");',
     'else if (tabParam === "rubiks" && RUBIKS_VISIBLE) setGameTab("rubiks");', 1),
    ('                  ["rubiks", "Rubik\'s Cube"],\n                  ] as const).map(([id, label]) => {',
     '                  ["rubiks", "Rubik\'s Cube"],\n                  ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label]) => {', 1),
    ('{!statsLoading && gameTab === "rubiks" && (',
     '{!statsLoading && RUBIKS_VISIBLE && gameTab === "rubiks" && (', 1),
])

patch(BASE + 'pages/guides.tsx', [
    ('import { usePageMeta } from "@/components/page-meta";',
     'import { usePageMeta } from "@/components/page-meta";\nimport { RUBIKS_VISIBLE } from "@/lib/rubiks";', 1),
    ('          <a href="#rubiks-guide-title" className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-300">Rubik\'s Cube guide</a>',
     '          {RUBIKS_VISIBLE && (\n          <a href="#rubiks-guide-title" className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-300">Rubik\'s Cube guide</a>\n          )}', 1),
    ('      <GuideSection\n        id="rubiks"',
     '      {RUBIKS_VISIBLE && (\n      <GuideSection\n        id="rubiks"', 1),
    ('          { href: "/leaderboard/rubiks", label: "Leaderboard" },\n        ]}\n      />\n\n      <GuideSection',
     '          { href: "/leaderboard/rubiks", label: "Leaderboard" },\n        ]}\n      />\n      )}\n\n      <GuideSection', 1),
])

print('all done')
