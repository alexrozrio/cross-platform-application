import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import * as THREE from "three";
import {
  applyCubeMove,
  createCube,
  createPyraminx,
  isSolved,
  qAxisAngle,
  qMul,
  scramblePieces,
  vRot,
  type CubeFace,
  type CubeMove,
  type Piece,
  type Quat,
  type RubiksPuzzle,
  type V3,
} from "@/lib/rubiks";

const CUBIE = 1.86;
const STICKER = 0.84;
const PLASTIC = "#1f2937";
const PYRA_TETRA_R = 1.45;
const PYRA_STICKER_R = 0.5;
const MOVE_DUR = 0.22;

const qToThree = (q: Quat) => new THREE.Quaternion(q[0], q[1], q[2], q[3]);
const vToThree = (v: V3) => new THREE.Vector3(v[0], v[1], v[2]);

function quatFromTo(a: V3, b: V3): Quat {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  if (d > 0.9999) return [0, 0, 0, 1];
  const cx = a[1] * b[2] - a[2] * b[1];
  const cy = a[2] * b[0] - a[0] * b[2];
  const cz = a[0] * b[1] - a[1] * b[0];
  const s = Math.sqrt((1 + d) * 2);
  return [cx / s, cy / s, cz / s, s * 0.5];
}

function dominantDir(v: THREE.Vector3): CubeFace | null {
  const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
  const m = Math.max(ax, ay, az);
  if (m < 0.5) return null;
  if (m === ax) return v.x > 0 ? "R" : "L";
  if (m === ay) return v.y > 0 ? "U" : "D";
  return v.z > 0 ? "F" : "B";
}

interface AnimState {
  from: { pos: V3; quat: Quat }[];
  to: Piece[];
  t0: number;
}

interface DragState {
  normal: THREE.Vector3;
  t1: THREE.Vector3;
  t2: THREE.Vector3;
  planeN: THREE.Vector3;
  ba: THREE.Vector3;
  bb: THREE.Vector3;
  rax: THREE.Vector3 | null;
  axisIdx: number;
  signAxis: number;
  coord: number;
  slice: number[];
  base: { pos: V3; quat: Quat }[];
  vertex: number;
  grabbed: number;
  startHit: THREE.Vector3;
  startAngle: number;
  accum: number;
  angle: number;
  moved: boolean;
  downX: number;
  downY: number;
}

function AnimDriver({
  anim,
  groupRefs,
  onDone,
}: {
  anim: React.MutableRefObject<AnimState | null>;
  groupRefs: React.MutableRefObject<(THREE.Group | null)[]>;
  onDone: () => void;
}) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useFrame(() => {
    const a = anim.current;
    if (!a) return;
    const t = Math.min(1, (performance.now() - a.t0) / (MOVE_DUR * 1000));
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    a.to.forEach((p, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const f = a.from[i];
      g.position.set(
        f.pos[0] + (p.pos[0] - f.pos[0]) * e,
        f.pos[1] + (p.pos[1] - f.pos[1]) * e,
        f.pos[2] + (p.pos[2] - f.pos[2]) * e,
      );
      q0.set(f.quat[0], f.quat[1], f.quat[2], f.quat[3]);
      q1.set(p.quat[0], p.quat[1], p.quat[2], p.quat[3]);
      g.quaternion.copy(q0.slerp(q1, e));
    });
    if (t >= 1) {
      anim.current = null;
      doneRef.current();
    }
  });
  return null;
}

function ViewDriver({
  viewRef,
  target,
}: {
  viewRef: React.MutableRefObject<THREE.Group | null>;
  target: React.MutableRefObject<{ x: number; y: number }>;
}) {
  useFrame((_, dt) => {
    const g = viewRef.current;
    if (!g) return;
    const k = 1 - Math.exp(-9 * dt);
    g.rotation.x += (target.current.x - g.rotation.x) * k;
    g.rotation.y += (target.current.y - g.rotation.y) * k;
  });
  return null;
}

