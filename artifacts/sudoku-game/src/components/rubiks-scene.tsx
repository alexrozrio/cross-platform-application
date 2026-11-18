import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  applyCubeMove,
  createCube,
  createPyraminx,
  isSolved,
  scramblePieces,
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
const PYRA_TETRA_R = 1.9;
const PYRA_STICKER_R = 0.6;
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
  face: CubeFace | null;
  normal: THREE.Vector3;
  vertex: number;
  startAngle: number;
  accum: number;
  moved: boolean;
  downX: number;
  downY: number;
  t1: THREE.Vector3;
  t2: THREE.Vector3;
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

  const applyMoveAnimated = (move: CubeMove) => {
    if (animRef.current) return;
    const from = renderedRef.current.map((r) => ({ pos: [...r.pos] as V3, quat: [...r.quat] as Quat }));
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

  const handlePieceDown = (e: ThreeEvent<PointerEvent>, piece: Piece) => {
    if (!interactive || animRef.current) return;
    const cam = cameraRef.current;
    const dom = e.nativeEvent.currentTarget as HTMLElement;
    if (!cam) return;

    // world-space normal of the intersected face (for cubes)
    let normalWorld: THREE.Vector3 | null = null;
    const face = (e as unknown as { face?: { normal: THREE.Vector3 } }).face;
    if (face && e.object) {
      normalWorld = face.normal.clone().transformDirection(e.object.matrixWorld);
    }

    const drag: DragState = {
      face: null,
      normal: new THREE.Vector3(),
      vertex: piece.id,
      startAngle: 0,
      accum: 0,
      moved: false,
      downX: e.nativeEvent.clientX,
      downY: e.nativeEvent.clientY,
      t1: new THREE.Vector3(),
      t2: new THREE.Vector3(),
    };

    if (!isPyra) {
      const n = normalWorld ?? vToThree(pieceNormalFallback(piece));
      const f = dominantDir(n);
      if (!f) return;
      drag.face = f;
      drag.normal.copy(n).normalize();
      const up = Math.abs(drag.normal.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      drag.t1.crossVectors(drag.normal, up).normalize();
      drag.t2.crossVectors(drag.normal, drag.t1).normalize();
    } else {
      const l = Math.hypot(piece.pos[0], piece.pos[1], piece.pos[2]) || 1;
      drag.normal.set(piece.pos[0] / l, piece.pos[1] / l, piece.pos[2] / l);
    }

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(drag.normal, new THREE.Vector3(0, 0, 0));
    const ndcFrom = (ev: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      return new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const hitPoint = new THREE.Vector3();
    const angleAt = (ev: PointerEvent): number | null => {
      raycaster.setFromCamera(ndcFrom(ev), cam);
      if (!raycaster.ray.intersectPlane(plane, hitPoint)) return null;
      return Math.atan2(hitPoint.dot(drag.t2), hitPoint.dot(drag.t1));
    };
    const a0 = angleAt(e.nativeEvent);
    if (a0 !== null) drag.startAngle = a0;

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(ev.clientX - d.downX, ev.clientY - d.downY) > 8) d.moved = true;
      if (!isPyra && d.face) {
        const a = angleAt(ev);
        if (a === null) return;
        let delta = a - d.startAngle;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        d.accum += delta;
        d.startAngle = a;
        if (Math.abs(d.accum) > 0.65) {
          // positive drag angle = CCW viewed from outside → turns 3; CW → turns 1
          applyMoveAnimated({ kind: "face", face: d.face, turns: d.accum > 0 ? 3 : 1 });
          d.accum = 0;
        }
      }
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (isPyra) {
        const dx = ev.clientX - d.downX;
        const dy = ev.clientY - d.downY;
        let dir: 1 | -1;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) dir = dx < 0 ? -1 : 1;
        else if (Math.abs(dy) > 8) dir = dy > 0 ? -1 : 1;
        else {
          // tap → alternate direction for this vertex
          const last = pyraDirRef.current[d.vertex] ?? -1;
          dir = last === 1 ? -1 : 1;
        }
        pyraDirRef.current[d.vertex] = dir;
        applyMoveAnimated({ kind: "vertex", vertex: d.vertex, dir });
      } else if (d.face && !d.moved) {
        applyMoveAnimated({ kind: "face", face: d.face, turns: 1 });
      }
    };
    dragRef.current = drag;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const camDist = isPyra ? 8 : puzzle === "4x4" ? 9 : puzzle === "2x2" ? 6 : 7.5;
  const initialPieces = piecesRef.current.length
    ? piecesRef.current
    : isPyra
      ? createPyraminx()
      : createCube(puzzle);

  return (
    <div className={className} style={{ width: "100%", height: "100%", touchAction: "none" }}>
      <Canvas
        camera={{ position: [camDist * 0.65, camDist * 0.55, camDist * 0.75], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <CameraBridge cameraRef={cameraRef} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 10, 6]} intensity={1.15} />
        <directionalLight position={[-6, -4, -6]} intensity={0.35} />
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
        <AnimDriver anim={animRef} groupRefs={groupRefs} onDone={handleAnimDone} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={camDist * 0.55}
          maxDistance={camDist * 1.9}
          rotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}

function pieceNormalFallback(piece: Piece): V3 {
  // sticker-less fallback: direction from center to piece (only used if raycast face is missing)
  const l = Math.hypot(piece.pos[0], piece.pos[1], piece.pos[2]) || 1;
  return [piece.pos[0] / l, piece.pos[1] / l, piece.pos[2] / l];
}
