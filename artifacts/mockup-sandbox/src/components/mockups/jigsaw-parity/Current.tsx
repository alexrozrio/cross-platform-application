import { useState } from "react";
import { ArrowLeft, Check, Image as ImageIcon, Share2, Sparkles } from "lucide-react";
import "./_group.css";

type GridSize = 2 | 3 | 4 | 5;

const sizes: GridSize[] = [2, 3, 4, 5];
const levels = [
  { value: 1, title: "Guided", copy: "Reference stays beside your puzzle" },
  { value: 2, title: "Recall", copy: "Peek at the picture whenever you need" },
  { value: 3, title: "From memory", copy: "No reference image during play" },
];

function Picture({ number, className = "" }: { number: number; className?: string }) {
  const src = `${window.location.protocol}//${window.location.hostname}:19093/themes/adventure/${number}.png`;
  return <img src={src} alt={`Puzzle picture ${number}`} className={className} />;
}

export function Current() {
  const [gridSize, setGridSize] = useState<GridSize>(2);
  const [level, setLevel] = useState(1);
  const [imageKey, setImageKey] = useState(1);

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-8">
      <header className="mb-8 flex items-center justify-between">
        <a href="#" className="inline-flex items-center gap-2 rounded-full border border-[#d6ded1] bg-[#f7f5ed] px-4 py-2 text-sm font-semibold text-[#52645d]">
          <ArrowLeft size={16} /> All games
        </a>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#82918a]">Play Brain Games . Online</p>
          <p className="font-mono text-xs text-[#65766f]">PICTURE STUDIO / 01</p>
        </div>
      </header>
      <section className="grid gap-6 lg:grid-cols-[1fr_.88fr]">
        <div className="rounded-2xl border border-[#d5ded2] bg-[#f7f5ed] p-5 shadow-sm sm:p-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#bc6d43]">Jigsaw atelier</p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            A picture, in<br /><em className="font-normal text-[#c8754b]">pieces.</em>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#62746d]">Choose a scene, set your challenge, then bring every little fragment home.</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setGridSize(size)}
                className={`rounded-xl border p-3 text-left transition ${gridSize === size ? "border-[#c8754b] bg-[#f4e5d7]" : "border-[#d9dfd4] bg-white"}`}
              >
                <span className="block font-serif text-2xl">{size}×{size}</span>
                <span className="mt-1 block text-xs text-[#76857e]">{size * size} picture pieces</span>
              </button>
            ))}
          </div>
          <div className="mt-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#82918a]">Choose your pace</p>
            <div className="space-y-2">
              {levels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLevel(item.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${level === item.value ? "border-[#c8754b] bg-[#f4e5d7]" : "border-[#d9dfd4] bg-white"}`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#c8754b] text-xs font-bold text-white">{item.value}</span>
                  <span className="flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="block text-xs text-[#7c8982]">{item.copy}</span></span>
                  {level === item.value && <Check size={17} className="text-[#bd6d43]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#d5ded2] bg-[#e9eee5] p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#82918a]">Your picture</p><p className="mt-1 font-serif text-2xl">Adventure collection</p></div>
            <ImageIcon className="text-[#bc754d]" size={21} />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border-4 border-[#f7f5ed] bg-[#d1dfd5]">
            <Picture number={imageKey} className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-60">
              {[0, 1, 2, 3].map((n) => <div key={n} className="border border-white/75" />)}
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-[#203b38]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white">Artwork {imageKey}</span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Choose image">
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <button key={number} type="button" onClick={() => setImageKey(number)} aria-label={`Choose picture ${number}`} className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 ${imageKey === number ? "border-[#c8754b]" : "border-[#f7f5ed] opacity-75"}`}>
                <Picture number={number} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244844] px-5 py-3.5 text-sm font-bold text-white">
            <Sparkles size={17} /> Start building
          </button>
          <button type="button" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd6ca] bg-[#f7f5ed] px-5 py-3 text-sm font-semibold text-[#52645d]">
            <Share2 size={16} /> Challenge a friend
          </button>
          <p className="mt-3 text-center text-xs text-[#82918a]">Plays offline. Your score syncs when available.</p>
        </div>
      </section>
    </main>
  );
}