function CameraBridge({ cameraRef }: { cameraRef: React.MutableRefObject<THREE.Camera | null> }) {
  const camera = useThree((s) => s.camera);
  cameraRef.current = camera;
  return null;
}

function CubePiece({ piece, onDown }: { piece: Piece; onDown: (e: ThreeEvent<PointerEvent>, p: Piece) => void }) {
  return (
    <group onPointerDown={(e) => { e.stopPropagation(); onDown(e, piece); }}>
      <mesh>
        <boxGeometry args={[CUBIE, CUBIE, CUBIE]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.55} metalness={0.05} />
      </mesh>
      {piece.stickers.map((s, i) => {
        const n = s.normal;
        const q = quatFromTo([0, 0, 1], n);
        const off = CUBIE / 2 + 0.015;
        return (
          <mesh
            key={i}
            position={[n[0] * off, n[1] * off, n[2] * off]}
            quaternion={qToThree(q)}
          >
            <boxGeometry args={[STICKER, STICKER, 0.05]} />
            <meshStandardMaterial color={s.color} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function PyraminxPiece({ piece, onDown }: { piece: Piece; onDown: (e: ThreeEvent<PointerEvent>, p: Piece) => void }) {
  return (
    <group onPointerDown={(e) => { e.stopPropagation(); onDown(e, piece); }}>
      <mesh>
        <tetrahedronGeometry args={[PYRA_TETRA_R, 0]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.5} flatShading />
      </mesh>
      {piece.stickers.map((s, i) => {
        const n = s.normal;
        const q = quatFromTo([0, 0, 1], n);
        const off = PYRA_TETRA_R / 3 + 0.03;
        return (
          <mesh
            key={i}
            position={[n[0] * off, n[1] * off, n[2] * off]}
            quaternion={qToThree(q)}
          >
            <circleGeometry args={[PYRA_STICKER_R, 3]} />
            <meshStandardMaterial color={s.color} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

export interface RubiksSceneProps {
  puzzle: RubiksPuzzle;
  seed: number;
  interactive?: boolean;
  onUserMove?: () => void;
  onSolved?: () => void;
  className?: string;
}

export function RubiksScene({ puzzle, seed, interactive = true, onUserMove, onSolved, className }: RubiksSceneProps) {
  const isPyra = puzzle === "pyraminx";
  const piecesRef = useRef<Piece[]>([]);
  const renderedRef = useRef<{ pos: V3; quat: Quat }[]>([]);
  const animRef = useRef<AnimState | null>(null);
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const pyraDirRef = useRef<Record<number, 1 | -1>>({});
  const cameraRef = useRef<THREE.Camera | null>(null);
  const viewRef = useRef<THREE.Group | null>(null);
  const viewTarget = useRef({ x: 0, y: 0 });
  const rotateView = (axis: "x" | "y", dir: 1 | -1) => {
    viewTarget.current[axis] += dir * Math.PI / 2;
  };
  const solvedRef = useRef(false);
  const [, force] = React.useState(0);
  const onSolvedRef = useRef(onSolved);
  onSolvedRef.current = onSolved;
  const onUserMoveRef = useRef(onUserMove);
  onUserMoveRef.current = onUserMove;

  // Build scrambled state whenever puzzle/seed changes.
  useEffect(() => {
    const built = scramblePieces(puzzle, seed);
    piecesRef.current = built;
    renderedRef.current = built.map((p) => ({ pos: [...p.pos] as V3, quat: [...p.quat] as Quat }));
    animRef.current = null;
    solvedRef.current = false;
    groupRefs.current.forEach((g, i) => {
      const p = built[i];
      if (g && p) {
        g.position.set(p.pos[0], p.pos[1], p.pos[2]);
        g.quaternion.copy(qToThree(p.quat));
      }
    });
    force((x) => x + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, seed]);

  const checkSolvedSoon = () => {
    window.setTimeout(() => {
      if (!solvedRef.current && isSolved(piecesRef.current)) {
        solvedRef.current = true;
        onSolvedRef.current?.();
      }
    }, MOVE_DUR * 1000 + 40);
  };

  const applyMoveAnimated = (move: CubeMove, fromVis?: { pos: V3; quat: Quat }[]) => {
    if (animRef.current) return;
    const from = fromVis ?? renderedRef.current.map((r) => ({ pos: [...r.pos] as V3, quat: [...r.quat] as Quat }));
    const next = applyCubeMove(piecesRef.current, move);
    piecesRef.current = next;
    renderedRef.current = next.map((p) => ({ pos: [...p.pos] as V3, quat: [...p.quat] as Quat }));
    animRef.current = { from, to: next, t0: performance.now() };
    onUserMoveRef.current?.();
    checkSolvedSoon();
  };

  const handleAnimDone = () => {
    // keep renderedRef in sync (already set optimistically)
  };

  const snapshotVisuals = () =>
    groupRefs.current.map((g) =>
      g
        ? { pos: [g.position.x, g.position.y, g.position.z] as V3, quat: [g.quaternion.x, g.quaternion.y, g.quaternion.z, g.quaternion.w] as Quat }
        : { pos: [0, 0, 0] as V3, quat: [0, 0, 0, 1] as Quat },
    );

  const setHighlight = (ids: Set<number> | null) => {
    groupRefs.current.forEach((g, i) => {
      if (!g) return;
      const on = ids?.has(i) ?? false;
      g.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const m = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (m && "emissive" in m) {
          m.emissive.set(on ? "#f59e0b" : "#000000");
          m.emissiveIntensity = on ? 0.45 : 0;
        }
      });
    });
  };

  const handlePieceDown = (e: ThreeEvent<PointerEvent>, piece: Piece) => {
    if (!interactive || animRef.current) return;
    const cam = cameraRef.current;
    const dom = e.nativeEvent.currentTarget as HTMLElement;
    if (!cam) return;

    let normalWorld: THREE.Vector3 | null = null;
    const face = (e as unknown as { face?: { normal: THREE.Vector3 } }).face;
    if (face && e.object) {
      normalWorld = face.normal.clone().transformDirection(e.object.matrixWorld);
    }
    const n = (normalWorld ?? vToThree(pieceNormalFallback(piece))).clone().normalize();
    const grabbed = piecesRef.current.findIndex((p) => p.id === piece.id);
    if (grabbed < 0) return;

    const drag: DragState = {
      normal: n,
      t1: new THREE.Vector3(),
      t2: new THREE.Vector3(),
      planeN: n.clone(),
      ba: new THREE.Vector3(),
      bb: new THREE.Vector3(),
      rax: null,
      axisIdx: 0,
      signAxis: 1,
      coord: 0,
      slice: [],
      base: [],
      vertex: piece.id,
      grabbed,
      startHit: new THREE.Vector3(),
      startAngle: 0,
      accum: 0,
      angle: 0,
      moved: false,
      downX: e.nativeEvent.clientX,
      downY: e.nativeEvent.clientY,
    };
    const up = Math.abs(n.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    drag.t1.crossVectors(n, up).normalize();
    drag.t2.crossVectors(n, drag.t1).normalize();
    setHighlight(new Set([grabbed]));

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane();
    const ndcFrom = (ev: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      return new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const hitPoint = new THREE.Vector3();
    const pointOnPlane = (ev: PointerEvent, normal: THREE.Vector3): THREE.Vector3 | null => {
      plane.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(0, 0, 0));
      raycaster.setFromCamera(ndcFrom(ev), cam);
      return raycaster.ray.intersectPlane(plane, hitPoint) ? hitPoint.clone() : null;
    };
    const h0 = pointOnPlane(e.nativeEvent, n);
    if (h0) drag.startHit.copy(h0);

    const angleNow = (ev: PointerEvent): number | null => {
      const h = pointOnPlane(ev, drag.planeN);
      if (!h || !drag.rax) return null;
      const r = drag.rax;
      const rel = h.clone().sub(r.clone().multiplyScalar(h.dot(r)));
      return Math.atan2(rel.dot(drag.bb), rel.dot(drag.ba));
    };

    const applyPreview = () => {
      if (!drag.rax) return;
      const q = qAxisAngle([drag.rax.x, drag.rax.y, drag.rax.z], drag.angle);
      drag.slice.forEach((idx, k) => {
        const g = groupRefs.current[idx];
        if (!g) return;
        const b = drag.base[k];
        const pos = vRot(q, b.pos);
        g.position.set(pos[0], pos[1], pos[2]);
        g.quaternion.copy(qToThree(qMul(q, b.quat)));
      });
    };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(ev.clientX - d.downX, ev.clientY - d.downY) > 8) d.moved = true;
      if (isPyra || !d.moved) return;
      const hNow = pointOnPlane(ev, d.planeN);
      if (!hNow) return;
      if (!d.rax) {
        // first real movement: pick the rotation axis from the dominant drag direction on the face
        const delta = hNow.clone().sub(d.startHit);
        const u = delta.dot(d.t1);
        const v = delta.dot(d.t2);
        if (Math.hypot(u, v) < 0.05) return;
        const tangent = Math.abs(u) > Math.abs(v)
          ? d.t1.clone().multiplyScalar(u >= 0 ? 1 : -1)
          : d.t2.clone().multiplyScalar(v >= 0 ? 1 : -1);
        const rax = new THREE.Vector3().crossVectors(d.normal, tangent).normalize();
        if (rax.lengthSq() < 0.5) return;
        const an = [Math.abs(rax.x), Math.abs(rax.y), Math.abs(rax.z)];
        d.axisIdx = an[0] >= an[1] && an[0] >= an[2] ? 0 : an[1] >= an[2] ? 1 : 2;
        d.signAxis = [rax.x, rax.y, rax.z][d.axisIdx] >= 0 ? 1 : -1;
        rax.set(0, 0, 0);
        rax.setComponent(d.axisIdx, d.signAxis);
        d.rax = rax;
        d.coord = piecesRef.current[d.grabbed].pos[d.axisIdx];
        d.slice = piecesRef.current
          .map((p, i) => (Math.abs(p.pos[d.axisIdx] - d.coord) < 0.01 ? i : -1))
          .filter((i) => i >= 0);
        d.base = d.slice.map((i) => ({ pos: [...renderedRef.current[i].pos] as V3, quat: [...renderedRef.current[i].quat] as Quat }));
        setHighlight(new Set(d.slice));
        d.planeN = rax;
        d.ba.copy(d.normal);
        d.bb.crossVectors(rax, d.normal).normalize();
        const a0 = angleNow(ev);
        if (a0 !== null) d.startAngle = a0;
        return;
      }
      const a = angleNow(ev);
      if (a === null) return;
      let delta = a - d.startAngle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      d.accum += delta;
      d.startAngle = a;
      d.angle = Math.max(-1.85, Math.min(1.85, d.accum));
      applyPreview();
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      setHighlight(null);
      if (!d) return;
      const visuals = snapshotVisuals();
      if (isPyra) {
        const dx = ev.clientX - d.downX;
        const dy = ev.clientY - d.downY;
        let dir: 1 | -1;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) dir = dx < 0 ? -1 : 1;
        else if (Math.abs(dy) > 8) dir = dy > 0 ? -1 : 1;
        else {
          const last = pyraDirRef.current[d.vertex] ?? -1;
          dir = last === 1 ? -1 : 1;
        }
        pyraDirRef.current[d.vertex] = dir;
        applyMoveAnimated({ kind: "vertex", vertex: d.vertex, dir }, visuals);
        return;
      }
      if (!d.moved) {
        // tap: quarter-turn the outer slice on the touched face's axis
        const an = [Math.abs(d.normal.x), Math.abs(d.normal.y), Math.abs(d.normal.z)];
        const axisIdx = an[0] >= an[1] && an[0] >= an[2] ? 0 : an[1] >= an[2] ? 1 : 2;
        const signN = [d.normal.x, d.normal.y, d.normal.z][axisIdx] >= 0 ? 1 : -1;
        const maxAbs = Math.max(...piecesRef.current.map((p) => Math.abs(p.pos[axisIdx])));
        applyMoveAnimated({ kind: "slice", axis: axisIdx as 0 | 1 | 2, coord: signN * maxAbs, turns: 1 }, visuals);
        return;
      }
      if (d.rax && Math.abs(d.angle) > 0.5) {
        const sCoord = d.coord === 0 ? 1 : Math.sign(d.coord);
        const turns = (Math.sign(d.angle) * d.signAxis === sCoord ? 3 : 1) as 1 | 3;
        applyMoveAnimated({ kind: "slice", axis: d.axisIdx as 0 | 1 | 2, coord: d.coord, turns }, visuals);
      } else {
        animRef.current = { from: visuals, to: renderedRef.current as unknown as Piece[], t0: performance.now() };
      }
    };
    dragRef.current = drag;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const camDist = isPyra ? 11 : puzzle === "4x4" ? 12.5 : puzzle === "2x2" ? 8.5 : 10.5;
  const initialPieces = piecesRef.current.length
    ? piecesRef.current
    : isPyra
      ? createPyraminx()
      : createCube(puzzle);

  return (
    <div className={className} style={{ width: "100%", height: "100%", touchAction: "none", position: "relative" }}>
      <Canvas
        camera={{ position: [camDist * 0.65, camDist * 0.55, camDist * 0.75], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <CameraBridge cameraRef={cameraRef} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 10, 6]} intensity={1.15} />
        <directionalLight position={[-6, -4, -6]} intensity={0.35} />
        <group ref={viewRef}>
        {initialPieces.map((p, i) => (
          <group
            key={p.id}
            ref={(el) => { groupRefs.current[i] = el; }}
            position={vToThree(p.pos)}
            quaternion={qToThree(p.quat)}
          >
            {p.kind === "corner" ? (
              <PyraminxPiece piece={p} onDown={handlePieceDown} />
            ) : (
              <CubePiece piece={p} onDown={handlePieceDown} />
            )}
          </group>
        ))}
        </group>
        <AnimDriver anim={animRef} groupRefs={groupRefs} onDone={handleAnimDone} />
        <ViewDriver viewRef={viewRef} target={viewTarget} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableRotate={false}
          minDistance={camDist * 0.5}
          maxDistance={camDist * 2.4}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0">
        <button type="button" aria-label="Rotate view up" onClick={() => rotateView("x", 1)} className="pointer-events-auto absolute left-1/2 top-3 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition hover:scale-110 hover:bg-rose-700 active:scale-95"><ArrowUp className="h-5 w-5" /></button>
        <button type="button" aria-label="Rotate view left" onClick={() => rotateView("y", 1)} className="pointer-events-auto absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition hover:scale-110 hover:bg-rose-700 active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <button type="button" aria-label="Rotate view right" onClick={() => rotateView("y", -1)} className="pointer-events-auto absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition hover:scale-110 hover:bg-rose-700 active:scale-95"><ArrowRight className="h-5 w-5" /></button>
        <button type="button" aria-label="Rotate view down" onClick={() => rotateView("x", -1)} className="pointer-events-auto absolute bottom-3 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition hover:scale-110 hover:bg-rose-700 active:scale-95"><ArrowDown className="h-5 w-5" /></button>
        <p className="absolute right-3 top-3 rounded-md bg-card/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">Arrows rotate view · pinch/scroll to zoom</p>
      </div>
    </div>
  );
}

function pieceNormalFallback(piece: Piece): V3 {
  // sticker-less fallback: direction from center to piece (only used if raycast face is missing)
  const l = Math.hypot(piece.pos[0], piece.pos[1], piece.pos[2]) || 1;
  return [piece.pos[0] / l, piece.pos[1] / l, piece.pos[2] / l];
}
