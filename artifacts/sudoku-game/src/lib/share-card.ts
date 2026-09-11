export interface ShareCardData {
  title: string;
  lines: string[];
  shareText: string;
  shareUrl?: string;
  accent?: string;
  filename?: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLine(line: string, maxCharacters = 34): string[] {
  if (line.length <= maxCharacters) return [line];
  const words = line.split(/\s+/);
  const wrapped: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharacters && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) wrapped.push(current);
  return wrapped;
}

export function buildShareCardSvg(data: ShareCardData): string {
  const accent = data.accent ?? "#f3b63f";
  const lines = data.lines.flatMap((line) => wrapLine(line));
  const lineMarkup = lines
    .map(
      (line, index) =>
        `<text x="540" y="${560 + index * 68}" text-anchor="middle" class="line">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111b33"/>
        <stop offset="100%" stop-color="#253d61"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${escapeXml(accent)}"/>
        <stop offset="100%" stop-color="#f7d47b"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" flood-opacity=".24"/>
      </filter>
      <style>
        .brand { font: 700 32px system-ui, sans-serif; letter-spacing: 1px; fill: #ffffff; }
        .eyebrow { font: 700 22px system-ui, sans-serif; letter-spacing: 5px; fill: ${escapeXml(accent)}; }
        .title { font: 800 68px system-ui, sans-serif; fill: #ffffff; }
        .line { font: 500 34px system-ui, sans-serif; fill: #e8eef8; }
        .footer { font: 600 25px system-ui, sans-serif; fill: #b7c6dc; }
      </style>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" rx="48" fill="url(#bg)"/>
    <circle cx="90" cy="110" r="28" fill="url(#accent)"/>
    <text x="140" y="122" class="brand">PLAY BRAIN GAMES</text>
    <rect x="80" y="195" width="920" height="10" rx="5" fill="url(#accent)"/>
    <text x="540" y="310" text-anchor="middle" class="eyebrow">SHARE YOUR MOMENT</text>
    <text x="540" y="430" text-anchor="middle" class="title">${escapeXml(data.title)}</text>
    <g>${lineMarkup}</g>
    <rect x="120" y="1120" width="840" height="2" fill="#ffffff" opacity=".18"/>
    <text x="540" y="1195" text-anchor="middle" class="footer">Play puzzles. Match cards. Climb the ranks.</text>
    <text x="540" y="1250" text-anchor="middle" class="footer">${escapeXml(typeof window !== "undefined" ? window.location.host : "Play Brain Games")}</text>
  </svg>`;
}

function renderShareCard(data: ShareCardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svg = buildShareCardSvg(data);
    const image = new Image();
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, WIDTH, HEIGHT);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not render share image"));
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load share image"));
    };
    image.src = objectUrl;
  });
}

export async function downloadShareCard(data: ShareCardData): Promise<void> {
  const blob = await renderShareCard(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = data.filename ?? "play-brain-games-share.png";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareOrDownloadShareCard(data: ShareCardData): Promise<"shared" | "downloaded"> {
  const blob = await renderShareCard(data);
  const file = new File([blob], data.filename ?? "play-brain-games-share.png", { type: "image/png" });
  const canShareFile =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    await navigator.share({
      files: [file],
      title: data.title,
      text: data.shareText,
      url: data.shareUrl,
    });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = data.filename ?? "play-brain-games-share.png";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}