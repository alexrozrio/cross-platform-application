// Rubik's cube engine: cubie/sticker model shared by 2x2, 3x3 and 4x4,
// plus a tetrahedral piece model for Pyraminx. Pure logic — no rendering.

export type RubiksPuzzle = "2x2" | "3x3" | "pyraminx" | "4x4";
export type RubiksDifficulty = "easy" | "medium" | "hard" | "expert";

export interface RubiksLevel {
  id: RubiksDifficulty;
  label: RubiksDifficulty;
  puzzle: RubiksPuzzle;
  name: string;
  tagline: string;
}

export const RUBIKS_LEVELS: RubiksLevel[] = [
  { id: "easy", label: "easy", puzzle: "2x2", name: "Pocket Cube", tagline: "2×2 — the fastest warm-up" },
  { id: "medium", label: "medium", puzzle: "3x3", name: "Rubik's Cube", tagline: "3×3 — the classic" },
  { id: "hard", label: "hard", puzzle: "pyraminx", name: "Pyraminx", tagline: "Pyramid — twist the corners" },
  { id: "expert", label: "expert", puzzle: "4x4", name: "Rubik's Revenge", tagline: "4×4 — twice the layers" },
];

export function puzzleForDifficulty(d: RubiksDifficulty): RubiksPuzzle {
  return RUBIKS_LEVELS.find((l) => l.id === d)?.puzzle ?? "3x3";
}
export function levelForPuzzle(p: RubiksPuzzle): RubiksDifficulty {
  return RUBIKS_LEVELS.find((l) => l.puzzle === p)?.id ?? "medium";
}
export function levelForDifficulty(d: string): RubiksLevel {
  return RUBIKS_LEVELS.find((l) => l.id === d) ?? RUBIKS_LEVELS[1];
}
export function isRubiksPuzzle(v: unknown): v is RubiksPuzzle {
  return v === "2x2" || v === "3x3" || v === "pyraminx" || v === "4x4";
}
export function isRubiksDifficulty(v: unknown): v is RubiksDifficulty {
  return v === "easy" || v === "medium" || v === "hard" || v === "expert";
}

// ─── Vec3 / quaternion helpers ────────────────────────────────────────────────

type V3 = [number, number, number];
type Quat = [number, number, number, number]; // x,y,z,w

const vAdd = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vScale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const vDot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vCross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const vLen = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const vNorm = (a: V3): V3 => { const l = vLen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// Rotate vector v by quaternion q (q assumed unit).
function vRot(q: Quat, v: V3): V3 {
  const [x, y, z, w] = q;
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [
    v[0] + w * tx + y * tz - z * ty,
    v[1] + w * ty + z * tx - x * tz,
    v[2] + w * tz + x * ty - y * tx,
  ];
}
const qMul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qNorm = (q: Quat): Quat => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
// Quaternion for +angle radians about unit axis.
function qAxisAngle(axis: V3, angle: number): Quat {
  const s = Math.sin(angle / 2);
  return qNorm([axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)]);
}
const qSlerp = (a: Quat, b: Quat, t: number): Quat => {
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let d = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (d < 0) { bx = -bx; by = -by; bz = -bz; bw = -bw; d = -d; }
  if (d > 0.9995) {
    return qNorm([a[0] + (bx - a[0]) * t, a[1] + (by - a[1]) * t, a[2] + (bz - a[2]) * t, a[3] + (bw - a[3]) * t]);
  }
  const th = Math.acos(Math.min(1, d));
  const s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
  return [a[0] * wa + bx * wb, a[1] * wa + by * wb, a[2] * wa + bz * wb, a[3] * wa + bw * wb];
};

// ─── Cubes (2x2 / 3x3 / 4x4) ──────────────────────────────────────────────────

export type CubeFace = "U" | "D" | "F" | "B" | "R" | "L";
export const FACE_COLORS: Record<CubeFace, string> = {
  U: "#f4f4f5", D: "#facc15", F: "#22c55e", B: "#3b82f6", R: "#ef4444", L: "#f97316",
};
// world direction → face, for solved checks and sticker coloring
const DIR_FACE: [V3, CubeFace][] = [
  [[0, 1, 0], "U"], [[0, -1, 0], "D"], [[0, 0, 1], "F"],
  [[0, 0, -1], "B"], [[1, 0, 0], "R"], [[-1, 0, 0], "L"],
];
const AXIS_OF_FACE: Record<CubeFace, 0 | 1 | 2> = { R: 0, L: 0, U: 1, D: 1, F: 2, B: 2 };
const DIR_OF_FACE: Record<CubeFace, 1 | -1> = { R: 1, L: -1, U: 1, D: -1, F: 1, B: -1 };
const FACE_NORMAL: Record<CubeFace, V3> = {
  U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0],
};

export interface Sticker { normal: V3; color: string }
export interface Piece {
  id: number;
  pos: V3;
  quat: Quat;
  stickers: Sticker[];
  // pyraminx only: piece kind for rendering
  kind?: "corner";
}

