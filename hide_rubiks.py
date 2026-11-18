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

# 1. flag in lib
patch(BASE + 'lib/rubiks.ts', [(
    '// plus a tetrahedral piece model for Pyraminx. Pure logic — no rendering.\n',
    '// plus a tetrahedral piece model for Pyraminx. Pure logic — no rendering.\n\n// Feature flag: hides every Rubik\'s Cube UI surface while keeping the game code intact.\nexport const RUBIKS_VISIBLE = false;\n', 1)])

# 2. portal.tsx
patch(BASE + 'pages/portal.tsx', [
    ('import { RUBIKS_LEVELS } from "@/lib/rubiks";',
     'import { RUBIKS_LEVELS, RUBIKS_VISIBLE } from "@/lib/rubiks";', 1),
    ('"slide-puzzle", "rubiks", "science-quiz"',
     '"slide-puzzle", "science-quiz"', 1),
    ('  {\n    id: "rubiks", name: "Rubik\'s Cube", href: "/rubiks",',
     '  ...(RUBIKS_VISIBLE ? [{\n    id: "rubiks", name: "Rubik\'s Cube", href: "/rubiks",', 1),
    ('    keywords: "cube twist turns 3d",\n  },',
     '    keywords: "cube twist turns 3d",\n  }] : []),', 1),
    # mobile featured section
    ('        {/* Rubik\'s Cube quick launch */}\n        <section',
     '        {/* Rubik\'s Cube quick launch */}\n        {RUBIKS_VISIBLE && (\n        <section', 1),
    ('          </div>\n        </section>\n\n        {/* Quiz quick launches',
     '          </div>\n        </section>\n        )}\n\n        {/* Quiz quick launches', 1),
    # mobile daily button
    ('''            <button onClick={() => setLocation("/rubiks?daily=1")} className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
              <Box className="h-5 w-5 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
            </button>''',
     '''            {RUBIKS_VISIBLE && (
            <button onClick={() => setLocation("/rubiks?daily=1")} className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
              <Box className="h-5 w-5 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
            </button>
            )}''', 1),
    # desktop featured section
    ('            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-rose-400/60 bg-gradient-to-br from-rose-100 via-red-50 to-orange-100 text-left',
     '            {RUBIKS_VISIBLE && (\n            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-rose-400/60 bg-gradient-to-br from-rose-100 via-red-50 to-orange-100 text-left', 1),
    ('                title="Available"\n              />\n            </section>\n            {(Object.keys(QUIZ_SUBJECTS)',
     '                title="Available"\n              />\n            </section>\n            )}\n            {(Object.keys(QUIZ_SUBJECTS)', 1),
    # desktop daily button
    ('''              <button onClick={() => setLocation("/rubiks?daily=1")} className="flex items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
                <Box className="h-6 w-6 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
              </button>''',
     '''              {RUBIKS_VISIBLE && (
              <button onClick={() => setLocation("/rubiks?daily=1")} className="flex items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
                <Box className="h-6 w-6 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
              </button>
              )}''', 1),
])

# 3. challenges.tsx
patch(BASE + 'pages/challenges.tsx', [
    ('import { RUBIKS_LEVELS, isRubiksPuzzle, levelForPuzzle, type RubiksPuzzle } from "@/lib/rubiks";',
     'import { RUBIKS_LEVELS, RUBIKS_VISIBLE, isRubiksPuzzle, levelForPuzzle, type RubiksPuzzle } from "@/lib/rubiks";', 1),
    ('                    ] as const).map(([id, label]) => {',
     '                    ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label]) => {', 1),
    ('              ] as const).map(([id, label, alert]) => {',
     '              ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label, alert]) => {', 1),
    ('const rubiksAlert = rubiksPending.length + rubiksActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;',
     'const rubiksAlert = RUBIKS_VISIBLE ? rubiksPending.length + rubiksActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length : 0;', 1),
    ('...(rubiksChallenges ?? []).map((challenge) => ({ game: "rubiks" as const, createdAt: challenge.createdAt, challenge })),',
     '...(RUBIKS_VISIBLE ? rubiksChallenges ?? [] : []).map((challenge) => ({ game: "rubiks" as const, createdAt: challenge.createdAt, challenge })),', 1),
])

# 4. leaderboard.tsx
patch(BASE + 'pages/leaderboard.tsx', [
    ('import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";',
     'import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";\nimport { RUBIKS_VISIBLE } from "@/lib/rubiks";', 1),
    ('  const links = [',
     '  const links = ([', 1),
    ('  ] as const;\n  const selected = links.find',
     '  ] as const).filter((link) => RUBIKS_VISIBLE || link.id !== "rubiks");\n  const selected = links.find', 1),
])

# 5. profile.tsx
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

# 6. guides.tsx
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
