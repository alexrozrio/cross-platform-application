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
    title: "Free Sudoku & Memory Match Games Online | Play Brain Games . Online",
    description:
      "Play free online Sudoku and Memory Match games for all ages. Choose multiple grids, difficulty levels, daily challenges, themes, and guest play.",
    heading: "Free Sudoku & Memory Match Games Online",
    intro:
      "Play free browser-based Sudoku and Memory Match puzzles at your own pace. Choose a quick beginner board or a harder challenge, then keep practicing without an account.",
    sections: [
      ["Sudoku puzzles for every level", "Solve 3×3, 4×4, 6×6, 9×9, or 16×16 boards with easy, medium, hard, and expert difficulty options."],
      ["Memory Match card games", "Find matching pairs on boards from a quick 2×4 warm-up to a demanding 8×8 memory challenge."],
      ["Daily challenges and progress", "Return for a shared daily Sudoku puzzle, leaderboards, themes, optional sign-in, and personal statistics."],
    ],
    links: [
      ["/sudoku", "Play Sudoku online"],
      ["/memory", "Play Memory Match online"],
      ["/guides", "Read the puzzle guides"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/guides",
    title: "Puzzle Guides: Sudoku & Memory Match | Play Brain Games . Online",
    description:
      "Learn how to play Sudoku and Memory Match, choose the right board, improve your approach, and understand daily challenges.",
    heading: "Puzzle Guides: Sudoku & Memory Match",
    intro:
      "Learn the rules and build a calmer solving approach with practical guides for Sudoku and Memory Match. Start with the board that fits your experience, then practice at your own pace.",
    sections: [
      ["Sudoku guide", "Use rows, columns, boxes, notes, and elimination to narrow down possibilities before making each move."],
      ["Memory Match guide", "Create a reliable visual memory of the board, reduce unnecessary flips, and improve your time with repeat practice."],
      ["Choose your next challenge", "Play as a guest, return to an unfinished round, or try a daily challenge when you want a shared goal."],
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
      "Play free online Sudoku with 3×3, 4×4, 6×6, 9×9, and 16×16 grids. Choose easy to expert difficulty, use notes and hints, and play as a guest.",
    heading: "Play Sudoku Online Free",
    intro:
      "Choose a Sudoku grid size and difficulty, then solve a fresh puzzle in your browser. No account is required to start playing.",
    sections: [
      ["Multiple Sudoku grid sizes", "Try 3×3 Baby, 4×4 Mini, 6×6 Dual, 9×9 Classic, or 16×16 Pro boards."],
      ["Easy to expert difficulty", "Build confidence with an easier board or test your logic with hard and expert puzzles."],
      ["Helpful ways to practice", "Use notes, hints, themes, and optional progress tracking while you improve your solving routine."],
    ],
    links: [
      ["/guides", "Learn Sudoku strategies"],
      ["/daily-challenge", "Solve today's Sudoku challenge"],
      ["/leaderboard", "View the Sudoku leaderboard"],
    ],
    schemaType: "WebApplication",
  },
  {
    route: "/memory",
    title: "Play Memory Match Online Free | All Difficulty Levels",
    description:
      "Play a free online Memory Match game with image, number, or letter cards. Match pairs across 2×4 to 8×8 boards and improve your best time.",
    heading: "Play Memory Match Online Free",
    intro:
      "Flip cards, remember their positions, and match every pair. Choose a compact warm-up board or a larger game designed to test your recall.",
    sections: [
      ["Four board sizes", "Play 2×4 Beginner, 4×4 Easy, 4×8 Medium, or 8×8 Hard Memory Match boards."],
      ["Choose your card style", "Use themed images, numbers, or letters to make each round feel different."],
      ["Practice and improve", "Track your flips and elapsed time locally, then try again to beat your best result."],
    ],
    links: [
      ["/guides", "Read the Memory Match guide"],
      ["/memory-challenge", "Try a memory challenge"],
      ["/leaderboard", "View the Memory leaderboard"],
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
    title: "Sudoku & Memory Match Leaderboards | Play Brain Games . Online",
    description:
      "Compare Sudoku and Memory Match scores across weekly, monthly, and all-time leaderboards.",
    heading: "Sudoku & Memory Match Leaderboards",
    intro:
      "Compare puzzle scores across weekly tournaments, monthly tournaments, and all-time boards. See how players perform across Sudoku grids and Memory Match levels.",
    sections: [
      ["Weekly and monthly tournaments", "Follow changing tournament standings and compete for a place near the top."],
      ["All-time Sudoku scores", "Compare points earned across 3×3, 4×4, 6×6, 9×9, and 16×16 Sudoku boards."],
      ["Memory Match rankings", "See how fast and accurately players complete different Memory Match board sizes."],
    ],
    links: [
      ["/sudoku", "Play Sudoku for leaderboard points"],
      ["/memory", "Play Memory Match for leaderboard points"],
      ["/challenges", "Challenge another player"],
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
      "Challenge another player to a Sudoku duel or Memory Match competition. Compare scores, replay finished challenges, and earn gem rewards for wins.",
    sections: [
      ["Sudoku challenges", "Choose a supported Sudoku grid and difficulty, then see who earns the higher score."],
      ["Memory Match duels", "Compete on the same Memory Match board and compare speed, flips, and final points."],
      ["Private invitations", "Sign in to create challenges and share an invitation link with the person you want to play."],
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
      "Learn about Play Brain Games . Online, a family-friendly site for free Sudoku and Memory Match puzzles, daily challenges, themes, and personal stats.",
    heading: "About Play Brain Games . Online",
    intro:
      "Play Brain Games . Online brings together free Sudoku and Memory Match games for first-time solvers, experienced players, and families.",
    sections: [
      ["Sudoku with flexible formats", "Play child-friendly Baby and Mini grids, classic 9×9 puzzles, or pro-level 16×16 boards with number, letter, and image themes."],
      ["Memory Match for quick or long sessions", "Match pairs on boards from a 2×4 warm-up to an 8×8 challenge using the same themed card sets."],
      ["Optional progress features", "Sign in to sync stats, achievements, leaderboards, rewards, and streaks across devices; guest play remains available."],
    ],
    links: [
      ["/sudoku", "Play Sudoku"],
      ["/memory", "Play Memory Match"],
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
      ([href, label]) =>
        `<a class="font-semibold text-primary underline-offset-2 hover:underline" href="${href}">${escapeHtml(label)}</a>`,
    )
    .join('<span aria-hidden="true" class="text-muted-foreground">·</span>');

  return `
    <main class="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6" aria-label="${escapeHtml(page.heading)}">
      <header class="rounded-2xl border border-border bg-card px-5 py-6 sm:px-7">
        <p class="text-sm font-semibold text-primary">${escapeHtml(siteName)}</p>
        <h1 class="mt-2 text-3xl font-serif font-bold tracking-tight sm:text-4xl">${escapeHtml(page.heading)}</h1>
        <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">${escapeHtml(page.intro)}</p>
      </header>
      <div class="grid gap-4 sm:grid-cols-3">${sections}</div>
      <nav class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm" aria-label="Related pages">
        ${links}
      </nav>
    </main>`;
}

async function prerender() {
  let template = await readFile(sourcePath, "utf8");

  for (const page of publicPages) {
    const url = `${siteUrl}${page.route === "/" ? "/" : page.route}`;
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