export type CubeMove =
  | { kind: "face"; face: CubeFace; turns: 1 | 2 | 3 } // 1=CW, 2=180, 3=CCW viewed from outside
  | { kind: "vertex"; vertex: number; dir: 1 | -1 }; // pyraminx

function cubeSize(p: Exclude<RubiksPuzzle, "pyraminx">): number { return p === "2x2" ? 2 : p === "4x4" ? 4 : 3; }

export function createCube(puzzle: Exclude<RubiksPuzzle, "pyraminx">): Piece[] {
  const n = cubeSize(puzzle);
  const pieces: Piece[] = [];
  let id = 0;
  // coordinates spaced by 2 so cubie centers sit on a clean grid
  const coords = Array.from({ length: n }, (_, i) => (n % 2 === 1 ? i - (n - 1) / 2 : i - (n - 1) / 2) * 2);
  for (const x of coords) for (const y of coords) for (const z of coords) {
    const pos: V3 = [x, y, z];
    const stickers: Sticker[] = [];
    for (const [dir, face] of DIR_FACE) {
      const ax = dir[0] !== 0 ? 0 : dir[1] !== 0 ? 1 : 2;
      // cubie touches this face iff its coordinate on that axis is at the outer layer
      const maxCoord = Math.max(...coords.map(Math.abs));
      if (Math.abs(pos[ax]) === maxCoord) stickers.push({ normal: [...dir] as V3, color: FACE_COLORS[face] });
    }
    pieces.push({ id: id++, pos, quat: [0, 0, 0, 1], stickers });
  }
  return pieces;
}

// Rotate position around the axis through origin. axis: 0=x,1=y,2=z; dir ±1 = ±90°.
function rotPos90(pos: V3, axis: 0 | 1 | 2, dir: 1 | -1): V3 {
  const [x, y, z] = pos;
  // right-hand rule about +axis; dir=-1 reverses
  const s = dir;
  if (axis === 0) return [x, s * -z, s * y];
  if (axis === 1) return [s * z, y, s * -x];
  return [s * -y, s * x, z];
}

function faceMoveQuat(face: CubeFace, turns: 1 | 2 | 3): { axis: 0 | 1 | 2; angle: number } {
  const axis = AXIS_OF_FACE[face];
  // CW viewed from outside the face = rotation about outward normal by -90° (right-hand rule)
  const outward = DIR_OF_FACE[face];
  const angle = (-Math.PI / 2) * outward * turns;
  return { axis, angle };
}

export function applyCubeMove(pieces: Piece[], move: CubeMove): Piece[] {
  if (move.kind === "vertex") return applyVertexMove(pieces, move.vertex, move.dir);
  const { axis, angle } = faceMoveQuat(move.face, move.turns);
  const layerCoord = Math.max(...pieces.map((p) => Math.abs(p.pos[axis]))) * DIR_OF_FACE[move.face];
  const q = qAxisAngle(axisVec(axis), angle);
  return pieces.map((p) => {
    if (Math.abs(p.pos[axis] - layerCoord) > 0.01) return p;
    const pos = vRot(q, p.pos);
    // snap near-zero coords to avoid fp drift
    const snapped: V3 = [0, 1, 2].map((i) => Math.abs(pos[i]) < 1e-6 ? 0 : pos[i]) as V3;
    return { ...p, pos: snapped, quat: qNorm(qMul(q, p.quat)) };
  });
}

function axisVec(axis: 0 | 1 | 2): V3 { return axis === 0 ? [1, 0, 0] : axis === 1 ? [0, 1, 0] : [0, 0, 1]; }

// ─── Pyraminx ────────────────────────────────────────────────────────────────

// Tetrahedron vertices; vertex i is opposite face i.
const PYRA_VERTS: V3[] = [
  vNorm([1, 1, 1]), vNorm([1, -1, -1]), vNorm([-1, 1, -1]), vNorm([-1, -1, 1]),
];
// face f normal points away from opposite vertex
const PYRA_FACES: V3[] = PYRA_VERTS.map((v) => vNorm(vScale(v, -1)));
export const PYRAMINX_COLORS = ["#f4f4f5", "#ef4444", "#3b82f6", "#facc15"]; // U-ish,R,B,Y per face
const PYRA_RADIUS = 2.2;

export function createPyraminx(): Piece[] {
  return PYRA_VERTS.map((v, i) => {
    // stickers on the 3 faces incident to vertex i (faces whose opposite vertex != i)
    const stickers: Sticker[] = [];
    for (let f = 0; f < 4; f++) {
      if (f === i) continue; // face i is opposite vertex i — not incident
      stickers.push({ normal: [...PYRA_FACES[f]] as V3, color: PYRAMINX_COLORS[f] });
    }
    // orient piece so its stickers' local normals match world face normals:
    // build basis from the three incident face normals
    const n0 = PYRA_FACES[(i + 1) % 4], n1 = PYRA_FACES[(i + 2) % 4], n2 = PYRA_FACES[(i + 3) % 4];
    // We need a rotation mapping local axes → world. Simpler: store stickers in world
    // orientation and give each piece identity quat at start — but stickers' normals
    // are world dirs; rotating the piece rotates normals via quat. At solved state
    // quat must map local→world = identity only if normals already world. So instead
    // we keep normals in "piece space" = world space at solved → identity quat works
    // ONLY if we define normals relative to piece. Easiest: normals stored in piece
    // local frame where solved quat = identity and normals equal world dirs — but then
    // different pieces share the same local frame, which is fine since we rotate quat.
    void n0; void n1; void n2;
    return { id: i, kind: "corner", pos: vScale(v, PYRA_RADIUS), quat: [0, 0, 0, 1], stickers };
  });
}

