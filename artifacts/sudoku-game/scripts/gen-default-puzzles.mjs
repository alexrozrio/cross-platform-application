#!/usr/bin/env node
// Generates default offline puzzles for every gridSize × difficulty combination.
// Run: node artifacts/sudoku-game/scripts/gen-default-puzzles.mjs
// Output: artifacts/sudoku-game/src/lib/default-puzzles.ts

import { writeFileSync } from 'fs';

// ── Helpers ──────────────────────────────────────────────────────────────────
function encodeCell(n) {
  if (n === 0) return '0';
  if (n <= 9) return n.toString();
  return String.fromCharCode(87 + n); // 10→'a' … 16→'g'
}
function encodeGrid(g) { return g.map(encodeCell).join(''); }

const CLUES = {
  3:  { easy: 8,   medium: 7,   hard: 6,   expert: 5   },
  4:  { easy: 14,  medium: 11,  hard: 8,   expert: 6   },
  6:  { easy: 24,  medium: 18,  hard: 14,  expert: 10  },
  9:  { easy: 50,  medium: 38,  hard: 28,  expert: 22  },
  16: { easy: 196, medium: 160, hard: 128, expert: 100 },
};
function clues(size, diff) { return (CLUES[size] ?? CLUES[9])[diff] ?? CLUES[9].medium; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── 3×3 ──────────────────────────────────────────────────────────────────────
function solve3(g) {
  const e = g.indexOf(0); if (e === -1) return true;
  for (const n of shuffle([1,2,3])) {
    const r = Math.floor(e/3), c = e%3;
    let ok = true;
    for (let i = 0; i < 3; i++) if (g[r*3+i]===n || g[i*3+c]===n) { ok=false; break; }
    if (ok) { g[e]=n; if (solve3(g)) return true; g[e]=0; }
  }
  return false;
}
function countSol3(g, lim=2) {
  const e = g.indexOf(0); if (e === -1) return 1;
  let count=0; const r=Math.floor(e/3), c=e%3;
  for (let n=1;n<=3;n++) {
    let ok=true; for (let i=0;i<3;i++) if(g[r*3+i]===n||g[i*3+c]===n){ok=false;break;}
    if(ok){g[e]=n;count+=countSol3(g,lim);g[e]=0;if(count>=lim)return count;}
  }
  return count;
}
function gen3(diff) {
  const sol=new Array(9).fill(0); solve3(sol);
  const puzzle=[...sol]; const pos=shuffle(Array.from({length:9},(_,i)=>i));
  const need=clues(3,diff); let removed=0;
  for (const p of pos) {
    if (removed>=9-need) break;
    const bk=puzzle[p]; puzzle[p]=0;
    if(countSol3([...puzzle])===1){removed++;}else{puzzle[p]=bk;}
  }
  return { grid: puzzle.join(''), solution: sol.join('') };
}

// ── 4×4 ──────────────────────────────────────────────────────────────────────
function isV4(g,pos,n){
  const r=Math.floor(pos/4),c=pos%4,br=Math.floor(r/2)*2,bc=Math.floor(c/2)*2;
  for(let i=0;i<4;i++)if(g[r*4+i]===n||g[i*4+c]===n)return false;
  for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+2;cc++)if(g[rr*4+cc]===n)return false;
  return true;
}
function solve4(g){
  const e=g.indexOf(0);if(e===-1)return true;
  for(const n of shuffle([1,2,3,4])){if(isV4(g,e,n)){g[e]=n;if(solve4(g))return true;g[e]=0;}}
  return false;
}
function countSol4(g,lim=2){
  const e=g.indexOf(0);if(e===-1)return 1;
  let c=0;
  for(let n=1;n<=4;n++){if(isV4(g,e,n)){g[e]=n;c+=countSol4(g,lim);g[e]=0;if(c>=lim)return c;}}
  return c;
}
function gen4(diff){
  const sol=new Array(16).fill(0);solve4(sol);
  const puzzle=[...sol];const pos=shuffle(Array.from({length:16},(_,i)=>i));
  const need=clues(4,diff);let removed=0;
  for(const p of pos){
    if(removed>=16-need)break;
    const bk=puzzle[p];puzzle[p]=0;
    if(countSol4([...puzzle])===1){removed++;}else{puzzle[p]=bk;}
  }
  return{grid:puzzle.join(''),solution:sol.join('')};
}

// ── 6×6 ──────────────────────────────────────────────────────────────────────
function isV6(g,pos,n){
  const r=Math.floor(pos/6),c=pos%6,br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;
  for(let i=0;i<6;i++)if(g[r*6+i]===n||g[i*6+c]===n)return false;
  for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)if(g[rr*6+cc]===n)return false;
  return true;
}
function solve6(g){
  const e=g.indexOf(0);if(e===-1)return true;
  for(const n of shuffle([1,2,3,4,5,6])){if(isV6(g,e,n)){g[e]=n;if(solve6(g))return true;g[e]=0;}}
  return false;
}
function countSol6(g,lim=2){
  const e=g.indexOf(0);if(e===-1)return 1;
  let c=0;
  for(let n=1;n<=6;n++){if(isV6(g,e,n)){g[e]=n;c+=countSol6(g,lim);g[e]=0;if(c>=lim)return c;}}
  return c;
}
function gen6(diff){
  const sol=new Array(36).fill(0);solve6(sol);
  const puzzle=[...sol];const pos=shuffle(Array.from({length:36},(_,i)=>i));
  const need=clues(6,diff);let removed=0;
  for(const p of pos){
    if(removed>=36-need)break;
    const bk=puzzle[p];puzzle[p]=0;
    if(countSol6([...puzzle])===1){removed++;}else{puzzle[p]=bk;}
  }
  return{grid:puzzle.join(''),solution:sol.join('')};
}

