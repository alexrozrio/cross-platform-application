import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const artifactDirectory = path.resolve(scriptDirectory, "..");
const outputDirectory = path.join(artifactDirectory, "dist", "public");
const sourcePath = path.join(outputDirectory, "index.html");
const siteUrl = "https://playbraingames.online";
const siteName = "Play Brain Games . Online";
const openGraphImage = `${siteUrl}/opengraph.jpg`;

const SUDOKU_BOOKMARK_GRIDS = [
  { slug: "baby", size: "3×3", label: "Baby", detail: "a compact 3×3 grid with only a few symbols — a gentle introduction to Sudoku logic" },
  { slug: "mini", size: "4×4", label: "Mini", detail: "a 4×4 grid with sixteen cells and a small symbol set that is easy to scan" },
  { slug: "dual", size: "6×6", label: "Dual", detail: "a 6×6 grid with thirty-six cells and more candidates to track than the small boards" },
  { slug: "classic", size: "9×9", label: "Classic", detail: "the familiar 9×9 grid with eighty-one cells and nine symbols" },
  { slug: "pro", size: "16×16", label: "Pro", detail: "a demanding 16×16 grid with 256 cells and sixteen symbols for experienced players" },
];

const SUDOKU_BOOKMARK_LEVELS = [
  { slug: "easy", label: "Easy", detail: "comes with plenty of starting clues, so you can learn the row, column, and box constraints without much backtracking" },
  { slug: "medium", label: "Medium", detail: "balances starting clues and empty cells, so you will need candidate notes and a repeatable solving loop" },
  { slug: "hard", label: "Hard", detail: "removes more starting clues, so expect longer candidate chains and deeper eliminations" },
  { slug: "expert", label: "Expert", detail: "has the fewest starting clues — plan ahead, keep notes, and be ready to revisit earlier candidates" },
];

const sudokuBookmarkPages = SUDOKU_BOOKMARK_GRIDS.flatMap((grid) =>
  SUDOKU_BOOKMARK_LEVELS.map((level) => ({
    route: `/sudoku/${grid.slug}/${level.slug}`,
    title: `${level.label} ${grid.size} Sudoku Puzzle – Play Free Online | Play Brain Games . Online`,
    description: `Play a free ${level.label.toLowerCase()} ${grid.size} Sudoku puzzle online. ${grid.label} grid: ${grid.detail}. Guest play, pencil notes, and daily challenges included.`,
    heading: `${level.label} ${grid.size} Sudoku`,
    intro: `This ${grid.size} ${level.label.toLowerCase()} Sudoku puzzle uses ${grid.detail} and ${level.detail}. Every symbol must appear once in each row, column, and marked box.`,
    sections: [
      ["How to approach this puzzle", `Start with the groups that have the fewest empty cells. List the missing symbols, then check each empty cell against its row, column, and box. Place a symbol only when one candidate remains, then scan those groups again for the next single.`],
      ["What to expect at ${level.label.toLowerCase()} difficulty", `${level.detail}. Use pencil notes to record candidates and remove them as nearby placements rule them out.`],
      ["Play as a guest or save progress", "You can start this puzzle without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/sudoku", "Choose any Sudoku grid and difficulty"],
      ["/guides", "Read the Sudoku solving guide"],
      ["/daily-challenge", "Solve today's shared Sudoku"],
      ["/leaderboard/sudoku/", "View the Sudoku leaderboard"],
    ],
    schemaType: "WebApplication",
  })),
);