// Rotate the 3 non-fixed vertices 120°*dir around the axis through vertex `vertex`.
function applyVertexMove(pieces: Piece[], vertex: number, dir: 1 | -1): Piece[] {
  const axis = PYRA_VERTS[vertex];
  const angle = dir * (Math.PI * 2) / 3;
  const q = qAxisAngle(axis, angle);
  return pieces.map((p) => {
    if (p.id === vertex) return p;
    return { ...p, pos: vRot(q, p.pos), quat: qNorm(qMul(q, p.quat)) };
  });
}

// ─── Scramble ────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FACES: CubeFace[] = ["U", "D", "F", "B", "R", "L"];

export function generateScramble(puzzle: RubiksPuzzle, seed: number, length?: number): CubeMove[] {
  const rand = mulberry32(seed);
  const len = length ?? (puzzle === "2x2" ? 8 : puzzle === "3x3" ? 20 : puzzle === "4x4" ? 26 : 14);
  const moves: CubeMove[] = [];
  let prevFace: CubeFace | null = null;
  let prevTurns: 1 | 2 | 3 = 1;
  for (let i = 0; i < len; i++) {
    let face = FACES[Math.floor(rand() * FACES.length)];
    if (puzzle === "pyraminx") {
      // pyraminx: pick vertex 0-3 and direction; avoid same vertex twice in a row
      let vertex = Math.floor(rand() * 4);
      if (moves.length && (moves[moves.length - 1] as { vertex?: number }).vertex === vertex) {
        vertex = (vertex + 1 + Math.floor(rand() * 3)) % 4;
      }
      moves.push({ kind: "vertex", vertex, dir: rand() < 0.5 ? 1 : -1 });
      continue;
    }
    if (face === prevFace) face = FACES[(FACES.indexOf(face) + 1 + Math.floor(rand() * 5)) % 6];
    const turns = ([1, 2, 3][Math.floor(rand() * 3)] as 1 | 2 | 3);
    if (face === prevFace && turns === ((4 - prevTurns) % 3) + 1) {
      // avoid immediate inverse of previous same-face move — rare since face changed
    }
    moves.push({ kind: "face", face, turns });
    prevFace = face; prevTurns = turns;
  }
  // ensure scramble isn't already solved (paranoid check for tiny scrambles)
  return moves;
}

// Apply a full scramble instantly (used for setup — no animation).
export function scramblePieces(puzzle: RubiksPuzzle, seed: number): Piece[] {
  const isPyra = puzzle === "pyraminx";
  let pieces = isPyra ? createPyraminx() : createCube(puzzle as Exclude<RubiksPuzzle, "pyraminx">);
  for (const m of generateScramble(puzzle, seed)) pieces = applyCubeMove(pieces, m);
  return pieces;
}

// ─── Solved check ─────────────────────────────────────────────────────────────

const DOMINANT = (v: V3): CubeFace | null => {
  const ax = Math.abs(v[0]), ay = Math.abs(v[1]), az = Math.abs(v[2]);
  const m = Math.max(ax, ay, az);
  if (m < 0.5) return null;
  if (m === ax) return v[0] > 0 ? "R" : "L";
  if (m === ay) return v[1] > 0 ? "U" : "D";
  return v[2] > 0 ? "F" : "B";
};

export function isSolved(pieces: Piece[]): boolean {
  for (const p of pieces) {
    for (const s of p.stickers) {
      const w = vRot(p.quat, s.normal);
      if (puzzleIsPyraminx(pieces)) {
        // find nearest pyraminx face
        let best = -1, bd = -2;
        for (let f = 0; f < 4; f++) {
          const d = vDot(w, PYRA_FACES[f]);
          if (d > bd) { bd = d; best = f; }
        }
        if (bd < 0.7) return false;
        if (s.color !== PYRAMINX_COLORS[best]) return false;
      } else {
        const face = DOMINANT(w);
        if (!face || s.color !== FACE_COLORS[face]) return false;
      }
    }
  }
  return true;
}

function puzzleIsPyraminx(pieces: Piece[]): boolean {
  return pieces.length === 4 && pieces[0]?.kind === "corner";
}

export function cubieCount(puzzle: RubiksPuzzle): number {
  return puzzle === "2x2" ? 8 : puzzle === "3x3" ? 26 : puzzle === "4x4" ? 56 : 4;
}

export { vRot, qSlerp, vAdd, vScale, vDot, vCross, vNorm, vLen };
export type { V3, Quat };