// ── 9×9 ──────────────────────────────────────────────────────────────────────
function isV9(g,pos,n){
  const r=Math.floor(pos/9),c=pos%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
  for(let i=0;i<9;i++)if(g[r*9+i]===n||g[i*9+c]===n)return false;
  for(let rr=br;rr<br+3;rr++)for(let cc=bc;cc<bc+3;cc++)if(g[rr*9+cc]===n)return false;
  return true;
}
function solve9(g){
  const e=g.indexOf(0);if(e===-1)return true;
  for(const n of shuffle([1,2,3,4,5,6,7,8,9])){if(isV9(g,e,n)){g[e]=n;if(solve9(g))return true;g[e]=0;}}
  return false;
}
function countSol9(g,lim=2){
  const e=g.indexOf(0);if(e===-1)return 1;
  let c=0;
  for(let n=1;n<=9;n++){if(isV9(g,e,n)){g[e]=n;c+=countSol9(g,lim);g[e]=0;if(c>=lim)return c;}}
  return c;
}
function gen9(diff){
  const sol=new Array(81).fill(0);solve9(sol);
  const puzzle=[...sol];const pos=shuffle(Array.from({length:81},(_,i)=>i));
  const need=clues(9,diff);let removed=0;
  for(const p of pos){
    if(removed>=81-need)break;
    const bk=puzzle[p];puzzle[p]=0;
    if(countSol9([...puzzle])===1){removed++;}else{puzzle[p]=bk;}
  }
  return{grid:puzzle.join(''),solution:sol.join('')};
}

// ── 16×16 ─────────────────────────────────────────────────────────────────────
function isV16(g,pos,n){
  const r=Math.floor(pos/16),c=pos%16,br=Math.floor(r/4)*4,bc=Math.floor(c/4)*4;
  for(let i=0;i<16;i++)if(g[r*16+i]===n||g[i*16+c]===n)return false;
  for(let rr=br;rr<br+4;rr++)for(let cc=bc;cc<bc+4;cc++)if(g[rr*16+cc]===n)return false;
  return true;
}
function gen16Solution(){
  // Deterministic seed then shuffle — faster than full backtracking
  const base=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  const g=new Array(256).fill(0);
  // Fill with Latin-square pattern first
  for(let r=0;r<16;r++){
    const blockRow=Math.floor(r/4);
    const innerRow=r%4;
    for(let c=0;c<16;c++){
      const blockCol=Math.floor(c/4);
      const innerCol=c%4;
      g[r*16+c]=((blockRow*4+blockCol+innerRow*4+innerCol)%16)+1;
    }
  }
  // Shuffle rows within bands, shuffle cols within bands, shuffle bands
  const shuffleRows=()=>{
    for(let band=0;band<4;band++){
      const rows=shuffle([0,1,2,3].map(i=>band*4+i));
      const tmp=g.slice(band*64,(band+1)*64);
      for(let i=0;i<4;i++)for(let c=0;c<16;c++)g[(band*4+i)*16+c]=tmp[rows[i]%4*16+c];
    }
  };
  shuffleRows();
  return g;
}
function gen16(diff){
  const sol=gen16Solution();
  const puzzle=[...sol];
  const pos=shuffle(Array.from({length:256},(_,i)=>i));
  const need=clues(16,diff);let removed=0;
  for(const p of pos){
    if(removed>=256-need)break;
    puzzle[p]=0;removed++;
  }
  return{grid:encodeGrid(puzzle),solution:encodeGrid(sol)};
}

// ── Generate bank ─────────────────────────────────────────────────────────────
const SIZES=[3,4,6,9,16];
const DIFFS=['easy','medium','hard','expert'];
const COUNT_PER=5; // 5 puzzles per combination

const bank = {};
for (const size of SIZES) {
  bank[size] = {};
  for (const diff of DIFFS) {
    console.log(`Generating ${COUNT_PER} × ${size}×${size} ${diff}...`);
    bank[size][diff] = [];
    let attempts = 0;
    while (bank[size][diff].length < COUNT_PER && attempts < COUNT_PER * 10) {
      attempts++;
      try {
        let p;
        if (size===3) p=gen3(diff);
        else if (size===4) p=gen4(diff);
        else if (size===6) p=gen6(diff);
        else if (size===16) p=gen16(diff);
        else p=gen9(diff);
        bank[size][diff].push({ grid: p.grid, solution: p.solution, gridSize: size, difficulty: diff });
      } catch(e) {
        console.error(`  attempt ${attempts} failed:`, e.message);
      }
    }
    console.log(`  → got ${bank[size][diff].length} puzzles`);
  }
}

// ── Write TypeScript file ─────────────────────────────────────────────────────
const ts = `// AUTO-GENERATED — do not edit by hand.
// Re-generate: node artifacts/sudoku-game/scripts/gen-default-puzzles.mjs
//
// Pre-built puzzle bank for every gridSize × difficulty combination.
// Used as an instant fallback so the game starts immediately even when
// the API server is unreachable.

export interface DefaultPuzzle {
  grid: string;
  solution: string;
  gridSize: number;
  difficulty: string;
}

// bank[gridSize][difficulty] = array of puzzles
export const DEFAULT_PUZZLES: Record<number, Record<string, DefaultPuzzle[]>> = ${JSON.stringify(bank, null, 2)};

/** Pick a random default puzzle, or null if none available for this combo. */
export function pickDefaultPuzzle(gridSize: number, difficulty: string): DefaultPuzzle | null {
  const pool = DEFAULT_PUZZLES[gridSize]?.[difficulty];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
`;

writeFileSync('artifacts/sudoku-game/src/lib/default-puzzles.ts', ts);
console.log('\n✅ Written to artifacts/sudoku-game/src/lib/default-puzzles.ts');