const publicPages = [
  {
    route: "/",
    title: "Free Puzzle & Quiz Games Online | Sudoku, Memory, Word Search & More",
    description:
      "Play nine free browser games: Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quizzes — with daily challenges, leaderboards, and guest play.",
    heading: "Free Puzzle & Quiz Games Online",
    intro:
      "Nine games, one place: logic puzzles, word and picture games, minefields, sliding tiles, and timed quizzes. Every game can be started as a guest, with daily challenges and leaderboards to compare scores.",
    sections: [
      ["Sudoku for logic", "Baby 3×3 through Pro 16×16 grids in easy, medium, hard, and expert. Each symbol must fit its row, column, and marked box — use candidate notes and a repeatable solving loop."],
      ["Memory Match for recall", "2×4 to 8×8 boards with number, letter, or image cards. Turn over two cards at a time and build a location map as you play."],
      ["Jigsaw for pictures", "Rebuild themed pictures on 2×2 to 5×5 boards across Kids, Adult, and All modes, with three levels and points based on size, level, time, moves, and tips."],
      ["Word Search for words", "Themed word lists hide in letter grids — Beginner and Easy go across and down, Medium adds diagonals, and Hard includes backwards words."],
      ["Minesweeper for nerves of steel", "Clear the minefield on 6×6 to 14×14 boards from Beginner to Hard. Numbers show adjacent mines; you get up to three mistakes and two hints."],
      ["Slide Puzzle for tile sliding", "Arrange numbered, alphabet, or picture tiles in order on 2×2 to 5×5 boards. Points reward fast, efficient solves with few hints."],
      ["Science, Maths & GK quizzes", "Timed multiple-choice quizzes with four levels — Easy (5 questions) up to Expert (12 questions). Answer quickly and accurately to maximise points, XP, and gems."],
      ["Daily challenges for everyone", "Every game has a shared daily challenge that refreshes each day, so you can compare your score with other players on the same puzzle."],
      ["Play as a guest or keep progress in a profile", "You can start any game without an account. Optional Google sign-in connects game statistics, achievements, and streaks to a profile so progress can sync across devices."],
    ],
    links: [
      ["/sudoku", "Play Sudoku online"],
      ["/memory", "Play Memory Match online"],
      ["/jigsaw", "Play Jigsaw online"],
      ["/word-search", "Play Word Search online"],
      ["/minesweeper", "Play Minesweeper online"],
      ["/slide-puzzle", "Play Slide Puzzle online"],
      ["/quiz/science", "Play the Science Quiz"],
      ["/quiz/maths", "Play the Maths Quiz"],
      ["/quiz/gk", "Play the GK Quiz"],
      ["/themes", "Browse game themes"],
      ["/guides", "Read the puzzle guides"],
      ["/about", "Learn how the games work"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/jigsaw",
    title: "Jigsaw Picture Puzzles Online | Play Brain Games . Online",
    description:
      "Rebuild themed pictures on 2×2, 3×3, 4×4, and 5×5 Jigsaw boards. Points account for board size, level, time, moves, and tips; wins award XP and gems.",
    heading: "Jigsaw Picture Puzzles Online",
    intro:
      "Choose a picture, set the board size and level, then place each piece. Complete today's shared puzzle or invite a friend to solve the same image.",
    sections: [
      ["Choose a board for your experience", "Kids mode offers 2×2 and 3×3 boards. Adult mode offers 4×4 and 5×5 boards. Default 4 All mode includes all four sizes. Larger boards have more pieces and earn higher base points."],
      ["Earn points from size, level, and time", "Board size and level set base points. Time adds a capped bonus, while extra moves and used tips reduce the score."],
      ["Play together or on your own", "Try the daily Jigsaw challenge to share the same board with everyone, or create a friend challenge and compare results after both players finish."],
    ],
    links: [
      ["/jigsaw-challenge", "Play today's Jigsaw challenge"],
      ["/jigsaw-challenges", "Open your Jigsaw challenges"],
      ["/leaderboard/jigsaw/", "View all-time Jigsaw scores"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "Game",
  },
  {
    route: "/jigsaw-challenge",
    title: "Daily Jigsaw Puzzle Challenge | Play Brain Games . Online",
    description:
      "Play today's shared Jigsaw picture puzzle, earn points for size, level, time, moves, and tips, and compare your result on the daily leaderboard.",
    heading: "Daily Jigsaw Puzzle Challenge",
    intro:
      "Everyone gets the same picture puzzle today. Complete it to post a score, then compare your time and points with other players.",
    sections: [
      ["One shared board each day", "The daily challenge uses the same board size, level, and picture for every player on that date."],
      ["Score by size, level, and time", "Larger boards and higher levels earn more points. Finishing faster than the target time adds a speed bonus."],
    ],
    links: [
      ["/jigsaw", "Choose another Jigsaw puzzle"],
      ["/leaderboard/jigsaw/", "View all-time Jigsaw scores"],
    ],
    schemaType: "WebPage",
  },
  {
    route: "/themes",
    title: "Game Themes | Play Brain Games . Online",
    description:
      "Personalise your games with curated colour palettes, system-provided backgrounds, fonts, and image-symbol sets. Preview styles and unlock selected themes with gems.",
    heading: "Game Themes",
    intro:
      "Choose a curated colour palette, switch on a system-provided background, and explore font and image-symbol options used across the games.",
    sections: [
      [
        "Curated colour palettes",
        "Choose Classic, Dark, Forest, or another available colour theme. The selected palette changes the look of the app without changing puzzle rules.",
      ],
      [
        "System-provided backgrounds",
        "Turn the background image for the selected theme on or off. Your choice is saved to your profile and appears behind games.",
      ],
      [
        "Fonts and image-symbol sets",
        "Adjust text styles and browse themed image icons used in Sudoku and Memory Match, plus themed pictures for Jigsaw. Preview available choices before selecting one.",
      ],
      [
        "Unlockable options",
        "Some themes can be unlocked with in-game gems. Classic, Dark, and Forest colour themes are free.",
      ],
    ],
    links: [
      ["/sudoku", "Play Sudoku with a new theme"],
      ["/memory", "Use themes in Memory Match"],
      ["/jigsaw", "Use pictures in Jigsaw"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/guides",
    title: "Game Guides: Sudoku, Memory Match, Word Search & More | Play Brain Games . Online",
    description:
      "Learn Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and the quizzes with practical strategies, board-size guidance, and tips for daily puzzles and friend challenges.",
    heading: "Game Guides",
    intro:
      "Use these practical guides to learn the rules, work through a sample move, and choose a board that fits your experience — covering every game on Play Brain Games . Online.",
    sections: [
      [
        "Sudoku rules: row, column, and box",
        "Each symbol must appear once in every row, column, and marked box. A symbol missing from a row may still be blocked from a particular cell by its column or box, so check all three groups before placing it. On smaller grids the symbol set and box shape change, but the same elimination method applies.",
      ],
      [
        "A repeatable Sudoku solving loop",
        "Scan a row, column, or box and list the symbols it is missing. For each empty cell, rule out symbols already present in its row, column, or box. Place a symbol only when one candidate remains; when several remain, record notes and continue elsewhere. After every placement, update the affected groups and scan them again for a new single.",
      ],
      [
        "Worked example: a 4×4 placement",
        "Starting board, with a dot for the empty cell: 1 2 | 3 4; 3 4 | 1 .; 2 1 | 4 3; 4 3 | 2 1. Row 2 is missing 2. Column 4 is also missing 2, and the top-right 2×2 box needs 2 as well. All three constraints agree: place 2 in row 2, column 4, then re-check that row, column, and box.",
      ],
      [
        "Choosing a Sudoku grid",
        "A 3×3 or 4×4 board keeps the symbol set small for a first try. A 6×6 board adds more candidates while staying compact. The 9×9 grid is the familiar standard format, while 16×16 uses a larger symbol set and takes more concentration. Choose a size that lets you reason comfortably rather than rushing.",
      ],
      [
        "Memory Match rules",
        "Cards start face-down. Reveal two cards on each turn: a matching pair stays visible, while a mismatch turns face-down again. The goal is to remember both what you saw and where it appeared. Each new board is shuffled, so a remembered position only applies to that round.",
      ],
      [
        "A reliable Memory Match routine",
        "Work through the board in a consistent order instead of flipping randomly. Notice the location of every revealed card, and keep both positions in mind after a mismatch. When you know where both cards in a pair are, match them before searching for more. Building a reliable map first can prevent extra flips; speed can improve as the layout becomes familiar.",
      ],
      [
        "Memory Match board sizes",
        "The 2×4 board has 4 pairs for a short warm-up. A 4×4 board has 8 pairs, an 8×4 board has 16, and an 8×8 board has 32. Larger boards require you to retain more card locations. Images, numbers, and letters use the same matching rules, so choose the display style that is easiest for you to scan.",
      ],
      [
        "Sample Memory Match sequence",
        "Suppose row 1, column 1 shows a star and row 1, column 2 shows a moon. They do not match, so both turn face-down. Later, row 2, column 1 reveals a star: pair it with the remembered star at row 1, column 1. Keep the moon's position in mind for when its partner appears. These positions are examples only; each round shuffles its own board.",
      ],
      [
        "Jigsaw picture puzzles",
        "Rebuild themed pictures on 2×2 to 5×5 grids: Kids mode has 2×2 and 3×3, Adult mode has 4×4 and 5×5, and default 4 All mode has all four. Choose one of three levels, then solve the shared daily puzzle or challenge a friend. Points depend on grid size, level, time, moves, and tips; completions also award XP and gems.",
      ],
      [
        "Word Search strategy",
        "Words run in straight lines — across, down, and on higher levels diagonally or backwards. Scan for rare letters first, then extend the line in both directions. Each game allows up to two hints.",
      ],
      [
        "Minesweeper reading patterns",
        "A revealed number counts the mines in its eight neighbours. When a number equals the count of covered neighbours, every covered neighbour is a mine — flag them all. When the flags already satisfy the count, every other neighbour is safe to reveal.",
      ],
      [
        "Slide Puzzle technique",
        "Work row by row from the top-left: place tile 1, then complete the first row, then the next. Keep the blank space near the tiles you're working on, and use the hint button when a row looks stuck.",
      ],
      [
        "Quiz strategy",
        "In the Science, Maths & GK quizzes, points combine accuracy with speed. Eliminate obviously wrong options quickly, guess rather than skip when unsure, and finish under the par time for the speed bonus.",
      ],
      [
        "Play as a guest or save progress",
        "You can start a puzzle without creating an account. Guest play is useful for a quick session; signing in is optional and lets the site associate completed results, rewards, and personal progress with your profile across devices.",
      ],
    ],
    links: [
      ["/sudoku", "Start a Sudoku puzzle"],
      ["/memory", "Start a Memory Match game"],
      ["/jigsaw", "Play a Jigsaw picture puzzle"],
      ["/word-search", "Play Word Search"],
      ["/minesweeper", "Play Minesweeper"],
      ["/slide-puzzle", "Play Slide Puzzle"],
      ["/quiz/science", "Play the quizzes"],
      ["/daily-challenge", "Try the daily challenge"],
    ],
    schemaType: "Article",
  },
  {
    route: "/sudoku",
    title: "Play Sudoku Online Free | Easy to Expert Puzzles",
    description:
      "Play free online Sudoku from 3×3 to 16×16. Learn a row, column, and box solving routine, use candidate notes, and play as a guest.",
    heading: "Play Sudoku Online Free",
    intro:
      "Choose a grid and difficulty, then use the same logic on every board: each symbol must fit its row, column, and marked box. Guest play is available without an account.",
    sections: [
      ["What makes a placement valid", "Each symbol must appear once in every row, column, and marked box. Before filling a cell, check all three groups; a symbol missing from a row may still be ruled out by its column or box."],
      ["Start where the choices are fewest", "Look for a row, column, or box with only a few empty cells. List its missing symbols, then test each empty cell against its intersecting groups. A cell with one remaining candidate is a supported move; after placing it, scan those groups again."],
      ["Use candidate notes deliberately", "When several symbols still fit, record the possibilities in pencil mode instead of guessing. As other cells are solved, update the notes. A candidate can be removed when the same symbol is placed elsewhere in its row, column, or box."],
      ["Choose board size before difficulty", "3×3 Baby, 4×4 Mini, and 6×6 Dual boards use fewer cells. 9×9 Classic is the standard layout, and 16×16 Pro uses a larger symbol set. If a puzzle feels crowded, reduce the grid or difficulty rather than rushing."],
      ["Number, letter, and image-symbol play", "The smaller grids also support letter or image-symbol modes. These display options change the symbols you enter, not the Sudoku constraints. Every row, column, and marked box still needs one of each symbol."],
      ["Compare practice on the daily board", "The daily challenge uses the same 9×9 medium puzzle for everyone that day. You can compare completion time and mistakes on an identical board, then return to a regular puzzle when you want to choose a different size or difficulty."],
    ],
    links: [
      ["/guides", "Learn Sudoku strategies"],
      ["/themes", "Explore Sudoku themes"],
      ["/daily-challenge", "Solve today's Sudoku challenge"],
      ["/leaderboard/sudoku/", "View the Sudoku leaderboard"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/memory",
    title: "Play Memory Match Online Free | All Difficulty Levels",
    description:
      "Play Memory Match with number, letter, or image cards. Learn a repeatable recall strategy and choose a 2×4, 4×4, 8×4, or 8×8 board.",
    heading: "Play Memory Match Online Free",
    intro:
      "All cards start face-down. Reveal two on each move and remember their positions; a matching pair stays visible, while a mismatch turns back over after a short pause.",
    sections: [
      ["Build a location map", "Scan in a consistent order, such as left to right across each row. When two cards do not match, remember both locations. If you see one of those symbols again, use the earlier position to complete the pair instead of making a random guess."],
      ["Select a board for the time you have", "The 2×4 Beginner board contains 4 pairs, 4×4 Easy has 8, 8×4 Medium has 16, and 8×8 Hard has 32. Begin with fewer pairs while learning the routine, then expand the board when you want to track more positions."],
      ["Use the card style that is easiest to scan", "Choose numbers, letters, or themed image symbols. The display can change between sessions, but a match is always two cards with the same symbol."],
      ["Understand flips, time, and results", "The game records how long the round takes and how many flips you make. Faster completion and fewer flips contribute to a higher score. You can replay a board to practise remembering positions more efficiently."],
      ["Play as a guest or sync your results", "You can start a round without signing in. Optional Google sign-in connects your results and profile statistics across devices. Daily and weekly challenges provide another way to practise the same kind of recall."],
    ],
    links: [
      ["/guides", "Read the Memory Match guide"],
      ["/themes", "Browse card themes"],
      ["/memory-challenge", "Try a memory challenge"],
      ["/leaderboard/memory/", "View the Memory Match leaderboard"],
      ["/about", "Learn about Play Brain Games"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/memory-challenge",
    title: "Memory Match Challenges | Play Brain Games . Online",
    description:
      "Take on daily and weekly Memory Match challenges, improve your recall, and compare results on Play Brain Games . Online.",
    heading: "Daily & Weekly Memory Match Challenges",
    intro:
      "Take on daily and weekly Memory Match challenges, practise your recall, and compare your results with other players.",
    sections: [
      ["Daily and weekly challenges", "Choose a shared Memory Match challenge and work through the card pairs at your own pace."],
      ["Compare challenge results", "Review completion times, flips, and scores on the challenge leaderboards."],
      ["Keep practising", "Play regular Memory Match boards to build recall, or return to the challenges to track your progress."],
    ],
    links: [
      ["/memory", "Play Memory Match"],
      ["/leaderboard/memory/", "View the Memory Match leaderboard"],
      ["/guides", "Read the Memory Match guide"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/daily-challenge",
    title: "Daily Sudoku Challenge | Play Today's Puzzle Online",
    description:
      "Solve today's shared 9×9 Sudoku challenge, compare your time and mistakes, and build a daily solving streak with other players.",
    heading: "Daily Sudoku Challenge",
    intro:
      "Everyone gets the same 9×9 Medium Sudoku puzzle each day. Solve it, compare your time and mistakes, and return tomorrow to build a streak.",
    sections: [
      ["One shared puzzle each day", "The daily Sudoku challenge refreshes at 00:00 UTC so players can compare results on the same board."],
      ["Compare your result", "See today's completion leaderboard and use your time and mistake count as a simple practice benchmark."],
      ["Play as a guest or sign in", "Guest play is available immediately. Sign in when you want streaks and progress to sync across devices."],
    ],
    links: [
      ["/sudoku", "Play more Sudoku puzzles"],
      ["/leaderboard", "See all-time leaderboards"],
      ["/guides", "Improve with Sudoku tips"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/leaderboard",
    title: "All Games Leaderboard | Play Brain Games . Online",
    description:
      "Compare scores across all nine games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quizzes — on weekly, monthly, and all-time boards.",
    heading: "All Games Leaderboard",
    intro:
      "Compare combined points across every game — puzzles, word games, quizzes, and more — on weekly tournaments, monthly tournaments, and all-time rankings.",
    sections: [
      ["Weekly and monthly tournaments", "Follow changing tournament standings and compete for a place near the top."],
      ["All-time combined scores", "Completed games from every title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and the Science, Maths & GK quizzes — contribute points to the all-games ranking."],
      ["Game-specific leaderboards", "Open separate all-time boards to compare scores for any individual game."],
    ],
    links: [
      ["/leaderboard/sudoku/", "View all-time Sudoku scores"],
      ["/leaderboard/memory/", "View all-time Memory Match scores"],
      ["/leaderboard/jigsaw/", "View all-time Jigsaw scores"],
      ["/leaderboard/word-search/", "View all-time Word Search scores"],
      ["/leaderboard/minesweeper/", "View all-time Minesweeper scores"],
      ["/leaderboard/slide-puzzle/", "View all-time Slide Puzzle scores"],
      ["/leaderboard/science-quiz/", "View Science Quiz scores"],
      ["/leaderboard/maths-quiz/", "View Maths Quiz scores"],
      ["/leaderboard/gk-quiz/", "View GK Quiz scores"],
      ["/sudoku/", "Play Sudoku for leaderboard points"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/sudoku",
    title: "Sudoku Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Sudoku points across 3×3, 4×4, 6×6, 9×9, and 16×16 grids.",
    heading: "Sudoku Leaderboard",
    intro:
      "See the players with the highest combined points across completed Sudoku games of every grid size.",
    sections: [
      ["Scores across every grid", "Points from completed 3×3, 4×4, 6×6, 9×9, and 16×16 Sudoku games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes Memory Match and Jigsaw scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/leaderboard/memory/", "View the Memory Match leaderboard"],
      ["/leaderboard/jigsaw/", "View the Jigsaw leaderboard"],
      ["/sudoku/", "Play Sudoku"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/memory",
    title: "Memory Match Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Memory Match scores across Beginner, Easy, Medium, and Hard levels.",
    heading: "Memory Match Leaderboard",
    intro:
      "See the players with the highest combined points across completed Memory Match games of every level.",
    sections: [
      ["Scores across every level", "Points from completed Beginner, Easy, Medium, and Hard games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes Sudoku and Jigsaw scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/leaderboard/sudoku/", "View the Sudoku leaderboard"],
      ["/memory/", "Play Memory Match"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/challenges",
    title: "Game Challenges & Duels | Play Brain Games . Online",
    description:
      "Create and join challenges for any of the nine games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and the quizzes — compare scores, and compete with friends.",
    heading: "Game Challenges & Duels",
    intro:
      "Create a head-to-head challenge in any game. Share an invitation link, complete the same round, and compare results.",
    sections: [
      ["What challenges are", "Challenges let two players compete on the same puzzle, board, or quiz. Each player completes a round, then the higher score wins bonus gems."],
      ["Every game supported", "Duels are available for Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and the Science, Maths & GK quizzes."],
      ["How invitations work", "Create a challenge and share the invitation link with a friend. They can open the link and accept the duel without signing in."],
      ["How scoring works", "Scores reward speed and difficulty while accounting for mistakes, hints, or extra moves. The winner earns gems; ties reward both players."],
    ],
    links: [
      ["/sudoku", "Practice Sudoku first"],
      ["/memory", "Practice Memory Match first"],
      ["/about", "Learn about Play Brain Games"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/about",
    title: "About Play Brain Games . Online | Nine Free Games",
    description:
      "Learn about Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quizzes — board choices, daily challenges, guest play, and saved progress.",
    heading: "About Play Brain Games . Online",
    intro:
      "Play Brain Games . Online brings together nine puzzle and quiz formats with adjustable boards, practical guides, daily challenges, and guest play.",
    sections: [
      ["Nine games, many kinds of play", "Sudoku is a logic puzzle; Memory Match is a recall game; Jigsaw rebuilds a picture; Word Search hides themed words; Minesweeper tests deduction under pressure; Slide Puzzle orders shuffled tiles; and the Science, Maths & GK quizzes test knowledge against the clock."],
      ["Board and level choices for every experience", "Sudoku ranges from 3×3 to 16×16 grids; Memory Match has 2×4 through 8×8 boards; Jigsaw offers 2×2 to 5×5 pictures; Word Search scales from 6×6 to 14×14; Minesweeper runs 6×6 to 14×14; Slide Puzzle goes 2×2 to 5×5; and each quiz has Easy through Expert levels."],
      ["Progress is optional", "Start as a guest without signing in. Google sign-in connects profile statistics, achievements, and streaks so progress can sync across devices. The games remain available without a profile."],
      ["Daily practice and shared results", "Every game has a daily challenge that refreshes each day, plus head-to-head challenges against friends. Leaderboards cover all nine games across weekly, monthly, and all-time boards."],
      ["Privacy and account control", "The Privacy Policy describes how account and game-progress information is used. The account deletion page explains how to request removal of an account and associated server data."],
    ],
    links: [
      ["/sudoku", "Play Sudoku"],
      ["/memory", "Play Memory Match"],
      ["/jigsaw", "Play Jigsaw"],
      ["/word-search", "Play Word Search"],
      ["/minesweeper", "Play Minesweeper"],
      ["/slide-puzzle", "Play Slide Puzzle"],
      ["/quiz/science", "Play the quizzes"],
      ["/guides", "Read the puzzle guides"],
      ["/account-deletion", "Account deletion"],
      ["/privacy", "Read the privacy policy"],
    ],
    schemaType: "AboutPage",
  },
  {
    route: "/privacy",
    title: "Privacy Policy | Play Brain Games . Online",
    description:
      "Read how Play Brain Games . Online handles guest play, Google sign-in, game progress, analytics consent, advertising choices, and children's privacy.",
    heading: "Privacy Policy",
    intro:
      "This policy explains what information Play Brain Games . Online uses for guest play, sign-in, saved game progress, analytics consent, and family-friendly features.",
    sections: [
      ["Information and game progress", "Guest play uses a browser identifier, while signed-in play can store profile details, puzzle attempts, scores, settings, and badges."],
      ["Analytics and cookies", "Analytics is disabled unless you allow it in the privacy choices dialog. Local storage supports preferences and offline game progress."],
      ["Children's privacy", "The service is general-audience and family-friendly. Child-friendly game modes do not require a child to provide direct contact information."],
    ],
    links: [
      ["/terms", "Read the terms of service"],
      ["/about", "Learn about the games"],
      ["/", "Return to the games"],
    ],
    schemaType: "WebPage",
  },
  {
    route: "/account-deletion",
    title: "Delete Your Account and Data | Play Brain Games . Online",
    description:
      "Request deletion of your Play Brain Games account and associated Sudoku, Memory Match, Jigsaw, and profile data.",
    heading: "Delete Your Account and Data",
    intro:
      "You can permanently delete your Play Brain Games account and associated server data from the app's Account page. Sign in to the account you want deleted, then confirm the deletion request.",
    sections: [
      ["What will be deleted", "Your account identity, profile, game history, statistics, badges, and related challenge records will be removed from our servers."],
      ["Local app data", "The deletion flow clears local app data on the device used to submit the request. Clear app storage on any other devices to remove locally saved copies there."],
      ["Can't sign in?", "Email support@playbraingames.online with an account deletion request. We may need to verify account ownership before processing it."],
    ],
    links: [
      ["/privacy", "Read the Privacy Policy"],
      ["/profile", "Open the Account page"],
    ],
    schemaType: "WebPage",
  },
  {
    route: "/terms",
    title: "Terms of Service | Play Brain Games . Online",
    description:
      "Read the terms for using Play Brain Games . Online, including guest play, accounts, family-friendly use, acceptable behavior, and game content.",
    heading: "Terms of Service",
    intro:
      "These terms describe the rules for using Play Brain Games . Online, including its Sudoku, Memory Match, and Jigsaw games, accounts, challenges, and virtual rewards.",
    sections: [
      ["Using the service", "By using the games, you agree to these terms. The service is general-audience and family-friendly, with optional child-friendly modes."],
      ["Fair play", "Do not use bots or automated tools to manipulate scores, disrupt the service, impersonate another user, or violate applicable laws."],
      ["Virtual items and game content", "Gems have no real-world monetary value. Puzzles, boards, themes, graphics, and code are owned by or licensed to the service."],
    ],
    links: [
      ["/privacy", "Read the privacy policy"],
      ["/about", "Learn about the games"],
      ["/", "Return to the games"],
    ],
    schemaType: "WebPage",
  },
  {
    route: "/word-search",
    title: "Word Search Puzzles Online Free | Play Brain Games . Online",
    description:
      "Play free Word Search puzzles with four difficulties, themed word lists, daily challenges, and friend duels. Find every hidden word online.",
    heading: "Word Search Puzzles Online",
    intro:
      "Words hide in straight lines inside a letter grid — across, down, and on harder levels diagonally and backwards. Pick a theme and difficulty, then drag from a word's first letter to its last.",
    sections: [
      ["Four difficulty levels", "Beginner (6×6, 6 words) and Easy (8×8, 8 words) hide words only left-to-right and top-to-bottom. Medium (12×12, 10 words) adds diagonals, and Hard (14×14, 12 words) also includes backwards words."],
      ["Themed word lists", "Animals, food, space, ocean, and icon-set themes each have their own word list, so every puzzle feels different even at the same difficulty."],
      ["How scoring works", "Points reflect the difficulty, your completion time, how many tries it took, and hints used. You get up to two hints per game, and finishing awards XP and gems."],
      ["Daily and friend challenges", "The daily Word Search challenge gives everyone the same shared puzzle each day. You can also challenge a friend to compare scores on the same words."],
      ["Play as a guest or save progress", "Start a puzzle without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/word-search-challenge", "Play today's Word Search challenge"],
      ["/leaderboard/word-search/", "View the Word Search leaderboard"],
      ["/guides", "Read the puzzle guides"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/word-search-challenge",
    title: "Daily Word Search Challenge | Play Brain Games . Online",
    description:
      "Play today's shared Word Search puzzle, earn points for speed and accuracy, and compare your score on the daily leaderboard.",
    heading: "Daily Word Search Challenge",
    intro:
      "Everyone gets the same themed word puzzle each day, refreshed at 00:00 UTC. Find every hidden word and post your score.",
    sections: [
      ["One shared puzzle each day", "The daily Word Search challenge uses the same grid, theme, and word list for every player on that date."],
      ["Score by speed and accuracy", "Points reflect the difficulty, completion time, tries, and hints used, so a clean fast run ranks higher."],
      ["Compare with other players", "The daily leaderboard shows completion times and points, and you can return tomorrow to build a streak."],
    ],
    links: [
      ["/word-search", "Play Word Search puzzles"],
      ["/leaderboard/word-search/", "View the Word Search leaderboard"],
      ["/guides", "Read the Word Search guide"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/jigsaw-challenges",
    title: "Jigsaw Friend Challenges | Play Brain Games . Online",
    description:
      "Create a Jigsaw picture challenge, share an invite link, and compare completion points with a friend on the same puzzle.",
    heading: "Jigsaw Friend Challenges",
    intro:
      "Pick a picture, board size, and level, then send a friend an invite link. Whoever finishes with more points wins bonus gems.",
    sections: [
      ["How friend challenges work", "Create a challenge for a specific friend or share an open invite link. Both players solve the same picture puzzle, then results are compared."],
      ["What decides the winner", "Points are based on board size, level, completion time, moves, and tips used. The higher score earns 10 bonus gems; a tie rewards both players."],
      ["Challenge history", "Your pending, active, and completed Jigsaw challenges are listed here so you can accept, decline, or replay them."],
    ],
    links: [
      ["/jigsaw", "Play a Jigsaw puzzle"],
      ["/jigsaw-challenge", "Try today's daily Jigsaw"],
      ["/leaderboard/jigsaw/", "View the Jigsaw leaderboard"],
      ["/challenges", "See all game challenges"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/jigsaw",
    title: "Jigsaw Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Jigsaw puzzle scores across 2×2, 3×3, 4×4, and 5×5 boards and all three levels.",
    heading: "Jigsaw Leaderboard",
    intro:
      "See the players with the highest combined points across completed Jigsaw picture puzzles of every board size and level.",
    sections: [
      ["Scores across every board", "Points from completed 2×2, 3×3, 4×4, and 5×5 Jigsaw puzzles count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes Sudoku, Memory Match, and Word Search scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/leaderboard/sudoku/", "View the Sudoku leaderboard"],
      ["/jigsaw", "Play a Jigsaw puzzle"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/word-search",
    title: "Word Search Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Word Search scores across Beginner, Easy, Medium, and Hard difficulties and every theme.",
    heading: "Word Search Leaderboard",
    intro:
      "See the players with the highest combined points across completed Word Search games of every difficulty.",
    sections: [
      ["Scores across every difficulty", "Points from completed Beginner, Easy, Medium, and Hard Word Search games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes Sudoku, Memory Match, Jigsaw, and daily challenge results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/leaderboard/jigsaw/", "View the Jigsaw leaderboard"],
      ["/word-search", "Play Word Search"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/minesweeper",
    title: "Minesweeper Online Free | Clear the Minefield",
    description:
      "Play free Minesweeper online with Beginner, Easy, Medium, and Hard boards. Read the numbers, flag the mines, and clear the field before three mistakes.",
    heading: "Minesweeper Online Free",
    intro:
      "A mine hides under every covered cell. Reveal safe squares and use the numbers — each shows how many mines touch that cell — to work out where the mines are before you hit one.",
    sections: [
      ["Four board sizes", "Beginner is a gentle 6×6 board with 5 mines, Easy is 8×8 with 12, Medium is 12×12 with 24, and Hard is 14×14 with 34 mines for experienced players."],
      ["How the numbers work", "Each revealed number counts the mines in the eight surrounding cells. A 1 means exactly one neighbour is a mine; a 0 means the whole neighbourhood is safe and reveals automatically."],
      ["Flag suspicious mines", "Switch to flag mode to mark cells you believe contain mines. Flags help you keep track, but the real skill is reading the number patterns."],
      ["Mistakes and hints", "You can afford up to three wrong reveals per game, and two hints that highlight a safe cell. Finishing with fewer mistakes and hints scores higher."],
      ["Daily challenge and leaderboards", "The daily Minesweeper challenge gives everyone the same minefield each day. Completed games earn points, XP, and gems, and feed the Minesweeper leaderboard."],
      ["Play as a guest or save progress", "Start a game without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/minesweeper-challenge", "Play today's Minesweeper challenge"],
      ["/leaderboard/minesweeper/", "View the Minesweeper leaderboard"],
      ["/guides", "Read the puzzle guides"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/minesweeper-challenge",
    title: "Daily Minesweeper Challenge | Play Brain Games . Online",
    description:
      "Play today's shared Minesweeper minefield, clear it with as few mistakes as possible, and compare your score on the daily leaderboard.",
    heading: "Daily Minesweeper Challenge",
    intro:
      "Everyone gets the same minefield each day, refreshed at 00:00 UTC. Clear every safe cell and post your score.",
    sections: [
      ["One shared minefield each day", "The daily Minesweeper challenge uses the same board and mine placement for every player on that date."],
      ["Score by mistakes and time", "Points reflect how cleanly and quickly you clear the field — fewer mistakes and hints mean a higher score."],
      ["Compare with other players", "The daily leaderboard shows completion times and points so you can benchmark your sweep."],
    ],
    links: [
      ["/minesweeper", "Play Minesweeper puzzles"],
      ["/leaderboard/minesweeper/", "View the Minesweeper leaderboard"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/slide-puzzle",
    title: "Slide Puzzle Online Free | 15-Puzzle & More",
    description:
      "Play free Slide Puzzles online with 2×2 to 5×5 boards and number, alphabet, or picture tiles. Slide tiles into order and beat the par time.",
    heading: "Slide Puzzle Online Free",
    intro:
      "One empty space, a grid of tiles, and one goal: slide the tiles until they sit in order. Choose your board size and tile style, then race the par time.",
    sections: [
      ["Four board sizes", "2×2 (3 tiles) is a warm-up, 3×3 (8 tiles) is the classic, 4×4 (15 tiles) is the famous 15-puzzle, and 5×5 (24 tiles) is a serious challenge."],
      ["Tile styles", "Play with numbers, letters of the alphabet, or picture tiles that use your selected image theme. Changing the style starts a fresh puzzle."],
      ["How scoring works", "Points reward a low move count and fast completion relative to the board's par moves and par time. Up to three hints are available per game."],
      ["Daily challenge and leaderboards", "The daily Slide Puzzle challenge gives everyone the same scrambled board each day. Completed games earn points, XP, and gems and feed the Slide Puzzle leaderboard."],
      ["Play as a guest or save progress", "Start a puzzle without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/slide-puzzle-challenge", "Play today's Slide Puzzle challenge"],
      ["/leaderboard/slide-puzzle/", "View the Slide Puzzle leaderboard"],
      ["/themes", "Browse picture themes"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/slide-puzzle-challenge",
    title: "Daily Slide Puzzle Challenge | Play Brain Games . Online",
    description:
      "Solve today's shared Slide Puzzle board, finish in as few moves and as little time as possible, and compare your score.",
    heading: "Daily Slide Puzzle Challenge",
    intro:
      "Everyone gets the same scrambled board each day, refreshed at 00:00 UTC. Slide the tiles into order and post your score.",
    sections: [
      ["One shared board each day", "The daily Slide Puzzle challenge uses the same board size, scramble, and tile style for every player on that date."],
      ["Score by moves and time", "Points reward efficient solves — fewer moves and a faster finish than the par target score higher."],
      ["Compare with other players", "The daily leaderboard shows completion times and points so you can benchmark your sliding."],
    ],
    links: [
      ["/slide-puzzle", "Play Slide Puzzles"],
      ["/leaderboard/slide-puzzle/", "View the Slide Puzzle leaderboard"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/quiz/science",
    title: "Science Quiz Online Free | Timed Trivia Questions",
    description:
      "Play the free Science Quiz with four levels — Easy (5 questions) to Expert (12 questions). Timed multiple-choice trivia on planets, elements, biology, and physics.",
    heading: "Science Quiz Online Free",
    intro:
      "Test your science knowledge with timed multiple-choice questions across four levels. Answer quickly and accurately to maximise points, XP, and gems.",
    sections: [
      ["Four levels of difficulty", "Easy asks 5 questions in 2 minutes, Medium 8 in 3 minutes, Hard 10 in 4 minutes, and Expert 12 in 5 minutes. Higher levels have bigger point bases."],
      ["How scoring works", "Points combine a level base with your accuracy and a speed bonus for finishing under the par time. Every correct answer counts; skipped questions score nothing."],
      ["What you'll be asked", "Questions cover chemistry, biology, physics, astronomy, and earth science — from everyday facts to expert-level detail."],
      ["Daily challenge and leaderboards", "The daily Science Quiz gives everyone the same questions each day. Completed games feed the Science Quiz leaderboard."],
      ["Play as a guest or save progress", "Start a quiz without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/quiz-challenge", "Play today's quiz challenges"],
      ["/leaderboard/science-quiz/", "View the Science Quiz leaderboard"],
      ["/quiz/maths", "Try the Maths Quiz"],
      ["/quiz/gk", "Try the GK Quiz"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/quiz/maths",
    title: "Maths Quiz Online Free | Timed Mental Maths",
    description:
      "Play the free Maths Quiz with four levels — Easy (5 questions) to Expert (12 questions). Timed arithmetic, algebra, geometry, and number-pattern questions.",
    heading: "Maths Quiz Online Free",
    intro:
      "Sharpen your mental maths with timed multiple-choice questions across four levels. Fast, accurate answers earn the most points.",
    sections: [
      ["Four levels of difficulty", "Easy asks 5 questions in 2 minutes, Medium 8 in 3 minutes, Hard 10 in 4 minutes, and Expert 12 in 5 minutes. Higher levels have bigger point bases."],
      ["How scoring works", "Points combine a level base with your accuracy and a speed bonus for finishing under the par time."],
      ["What you'll be asked", "Questions range from basic arithmetic and times tables through percentages, algebra, and geometry to quadratics, logarithms, and probability."],
      ["Daily challenge and leaderboards", "The daily Maths Quiz gives everyone the same questions each day. Completed games feed the Maths Quiz leaderboard."],
      ["Play as a guest or save progress", "Start a quiz without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/quiz-challenge", "Play today's quiz challenges"],
      ["/leaderboard/maths-quiz/", "View the Maths Quiz leaderboard"],
      ["/quiz/science", "Try the Science Quiz"],
      ["/quiz/gk", "Try the GK Quiz"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/quiz/gk",
    title: "GK Quiz Online Free | General Knowledge Trivia",
    description:
      "Play the free General Knowledge Quiz with four levels — Easy (5 questions) to Expert (12 questions). Timed trivia on countries, history, sports, and world facts.",
    heading: "GK Quiz Online Free",
    intro:
      "How much do you know about the world? Take the timed General Knowledge Quiz across four levels and test yourself against the clock.",
    sections: [
      ["Four levels of difficulty", "Easy asks 5 questions in 2 minutes, Medium 8 in 3 minutes, Hard 10 in 4 minutes, and Expert 12 in 5 minutes. Higher levels have bigger point bases."],
      ["How scoring works", "Points combine a level base with your accuracy and a speed bonus for finishing under the par time."],
      ["What you'll be asked", "Questions cover capitals, currencies, history, sports, science, and world records — from common facts to expert-level trivia."],
      ["Daily challenge and leaderboards", "The daily GK Quiz gives everyone the same questions each day. Completed games feed the GK Quiz leaderboard."],
      ["Play as a guest or save progress", "Start a quiz without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/quiz-challenge", "Play today's quiz challenges"],
      ["/leaderboard/gk-quiz/", "View the GK Quiz leaderboard"],
      ["/quiz/science", "Try the Science Quiz"],
      ["/quiz/maths", "Try the Maths Quiz"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/quiz-challenge",
    title: "Daily Quiz Challenges | Science, Maths & GK | Play Brain Games . Online",
    description:
      "Play today's shared Science, Maths, and GK quizzes. Everyone gets the same questions and level each day — compare your score on the leaderboard.",
    heading: "Daily Quiz Challenges",
    intro:
      "Three daily quizzes — Science, Maths, and GK — each give every player the same questions and difficulty level each day, refreshed at 00:00 UTC.",
    sections: [
      ["One shared quiz per subject", "Each day picks a fixed level and question set per subject, so every player answers identical questions."],
      ["Score by accuracy and speed", "Points combine the level base with your accuracy and a speed bonus, so a fast, clean run ranks highest."],
      ["Compare with other players", "Each subject has its own daily leaderboard and all-time board, plus head-to-head quiz challenges against friends."],
    ],
    links: [
      ["/quiz/science", "Play the Science Quiz"],
      ["/quiz/maths", "Play the Maths Quiz"],
      ["/quiz/gk", "Play the GK Quiz"],
      ["/leaderboard", "View the leaderboards"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/leaderboard/minesweeper",
    title: "Minesweeper Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Minesweeper scores across Beginner, Easy, Medium, and Hard boards.",
    heading: "Minesweeper Leaderboard",
    intro:
      "See the players with the highest combined points across completed Minesweeper games of every board size.",
    sections: [
      ["Scores across every board", "Points from completed Beginner, Easy, Medium, and Hard games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/minesweeper", "Play Minesweeper"],
      ["/minesweeper-challenge", "Try today's challenge"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/slide-puzzle",
    title: "Slide Puzzle Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Slide Puzzle scores across 2×2, 3×3, 4×4, and 5×5 boards.",
    heading: "Slide Puzzle Leaderboard",
    intro:
      "See the players with the highest combined points across completed Slide Puzzle games of every board size.",
    sections: [
      ["Scores across every board", "Points from completed 2×2, 3×3, 4×4, and 5×5 games count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/slide-puzzle", "Play Slide Puzzle"],
      ["/slide-puzzle-challenge", "Try today's challenge"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/rubiks",
    title: "Play Rubik's Cube Online Free | 2x2, 3x3, Pyraminx & 4x4",
    description:
      "Solve the Rubik's Cube, Pocket Cube (2x2), Pyraminx, and Rubik's Revenge (4x4) online. Timed solves, move counts, daily challenges, and duels.",
    heading: "Rubik's Cube Online Free",
    intro:
      "Twist the layers, restore the colours, and beat the clock. Choose your puzzle, scramble, and start solving - points reward fast, efficient solves.",
    sections: [
      ["Four puzzles", "The Pocket Cube (2x2) is a quick warm-up, the classic Rubik's Cube (3x3) is the original, the Pyraminx is a tetrahedral twist, and the Rubik's Revenge (4x4) doubles the layers."],
      ["How scoring works", "Points scale with puzzle size and reward finishing under the par time with few moves. Every solve earns XP and gems."],
      ["Daily challenge and duels", "A new puzzle drops daily at 00:00 UTC for everyone to race, and you can challenge friends to solve the same scramble from the Challenges page."],
      ["Play as a guest or save progress", "Start solving without an account. Optional Google sign-in connects your results, stats, and streaks to a profile across devices."],
    ],
    links: [
      ["/leaderboard/rubiks/", "View the Rubik's Cube leaderboard"],
      ["/challenges", "Challenge another player"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/leaderboard/rubiks",
    title: "Rubik's Cube Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Rubik's Cube points across 2x2, 3x3, Pyraminx, and 4x4 puzzles.",
    heading: "Rubik's Cube Leaderboard",
    intro:
      "See the players with the highest combined points across completed Rubik's Cube games of every puzzle type.",
    sections: [
      ["Scores across every puzzle", "Points from completed 2x2, 3x3, Pyraminx, and 4x4 solves count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/rubiks", "Play Rubik's Cube"],
      ["/challenges", "Challenge another player"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/science-quiz",
    title: "Science Quiz Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Science Quiz scores across Easy, Medium, Hard, and Expert levels.",
    heading: "Science Quiz Leaderboard",
    intro:
      "See the players with the highest combined points across completed Science Quiz games of every level.",
    sections: [
      ["Scores across every level", "Points from completed Easy, Medium, Hard, and Expert quizzes count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/quiz/science", "Play the Science Quiz"],
      ["/quiz/maths", "Try the Maths Quiz"],
      ["/quiz/gk", "Try the GK Quiz"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/maths-quiz",
    title: "Maths Quiz Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time Maths Quiz scores across Easy, Medium, Hard, and Expert levels.",
    heading: "Maths Quiz Leaderboard",
    intro:
      "See the players with the highest combined points across completed Maths Quiz games of every level.",
    sections: [
      ["Scores across every level", "Points from completed Easy, Medium, Hard, and Expert quizzes count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/quiz/maths", "Play the Maths Quiz"],
      ["/quiz/science", "Try the Science Quiz"],
      ["/quiz/gk", "Try the GK Quiz"],
    ],
    schemaType: "CollectionPage",
  },
  {
    route: "/leaderboard/gk-quiz",
    title: "GK Quiz Leaderboard | Play Brain Games . Online",
    description:
      "Compare all-time GK Quiz scores across Easy, Medium, Hard, and Expert levels.",
    heading: "GK Quiz Leaderboard",
    intro:
      "See the players with the highest combined points across completed GK Quiz games of every level.",
    sections: [
      ["Scores across every level", "Points from completed Easy, Medium, Hard, and Expert quizzes count toward this all-time board."],
      ["Compare all games", "The all-games leaderboard also includes every other game's scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/quiz/gk", "Play the GK Quiz"],
      ["/quiz/science", "Try the Science Quiz"],
      ["/quiz/maths", "Try the Maths Quiz"],
    ],
    schemaType: "CollectionPage",
  },
  ...sudokuBookmarkPages,
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceOnce(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`Could not find ${label} in the Vite output`);
  }
  return source.replace(pattern, replacement);
}

function replaceMeta(source, attribute, key, content) {
  const keyPattern = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tagPattern = new RegExp(
    `<meta(?=[^>]*\\b${attribute}="${keyPattern}"(?=\\s|\\/?>))[^>]*>`,
    "i",
  );
  const tag = source.match(tagPattern)?.[0];
  if (!tag) throw new Error(`Could not find ${attribute}=${key} in the Vite output`);

  const contentPattern = /content="[^"]*"/i;
  if (!contentPattern.test(tag)) {
    throw new Error(`Meta tag ${attribute}=${key} has no content attribute`);
  }
  const updatedTag = tag.replace(contentPattern, `content="${escapeHtml(content)}"`);
  return source.replace(tagPattern, updatedTag);
}

function buildStructuredData(page, url) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": page.schemaType,
    name: page.heading,
    headline: page.heading,
    url,
    description: page.description,
    inLanguage: "en",
    ...(page.schemaType === "WebApplication"
      ? {
          applicationCategory: "GameApplication",
          operatingSystem: "Web",
          isAccessibleForFree: true,
        }
      : {}),
    ...(page.schemaType === "Article"
      ? { author: { "@type": "Organization", name: siteName } }
      : {}),
  });
}

function buildStaticContent(page) {
  const sections = page.sections
    .map(
      ([heading, text]) => `
        <section class="rounded-2xl border border-border bg-card p-5">
          <h2 class="text-lg font-semibold text-foreground">${escapeHtml(heading)}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">${escapeHtml(text)}</p>
        </section>`,
    )
    .join("");
  const links = page.links
    .map(
      ([href, label]) => {
        const publicHref = href === "/" || href.endsWith("/") ? href : `${href}/`;
        return `<a class="font-semibold text-primary underline-offset-2 hover:underline" href="${publicHref}">${escapeHtml(label)}</a>`;
      },
    )
    .join('<span aria-hidden="true" class="text-muted-foreground">·</span>');
  const cta = page.cta
    ? `
      <section class="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-5 text-center">
        <h2 class="text-lg font-semibold text-foreground">Ready to challenge someone?</h2>
        <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(page.cta.description)}</p>
        <a class="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="${page.cta.href}">${escapeHtml(page.cta.label)}</a>
      </section>`
    : "";

  return `
    <main class="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6" aria-label="${escapeHtml(page.heading)}">
      <header class="rounded-2xl border border-border bg-card px-5 py-6 sm:px-7">
        <p class="text-sm font-semibold text-primary">${escapeHtml(siteName)}</p>
        <h1 class="mt-2 text-3xl font-serif font-bold tracking-tight sm:text-4xl">${escapeHtml(page.heading)}</h1>
        <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">${escapeHtml(page.intro)}</p>
      </header>
      <div class="grid gap-4 sm:grid-cols-2">${sections}</div>
      ${cta}
      <nav class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm" aria-label="Related pages">
        ${links}
      </nav>
    </main>`;
}

async function prerender() {
  let template = await readFile(sourcePath, "utf8");

  for (const page of publicPages) {
    const publicRoute =
      page.route === "/" || page.route.endsWith("/") ? page.route : `${page.route}/`;
    const url = `${siteUrl}${publicRoute}`;
    let html = template;
    html = replaceOnce(html, /<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`, "title");
    html = replaceMeta(html, "name", "description", page.description);
    html = replaceMeta(html, "property", "og:title", page.title);
    html = replaceMeta(html, "property", "og:description", page.description);
    html = replaceMeta(html, "property", "og:url", url);
    html = replaceMeta(html, "name", "twitter:title", page.title);
    html = replaceMeta(html, "name", "twitter:description", page.description);
    html = replaceOnce(
      html,
      /<link rel="canonical" href="[^"]*"\s*\/>/i,
      `<link rel="canonical" href="${url}" />`,
      "canonical link",
    );
    html = replaceOnce(
      html,
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${buildStructuredData(page, url)}</script>`,
      "structured data",
    );
    html = replaceOnce(
      html,
      /<div id="root"><\/div>/i,
      `<div id="root">${buildStaticContent(page)}<noscript><p>JavaScript is required to play the games and use interactive features.</p></noscript></div>`,
      "root mount",
    );

    const outputPath =
      page.route === "/"
        ? sourcePath
        : path.join(outputDirectory, page.route.slice(1), "index.html");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages
  .map((page) => {
    const publicRoute =
      page.route === "/" || page.route.endsWith("/") ? page.route : `${page.route}/`;
    return `  <url>\n    <loc>${siteUrl}${publicRoute}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  })
  .join("\n")}
</urlset>
`;
  await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);

  console.log(`Prerendered ${publicPages.length} public routes to ${outputDirectory}`);
}

await prerender();
