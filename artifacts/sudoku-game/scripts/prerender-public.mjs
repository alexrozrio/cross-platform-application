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

const publicPages = [
  {
    route: "/",
    title: "Free Sudoku, Memory Match & Jigsaw Games Online | Play Brain Games . Online",
    description:
      "Play browser-based Sudoku, Memory Match, and Jigsaw with flexible boards, daily challenges, guest play, and optional synced progress.",
    heading: "Free Sudoku, Memory Match & Jigsaw Games Online",
    intro:
      "Choose Sudoku for logic, Memory Match for recall, or Jigsaw to rebuild a picture. All three games can be started as a guest, with board choices for short sessions and larger challenges.",
    sections: [
      ["Choose a Sudoku grid you can reason through", "Baby 3×3, Mini 4×4, and Dual 6×6 boards keep the symbol set compact. Classic 9×9 is the familiar standard, while Pro 16×16 is a longer challenge. Easy, medium, hard, and expert settings change puzzle difficulty independently of board size."],
      ["Use constraints instead of guessing", "A legal placement must fit the row, column, and marked box. Start with a group that has few empty cells, list its missing symbols, and check which candidates remain in each cell. When more than one candidate fits, use notes and revisit the cell after a nearby placement."],
      ["Build a location map in Memory Match", "Turn over two cards at a time. If they match, they stay visible; if not, remember both positions before they turn face-down again. Scanning in a consistent order helps you connect a symbol to a location when you see it later."],
      ["Choose a Memory Match board", "The 2×4 Beginner board has 4 pairs, 4×4 Easy has 8, 8×4 Medium has 16, and 8×8 Hard has 32. A small board is useful for learning the routine; larger boards ask you to remember more locations. Completion time and flips contribute to the result."],
      ["Build a picture in Jigsaw", "Choose a 2×2 or 3×3 board for a smaller puzzle, or a 4×4 or 5×5 board for a larger challenge. Swap or drag pieces into place. Higher levels and larger boards earn more base points, while a fast finish adds a time bonus."],
      ["Change the display without changing the rules", "Sudoku and Memory Match can use numbers, letters, or curated image symbols where those modes are available. Jigsaw uses themed pictures. Themes change the appearance of the board, while each game's rules stay the same."],
      ["Play as a guest or keep progress in a profile", "You can start a game without an account. Optional Google sign-in connects game statistics, achievements, and streaks to a profile so progress can sync across devices."],
      ["Use daily challenges for a shared benchmark", "The daily Sudoku challenge gives players the same 9×9 medium puzzle for that date. Memory Match has daily and weekly challenges, and Jigsaw gives everyone the same picture puzzle each day."],
    ],
    links: [
      ["/sudoku", "Play Sudoku online"],
      ["/memory", "Play Memory Match online"],
      ["/jigsaw", "Play Jigsaw online"],
      ["/jigsaw-challenge", "Try today's Jigsaw puzzle"],
      ["/leaderboard/jigsaw/", "View the Jigsaw leaderboard"],
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
      "Rebuild themed pictures on 2×2, 3×3, 4×4, and 5×5 Jigsaw boards. Choose a level, earn time-based points, and challenge friends.",
    heading: "Jigsaw Picture Puzzles Online",
    intro:
      "Choose a picture, set the board size and level, then place each piece. Complete today's shared puzzle or invite a friend to solve the same image.",
    sections: [
      ["Choose a board for your experience", "2×2 and 3×3 boards offer smaller puzzles. 4×4 and 5×5 boards add more pieces and earn higher base points. The 4 All game mode includes all four sizes."],
      ["Earn points from size, level, and time", "Larger boards and harder levels raise the base score. Finish faster than the target time to earn an additional speed bonus."],
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
      "Play today's shared Jigsaw picture puzzle, earn points for size, level, and time, and compare your result on the daily leaderboard.",
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
    title: "Sudoku, Memory Match & Jigsaw Themes | Play Brain Games . Online",
    description:
      "Personalise Sudoku and Memory Match, and use themed image sets for Jigsaw picture puzzles. Preview styles and unlock selected themes with gems.",
    heading: "Sudoku, Memory Match & Jigsaw Themes",
    intro:
      "Choose a curated colour palette, switch on a system-provided background, and explore font and image-symbol options. Jigsaw uses themed images for its picture puzzles.",
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
    title: "Puzzle Guides: Sudoku & Memory Match | Play Brain Games . Online",
    description:
      "Learn Sudoku and Memory Match with practical strategies, a worked 4×4 Sudoku move, a sample card sequence, and board-size guidance.",
    heading: "Puzzle Guides: Sudoku & Memory Match",
    intro:
      "Use these practical guides to learn the rules, work through a sample move, and choose a board that fits your experience. The examples use the same row, column, box, and card-position ideas you can apply while playing.",
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
        "Play as a guest or save progress",
        "You can start a puzzle without creating an account. Guest play is useful for a quick session; signing in is optional and lets the site associate completed results, rewards, and personal progress with your profile across devices.",
      ],
    ],
    links: [
      ["/sudoku", "Start a Sudoku puzzle"],
      ["/memory", "Start a Memory Match game"],
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
      ["/about", "Learn about both games"],
    ],
    schemaType: "WebApplication",
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
      "Compare Sudoku and Memory Match scores across weekly, monthly, and all-time leaderboards.",
    heading: "All Games Leaderboard",
    intro:
      "Compare combined Sudoku and Memory Match points across weekly tournaments, monthly tournaments, and all-time rankings.",
    sections: [
      ["Weekly and monthly tournaments", "Follow changing tournament standings and compete for a place near the top."],
      ["All-time combined scores", "Completed Sudoku and Memory Match games both contribute points to the all-games ranking."],
      ["Game-specific leaderboards", "Open separate all-time boards to compare Sudoku grid scores or Memory Match level scores."],
    ],
    links: [
      ["/leaderboard/sudoku/", "View all-time Sudoku scores"],
      ["/leaderboard/memory/", "View all-time Memory Match scores"],
      ["/sudoku/", "Play Sudoku for leaderboard points"],
      ["/memory/", "Play Memory Match for leaderboard points"],
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
      ["Compare all games", "The all-games leaderboard also includes Memory Match scores from weekly, monthly, and all-time results."],
    ],
    links: [
      ["/leaderboard/", "View the all-games leaderboard"],
      ["/leaderboard/memory/", "View the Memory Match leaderboard"],
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
      ["Compare all games", "The all-games leaderboard also includes Sudoku scores from weekly, monthly, and all-time results."],
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
    title: "Puzzle Challenges & Duels | Play Brain Games . Online",
    description:
      "Create and join Sudoku and Memory Match challenges, compare scores, and compete with friends.",
    heading: "Puzzle Challenges & Duels",
    intro:
      "Create a Sudoku duel or Memory Match competition without signing in. Share an invitation link, compare scores, and replay finished challenges.",
    sections: [
      ["What challenges are", "A challenge lets two players compete on the same Sudoku puzzle or Memory Match board. Each player completes their own round, then the higher score wins."],
      ["How invitations work", "Create a challenge and share the invitation link with a friend. They can open the link and accept the duel without signing in."],
      ["How scoring works", "Scores reward speed and difficulty while accounting for mistakes, hints, or extra card flips. The winner earns gems; ties reward both players."],
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
    title: "About Play Brain Games . Online | Sudoku & Memory Match",
    description:
      "Learn how Play Brain Games combines practical Sudoku and Memory Match sessions, daily challenges, guest play, optional synced progress, and player support.",
    heading: "About Play Brain Games . Online",
    intro:
      "Play Brain Games . Online brings together two familiar puzzle formats with adjustable boards, practical guides, daily challenges, and guest play.",
    sections: [
      ["Two games, two kinds of attention", "Sudoku is a logic puzzle: each symbol must fit its row, column, and marked box. Memory Match is a recall game: reveal two cards, remember their positions, and use those locations to find pairs."],
      ["Board choices for different experience levels", "Sudoku ranges from small 3×3, 4×4, and 6×6 grids through 9×9 Classic and 16×16 Pro. Memory Match ranges from a 2×4 board with 4 pairs to an 8×8 board with 32 pairs."],
      ["Progress is optional", "Start as a guest without signing in. Google sign-in connects profile statistics, achievements, and streaks so progress can sync across devices. The games remain available without a profile."],
      ["Daily practice and shared results", "The daily Sudoku challenge gives players the same 9×9 medium puzzle for that date. Memory Match has daily and weekly challenges, while leaderboards show recorded results for players who choose to participate."],
      ["Privacy and account control", "The Privacy Policy describes how account and game-progress information is used. The account deletion page explains how to request removal of an account and associated server data."],
    ],
    links: [
      ["/sudoku", "Play Sudoku"],
      ["/memory", "Play Memory Match"],
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
      "Request deletion of your Play Brain Games account and associated Sudoku, Memory Match, and profile data.",
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
      "These terms describe the rules for using Play Brain Games . Online, including its Sudoku and Memory Match games, accounts, challenges, and virtual rewards.",
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

  console.log(`Prerendered ${publicPages.length} public routes to ${outputDirectory}`);
}

await prerender();