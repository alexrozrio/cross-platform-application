import React from "react";
import { ThemeIcon, useThemeImageSrc } from "@/components/theme-icons";
import type { OddImageVariant } from "@/lib/odd-images";

type ResolvedOddImage = { src: string; variant: OddImageVariant };

const mutationCache = new Map<string, Promise<ResolvedOddImage>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load odd-image source"));
    image.src = src;
  });
}

function hashSeed(seed: number): number {
  let value = seed >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return value >>> 0;
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D is unavailable");
  return { canvas, context };
}

function drawVariant(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  variant: OddImageVariant,
  width: number,
  height: number,
  seed: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const x = (width - imageWidth) / 2;
  const y = (height - imageHeight) / 2;

  context.save();
  context.clearRect(0, 0, width, height);

  if (variant === "color") {
    context.filter = "hue-rotate(145deg) saturate(1.75) brightness(1.14)";
    context.drawImage(image, x, y, imageWidth, imageHeight);
    context.globalCompositeOperation = "source-atop";
    context.fillStyle = "rgba(14, 165, 233, 0.30)";
    context.fillRect(0, 0, width, height);
  } else if (variant === "flip-horizontal") {
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(image, x, y, imageWidth, imageHeight);
  } else if (variant === "flip-vertical") {
    context.translate(0, height);
    context.scale(1, -1);
    context.drawImage(image, x, y, imageWidth, imageHeight);
  } else if (variant === "rotate-left" || variant === "rotate-right") {
    context.translate(width / 2, height / 2);
    context.rotate(variant === "rotate-left" ? -Math.PI / 2 : Math.PI / 2);
    context.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
  } else if (variant === "missing-part") {
    context.drawImage(image, x, y, imageWidth, imageHeight);
    const mixed = hashSeed(seed);
    const spot = mixed % 4;
    const radius = Math.max(8, Math.min(imageWidth, imageHeight) * 0.16);
    const positions = [
      [imageWidth * 0.34, imageHeight * 0.24],
      [imageWidth * 0.66, imageHeight * 0.24],
      [imageWidth * 0.36, imageHeight * 0.76],
      [imageWidth * 0.64, imageHeight * 0.76],
    ] as const;
    const [localX, localY] = positions[spot];
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.ellipse(x + localX, y + localY, radius * (spot < 2 ? 1.15 : 0.9), radius, spot * 0.7, 0, Math.PI * 2);
    context.fill();
  } else {
    context.drawImage(image, x, y, imageWidth, imageHeight);
  }

  context.restore();
}

function drawOriginal(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
}

function imageDiffers(a: HTMLCanvasElement, b: HTMLCanvasElement): boolean {
  const aData = a.getContext("2d")?.getImageData(0, 0, a.width, a.height).data;
  const bData = b.getContext("2d")?.getImageData(0, 0, b.width, b.height).data;
  if (!aData || !bData || aData.length !== bData.length) return true;
  let different = 0;
  const step = 16;
  for (let index = 0; index < aData.length; index += step) {
    const delta = Math.max(
      Math.abs(aData[index] - bData[index]),
      Math.abs(aData[index + 1] - bData[index + 1]),
      Math.abs(aData[index + 2] - bData[index + 2]),
      Math.abs(aData[index + 3] - bData[index + 3]),
    );
    if (delta > 18) different += 1;
    if (different > 24) return true;
  }
  return false;
}

function renderCandidate(image: HTMLImageElement, variant: OddImageVariant, seed: number): ResolvedOddImage | null {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const isRotation = variant === "rotate-left" || variant === "rotate-right";
  const width = isRotation ? Math.max(imageWidth, imageHeight) : imageWidth;
  const height = isRotation ? width : imageHeight;
  const mutated = makeCanvas(width, height);
  drawVariant(mutated.context, image, variant, width, height, seed);

  const original = makeCanvas(width, height);
  drawOriginal(original.context, image, width, height);
  if (variant !== "color" && !imageDiffers(mutated.canvas, original.canvas)) return null;

  return { src: mutated.canvas.toDataURL("image/png"), variant };
}

async function resolveOddImage(src: string, variants: OddImageVariant[], seed: number): Promise<ResolvedOddImage> {
  const candidates = variants.length > 0 ? variants : (["color"] as OddImageVariant[]);
  const image = await loadImage(src);
  for (const variant of candidates) {
    try {
      const resolved = renderCandidate(image, variant, seed);
      if (resolved) return resolved;
    } catch {
      // Try the next mutation if a canvas operation is unavailable for this image.
    }
  }
  const fallback = makeCanvas(image.naturalWidth || image.width, image.naturalHeight || image.height);
  drawVariant(fallback.context, image, "color", fallback.canvas.width, fallback.canvas.height, seed);
  return { src: fallback.canvas.toDataURL("image/png"), variant: "color" };
}

function useResolvedOddImage(src: string, variants: OddImageVariant[], seed: number): ResolvedOddImage | null {
  const key = `${src}|${variants.join(",")}|${seed}`;
  const [state, setState] = React.useState<{ key: string; value: ResolvedOddImage | null }>({ key, value: null });

  React.useEffect(() => {
    let active = true;
    if (!src || variants.length === 0) {
      setState({ key, value: null });
      return () => { active = false; };
    }
    const cached = mutationCache.get(key);
    const promise = cached ?? resolveOddImage(src, variants, seed);
    if (!cached) mutationCache.set(key, promise);
    promise
      .then((value) => { if (active) setState({ key, value }); })
      .catch(() => { if (active) setState({ key, value: null }); });
    return () => { active = false; };
    // The joined key captures every input that can change the mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.value : null;
}

function fallbackStyle(variant: OddImageVariant): React.CSSProperties {
  if (variant === "flip-horizontal") return { transform: "scaleX(-1)" };
  if (variant === "flip-vertical") return { transform: "scaleY(-1)" };
  if (variant === "rotate-left") return { transform: "rotate(-90deg)" };
  if (variant === "rotate-right") return { transform: "rotate(90deg)" };
  return { filter: "hue-rotate(145deg) saturate(1.75) brightness(1.14)" };
}

export function OddImageTile({
  themeId,
  value,
  size,
  variants,
  mutationSeed = 1,
}: {
  themeId: string;
  value: number;
  size: number;
  variants?: OddImageVariant[];
  mutationSeed?: number;
}) {
  const imageSrc = useThemeImageSrc(themeId, value);
  const resolved = useResolvedOddImage(
    typeof imageSrc === "string" ? imageSrc : "",
    variants ?? [],
    mutationSeed,
  );

  if (!variants?.length) {
    return <ThemeIcon themeId={themeId} value={value} size={size} />;
  }

  if (typeof imageSrc === "string" && resolved) {
    return (
      <img
        src={resolved.src}
        alt={`${themeId} odd image`}
        draggable={false}
        style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }}
      />
    );
  }

  const fallbackVariant = variants.includes("color") ? "color" : variants.find((variant) => variant !== "missing-part") ?? "color";
  return (
    <span style={{ display: "inline-flex", ...fallbackStyle(fallbackVariant) }}>
      <ThemeIcon themeId={themeId} value={value} size={size} />
    </span>
  );
}
