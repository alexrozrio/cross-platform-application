import React from 'react';

interface IconProps { size?: number }

// ─── SUPERHERO ──────────────────────────────────────────────────────────────

export function SpiderManIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#D32F2F" />
      {/* web lines */}
      {[0,45,90,135].map(a => (
        <line key={a} x1="24" y1="24" x2={24+23*Math.cos(a*Math.PI/180)} y2={24+23*Math.sin(a*Math.PI/180)} stroke="#B71C1C" strokeWidth="1"/>
      ))}
      {[22.5,67.5,112.5,157.5].map(a => (
        <line key={a} x1="24" y1="24" x2={24+23*Math.cos(a*Math.PI/180)} y2={24+23*Math.sin(a*Math.PI/180)} stroke="#B71C1C" strokeWidth="1"/>
      ))}
      <circle cx="24" cy="24" r="7" fill="none" stroke="#B71C1C" strokeWidth="1"/>
      <circle cx="24" cy="24" r="14" fill="none" stroke="#B71C1C" strokeWidth="1"/>
      <circle cx="24" cy="24" r="21" fill="none" stroke="#B71C1C" strokeWidth="1"/>
      {/* white eyes */}
      <ellipse cx="17" cy="20" rx="5" ry="3.5" fill="white" transform="rotate(-15,17,20)"/>
      <ellipse cx="31" cy="20" rx="5" ry="3.5" fill="white" transform="rotate(15,31,20)"/>
      {/* blue lower */}
      <path d="M3 30 Q12 34 24 32 Q36 34 45 30 Q40 44 24 46 Q8 44 3 30Z" fill="#1565C0"/>
    </svg>
  );
}

export function SupermanIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1565C0"/>
      {/* shield */}
      <path d="M24 8 L36 14 L36 28 Q36 38 24 42 Q12 38 12 28 L12 14 Z" fill="#D32F2F"/>
      <path d="M24 11 L33 16 L33 28 Q33 36 24 40 Q15 36 15 28 L15 16 Z" fill="#FFEB3B"/>
      {/* S */}
      <path d="M28 18 Q28 15 24 15 Q20 15 20 18 Q20 21 24 22 Q28 23 28 26 Q28 29 24 29 Q20 29 20 26" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function BatmanIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#263238"/>
      {/* bat wings */}
      <path d="M24 22 C20 18 14 14 6 16 C10 20 12 22 14 26 C17 24 20 23 24 22Z" fill="#FDD835"/>
      <path d="M24 22 C28 18 34 14 42 16 C38 20 36 22 34 26 C31 24 28 23 24 22Z" fill="#FDD835"/>
      {/* bat body */}
      <path d="M14 26 Q15 30 18 30 Q20 32 24 32 Q28 32 30 30 Q33 30 34 26 Q29 28 24 28 Q19 28 14 26Z" fill="#FDD835"/>
      {/* ears on body */}
      <path d="M18 30 L16 36 Q24 38 32 36 L30 30" fill="#FDD835"/>
      {/* nose */}
      <path d="M22 28 L24 26 L26 28" fill="#263238"/>
    </svg>
  );
}

export function WonderWomanIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#C62828"/>
      {/* tiara */}
      <path d="M10 18 L24 10 L38 18 L34 22 L24 15 L14 22 Z" fill="#FFD600"/>
      <circle cx="24" cy="12" r="3" fill="#E53935"/>
      {/* WW logo */}
      <path d="M13 27 L17 35 L21 27 L24 33 L27 27 L31 35 L35 27" stroke="#FFD600" strokeWidth="2.5" strokeLinejoin="round" fill="none" strokeLinecap="round"/>
      {/* lasso */}
      <circle cx="38" cy="32" r="5" fill="none" stroke="#FFD600" strokeWidth="2"/>
      <path d="M33 32 Q33 38 38 40" stroke="#FFD600" strokeWidth="2" fill="none"/>
    </svg>
  );
}

export function IronManIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#B71C1C"/>
      {/* helmet */}
      <rect x="14" y="12" width="20" height="20" rx="4" fill="#D32F2F"/>
      {/* gold face plate */}
      <rect x="14" y="22" width="20" height="10" rx="2" fill="#FFD600"/>
      {/* eyes */}
      <rect x="16" y="16" width="6" height="4" rx="2" fill="#81D4FA"/>
      <rect x="26" y="16" width="6" height="4" rx="2" fill="#81D4FA"/>
      {/* arc reactor */}
      <circle cx="24" cy="36" r="4" fill="#81D4FA"/>
      <circle cx="24" cy="36" r="2" fill="white"/>
      {/* suit lower */}
      <path d="M14 32 L12 42 L24 40 L36 42 L34 32" fill="#D32F2F"/>
      <path d="M17 32 L24 40 L31 32" fill="#FFD600"/>
    </svg>
  );
}

export function CaptainAmericaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1565C0"/>
      {/* shield rings */}
      <circle cx="24" cy="24" r="19" fill="#D32F2F"/>
      <circle cx="24" cy="24" r="13" fill="white"/>
      <circle cx="24" cy="24" r="7" fill="#1565C0"/>
      {/* star */}
      <polygon points="24,17 25.5,21.5 30,21.5 26.5,24.5 27.5,29 24,26.5 20.5,29 21.5,24.5 18,21.5 22.5,21.5" fill="white"/>
    </svg>
  );
}

export function ThorIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#5C6BC0"/>
      {/* hammer head */}
      <rect x="16" y="8" width="16" height="12" rx="3" fill="#9E9E9E"/>
      <rect x="18" y="9" width="12" height="4" rx="1" fill="#BDBDBD"/>
      {/* handle */}
      <rect x="22" y="20" width="4" height="18" rx="2" fill="#795548"/>
      {/* bands */}
      <rect x="21" y="22" width="6" height="3" rx="1" fill="#FFD600"/>
      <rect x="21" y="27" width="6" height="2" rx="1" fill="#FFD600"/>
      {/* lightning */}
      <path d="M38 10 L33 22 L37 22 L30 38 L36 24 L32 24 Z" fill="#FFD600" opacity="0.9"/>
    </svg>
  );
}

export function HulkIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#2E7D32"/>
      {/* head */}
      <ellipse cx="24" cy="20" rx="12" ry="11" fill="#43A047"/>
      {/* angry brow */}
      <path d="M13 16 Q18 12 24 14 Q30 12 35 16" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* eyes */}
      <ellipse cx="19" cy="18" rx="3" ry="2" fill="white"/>
      <ellipse cx="29" cy="18" rx="3" ry="2" fill="white"/>
      <circle cx="19" cy="18" r="1.5" fill="#1B5E20"/>
      <circle cx="29" cy="18" r="1.5" fill="#1B5E20"/>
      {/* nose */}
      <path d="M22 21 Q24 23 26 21" fill="#2E7D32"/>
      {/* mouth grr */}
      <path d="M17 25 Q20 28 24 27 Q28 28 31 25" stroke="#1B5E20" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* fists */}
      <ellipse cx="14" cy="36" rx="8" ry="7" fill="#43A047"/>
      <ellipse cx="34" cy="36" rx="8" ry="7" fill="#43A047"/>
      <path d="M8 33 Q14 31 20 33" stroke="#2E7D32" strokeWidth="1.5" fill="none"/>
      <path d="M28 33 Q34 31 40 33" stroke="#2E7D32" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

export function FlashIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#D32F2F"/>
      {/* lightning bolt */}
      <path d="M27 6 L15 26 L23 26 L19 42 L33 20 L25 20 Z" fill="#FFD600" stroke="#E65100" strokeWidth="1"/>
      {/* speed lines */}
      <line x1="6" y1="20" x2="13" y2="20" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <line x1="5" y1="25" x2="11" y2="25" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="7" y1="30" x2="12" y2="30" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

// ─── ADVENTURE ───────────────────────────────────────────────────────────────

export function ExplorerGirlIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F9A825"/>
      {/* hat */}
      <ellipse cx="24" cy="12" rx="10" ry="4" fill="#FF6F00"/>
      <rect x="14" y="10" width="20" height="5" rx="2" fill="#E65100"/>
      {/* head */}
      <circle cx="24" cy="19" r="7" fill="#FFCC80"/>
      {/* hair */}
      <path d="M17 16 Q24 10 31 16" fill="#4E342E"/>
      <path d="M17 18 Q15 22 17 24" fill="#4E342E"/>
      <path d="M31 18 Q33 22 31 24" fill="#4E342E"/>
      {/* eyes */}
      <circle cx="21" cy="19" r="1.5" fill="#4E342E"/>
      <circle cx="27" cy="19" r="1.5" fill="#4E342E"/>
      <circle cx="21.5" cy="18.5" r="0.5" fill="white"/>
      <circle cx="27.5" cy="18.5" r="0.5" fill="white"/>
      {/* smile */}
      <path d="M21 22 Q24 25 27 22" stroke="#E65100" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* body */}
      <rect x="18" y="26" width="12" height="12" rx="3" fill="#FF6F00"/>
      {/* backpack on back */}
      <rect x="27" y="27" width="7" height="9" rx="2" fill="#7B1FA2"/>
      <rect x="28" y="28" width="5" height="3" rx="1" fill="#9C27B0"/>
    </svg>
  );
}

export function FoxIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E65100"/>
      {/* ears */}
      <path d="M13 18 L10 8 L20 16 Z" fill="#E64A19"/>
      <path d="M35 18 L38 8 L28 16 Z" fill="#E64A19"/>
      <path d="M14 17 L12 10 L19 16 Z" fill="#FFCCBC"/>
      <path d="M34 17 L36 10 L29 16 Z" fill="#FFCCBC"/>
      {/* head */}
      <ellipse cx="24" cy="24" rx="12" ry="11" fill="#FF5722"/>
      {/* white snout */}
      <ellipse cx="24" cy="29" rx="7" ry="5" fill="#FFCCBC"/>
      {/* eyes */}
      <circle cx="19" cy="22" r="3" fill="white"/>
      <circle cx="29" cy="22" r="3" fill="white"/>
      <circle cx="19" cy="22" r="1.5" fill="#212121"/>
      <circle cx="29" cy="22" r="1.5" fill="#212121"/>
      <circle cx="19.5" cy="21.5" r="0.5" fill="white"/>
      <circle cx="29.5" cy="21.5" r="0.5" fill="white"/>
      {/* nose */}
      <ellipse cx="24" cy="27" rx="2" ry="1.5" fill="#212121"/>
      {/* tail hint */}
      <path d="M34 32 Q42 28 40 38 Q36 38 34 34" fill="#FF5722"/>
      <path d="M36 34 Q42 32 40 38 Q38 38 36 36" fill="#FFCCBC"/>
    </svg>
  );
}

export function MapIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#8D6E63"/>
      {/* map parchment */}
      <path d="M10 12 Q16 10 22 13 L22 38 Q16 40 10 38 Z" fill="#FFECB3"/>
      <path d="M22 13 Q28 10 34 13 L34 38 Q28 40 22 38 Z" fill="#FFE082"/>
      <path d="M34 13 Q40 10 38 12 L38 38 Q40 40 34 38 Z" fill="#FFECB3"/>
      {/* dotted path */}
      <path d="M13 20 Q20 16 25 22 Q30 28 35 24" stroke="#E65100" strokeWidth="2" strokeDasharray="2,2" fill="none" strokeLinecap="round"/>
      {/* X marks the spot */}
      <line x1="32" y1="20" x2="36" y2="24" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="36" y1="20" x2="32" y2="24" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round"/>
      {/* mountains */}
      <path d="M12 32 L16 26 L20 32" fill="#A5D6A7"/>
      <path d="M18 32 L22 24 L26 32" fill="#81C784"/>
      {/* scroll ends */}
      <ellipse cx="22" cy="13" rx="3" ry="2" fill="#D7CCC8"/>
      <ellipse cx="22" cy="38" rx="3" ry="2" fill="#D7CCC8"/>
    </svg>
  );
}

export function BackpackIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#7B1FA2"/>
      {/* straps */}
      <path d="M18 12 Q14 16 14 24" stroke="#6A1B9A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M30 12 Q34 16 34 24" stroke="#6A1B9A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* bag body */}
      <rect x="13" y="16" width="22" height="22" rx="4" fill="#9C27B0"/>
      {/* front pocket */}
      <rect x="17" y="24" width="14" height="10" rx="3" fill="#7B1FA2"/>
      {/* zipper */}
      <path d="M17 28 Q24 26 31 28" stroke="#CE93D8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* face */}
      <circle cx="21" cy="21" r="2" fill="#F8BBD0"/>
      <circle cx="27" cy="21" r="2" fill="#F8BBD0"/>
      <circle cx="21" cy="21" r="1" fill="#7B1FA2"/>
      <circle cx="27" cy="21" r="1" fill="#7B1FA2"/>
      <path d="M21 23 Q24 26 27 23" stroke="#CE93D8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* top */}
      <ellipse cx="24" cy="16" rx="6" ry="3" fill="#CE93D8"/>
    </svg>
  );
}

export function FlowerIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#AD1457"/>
      {/* petals */}
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <ellipse key={i} cx={24+10*Math.cos(a*Math.PI/180)} cy={24+10*Math.sin(a*Math.PI/180)}
          rx="5" ry="8" fill="#F06292"
          transform={`rotate(${a},${24+10*Math.cos(a*Math.PI/180)},${24+10*Math.sin(a*Math.PI/180)})`}/>
      ))}
      {/* center */}
      <circle cx="24" cy="24" r="7" fill="#FFD600"/>
      <circle cx="24" cy="24" r="4" fill="#FF8F00"/>
      {/* dots */}
      {[0,60,120,180,240,300].map((a,i) => (
        <circle key={i} cx={24+5.5*Math.cos(a*Math.PI/180)} cy={24+5.5*Math.sin(a*Math.PI/180)} r="1" fill="#FFD600"/>
      ))}
    </svg>
  );
}

export function TelescopeIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#00695C"/>
      {/* tripod legs */}
      <line x1="24" y1="34" x2="16" y2="44" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="34" x2="32" y2="44" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="38" x2="24" y2="44" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round"/>
      {/* main tube */}
      <rect x="10" y="16" width="28" height="10" rx="5" fill="#B8860B" transform="rotate(-20,24,21)"/>
      <rect x="10" y="16" width="28" height="10" rx="5" fill="none" stroke="#8B6914" strokeWidth="1" transform="rotate(-20,24,21)"/>
      {/* lens end */}
      <circle cx="36" cy="14" r="5" fill="#B0BEC5"/>
      <circle cx="36" cy="14" r="3.5" fill="#CFD8DC"/>
      <circle cx="36" cy="14" r="2" fill="#81D4FA"/>
      {/* eyepiece */}
      <circle cx="12" cy="28" r="4" fill="#795548"/>
      <circle cx="12" cy="28" r="2.5" fill="#212121"/>
      {/* ring bands */}
      <rect x="18" y="17" width="4" height="10" fill="#8B6914" transform="rotate(-20,24,21)"/>
    </svg>
  );
}

export function KeyIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F57F17"/>
      {/* key head ring */}
      <circle cx="18" cy="18" r="9" fill="#FFD600" stroke="#F9A825" strokeWidth="2"/>
      <circle cx="18" cy="18" r="5" fill="#F57F17"/>
      {/* key shaft */}
      <rect x="24" y="16" width="16" height="5" rx="2.5" fill="#FFD600"/>
      {/* key teeth */}
      <rect x="32" y="21" width="4" height="4" rx="1" fill="#FFD600"/>
      <rect x="37" y="21" width="3" height="3" rx="1" fill="#FFD600"/>
      {/* sparkle */}
      <path d="M13 10 L14 13 L17 14 L14 15 L13 18 L12 15 L9 14 L12 13 Z" fill="white" opacity="0.9"/>
    </svg>
  );
}

export function RainbowIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1E88E5"/>
      {/* rainbow arcs */}
      <path d="M6 34 Q6 12 24 12 Q42 12 42 34" stroke="#E53935" strokeWidth="3" fill="none"/>
      <path d="M9 34 Q9 15 24 15 Q39 15 39 34" stroke="#F57C00" strokeWidth="3" fill="none"/>
      <path d="M12 34 Q12 18 24 18 Q36 18 36 34" stroke="#FDD835" strokeWidth="3" fill="none"/>
      <path d="M15 34 Q15 21 24 21 Q33 21 33 34" stroke="#43A047" strokeWidth="3" fill="none"/>
      <path d="M18 34 Q18 24 24 24 Q30 24 30 34" stroke="#1E88E5" strokeWidth="3" fill="none"/>
      <path d="M21 34 Q21 27 24 27 Q27 27 27 34" stroke="#8E24AA" strokeWidth="3" fill="none"/>
      {/* clouds */}
      <circle cx="9" cy="34" r="4" fill="white"/>
      <circle cx="12" cy="32" r="5" fill="white"/>
      <circle cx="39" cy="34" r="4" fill="white"/>
      <circle cx="36" cy="32" r="5" fill="white"/>
    </svg>
  );
}

export function TrophyIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E65100"/>
      {/* trophy body */}
      <path d="M16 10 L32 10 L30 26 Q28 32 24 32 Q20 32 18 26 Z" fill="#FFD600"/>
      {/* handles */}
      <path d="M16 12 Q8 14 10 22 Q12 28 18 24" stroke="#FFA000" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M32 12 Q40 14 38 22 Q36 28 30 24" stroke="#FFA000" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* stem */}
      <rect x="21" y="32" width="6" height="6" fill="#FFA000"/>
      {/* base */}
      <rect x="17" y="38" width="14" height="4" rx="2" fill="#FFD600"/>
      {/* star */}
      <polygon points="24,15 25.5,19 30,19 26.5,22 28,26 24,23.5 20,26 21.5,22 18,19 22.5,19" fill="#FF6F00"/>
    </svg>
  );
}

// ─── OCEAN ───────────────────────────────────────────────────────────────────

export function DolphinIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#0277BD"/>
      {/* body */}
      <path d="M8 26 Q16 18 28 20 Q38 22 42 28 Q36 32 28 30 Q16 34 8 26Z" fill="#B2EBF2"/>
      {/* dorsal fin */}
      <path d="M22 20 L24 12 L28 20" fill="#80DEEA"/>
      {/* tail */}
      <path d="M8 26 Q4 22 6 18 Q8 22 8 26Z" fill="#B2EBF2"/>
      <path d="M8 26 Q4 30 6 34 Q8 30 8 26Z" fill="#B2EBF2"/>
      {/* belly */}
      <path d="M14 26 Q22 28 30 26 Q22 30 14 26Z" fill="white"/>
      {/* eye */}
      <circle cx="36" cy="25" r="2.5" fill="white"/>
      <circle cx="36.5" cy="25" r="1.5" fill="#01579B"/>
      <circle cx="37" cy="24.5" r="0.5" fill="white"/>
      {/* mouth smile */}
      <path d="M38 28 Q40 30 38 32" stroke="#01579B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* waves */}
      <path d="M10 38 Q14 35 18 38 Q22 41 26 38 Q30 35 34 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function OctopusIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#6A1B9A"/>
      {/* tentacles */}
      {[[-8,8],[-5,12],[0,14],[5,12],[8,8]].map(([x,y],i) => (
        <path key={i} d={`M${24+x} 28 Q${20+i*3} ${32+y} ${16+i*4} ${36+y}`} stroke="#CE93D8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ))}
      {/* back tentacles */}
      <path d="M18 28 Q10 34 10 42" stroke="#AB47BC" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M30 28 Q38 34 38 42" stroke="#AB47BC" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* body */}
      <ellipse cx="24" cy="20" rx="12" ry="10" fill="#CE93D8"/>
      {/* eyes */}
      <circle cx="19" cy="18" r="3.5" fill="white"/>
      <circle cx="29" cy="18" r="3.5" fill="white"/>
      <circle cx="19" cy="18" r="2" fill="#6A1B9A"/>
      <circle cx="29" cy="18" r="2" fill="#6A1B9A"/>
      <circle cx="19.5" cy="17.5" r="0.7" fill="white"/>
      <circle cx="29.5" cy="17.5" r="0.7" fill="white"/>
      {/* smile */}
      <path d="M20 23 Q24 27 28 23" stroke="#6A1B9A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function SharkIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#0288D1"/>
      {/* body */}
      <path d="M6 26 Q14 20 30 22 Q40 24 44 28 Q36 30 24 30 Q12 30 6 26Z" fill="#78909C"/>
      {/* dorsal fin */}
      <path d="M20 22 L22 10 L28 22" fill="#607D8B"/>
      {/* tail */}
      <path d="M6 26 Q0 20 4 16 Q6 22 6 26Z" fill="#607D8B"/>
      <path d="M6 26 Q0 32 4 36 Q6 30 6 26Z" fill="#78909C"/>
      {/* belly white */}
      <path d="M12 26 Q24 28 36 26 Q28 30 12 26Z" fill="#ECEFF1"/>
      {/* eye */}
      <circle cx="38" cy="24" r="2.5" fill="black"/>
      <circle cx="38.5" cy="23.5" r="0.7" fill="white"/>
      {/* mouth */}
      <path d="M38 28 Q40 32 36 32 Q40 30 38 28Z" fill="white"/>
      <path d="M39 28 L39 31" stroke="#78909C" strokeWidth="1" fill="none"/>
      {/* pectoral fin */}
      <path d="M18 24 Q16 30 22 32" fill="#607D8B"/>
    </svg>
  );
}

export function ClownfishIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E65100"/>
      {/* body */}
      <ellipse cx="23" cy="24" rx="13" ry="10" fill="#FF6D00"/>
      {/* white stripes */}
      <path d="M20 14 Q22 24 20 34 Q18 34 18 24 Q18 14 20 14Z" fill="white" stroke="#212121" strokeWidth="0.5"/>
      <path d="M28 15 Q30 24 28 33 Q26 33 26 24 Q26 15 28 15Z" fill="white" stroke="#212121" strokeWidth="0.5"/>
      {/* black outline on body */}
      <ellipse cx="23" cy="24" rx="13" ry="10" fill="none" stroke="#212121" strokeWidth="1.5"/>
      {/* tail fin */}
      <path d="M36 24 L42 18 L44 24 L42 30 Z" fill="#FF6D00" stroke="#212121" strokeWidth="1"/>
      {/* dorsal fin */}
      <path d="M20 14 Q24 8 28 14" fill="#FF6D00" stroke="#212121" strokeWidth="1"/>
      {/* pectoral fin */}
      <path d="M22 24 Q18 20 16 26" fill="white" stroke="#212121" strokeWidth="1"/>
      {/* eye */}
      <circle cx="34" cy="22" r="3" fill="white"/>
      <circle cx="34" cy="22" r="2" fill="#212121"/>
      <circle cx="34.5" cy="21.5" r="0.7" fill="white"/>
      {/* mouth */}
      <path d="M34 26 Q36 28 34 30" stroke="#E65100" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function CrabIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#C62828"/>
      {/* legs */}
      {[[-10,-4],[-8,0],[-8,4],[-8,8]].map(([x,y],i) => (
        <path key={`l${i}`} d={`M17 ${24+y} Q${8+x} ${20+y} ${4+x} ${14+y}`} stroke="#EF9A9A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      ))}
      {[[10,-4],[8,0],[8,4],[8,8]].map(([x,y],i) => (
        <path key={`r${i}`} d={`M31 ${24+y} Q${40+x} ${20+y} ${44+x} ${14+y}`} stroke="#EF9A9A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      ))}
      {/* body */}
      <ellipse cx="24" cy="26" rx="12" ry="9" fill="#EF5350"/>
      {/* claws */}
      <ellipse cx="10" cy="22" rx="6" ry="5" fill="#EF5350"/>
      <ellipse cx="38" cy="22" rx="6" ry="5" fill="#EF5350"/>
      <path d="M7 20 Q10 16 13 20" fill="#C62828"/>
      <path d="M35 20 Q38 16 41 20" fill="#C62828"/>
      {/* eyes on stalks */}
      <line x1="20" y1="17" x2="19" y2="12" stroke="#C62828" strokeWidth="2"/>
      <line x1="28" y1="17" x2="29" y2="12" stroke="#C62828" strokeWidth="2"/>
      <circle cx="19" cy="11" r="3" fill="white"/>
      <circle cx="29" cy="11" r="3" fill="white"/>
      <circle cx="19" cy="11" r="2" fill="#212121"/>
      <circle cx="29" cy="11" r="2" fill="#212121"/>
      {/* smile */}
      <path d="M20 28 Q24 31 28 28" stroke="#C62828" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function PufferfishIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F9A825"/>
      {/* spiky body */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <line key={i} x1={24+14*Math.cos(a*Math.PI/180)} y1={24+14*Math.sin(a*Math.PI/180)}
          x2={24+20*Math.cos(a*Math.PI/180)} y2={24+20*Math.sin(a*Math.PI/180)}
          stroke="#E65100" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      {/* body circle */}
      <circle cx="24" cy="24" r="14" fill="#FFCC02"/>
      {/* belly spots */}
      <circle cx="22" cy="26" r="2" fill="#FFE082"/>
      <circle cx="27" cy="28" r="1.5" fill="#FFE082"/>
      <circle cx="19" cy="29" r="1.5" fill="#FFE082"/>
      {/* eyes */}
      <circle cx="18" cy="20" r="4" fill="white"/>
      <circle cx="30" cy="20" r="4" fill="white"/>
      <circle cx="18" cy="20" r="2.5" fill="#212121"/>
      <circle cx="30" cy="20" r="2.5" fill="#212121"/>
      <circle cx="18.7" cy="19.3" r="0.8" fill="white"/>
      <circle cx="30.7" cy="19.3" r="0.8" fill="white"/>
      {/* smile */}
      <path d="M19 25 Q24 29 29 25" stroke="#E65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* fins */}
      <path d="M24 10 L26 8 L28 10" fill="#E65100"/>
      <path d="M10 24 L8 22 L10 26" fill="#E65100"/>
      <path d="M38 24 L40 22 L40 26" fill="#E65100"/>
    </svg>
  );
}

export function SquidIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#283593"/>
      {/* tentacles */}
      {[-6,-2,2,6,10].map((x,i) => (
        <path key={i} d={`M${18+i*3} 30 Q${16+i*3} 38 ${14+i*3} 44`} stroke="#7986CB" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      ))}
      {/* long tentacles */}
      <path d="M19 30 Q12 36 8 44" stroke="#5C6BC0" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M29 30 Q36 36 40 44" stroke="#5C6BC0" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* mantle */}
      <path d="M14 22 Q16 12 24 10 Q32 12 34 22 L34 30 Q30 34 24 34 Q18 34 14 30 Z" fill="#5C6BC0"/>
      {/* fin edges */}
      <path d="M14 22 Q10 20 14 18" fill="#7986CB"/>
      <path d="M34 22 Q38 20 34 18" fill="#7986CB"/>
      {/* eyes */}
      <circle cx="19" cy="22" r="3.5" fill="white"/>
      <circle cx="29" cy="22" r="3.5" fill="white"/>
      <circle cx="19" cy="22" r="2" fill="#1A237E"/>
      <circle cx="29" cy="22" r="2" fill="#1A237E"/>
      <circle cx="19.5" cy="21.5" r="0.6" fill="white"/>
      <circle cx="29.5" cy="21.5" r="0.6" fill="white"/>
      {/* glow spots */}
      <circle cx="22" cy="26" r="1.5" fill="#7986CB" opacity="0.8"/>
      <circle cx="26" cy="27" r="1" fill="#9FA8DA" opacity="0.7"/>
    </svg>
  );
}

export function TurtleIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#2E7D32"/>
      {/* legs */}
      <ellipse cx="14" cy="16" rx="5" ry="4" fill="#558B2F" transform="rotate(-30,14,16)"/>
      <ellipse cx="34" cy="16" rx="5" ry="4" fill="#558B2F" transform="rotate(30,34,16)"/>
      <ellipse cx="14" cy="34" rx="5" ry="4" fill="#558B2F" transform="rotate(30,14,34)"/>
      <ellipse cx="34" cy="34" rx="5" ry="4" fill="#558B2F" transform="rotate(-30,34,34)"/>
      {/* shell */}
      <ellipse cx="24" cy="24" rx="13" ry="11" fill="#8BC34A"/>
      {/* shell pattern hexagons */}
      <polygon points="24,14 28,17 27,22 21,22 20,17" fill="#689F38"/>
      <polygon points="14,22 18,19 22,22 20,27 14,27" fill="#689F38"/>
      <polygon points="34,22 30,19 26,22 28,27 34,27" fill="#689F38"/>
      <polygon points="24,34 28,31 27,26 21,26 20,31" fill="#689F38"/>
      {/* head */}
      <circle cx="24" cy="12" r="5" fill="#558B2F"/>
      {/* eyes */}
      <circle cx="22" cy="11" r="1.5" fill="white"/>
      <circle cx="26" cy="11" r="1.5" fill="white"/>
      <circle cx="22" cy="11" r="0.8" fill="#212121"/>
      <circle cx="26" cy="11" r="0.8" fill="#212121"/>
      {/* smile */}
      <path d="M22 13 Q24 15 26 13" stroke="#2E7D32" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* tail */}
      <path d="M24 35 Q24 40 22 42" stroke="#558B2F" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function LobsterIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#B71C1C"/>
      {/* antennae */}
      <path d="M20 12 Q12 6 8 2" stroke="#EF9A9A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M28 12 Q36 6 40 2" stroke="#EF9A9A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* claws */}
      <ellipse cx="10" cy="20" rx="7" ry="5" fill="#EF5350"/>
      <path d="M7 17 Q10 13 13 17" fill="#C62828"/>
      <ellipse cx="38" cy="20" rx="7" ry="5" fill="#EF5350"/>
      <path d="M35 17 Q38 13 41 17" fill="#C62828"/>
      {/* body segments */}
      <ellipse cx="24" cy="18" rx="7" ry="5" fill="#EF5350"/>
      <ellipse cx="24" cy="25" rx="7" ry="5" fill="#E53935"/>
      <ellipse cx="24" cy="32" rx="6" ry="4" fill="#EF5350"/>
      {/* segment lines */}
      <path d="M17 22 Q24 24 31 22" stroke="#C62828" strokeWidth="1" fill="none"/>
      <path d="M18 29 Q24 31 30 29" stroke="#C62828" strokeWidth="1" fill="none"/>
      {/* legs */}
      {[-2,0,2].map((x,i) => (
        <path key={`l${i}`} d={`M${18+x} ${22+i*3} Q${12+x} ${24+i*3} ${8+x} ${28+i*3}`} stroke="#EF9A9A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      ))}
      {[-2,0,2].map((x,i) => (
        <path key={`r${i}`} d={`M${30+x} ${22+i*3} Q${36+x} ${24+i*3} ${40+x} ${28+i*3}`} stroke="#EF9A9A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      ))}
      {/* eyes */}
      <circle cx="20" cy="14" r="2.5" fill="white"/>
      <circle cx="28" cy="14" r="2.5" fill="white"/>
      <circle cx="20" cy="14" r="1.5" fill="#212121"/>
      <circle cx="28" cy="14" r="1.5" fill="#212121"/>
    </svg>
  );
}

// ─── JUNGLE ──────────────────────────────────────────────────────────────────

export function MonkeyIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#5D4037"/>
      {/* ears */}
      <circle cx="12" cy="20" r="6" fill="#795548"/>
      <circle cx="12" cy="20" r="4" fill="#FFCCBC"/>
      <circle cx="36" cy="20" r="6" fill="#795548"/>
      <circle cx="36" cy="20" r="4" fill="#FFCCBC"/>
      {/* head */}
      <ellipse cx="24" cy="22" rx="12" ry="11" fill="#795548"/>
      {/* face */}
      <ellipse cx="24" cy="27" rx="8" ry="6" fill="#FFCCBC"/>
      {/* eyes */}
      <circle cx="19" cy="20" r="3" fill="white"/>
      <circle cx="29" cy="20" r="3" fill="white"/>
      <circle cx="19" cy="20" r="2" fill="#212121"/>
      <circle cx="29" cy="20" r="2" fill="#212121"/>
      <circle cx="19.5" cy="19.5" r="0.7" fill="white"/>
      <circle cx="29.5" cy="19.5" r="0.7" fill="white"/>
      {/* nose */}
      <ellipse cx="22" cy="25" rx="1.5" ry="1" fill="#5D4037"/>
      <ellipse cx="26" cy="25" rx="1.5" ry="1" fill="#5D4037"/>
      {/* mouth */}
      <path d="M20 28 Q24 31 28 28" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* tail */}
      <path d="M24 33 Q34 36 36 42 Q32 44 30 40 Q28 36 22 35" stroke="#795548" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function LionIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F57F17"/>
      {/* mane */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <ellipse key={i} cx={24+14*Math.cos(a*Math.PI/180)} cy={24+14*Math.sin(a*Math.PI/180)}
          rx="4" ry="7" fill="#E65100"
          transform={`rotate(${a},${24+14*Math.cos(a*Math.PI/180)},${24+14*Math.sin(a*Math.PI/180)})`}/>
      ))}
      {/* head */}
      <circle cx="24" cy="24" r="12" fill="#FFB300"/>
      {/* snout */}
      <ellipse cx="24" cy="29" rx="7" ry="5" fill="#FFCA28"/>
      {/* eyes */}
      <circle cx="19" cy="22" r="3" fill="#FFECB3"/>
      <circle cx="29" cy="22" r="3" fill="#FFECB3"/>
      <ellipse cx="19" cy="22" rx="1.5" ry="2" fill="#795548"/>
      <ellipse cx="29" cy="22" rx="1.5" ry="2" fill="#795548"/>
      <circle cx="19.3" cy="21.3" r="0.5" fill="white"/>
      <circle cx="29.3" cy="21.3" r="0.5" fill="white"/>
      {/* nose */}
      <path d="M22 27 L24 25 L26 27 L24 29 Z" fill="#E91E63"/>
      {/* mouth */}
      <path d="M22 29 Q24 32 26 29" stroke="#E65100" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="24" y1="29" x2="24" y2="32" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round"/>
      {/* whisker dots */}
      <circle cx="18" cy="28" r="1" fill="#E65100"/>
      <circle cx="30" cy="28" r="1" fill="#E65100"/>
      <circle cx="16" cy="30" r="1" fill="#E65100"/>
      <circle cx="32" cy="30" r="1" fill="#E65100"/>
    </svg>
  );
}

export function ElephantIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#455A64"/>
      {/* big ear left */}
      <ellipse cx="13" cy="22" rx="8" ry="11" fill="#607D8B"/>
      <ellipse cx="14" cy="22" rx="5" ry="8" fill="#FFCDD2"/>
      {/* big ear right */}
      <ellipse cx="35" cy="22" rx="8" ry="11" fill="#607D8B"/>
      <ellipse cx="34" cy="22" rx="5" ry="8" fill="#FFCDD2"/>
      {/* head */}
      <circle cx="24" cy="20" r="11" fill="#78909C"/>
      {/* trunk */}
      <path d="M20 28 Q16 32 18 40 Q22 42 24 38 Q22 34 24 30" fill="#78909C"/>
      {/* trunk tip */}
      <ellipse cx="21" cy="39" rx="3" ry="2" fill="#607D8B"/>
      {/* eyes */}
      <circle cx="19" cy="18" r="3" fill="white"/>
      <circle cx="29" cy="18" r="3" fill="white"/>
      <circle cx="19" cy="18" r="2" fill="#212121"/>
      <circle cx="29" cy="18" r="2" fill="#212121"/>
      <circle cx="19.5" cy="17.5" r="0.7" fill="white"/>
      <circle cx="29.5" cy="17.5" r="0.7" fill="white"/>
      {/* tusks */}
      <path d="M20 28 Q17 32 14 34" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 28 Q31 32 34 34" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function GiraffeIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F9A825"/>
      {/* neck */}
      <rect x="19" y="6" width="10" height="26" rx="5" fill="#FFB300"/>
      {/* patches on neck */}
      <path d="M20 10 Q23 8 26 12 Q23 14 20 10Z" fill="#E65100"/>
      <path d="M21 18 Q24 16 27 20 Q24 22 21 18Z" fill="#E65100"/>
      <path d="M20 26 Q23 24 26 28 Q23 30 20 26Z" fill="#E65100"/>
      {/* head */}
      <ellipse cx="24" cy="8" rx="7" ry="6" fill="#FFB300"/>
      {/* ossicones (horns) */}
      <line x1="20" y1="3" x2="19" y2="-1" stroke="#E65100" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="3" x2="29" y2="-1" stroke="#E65100" strokeWidth="3" strokeLinecap="round"/>
      {/* ears */}
      <ellipse cx="17" cy="7" rx="4" ry="3" fill="#FFB300"/>
      <ellipse cx="31" cy="7" rx="4" ry="3" fill="#FFB300"/>
      {/* eyes */}
      <circle cx="20" cy="7" r="2.5" fill="white"/>
      <circle cx="28" cy="7" r="2.5" fill="white"/>
      <circle cx="20" cy="7" r="1.5" fill="#5D4037"/>
      <circle cx="28" cy="7" r="1.5" fill="#5D4037"/>
      {/* snout */}
      <ellipse cx="24" cy="11" rx="4" ry="2.5" fill="#FFD54F"/>
      <circle cx="22.5" cy="11" r="1" fill="#E65100"/>
      <circle cx="25.5" cy="11" r="1" fill="#E65100"/>
      {/* body */}
      <ellipse cx="24" cy="36" rx="10" ry="8" fill="#FFB300"/>
      {/* spots on body */}
      <circle cx="20" cy="34" r="3" fill="#E65100"/>
      <circle cx="28" cy="37" r="3" fill="#E65100"/>
      <circle cx="24" cy="32" r="2.5" fill="#E65100"/>
    </svg>
  );
}

export function ZebraIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F5F5F5"/>
      {/* body */}
      <ellipse cx="24" cy="28" rx="13" ry="10" fill="white"/>
      {/* stripes on body */}
      <path d="M12 24 Q15 22 16 30 Q13 30 12 24Z" fill="#212121"/>
      <path d="M19 20 Q21 18 22 28 Q19 28 19 20Z" fill="#212121"/>
      <path d="M25 20 Q27 18 28 28 Q25 28 25 20Z" fill="#212121"/>
      <path d="M31 22 Q33 20 34 28 Q31 28 31 22Z" fill="#212121"/>
      {/* head */}
      <ellipse cx="24" cy="16" rx="9" ry="10" fill="white"/>
      {/* mane */}
      <path d="M19 8 Q24 6 29 8 Q26 10 29 12 Q26 13 28 15 Q25 15 24 8" fill="#212121"/>
      {/* face stripes */}
      <path d="M18 12 Q19 10 20 14" stroke="#212121" strokeWidth="2" fill="none"/>
      <path d="M28 12 Q29 10 30 14" stroke="#212121" strokeWidth="2" fill="none"/>
      {/* snout */}
      <ellipse cx="24" cy="22" rx="5" ry="4" fill="#F0F0F0"/>
      <circle cx="22.5" cy="22" r="1" fill="#212121"/>
      <circle cx="25.5" cy="22" r="1" fill="#212121"/>
      {/* eyes */}
      <circle cx="19" cy="15" r="2.5" fill="white"/>
      <circle cx="29" cy="15" r="2.5" fill="white"/>
      <circle cx="19" cy="15" r="1.5" fill="#212121"/>
      <circle cx="29" cy="15" r="1.5" fill="#212121"/>
      <circle cx="19.5" cy="14.5" r="0.5" fill="white"/>
      <circle cx="29.5" cy="14.5" r="0.5" fill="white"/>
      {/* ears */}
      <path d="M17 10 L15 5 L20 9" fill="white" stroke="#212121" strokeWidth="1"/>
      <path d="M31 10 L33 5 L28 9" fill="white" stroke="#212121" strokeWidth="1"/>
    </svg>
  );
}

export function RhinoIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#546E7A"/>
      {/* body */}
      <ellipse cx="25" cy="30" rx="14" ry="10" fill="#78909C"/>
      {/* head */}
      <ellipse cx="24" cy="20" rx="11" ry="9" fill="#78909C"/>
      {/* horn */}
      <path d="M20 12 L24 4 L28 12" fill="#B0BEC5"/>
      <path d="M22 11 L24 6 L26 11" fill="#CFD8DC"/>
      {/* ears */}
      <ellipse cx="14" cy="16" rx="4" ry="5" fill="#90A4AE"/>
      <ellipse cx="34" cy="16" rx="4" ry="5" fill="#90A4AE"/>
      <ellipse cx="14" cy="16" rx="2.5" ry="3" fill="#FFCDD2"/>
      <ellipse cx="34" cy="16" rx="2.5" ry="3" fill="#FFCDD2"/>
      {/* eyes */}
      <circle cx="18" cy="19" r="3" fill="white"/>
      <circle cx="30" cy="19" r="3" fill="white"/>
      <circle cx="18" cy="19" r="2" fill="#212121"/>
      <circle cx="30" cy="19" r="2" fill="#212121"/>
      <circle cx="18.5" cy="18.5" r="0.7" fill="white"/>
      <circle cx="30.5" cy="18.5" r="0.7" fill="white"/>
      {/* nose with big nostrils */}
      <ellipse cx="24" cy="25" rx="7" ry="5" fill="#607D8B"/>
      <ellipse cx="21" cy="25" rx="2" ry="1.5" fill="#455A64"/>
      <ellipse cx="27" cy="25" rx="2" ry="1.5" fill="#455A64"/>
      {/* skin wrinkles */}
      <path d="M12 24 Q16 22 20 24" stroke="#607D8B" strokeWidth="1" fill="none"/>
      <path d="M28 24 Q32 22 36 24" stroke="#607D8B" strokeWidth="1" fill="none"/>
    </svg>
  );
}

export function LeopardIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F9A825"/>
      {/* body */}
      <ellipse cx="24" cy="28" rx="13" ry="9" fill="#FFA000"/>
      {/* rosette spots on body */}
      {[[16,26],[24,24],[32,26],[20,32],[28,32]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4" fill="#E65100" opacity="0.7"/>
          <circle cx={cx} cy={cy} r="2" fill="#FFA000"/>
        </g>
      ))}
      {/* head */}
      <circle cx="24" cy="18" r="10" fill="#FFA000"/>
      {/* spots on head */}
      <circle cx="18" cy="15" r="2.5" fill="#E65100" opacity="0.7"/>
      <circle cx="30" cy="15" r="2.5" fill="#E65100" opacity="0.7"/>
      {/* ears */}
      <path d="M15 11 L12 5 L19 10" fill="#FFA000"/>
      <path d="M33 11 L36 5 L29 10" fill="#FFA000"/>
      <path d="M15 11 L13 7 L18 10" fill="#212121"/>
      <path d="M33 11 L35 7 L30 10" fill="#212121"/>
      {/* eyes */}
      <circle cx="19" cy="17" r="3" fill="#FFF9C4"/>
      <circle cx="29" cy="17" r="3" fill="#FFF9C4"/>
      <ellipse cx="19" cy="17" rx="1.5" ry="2" fill="#1A6600"/>
      <ellipse cx="29" cy="17" rx="1.5" ry="2" fill="#1A6600"/>
      <circle cx="19.5" cy="16.5" r="0.5" fill="white"/>
      <circle cx="29.5" cy="16.5" r="0.5" fill="white"/>
      {/* nose */}
      <path d="M22 21 L24 19 L26 21 L24 23 Z" fill="#E91E63"/>
      {/* whisker dots */}
      <circle cx="16" cy="21" r="1" fill="#212121"/>
      <circle cx="32" cy="21" r="1" fill="#212121"/>
      <circle cx="14" cy="23" r="1" fill="#212121"/>
      <circle cx="34" cy="23" r="1" fill="#212121"/>
    </svg>
  );
}

export function GorillaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#37474F"/>
      {/* ears */}
      <circle cx="11" cy="20" r="6" fill="#455A64"/>
      <circle cx="37" cy="20" r="6" fill="#455A64"/>
      <circle cx="11" cy="20" r="3.5" fill="#FFCDD2"/>
      <circle cx="37" cy="20" r="3.5" fill="#FFCDD2"/>
      {/* head - large and flat on top */}
      <path d="M12 14 Q16 10 24 10 Q32 10 36 14 L36 26 Q32 34 24 34 Q16 34 12 26 Z" fill="#455A64"/>
      {/* brow ridge */}
      <path d="M12 14 Q18 11 24 12 Q30 11 36 14" stroke="#263238" strokeWidth="3" fill="none"/>
      {/* face plate */}
      <ellipse cx="24" cy="26" rx="9" ry="7" fill="#546E7A"/>
      {/* eyes deep set */}
      <circle cx="19" cy="21" r="3.5" fill="#263238"/>
      <circle cx="29" cy="21" r="3.5" fill="#263238"/>
      <circle cx="19" cy="21" r="2" fill="#212121"/>
      <circle cx="29" cy="21" r="2" fill="#212121"/>
      <circle cx="19.5" cy="20.5" r="0.7" fill="white"/>
      <circle cx="29.5" cy="20.5" r="0.7" fill="white"/>
      {/* nose wide */}
      <ellipse cx="24" cy="26" rx="4" ry="2.5" fill="#37474F"/>
      <ellipse cx="21.5" cy="26" rx="1.8" ry="1.5" fill="#263238"/>
      <ellipse cx="26.5" cy="26" rx="1.8" ry="1.5" fill="#263238"/>
      {/* mouth */}
      <path d="M19 30 Q24 33 29 30" stroke="#263238" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* arms */}
      <path d="M12 28 Q6 32 8 42 Q14 38 16 34" fill="#455A64"/>
      <path d="M36 28 Q42 32 40 42 Q34 38 32 34" fill="#455A64"/>
    </svg>
  );
}

export function ParrotIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#2E7D32"/>
      {/* body */}
      <ellipse cx="24" cy="28" rx="10" ry="12" fill="#388E3C"/>
      {/* wing */}
      <path d="M14 22 Q8 28 10 38 Q16 34 20 28" fill="#1B5E20"/>
      <path d="M14 22 Q10 28 12 36 Q16 32 20 28" fill="#388E3C"/>
      {/* tail */}
      <path d="M20 38 L16 48 L24 44 L28 48 L32 44 L28 38" fill="#1B5E20"/>
      {/* head */}
      <circle cx="24" cy="16" r="9" fill="#66BB6A"/>
      {/* red forehead */}
      <path d="M16 12 Q24 8 32 12 Q28 16 24 14 Q20 16 16 12Z" fill="#E53935"/>
      {/* beak */}
      <path d="M24 19 Q28 22 24 24 Q20 22 24 19Z" fill="#FFB300"/>
      <path d="M24 21 Q26 22 24 24 Q22 22 24 21Z" fill="#E65100"/>
      {/* eyes */}
      <circle cx="19" cy="15" r="3" fill="white"/>
      <circle cx="29" cy="15" r="3" fill="white"/>
      <circle cx="19" cy="15" r="2" fill="#212121"/>
      <circle cx="29" cy="15" r="2" fill="#212121"/>
      <circle cx="19.5" cy="14.5" r="0.7" fill="white"/>
      <circle cx="29.5" cy="14.5" r="0.7" fill="white"/>
      {/* cheek patches */}
      <circle cx="17" cy="18" r="2.5" fill="#FFEB3B"/>
      <circle cx="31" cy="18" r="2.5" fill="#FFEB3B"/>
      {/* feet on branch */}
      <path d="M20 38 Q22 40 20 44" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 38 Q26 40 28 44" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ─── SPACE ────────────────────────────────────────────────────────────────────

export function RocketIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E"/>
      {/* rocket body */}
      <path d="M24 6 Q30 10 30 22 L30 32 L24 36 L18 32 L18 22 Q18 10 24 6Z" fill="#ECEFF1"/>
      {/* red nose cone */}
      <path d="M18 22 Q24 8 30 22" fill="#EF5350"/>
      {/* window */}
      <circle cx="24" cy="22" r="4" fill="#81D4FA"/>
      <circle cx="24" cy="22" r="2.5" fill="#29B6F6"/>
      {/* fins */}
      <path d="M18 28 L10 36 L18 34 Z" fill="#EF5350"/>
      <path d="M30 28 L38 36 L30 34 Z" fill="#EF5350"/>
      {/* flames */}
      <path d="M20 36 Q22 42 24 40 Q26 46 24 44 Q22 48 20 44 Q18 42 20 36Z" fill="#FF6D00"/>
      <path d="M24 36 Q26 42 28 40 Q30 46 28 44 Q26 48 24 44 Q22 42 24 36Z" fill="#FF6D00"/>
      <path d="M22 36 Q24 42 26 40 Q24 46 22 42Z" fill="#FFD600"/>
      {/* stars */}
      <circle cx="10" cy="12" r="1.5" fill="white"/>
      <circle cx="38" cy="18" r="1.5" fill="white"/>
      <circle cx="8" cy="28" r="1" fill="white"/>
      <circle cx="40" cy="32" r="1" fill="white"/>
    </svg>
  );
}

export function StarIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F57F17"/>
      {/* outer glow */}
      <polygon points="24,5 27.5,15.5 39,15.5 29.5,22.5 33,33 24,26 15,33 18.5,22.5 9,15.5 20.5,15.5" fill="#FFD600"/>
      {/* inner shine */}
      <polygon points="24,9 27,17 35,17 29,22 31,30 24,25 17,30 19,22 13,17 21,17" fill="#FFEE58"/>
      {/* sparkle lines */}
      <line x1="24" y1="2" x2="24" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="10" x2="35.5" y2="12.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="10" x2="12.5" y2="12.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4" y1="24" x2="8" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function MoonIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E"/>
      {/* crescent */}
      <path d="M30 10 Q40 18 38 30 Q36 40 24 42 Q14 42 9 34 Q6 26 10 18 Q14 12 22 10 Q26 10 30 10 Z" fill="#FDD835"/>
      <circle cx="28" cy="20" r="10" fill="#1A237E"/>
      {/* stars */}
      <circle cx="38" cy="14" r="2" fill="white"/>
      <circle cx="10" cy="20" r="1.5" fill="white"/>
      <circle cx="14" cy="38" r="1.5" fill="white"/>
      <circle cx="40" cy="36" r="2" fill="white"/>
      <circle cx="42" cy="24" r="1" fill="white"/>
      {/* face on moon */}
      <circle cx="20" cy="26" r="2.5" fill="#F57F17"/>
      <circle cx="27" cy="30" r="2" fill="#F57F17"/>
      <path d="M18 32 Q22 36 26 33" stroke="#F57F17" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function CometIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#212121"/>
      {/* tail glow layers */}
      <path d="M36 12 L8 22 L8 26 L36 36 Q30 24 36 12Z" fill="#FF6D00" opacity="0.2"/>
      <path d="M36 14 L10 22 L10 26 L36 34 Q31 24 36 14Z" fill="#FF8F00" opacity="0.3"/>
      <path d="M36 16 L12 22 L12 26 L36 32 Q32 24 36 16Z" fill="#FFA000" opacity="0.4"/>
      <path d="M36 18 L14 22 L14 26 L36 30 Q33 24 36 18Z" fill="#FFB300" opacity="0.6"/>
      <path d="M36 20 L18 22 L18 26 L36 28 Q34 24 36 20Z" fill="#FFD600" opacity="0.8"/>
      {/* comet head */}
      <circle cx="36" cy="24" r="7" fill="#FFD600"/>
      <circle cx="36" cy="24" r="5" fill="#FFFF00"/>
      <circle cx="34" cy="22" r="2" fill="white" opacity="0.8"/>
      {/* stars in background */}
      <circle cx="10" cy="10" r="1.5" fill="white"/>
      <circle cx="20" cy="6" r="1" fill="white"/>
      <circle cx="6" cy="30" r="1" fill="white"/>
      <circle cx="14" cy="40" r="1.5" fill="white"/>
    </svg>
  );
}

export function SaturnIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E"/>
      {/* ring back */}
      <ellipse cx="24" cy="26" rx="19" ry="7" fill="none" stroke="#FFCC80" strokeWidth="4"/>
      {/* planet */}
      <circle cx="24" cy="24" r="12" fill="#FFB74D"/>
      {/* planet shading bands */}
      <path d="M12 20 Q18 18 36 22 Q30 18 12 20Z" fill="#FFA726" opacity="0.6"/>
      <path d="M12 24 Q18 22 36 26 Q30 22 12 24Z" fill="#FF8F00" opacity="0.4"/>
      <path d="M13 28 Q18 26 35 28 Q30 26 13 28Z" fill="#FFA726" opacity="0.4"/>
      {/* ring front covering planet */}
      <path d="M12 26 Q24 32 36 26" stroke="#FFCC80" strokeWidth="4" fill="none"/>
      {/* stars */}
      <circle cx="6" cy="10" r="1.5" fill="white"/>
      <circle cx="40" cy="8" r="1.5" fill="white"/>
      <circle cx="44" cy="32" r="1" fill="white"/>
      <circle cx="4" cy="36" r="1" fill="white"/>
    </svg>
  );
}

export function EarthIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#0D47A1"/>
      {/* ocean base */}
      <circle cx="24" cy="24" r="18" fill="#1976D2"/>
      {/* continents */}
      <path d="M18 10 Q22 8 26 12 Q30 14 28 18 Q24 20 20 18 Q16 16 18 10Z" fill="#4CAF50"/>
      <path d="M28 16 Q34 14 36 20 Q38 26 34 28 Q30 30 28 26 Q26 22 28 16Z" fill="#4CAF50"/>
      <path d="M12 24 Q14 20 18 22 Q22 24 20 28 Q18 32 14 30 Q10 28 12 24Z" fill="#4CAF50"/>
      <path d="M20 30 Q24 28 28 32 Q30 36 26 38 Q22 40 20 36 Q18 32 20 30Z" fill="#4CAF50"/>
      <path d="M30 28 Q34 26 36 30 Q36 34 32 34 Q28 34 30 28Z" fill="#4CAF50"/>
      {/* cloud wisps */}
      <path d="M14 16 Q18 14 22 16 Q20 18 14 16Z" fill="white" opacity="0.7"/>
      <path d="M28 36 Q32 34 36 36 Q34 38 28 36Z" fill="white" opacity="0.7"/>
      {/* shine */}
      <path d="M14 12 Q18 10 20 14 Q16 14 14 12Z" fill="white" opacity="0.4"/>
    </svg>
  );
}

export function AlienIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1B5E20"/>
      {/* antenna */}
      <line x1="20" y1="8" x2="17" y2="2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="2" r="2.5" fill="#A5D6A7"/>
      <line x1="28" y1="8" x2="31" y2="2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="31" cy="2" r="2.5" fill="#A5D6A7"/>
      {/* head oval shape */}
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="#4CAF50"/>
      {/* big eyes */}
      <ellipse cx="18" cy="18" rx="6" ry="7" fill="#212121"/>
      <ellipse cx="30" cy="18" rx="6" ry="7" fill="#212121"/>
      <ellipse cx="18" cy="18" rx="4" ry="5" fill="#00E5FF"/>
      <ellipse cx="30" cy="18" rx="4" ry="5" fill="#00E5FF"/>
      <ellipse cx="18" cy="18" rx="2.5" ry="3" fill="#00ACC1"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="3" fill="#00ACC1"/>
      <ellipse cx="17" cy="16" rx="1.2" ry="1.5" fill="white"/>
      <ellipse cx="29" cy="16" rx="1.2" ry="1.5" fill="white"/>
      {/* tiny nose */}
      <circle cx="23" cy="26" r="1" fill="#2E7D32"/>
      <circle cx="25" cy="26" r="1" fill="#2E7D32"/>
      {/* smile */}
      <path d="M18 30 Q24 35 30 30" stroke="#2E7D32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* ears/side nubs */}
      <ellipse cx="11" cy="20" rx="3" ry="5" fill="#4CAF50"/>
      <ellipse cx="37" cy="20" rx="3" ry="5" fill="#4CAF50"/>
    </svg>
  );
}

export function UFOIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#212121"/>
      {/* beam */}
      <path d="M18 28 L10 44 L38 44 L30 28 Z" fill="#FFD600" opacity="0.3"/>
      <path d="M19 28 L13 42 L35 42 L29 28 Z" fill="#FFD600" opacity="0.2"/>
      {/* saucer bottom */}
      <ellipse cx="24" cy="28" rx="16" ry="5" fill="#9E9E9E"/>
      {/* lights on bottom */}
      <circle cx="14" cy="28" r="2.5" fill="#FF1744"/>
      <circle cx="19" cy="30" r="2" fill="#00E5FF"/>
      <circle cx="24" cy="31" r="2.5" fill="#FFEA00"/>
      <circle cx="29" cy="30" r="2" fill="#00E5FF"/>
      <circle cx="34" cy="28" r="2.5" fill="#FF1744"/>
      {/* dome */}
      <path d="M14 28 Q14 16 24 14 Q34 16 34 28" fill="#B0BEC5"/>
      <path d="M16 28 Q16 18 24 16 Q32 18 32 28" fill="#CFD8DC"/>
      {/* window on dome */}
      <ellipse cx="24" cy="22" rx="6" ry="5" fill="#29B6F6"/>
      <ellipse cx="22" cy="20" rx="3" ry="2" fill="#81D4FA"/>
      {/* stars */}
      <circle cx="8" cy="12" r="1.5" fill="white"/>
      <circle cx="40" cy="8" r="1.5" fill="white"/>
      <circle cx="6" cy="24" r="1" fill="white"/>
      <circle cx="42" cy="20" r="1" fill="white"/>
    </svg>
  );
}

export function AstronautIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E"/>
      {/* suit body */}
      <rect x="14" y="26" width="20" height="16" rx="6" fill="#ECEFF1"/>
      {/* suit arms */}
      <rect x="6" y="26" width="10" height="12" rx="5" fill="#ECEFF1" transform="rotate(-15,11,32)"/>
      <rect x="32" y="26" width="10" height="12" rx="5" fill="#ECEFF1" transform="rotate(15,37,32)"/>
      {/* gloves */}
      <circle cx="8" cy="38" r="4" fill="#B0BEC5"/>
      <circle cx="40" cy="38" r="4" fill="#B0BEC5"/>
      {/* chest details */}
      <rect x="18" y="30" width="12" height="8" rx="2" fill="#B0BEC5"/>
      <circle cx="20" cy="32" r="1.5" fill="#F44336"/>
      <circle cx="24" cy="32" r="1.5" fill="#4CAF50"/>
      <circle cx="28" cy="32" r="1.5" fill="#2196F3"/>
      {/* helmet */}
      <circle cx="24" cy="18" r="12" fill="#90A4AE"/>
      <circle cx="24" cy="18" r="10" fill="#455A64"/>
      {/* visor */}
      <ellipse cx="24" cy="18" rx="8" ry="7" fill="#FFD600"/>
      <ellipse cx="24" cy="18" rx="7" ry="6" fill="#F9A825"/>
      {/* reflection on visor */}
      <path d="M20 14 Q22 13 22 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* astronaut suit detail */}
      <rect x="17" y="38" width="14" height="4" rx="2" fill="#B0BEC5"/>
    </svg>
  );
}

// ─── SHAPES (upgraded) ────────────────────────────────────────────────────────

export function Shape1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E53935"/><circle cx="24" cy="24" r="16" fill="#EF9A9A"/><circle cx="24" cy="24" r="8" fill="#B71C1C"/></svg>;
}
export function Shape2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="6" fill="#1E88E5"/><rect x="10" y="10" width="28" height="28" rx="4" fill="#90CAF9"/><rect x="16" y="16" width="16" height="16" rx="2" fill="#0D47A1"/></svg>;
}
export function Shape3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><polygon points="24,3 45,42 3,42" fill="#43A047"/><polygon points="24,10 40,42 8,42" fill="#A5D6A7"/><polygon points="24,18 36,42 12,42" fill="#1B5E20"/></svg>;
}
export function Shape4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><polygon points="24,3 45,24 24,45 3,24" fill="#FB8C00"/><polygon points="24,9 39,24 24,39 9,24" fill="#FFCC80"/><polygon points="24,16 32,24 24,32 16,24" fill="#E65100"/></svg>;
}
export function Shape5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><polygon points="24,3 27.5,13.5 39,13.5 29.5,20.5 33,31 24,24.5 15,31 18.5,20.5 9,13.5 20.5,13.5" fill="#7B1FA2"/><polygon points="24,8 27,17 35,17 29,22 31,30 24,25.5 17,30 19,22 13,17 21,17" fill="#E1BEE7"/></svg>;
}
export function Shape6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><polygon points="24,3 41,12 41,36 24,45 7,36 7,12" fill="#00897B"/><polygon points="24,9 37,17 37,31 24,39 11,31 11,17" fill="#80CBC4"/><polygon points="24,16 31,20 31,28 24,32 17,28 17,20" fill="#004D40"/></svg>;
}
export function Shape7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M24 4 C18 4 10 10 10 18 C10 28 24 44 24 44 C24 44 38 28 38 18 C38 10 30 4 24 4Z" fill="#E91E63"/><path d="M24 10 C19 10 14 14 14 19 C14 26 24 38 24 38 C24 38 34 26 34 19 C34 14 29 10 24 10Z" fill="#F8BBD0"/><path d="M24 16 C21 16 18 18 18 21 C18 25 24 32 24 32 C24 32 30 25 30 21 C30 18 27 16 24 16Z" fill="#880E4F"/></svg>;
}
export function Shape8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><rect x="20" y="3" width="8" height="42" rx="4" fill="#F57F17"/><rect x="3" y="20" width="42" height="8" rx="4" fill="#F57F17"/><rect x="21" y="4" width="6" height="40" rx="3" fill="#FFF176"/><rect x="4" y="21" width="40" height="6" rx="3" fill="#FFF176"/></svg>;
}
export function Shape9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="#546E7A" strokeWidth="6"/><circle cx="24" cy="24" r="13" stroke="#90A4AE" strokeWidth="4"/><circle cx="24" cy="24" r="6" fill="#263238"/></svg>;
}

// ─── SHAPES extra (10–16) ────────────────────────────────────────────────────

export function Shape10Icon({ size = 48 }: IconProps) {
  // Diamond with glow
  return <svg width={size} height={size} viewBox="0 0 48 48"><polygon points="24,4 44,24 24,44 4,24" fill="#00BCD4"/><polygon points="24,10 38,24 24,38 10,24" fill="#80DEEA"/><polygon points="24,17 31,24 24,31 17,24" fill="#006064"/></svg>;
}
export function Shape11Icon({ size = 48 }: IconProps) {
  // Spiral
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#FF7043"/>
      <path d="M24 24 Q30 18 34 24 Q38 32 28 36 Q16 40 10 30 Q4 18 14 10 Q26 2 38 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
export function Shape12Icon({ size = 48 }: IconProps) {
  // Crescent
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#5C6BC0"/>
      <path d="M14 10 Q26 12 30 24 Q26 36 14 38 Q8 32 8 24 Q8 16 14 10Z" fill="#FDD835"/>
      <circle cx="26" cy="24" r="10" fill="#5C6BC0"/>
    </svg>
  );
}
export function Shape13Icon({ size = 48 }: IconProps) {
  // Arrow right bold
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#EF5350"/>
      <polygon points="8,17 30,17 30,10 42,24 30,38 30,31 8,31" fill="white"/>
    </svg>
  );
}
export function Shape14Icon({ size = 48 }: IconProps) {
  // Gear / cog
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#8D6E63"/>
      <path d="M20 6 L22 12 Q18 13 15 16 L10 13 L7 18 L12 21 Q11 24 12 27 L7 30 L10 35 L15 32 Q18 35 22 36 L20 42 L28 42 L26 36 Q30 35 33 32 L38 35 L41 30 L36 27 Q37 24 36 21 L41 18 L38 13 L33 16 Q30 13 26 12 L28 6 Z" fill="#FFB300" stroke="#E65100" strokeWidth="1"/>
      <circle cx="24" cy="24" r="7" fill="#E65100"/>
      <circle cx="24" cy="24" r="4" fill="#FFB300"/>
    </svg>
  );
}
export function Shape15Icon({ size = 48 }: IconProps) {
  // Lightning bolt
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#FDD835"/>
      <polygon points="28,5 16,26 24,26 20,43 34,22 26,22" fill="#E65100"/>
      <polygon points="27,8 17,26 25,26 22,40 32,24 24,24" fill="#FF6F00"/>
    </svg>
  );
}
export function Shape16Icon({ size = 48 }: IconProps) {
  // Infinity loop
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#26A69A"/>
      <path d="M10 24 Q10 16 17 16 Q24 16 24 24 Q24 32 31 32 Q38 32 38 24 Q38 16 31 16 Q24 16 24 24 Q24 32 17 32 Q10 32 10 24Z" stroke="white" strokeWidth="5" fill="none"/>
    </svg>
  );
}

// ─── ADVENTURE extra (10–16) ─────────────────────────────────────────────────

export function CompassIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#5D4037"/>
      <circle cx="24" cy="24" r="18" fill="#EFEBE9"/>
      <circle cx="24" cy="24" r="16" fill="#FFF8E1"/>
      {/* cardinal lines */}
      <line x1="24" y1="8" x2="24" y2="40" stroke="#BDBDBD" strokeWidth="1"/>
      <line x1="8" y1="24" x2="40" y2="24" stroke="#BDBDBD" strokeWidth="1"/>
      {/* N needle red */}
      <polygon points="24,10 22,24 26,24" fill="#D32F2F"/>
      {/* S needle grey */}
      <polygon points="24,38 22,24 26,24" fill="#607D8B"/>
      {/* center */}
      <circle cx="24" cy="24" r="3" fill="#5D4037"/>
      {/* N label */}
      <text x="24" y="7" textAnchor="middle" fontSize="5" fill="#D32F2F" fontWeight="bold">N</text>
    </svg>
  );
}

export function CampfireIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1B5E20"/>
      {/* logs */}
      <ellipse cx="20" cy="36" rx="10" ry="3" fill="#795548" transform="rotate(-20,20,36)"/>
      <ellipse cx="28" cy="36" rx="10" ry="3" fill="#5D4037" transform="rotate(20,28,36)"/>
      {/* flame outer */}
      <path d="M24 36 Q18 28 20 20 Q22 14 24 10 Q26 14 28 20 Q30 28 24 36Z" fill="#FF6D00"/>
      {/* flame mid */}
      <path d="M24 34 Q20 27 22 20 Q23 16 24 13 Q25 16 26 20 Q28 27 24 34Z" fill="#FFA000"/>
      {/* flame inner */}
      <path d="M24 32 Q22 27 23 22 Q24 19 24 17 Q24 19 25 22 Q26 27 24 32Z" fill="#FFF176"/>
      {/* glow */}
      <circle cx="24" cy="28" r="6" fill="#FF6D00" opacity="0.2"/>
    </svg>
  );
}

export function MoonLanternIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1A237E"/>
      {/* lantern body */}
      <rect x="16" y="14" width="16" height="22" rx="4" fill="#FFD600"/>
      <rect x="18" y="16" width="12" height="18" rx="3" fill="#FFF9C4"/>
      {/* vertical bars */}
      <line x1="22" y1="16" x2="22" y2="34" stroke="#F57F17" strokeWidth="1.5"/>
      <line x1="26" y1="16" x2="26" y2="34" stroke="#F57F17" strokeWidth="1.5"/>
      {/* top hook */}
      <rect x="22" y="8" width="4" height="6" rx="2" fill="#F57F17"/>
      <path d="M20 8 Q24 4 28 8" stroke="#F57F17" strokeWidth="2" fill="none"/>
      {/* bottom tassel */}
      <line x1="24" y1="36" x2="24" y2="42" stroke="#F57F17" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="43" r="2" fill="#FF6F00"/>
      {/* stars */}
      <circle cx="8" cy="10" r="1.5" fill="white"/>
      <circle cx="38" cy="14" r="1" fill="white"/>
      <circle cx="40" cy="36" r="1.5" fill="white"/>
    </svg>
  );
}

export function ButterflyAdventureIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#7B1FA2"/>
      {/* upper wings */}
      <path d="M24 24 Q16 14 8 16 Q4 20 10 26 Q16 30 24 24Z" fill="#CE93D8"/>
      <path d="M24 24 Q32 14 40 16 Q44 20 38 26 Q32 30 24 24Z" fill="#CE93D8"/>
      {/* lower wings */}
      <path d="M24 24 Q14 26 10 34 Q12 40 18 38 Q22 34 24 28Z" fill="#AB47BC"/>
      <path d="M24 24 Q34 26 38 34 Q36 40 30 38 Q26 34 24 28Z" fill="#AB47BC"/>
      {/* wing patterns */}
      <circle cx="14" cy="22" r="4" fill="#F3E5F5" opacity="0.7"/>
      <circle cx="34" cy="22" r="4" fill="#F3E5F5" opacity="0.7"/>
      {/* body */}
      <ellipse cx="24" cy="24" rx="2" ry="8" fill="#4A148C"/>
      {/* antennae */}
      <path d="M23 17 Q20 12 18 10" stroke="#4A148C" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25 17 Q28 12 30 10" stroke="#4A148C" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="18" cy="10" r="2" fill="#E040FB"/>
      <circle cx="30" cy="10" r="2" fill="#E040FB"/>
    </svg>
  );
}

export function MushroomIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#2E7D32"/>
      {/* stem */}
      <rect x="19" y="28" width="10" height="14" rx="4" fill="#EFEBE9"/>
      <path d="M19 32 Q24 34 29 32" stroke="#D7CCC8" strokeWidth="1" fill="none"/>
      {/* cap */}
      <path d="M6 28 Q8 14 24 12 Q40 14 42 28 Z" fill="#D32F2F"/>
      {/* spots */}
      <circle cx="16" cy="22" r="4" fill="white"/>
      <circle cx="32" cy="20" r="4" fill="white"/>
      <circle cx="24" cy="16" r="3" fill="white"/>
      <circle cx="38" cy="26" r="3" fill="white"/>
      <circle cx="10" cy="26" r="3" fill="white"/>
    </svg>
  );
}

export function WandIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#4A148C"/>
      {/* wand stick */}
      <line x1="10" y1="38" x2="36" y2="12" stroke="#795548" strokeWidth="4" strokeLinecap="round"/>
      <line x1="34" y1="10" x2="38" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      {/* star tip */}
      <polygon points="36,8 37,12 41,12 38,14.5 39,18 36,16 33,18 34,14.5 31,12 35,12" fill="#FFD600"/>
      {/* sparkles */}
      <circle cx="16" cy="18" r="2" fill="#FFD600"/>
      <circle cx="12" cy="28" r="1.5" fill="#E040FB"/>
      <circle cx="22" cy="14" r="1.5" fill="#40C4FF"/>
      <path d="M30 26 L31 29 L34 30 L31 31 L30 34 L29 31 L26 30 L29 29 Z" fill="#FFD600"/>
    </svg>
  );
}

export function DartboardIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#B71C1C"/>
      <circle cx="24" cy="24" r="19" fill="#D32F2F"/>
      <circle cx="24" cy="24" r="14" fill="white"/>
      <circle cx="24" cy="24" r="10" fill="#D32F2F"/>
      <circle cx="24" cy="24" r="6" fill="white"/>
      <circle cx="24" cy="24" r="3" fill="#D32F2F"/>
      {/* dart */}
      <line x1="38" y1="10" x2="26" y2="22" stroke="#424242" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="26,22 30,18 34,14 38,10" fill="#424242"/>
      <line x1="38" y1="10" x2="42" y2="6" stroke="#FFD600" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ─── SUPERHERO extra (10–16) ─────────────────────────────────────────────────

export function VillainIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#212121"/>
      {/* villain horns */}
      <path d="M14 16 L10 6 L18 14" fill="#7B1FA2"/>
      <path d="M34 16 L38 6 L30 14" fill="#7B1FA2"/>
      {/* head */}
      <circle cx="24" cy="22" r="11" fill="#6A1B9A"/>
      {/* evil eyes */}
      <ellipse cx="19" cy="20" rx="4" ry="3" fill="#FF1744"/>
      <ellipse cx="29" cy="20" rx="4" ry="3" fill="#FF1744"/>
      <ellipse cx="19" cy="20" rx="2.5" ry="2" fill="#212121"/>
      <ellipse cx="29" cy="20" rx="2.5" ry="2" fill="#212121"/>
      {/* evil grin */}
      <path d="M16 27 Q24 32 32 27" stroke="#FF1744" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M18 27 L20 30 M24 28 L24 31 M28 27 L30 30" stroke="#FF1744" strokeWidth="1.5" strokeLinecap="round"/>
      {/* cape */}
      <path d="M13 28 Q6 36 8 46 L24 40 L40 46 Q42 36 35 28" fill="#4A148C"/>
    </svg>
  );
}

export function TornadoIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#37474F"/>
      <ellipse cx="24" cy="12" rx="16" ry="4" fill="#90A4AE"/>
      <ellipse cx="24" cy="19" rx="12" ry="3" fill="#78909C"/>
      <ellipse cx="24" cy="26" rx="8" ry="2.5" fill="#607D8B"/>
      <ellipse cx="24" cy="32" rx="5" ry="2" fill="#546E7A"/>
      <ellipse cx="24" cy="38" rx="2.5" ry="1.5" fill="#455A64"/>
      <path d="M24 40 L22 46" stroke="#455A64" strokeWidth="2" strokeLinecap="round"/>
      {/* debris */}
      <rect x="8" y="14" width="4" height="3" rx="1" fill="#795548" transform="rotate(-20,10,15)"/>
      <rect x="36" y="16" width="3" height="4" rx="1" fill="#795548" transform="rotate(15,37,18)"/>
      <circle cx="38" cy="10" r="2" fill="#795548"/>
    </svg>
  );
}

export function SparkleStarIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0D47A1"/>
      {/* big sparkle */}
      <path d="M24 6 L26 20 L40 18 L28 26 L36 38 L24 30 L12 38 L20 26 L8 18 L22 20 Z" fill="#FFD600"/>
      {/* small sparkles */}
      <path d="M40 8 L41 12 L45 13 L41 14 L40 18 L39 14 L35 13 L39 12 Z" fill="white"/>
      <path d="M8 30 L9 33 L12 34 L9 35 L8 38 L7 35 L4 34 L7 33 Z" fill="white"/>
    </svg>
  );
}

export function EagleIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1565C0"/>
      {/* wings spread */}
      <path d="M24 24 Q14 18 4 22 Q6 28 14 28 Q18 28 20 26Z" fill="#795548"/>
      <path d="M24 24 Q34 18 44 22 Q42 28 34 28 Q30 28 28 26Z" fill="#795548"/>
      {/* body */}
      <ellipse cx="24" cy="26" rx="6" ry="8" fill="#5D4037"/>
      {/* white head */}
      <circle cx="24" cy="16" r="7" fill="white"/>
      {/* beak */}
      <path d="M28 17 L34 19 L28 20 Z" fill="#FFB300"/>
      {/* eye */}
      <circle cx="26" cy="15" r="2" fill="#212121"/>
      <circle cx="26.5" cy="14.5" r="0.7" fill="white"/>
      {/* tail feathers */}
      <path d="M20 34 L16 42 L24 38 L28 42 L32 38 L24 34 Z" fill="#5D4037"/>
    </svg>
  );
}

export function CrossedSwordsIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#37474F"/>
      {/* sword 1 */}
      <line x1="8" y1="8" x2="40" y2="40" stroke="#B0BEC5" strokeWidth="4" strokeLinecap="round"/>
      <rect x="5" y="5" width="8" height="3" rx="1.5" fill="#795548" transform="rotate(45,9,6.5)"/>
      <rect x="22" y="20" width="6" height="2.5" rx="1.25" fill="#FFD600" transform="rotate(45,25,21.25)"/>
      {/* sword 2 */}
      <line x1="40" y1="8" x2="8" y2="40" stroke="#CFD8DC" strokeWidth="4" strokeLinecap="round"/>
      <rect x="37" y="5" width="8" height="3" rx="1.5" fill="#795548" transform="rotate(-45,41,6.5)"/>
      <rect x="21" y="20" width="6" height="2.5" rx="1.25" fill="#FFD600" transform="rotate(-45,24,21.25)"/>
      {/* center */}
      <circle cx="24" cy="24" r="3" fill="#FFD600"/>
    </svg>
  );
}

export function MagnetIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#B71C1C"/>
      {/* magnet U shape */}
      <path d="M10 12 L10 30 Q10 42 24 42 Q38 42 38 30 L38 12" stroke="#D32F2F" strokeWidth="8" fill="none" strokeLinecap="square"/>
      <path d="M10 12 L10 30 Q10 42 24 42 Q38 42 38 30 L38 12" stroke="#EF9A9A" strokeWidth="4" fill="none" strokeLinecap="square"/>
      {/* poles */}
      <rect x="6" y="8" width="8" height="8" rx="1" fill="#1565C0"/>
      <rect x="34" y="8" width="8" height="8" rx="1" fill="#D32F2F"/>
      <text x="10" y="15" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">N</text>
      <text x="38" y="15" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">S</text>
      {/* attraction lines */}
      <path d="M10 6 Q24 2 38 6" stroke="#FFD600" strokeWidth="1.5" strokeDasharray="2,2" fill="none"/>
    </svg>
  );
}

export function BullseyeIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#880E4F"/>
      <circle cx="24" cy="24" r="19" fill="white"/>
      <circle cx="24" cy="24" r="14" fill="#C62828"/>
      <circle cx="24" cy="24" r="9" fill="white"/>
      <circle cx="24" cy="24" r="5" fill="#C62828"/>
      <circle cx="24" cy="24" r="2" fill="white"/>
      {/* arrow */}
      <line x1="42" y1="6" x2="26" y2="22" stroke="#424242" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="24,24 28,18 30,14 34,10 38,6" fill="#212121"/>
      <path d="M40 4 L44 8 L40 8 Z" fill="#D32F2F"/>
    </svg>
  );
}

// ─── OCEAN extra (10–16) ─────────────────────────────────────────────────────

export function WhaleIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0277BD"/>
      {/* body */}
      <path d="M6 26 Q12 18 26 20 Q38 20 44 26 Q36 34 24 32 Q12 34 6 26Z" fill="#4FC3F7"/>
      {/* tail */}
      <path d="M6 26 Q2 20 4 14 Q6 20 6 26Z" fill="#4FC3F7"/>
      <path d="M6 26 Q2 32 4 38 Q6 32 6 26Z" fill="#29B6F6"/>
      {/* belly */}
      <path d="M12 26 Q24 30 36 26 Q28 32 12 26Z" fill="#E1F5FE"/>
      {/* blowhole spout */}
      <path d="M30 20 Q32 14 30 10 Q34 14 34 20" stroke="#81D4FA" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* eye */}
      <circle cx="38" cy="24" r="2.5" fill="white"/>
      <circle cx="38.5" cy="24" r="1.5" fill="#01579B"/>
      <circle cx="39" cy="23.5" r="0.5" fill="white"/>
      {/* smile */}
      <path d="M38 27 Q40 30 38 32" stroke="#01579B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function SealIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0288D1"/>
      {/* body */}
      <ellipse cx="24" cy="28" rx="14" ry="10" fill="#78909C"/>
      {/* head */}
      <circle cx="24" cy="16" r="10" fill="#90A4AE"/>
      {/* eyes big */}
      <circle cx="19" cy="14" r="4" fill="#212121"/>
      <circle cx="29" cy="14" r="4" fill="#212121"/>
      <circle cx="19.7" cy="13.3" r="1.5" fill="white"/>
      <circle cx="29.7" cy="13.3" r="1.5" fill="white"/>
      {/* nose */}
      <path d="M22 18 L24 16 L26 18 L24 20 Z" fill="#FFCCBC"/>
      {/* whiskers */}
      <line x1="14" y1="18" x2="22" y2="19" stroke="#B0BEC5" strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="20" x2="22" y2="20" stroke="#B0BEC5" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="19" x2="34" y2="18" stroke="#B0BEC5" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="34" y2="20" stroke="#B0BEC5" strokeWidth="1" strokeLinecap="round"/>
      {/* flippers */}
      <path d="M10 30 Q4 34 6 40 Q12 38 14 32" fill="#607D8B"/>
      <path d="M38 30 Q44 34 42 40 Q36 38 34 32" fill="#607D8B"/>
      {/* tail */}
      <path d="M20 36 Q16 42 20 44 L24 40 L28 44 Q32 42 28 36" fill="#607D8B"/>
    </svg>
  );
}

export function SeashellIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#00838F"/>
      {/* shell body */}
      <path d="M24 38 Q10 34 8 22 Q8 10 24 8 Q40 8 40 22 Q40 34 24 38Z" fill="#FFCC80"/>
      {/* shell spiral lines */}
      <path d="M24 36 Q12 32 12 22 Q12 13 24 12" stroke="#FF8F00" strokeWidth="2" fill="none"/>
      <path d="M24 33 Q15 30 15 22 Q15 16 24 15" stroke="#FFB300" strokeWidth="1.5" fill="none"/>
      <path d="M24 30 Q18 28 18 22 Q18 18 24 18" stroke="#FF8F00" strokeWidth="1.5" fill="none"/>
      <path d="M24 27 Q21 26 21 22 Q21 20 24 21" stroke="#FFB300" strokeWidth="1" fill="none"/>
      {/* center point */}
      <circle cx="24" cy="22" r="2" fill="#E65100"/>
      {/* base */}
      <path d="M18 38 Q24 42 30 38" stroke="#FF8F00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function CoralIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#006064"/>
      {/* coral branches */}
      <path d="M24 40 L24 28" stroke="#FF4081" strokeWidth="4" strokeLinecap="round"/>
      <path d="M24 34 L18 26" stroke="#FF4081" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 34 L30 26" stroke="#FF4081" strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 26 L14 20" stroke="#FF80AB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 26 L20 18" stroke="#FF80AB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M30 26 L34 20" stroke="#FF80AB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M30 26 L28 18" stroke="#FF80AB" strokeWidth="2.5" strokeLinecap="round"/>
      {/* tips */}
      <circle cx="14" cy="20" r="3" fill="#FF4081"/>
      <circle cx="20" cy="18" r="3" fill="#F50057"/>
      <circle cx="34" cy="20" r="3" fill="#FF4081"/>
      <circle cx="28" cy="18" r="3" fill="#F50057"/>
      <circle cx="24" cy="28" r="2" fill="#FF80AB"/>
      {/* base */}
      <ellipse cx="24" cy="41" rx="8" ry="3" fill="#795548"/>
    </svg>
  );
}

export function ShrimpIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#E65100"/>
      {/* body segments (curved) */}
      <path d="M14 36 Q10 30 12 24 Q14 18 20 14 Q28 10 34 14 Q38 18 36 24 Q32 30 26 32 Q20 34 18 36 Q16 38 14 36Z" fill="#FF7043"/>
      {/* segment lines */}
      <path d="M18 32 Q16 28 18 24" stroke="#E64A19" strokeWidth="1.5" fill="none"/>
      <path d="M22 30 Q20 26 22 22" stroke="#E64A19" strokeWidth="1.5" fill="none"/>
      <path d="M26 28 Q26 24 28 20" stroke="#E64A19" strokeWidth="1.5" fill="none"/>
      {/* tail fan */}
      <path d="M14 36 Q10 40 8 38" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M14 36 Q12 42 10 42" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M14 36 Q16 42 14 44" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* head */}
      <circle cx="34" cy="14" r="6" fill="#FF7043"/>
      {/* eye */}
      <circle cx="37" cy="12" r="3" fill="white"/>
      <circle cx="37" cy="12" r="2" fill="#212121"/>
      <circle cx="37.5" cy="11.5" r="0.7" fill="white"/>
      {/* antennae */}
      <path d="M34 10 Q32 6 28 4" stroke="#FF7043" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M36 10 Q38 6 42 4" stroke="#FF7043" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function FishIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#01579B"/>
      {/* tail */}
      <path d="M10 24 L4 16 L8 24 L4 32 Z" fill="#039BE5"/>
      {/* body */}
      <ellipse cx="26" cy="24" rx="16" ry="10" fill="#29B6F6"/>
      {/* belly */}
      <ellipse cx="26" cy="26" rx="12" ry="6" fill="#B3E5FC"/>
      {/* fin top */}
      <path d="M20 14 Q26 10 32 14" fill="#039BE5"/>
      {/* fin bottom */}
      <path d="M22 34 Q26 38 30 34" fill="#039BE5"/>
      {/* scales */}
      <path d="M20 22 Q22 20 24 22" stroke="#0288D1" strokeWidth="1" fill="none"/>
      <path d="M26 20 Q28 18 30 20" stroke="#0288D1" strokeWidth="1" fill="none"/>
      <path d="M24 26 Q26 24 28 26" stroke="#0288D1" strokeWidth="1" fill="none"/>
      {/* eye */}
      <circle cx="36" cy="22" r="3.5" fill="white"/>
      <circle cx="36" cy="22" r="2.5" fill="#01579B"/>
      <circle cx="36.5" cy="21.5" r="0.8" fill="white"/>
      {/* mouth */}
      <path d="M40 24 Q42 26 40 28" stroke="#01579B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function WaveIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0277BD"/>
      {/* large wave */}
      <path d="M4 30 Q8 20 14 24 Q20 30 24 22 Q28 14 34 20 Q40 28 44 22" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* second wave */}
      <path d="M4 38 Q10 30 16 34 Q22 40 26 32 Q30 24 36 30 Q40 34 44 30" stroke="#90CAF9" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* foam dots */}
      <circle cx="14" cy="24" r="2" fill="white" opacity="0.6"/>
      <circle cx="34" cy="20" r="2" fill="white" opacity="0.6"/>
      <circle cx="24" cy="22" r="2.5" fill="white" opacity="0.8"/>
    </svg>
  );
}

// ─── JUNGLE extra (10–16) ────────────────────────────────────────────────────

export function CrocodileIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1B5E20"/>
      {/* body */}
      <ellipse cx="24" cy="30" rx="16" ry="8" fill="#388E3C"/>
      {/* scale bumps on back */}
      {[12,16,20,24,28,32,36].map((x,i) => (
        <ellipse key={i} cx={x} cy={26} rx="2" ry="3" fill="#2E7D32"/>
      ))}
      {/* head */}
      <path d="M8 24 Q8 18 24 16 Q40 18 40 24 Q40 28 24 30 Q8 28 8 24Z" fill="#43A047"/>
      {/* snout */}
      <path d="M8 24 Q4 22 4 24 Q4 26 8 26" fill="#43A047"/>
      {/* teeth */}
      {[12,16,20,24,28,32,36].map((x,i) => (
        <polygon key={i} points={`${x},16 ${x+1.5},12 ${x+3},16`} fill="white"/>
      ))}
      {/* eyes */}
      <circle cx="36" cy="20" r="4" fill="#388E3C"/>
      <circle cx="36" cy="20" r="2.5" fill="#FFD600"/>
      <ellipse cx="36" cy="20" rx="1" ry="2" fill="#212121"/>
      <circle cx="28" cy="20" r="4" fill="#388E3C"/>
      <circle cx="28" cy="20" r="2.5" fill="#FFD600"/>
      <ellipse cx="28" cy="20" rx="1" ry="2" fill="#212121"/>
    </svg>
  );
}

export function LizardIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#33691E"/>
      {/* tail */}
      <path d="M30 30 Q38 34 44 40 Q42 44 40 42 Q34 36 28 34" stroke="#558B2F" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* body */}
      <ellipse cx="22" cy="26" rx="10" ry="7" fill="#7CB342"/>
      {/* legs */}
      <path d="M16 24 Q10 20 8 16 Q10 18 14 22" stroke="#558B2F" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M28 24 Q34 20 36 16 Q34 18 30 22" stroke="#558B2F" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M16 30 Q10 34 8 40 Q10 38 14 34" stroke="#558B2F" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M28 30 Q34 34 36 38 Q34 36 30 32" stroke="#558B2F" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* head */}
      <ellipse cx="14" cy="22" rx="8" ry="6" fill="#8BC34A"/>
      {/* eye */}
      <circle cx="10" cy="20" r="3" fill="#FFD600"/>
      <circle cx="10" cy="20" r="2" fill="#212121"/>
      <circle cx="10.5" cy="19.5" r="0.7" fill="white"/>
      {/* tongue */}
      <path d="M6 22 L4 22 M4 22 L2 20 M4 22 L2 24" stroke="#F44336" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function ButterflyJungleIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1B5E20"/>
      {/* upper wings */}
      <path d="M24 24 Q14 12 6 14 Q2 20 8 26 Q14 30 24 24Z" fill="#F9A825"/>
      <path d="M24 24 Q34 12 42 14 Q46 20 40 26 Q34 30 24 24Z" fill="#F9A825"/>
      {/* lower wings */}
      <path d="M24 24 Q12 26 8 36 Q10 42 16 40 Q20 36 24 28Z" fill="#FF8F00"/>
      <path d="M24 24 Q36 26 40 36 Q38 42 32 40 Q28 36 24 28Z" fill="#FF8F00"/>
      {/* wing spots */}
      <circle cx="12" cy="20" r="4" fill="#1B5E20" opacity="0.5"/>
      <circle cx="36" cy="20" r="4" fill="#1B5E20" opacity="0.5"/>
      <circle cx="14" cy="32" r="3" fill="#1B5E20" opacity="0.4"/>
      <circle cx="34" cy="32" r="3" fill="#1B5E20" opacity="0.4"/>
      {/* body */}
      <ellipse cx="24" cy="24" rx="2" ry="8" fill="#4E342E"/>
      {/* antennae */}
      <path d="M23 17 Q20 12 18 10" stroke="#4E342E" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25 17 Q28 12 30 10" stroke="#4E342E" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="18" cy="10" r="2" fill="#FFD600"/>
      <circle cx="30" cy="10" r="2" fill="#FFD600"/>
    </svg>
  );
}

export function LeafClusterIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#2E7D32"/>
      {/* stem */}
      <path d="M24 42 Q22 34 20 26 Q24 22 28 26 Q26 34 24 42" stroke="#388E3C" strokeWidth="2" fill="#33691E"/>
      {/* large leaf */}
      <path d="M24 28 Q10 20 8 10 Q20 12 24 28Z" fill="#66BB6A"/>
      <path d="M24 28 Q10 20 8 10" stroke="#43A047" strokeWidth="1" fill="none"/>
      {/* right leaf */}
      <path d="M24 26 Q38 18 40 8 Q28 12 24 26Z" fill="#81C784"/>
      <path d="M24 26 Q38 18 40 8" stroke="#43A047" strokeWidth="1" fill="none"/>
      {/* top leaf */}
      <path d="M24 24 Q20 10 24 4 Q28 10 24 24Z" fill="#A5D6A7"/>
      {/* veins */}
      <line x1="24" y1="28" x2="12" y2="14" stroke="#2E7D32" strokeWidth="1"/>
      <line x1="24" y1="26" x2="36" y2="12" stroke="#2E7D32" strokeWidth="1"/>
    </svg>
  );
}

export function PalmTreeIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0277BD"/>
      {/* trunk */}
      <path d="M22 44 Q20 36 22 28 Q24 24 26 28 Q28 36 26 44" fill="#8D6E63"/>
      {/* trunk curve marks */}
      <path d="M22 40 Q24 39 26 40" stroke="#795548" strokeWidth="1" fill="none"/>
      <path d="M22 36 Q24 35 26 36" stroke="#795548" strokeWidth="1" fill="none"/>
      <path d="M22 32 Q24 31 26 32" stroke="#795548" strokeWidth="1" fill="none"/>
      {/* fronds */}
      <path d="M24 26 Q14 20 8 16 Q14 18 20 24" fill="#388E3C"/>
      <path d="M24 26 Q34 20 40 16 Q34 18 28 24" fill="#43A047"/>
      <path d="M24 26 Q18 16 18 8 Q22 16 24 24" fill="#2E7D32"/>
      <path d="M24 26 Q30 16 30 8 Q26 16 24 24" fill="#388E3C"/>
      <path d="M24 26 Q10 22 6 26 Q12 24 22 26" fill="#43A047"/>
      <path d="M24 26 Q38 22 42 26 Q36 24 26 26" fill="#2E7D32"/>
      {/* coconuts */}
      <circle cx="22" cy="26" r="3" fill="#795548"/>
      <circle cx="26" cy="28" r="3" fill="#6D4C41"/>
      {/* sun/water */}
      <circle cx="38" cy="10" r="5" fill="#FFD600" opacity="0.7"/>
      <path d="M4 38 Q12 34 20 38 Q28 42 36 38" stroke="#29B6F6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

export function HibiscusIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1A237E"/>
      {/* petals */}
      <ellipse cx="24" cy="12" rx="6" ry="10" fill="#E91E63"/>
      <ellipse cx="24" cy="36" rx="6" ry="10" fill="#E91E63"/>
      <ellipse cx="12" cy="24" rx="10" ry="6" fill="#EC407A"/>
      <ellipse cx="36" cy="24" rx="10" ry="6" fill="#EC407A"/>
      <ellipse cx="14.3" cy="14.3" rx="6" ry="10" fill="#F06292" transform="rotate(45,14.3,14.3)"/>
      <ellipse cx="33.7" cy="14.3" rx="6" ry="10" fill="#F06292" transform="rotate(-45,33.7,14.3)"/>
      <ellipse cx="14.3" cy="33.7" rx="6" ry="10" fill="#F06292" transform="rotate(-45,14.3,33.7)"/>
      <ellipse cx="33.7" cy="33.7" rx="6" ry="10" fill="#F06292" transform="rotate(45,33.7,33.7)"/>
      {/* center circle */}
      <circle cx="24" cy="24" r="7" fill="#FFD600"/>
      {/* stamen */}
      <circle cx="24" cy="24" r="4" fill="#FF6F00"/>
      <circle cx="24" cy="24" r="2" fill="#E65100"/>
      {/* pollen dots */}
      {[0,60,120,180,240,300].map((a,i) => (
        <circle key={i} cx={24+5.5*Math.cos(a*Math.PI/180)} cy={24+5.5*Math.sin(a*Math.PI/180)} r="1.2" fill="#FFD600"/>
      ))}
    </svg>
  );
}

export function CaterpillarIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#33691E"/>
      {/* body segments */}
      <circle cx="36" cy="28" r="6" fill="#7CB342"/>
      <circle cx="28" cy="26" r="6" fill="#8BC34A"/>
      <circle cx="20" cy="26" r="6" fill="#7CB342"/>
      <circle cx="12" cy="28" r="6" fill="#8BC34A"/>
      {/* dots on body */}
      <circle cx="36" cy="26" r="2" fill="#558B2F"/>
      <circle cx="28" cy="24" r="2" fill="#558B2F"/>
      <circle cx="20" cy="24" r="2" fill="#558B2F"/>
      <circle cx="12" cy="26" r="2" fill="#558B2F"/>
      {/* head */}
      <circle cx="40" cy="22" r="7" fill="#AED581"/>
      {/* eyes */}
      <circle cx="38" cy="20" r="2.5" fill="white"/>
      <circle cx="43" cy="20" r="2.5" fill="white"/>
      <circle cx="38" cy="20" r="1.5" fill="#212121"/>
      <circle cx="43" cy="20" r="1.5" fill="#212121"/>
      <circle cx="38.5" cy="19.5" r="0.5" fill="white"/>
      <circle cx="43.5" cy="19.5" r="0.5" fill="white"/>
      {/* smile */}
      <path d="M37 24 Q40 27 43 24" stroke="#558B2F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* antennae */}
      <path d="M40 16 Q38 10 36 8" stroke="#558B2F" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M42 16 Q44 10 46 8" stroke="#558B2F" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="36" cy="8" r="2" fill="#FF7043"/>
      <circle cx="46" cy="8" r="2" fill="#FF7043"/>
      {/* legs */}
      {[12,20,28,36].map((x,i) => (
        <React.Fragment key={i}>
          <line x1={x} y1="32" x2={x-3} y2="38" stroke="#558B2F" strokeWidth="2" strokeLinecap="round"/>
          <line x1={x} y1="32" x2={x+3} y2="38" stroke="#558B2F" strokeWidth="2" strokeLinecap="round"/>
        </React.Fragment>
      ))}
    </svg>
  );
}

// ─── SPACE extra (10–16) ─────────────────────────────────────────────────────

export function GalaxyIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0D0221"/>
      {/* spiral arms */}
      <path d="M24 24 Q32 18 38 10 Q36 20 30 24 Q36 28 38 38 Q32 30 24 24Z" fill="#7E57C2" opacity="0.8"/>
      <path d="M24 24 Q16 30 10 38 Q12 28 18 24 Q12 20 10 10 Q16 18 24 24Z" fill="#5C35A5" opacity="0.8"/>
      {/* core */}
      <circle cx="24" cy="24" r="6" fill="#FFD600" opacity="0.9"/>
      <circle cx="24" cy="24" r="3" fill="white"/>
      {/* stars scattered */}
      <circle cx="10" cy="14" r="1.2" fill="white"/>
      <circle cx="38" cy="34" r="1" fill="white"/>
      <circle cx="36" cy="12" r="1.5" fill="#B39DDB"/>
      <circle cx="12" cy="36" r="1.5" fill="#B39DDB"/>
      <circle cx="30" cy="8" r="1" fill="white"/>
      <circle cx="18" cy="40" r="1" fill="white"/>
    </svg>
  );
}

export function TelescopeSpaceIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1A237E"/>
      {/* tripod */}
      <line x1="24" y1="32" x2="16" y2="44" stroke="#795548" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="32" x2="32" y2="44" stroke="#795548" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="36" x2="24" y2="44" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
      {/* tube */}
      <rect x="10" y="14" width="26" height="9" rx="4.5" fill="#8D6E63" transform="rotate(-15,23,18)"/>
      {/* lens */}
      <circle cx="34" cy="12" r="5" fill="#B0BEC5"/>
      <circle cx="34" cy="12" r="3.5" fill="#CFD8DC"/>
      <circle cx="34" cy="12" r="2" fill="#81D4FA"/>
      {/* eyepiece */}
      <circle cx="12" cy="26" r="4" fill="#5D4037"/>
      <circle cx="12" cy="26" r="2.5" fill="#212121"/>
      {/* nebula in view */}
      <circle cx="34" cy="12" r="1" fill="#FF80AB"/>
      {/* stars */}
      <circle cx="8" cy="10" r="1.2" fill="white"/>
      <circle cx="40" cy="20" r="1" fill="white"/>
      <circle cx="38" cy="6" r="1.5" fill="#90CAF9"/>
    </svg>
  );
}

export function ShootingStarIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#0D0221"/>
      {/* trail */}
      <path d="M36 10 L6 32" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      <path d="M36 10 L10 30" stroke="#FFD600" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
      <path d="M36 10 L14 28" stroke="#FFD600" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
      <path d="M36 10 L18 26" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* star head */}
      <polygon points="36,4 37.5,8.5 42,8.5 38.5,11.5 40,16 36,13.5 32,16 33.5,11.5 30,8.5 34.5,8.5" fill="#FFD600"/>
      {/* background stars */}
      <circle cx="10" cy="12" r="1.2" fill="white"/>
      <circle cx="42" cy="28" r="1" fill="white"/>
      <circle cx="16" cy="38" r="1.5" fill="#B39DDB"/>
      <circle cx="38" cy="40" r="1" fill="white"/>
    </svg>
  );
}

export function SatelliteIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1A237E"/>
      {/* solar panels */}
      <rect x="4" y="20" width="14" height="8" rx="2" fill="#1565C0"/>
      <line x1="4" y1="22" x2="18" y2="22" stroke="#42A5F5" strokeWidth="1"/>
      <line x1="4" y1="24" x2="18" y2="24" stroke="#42A5F5" strokeWidth="1"/>
      <line x1="4" y1="26" x2="18" y2="26" stroke="#42A5F5" strokeWidth="1"/>
      <rect x="30" y="20" width="14" height="8" rx="2" fill="#1565C0"/>
      <line x1="30" y1="22" x2="44" y2="22" stroke="#42A5F5" strokeWidth="1"/>
      <line x1="30" y1="24" x2="44" y2="24" stroke="#42A5F5" strokeWidth="1"/>
      <line x1="30" y1="26" x2="44" y2="26" stroke="#42A5F5" strokeWidth="1"/>
      {/* body */}
      <rect x="18" y="18" width="12" height="12" rx="3" fill="#90A4AE"/>
      <rect x="20" y="20" width="8" height="8" rx="2" fill="#CFD8DC"/>
      {/* panel connectors */}
      <rect x="16" y="22" width="4" height="4" rx="1" fill="#607D8B"/>
      <rect x="28" y="22" width="4" height="4" rx="1" fill="#607D8B"/>
      {/* dish */}
      <path d="M26 18 Q30 12 34 14" stroke="#B0BEC5" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="34" cy="14" r="3" fill="#90A4AE"/>
      <circle cx="34" cy="14" r="1.5" fill="#E0E0E0"/>
      {/* signal waves */}
      <path d="M36 12 Q40 8 42 10" stroke="#29B6F6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M36 14 Q42 10 46 14" stroke="#29B6F6" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* earth below */}
      <circle cx="10" cy="40" r="6" fill="#1976D2"/>
      <path d="M6 38 Q8 36 10 38 Q12 40 10 42 Q8 40 6 38Z" fill="#4CAF50"/>
      {/* stars */}
      <circle cx="42" cy="36" r="1.2" fill="white"/>
      <circle cx="6" cy="14" r="1" fill="white"/>
    </svg>
  );
}

export function SunSpaceIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#E65100"/>
      {/* rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <line key={i}
          x1={24+16*Math.cos(a*Math.PI/180)} y1={24+16*Math.sin(a*Math.PI/180)}
          x2={24+22*Math.cos(a*Math.PI/180)} y2={24+22*Math.sin(a*Math.PI/180)}
          stroke="#FFD600" strokeWidth="3" strokeLinecap="round"/>
      ))}
      {/* sun body */}
      <circle cx="24" cy="24" r="14" fill="#FFD600"/>
      <circle cx="24" cy="24" r="11" fill="#FFEE58"/>
      <circle cx="24" cy="24" r="8" fill="#FFD600"/>
      {/* face */}
      <circle cx="20" cy="22" r="2" fill="#FF6F00"/>
      <circle cx="28" cy="22" r="2" fill="#FF6F00"/>
      <path d="M19 27 Q24 31 29 27" stroke="#FF6F00" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* flares */}
      <path d="M10 10 Q14 14 12 18" stroke="#FF8F00" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M38 10 Q34 14 36 18" stroke="#FF8F00" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

export function MarsIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#1A237E"/>
      {/* planet */}
      <circle cx="24" cy="24" r="16" fill="#D32F2F"/>
      {/* surface features */}
      <path d="M12 20 Q18 16 26 18 Q32 16 36 20 Q32 16 26 14 Q18 12 12 20Z" fill="#B71C1C" opacity="0.6"/>
      <circle cx="20" cy="28" r="5" fill="#C62828" opacity="0.7"/>
      <circle cx="30" cy="22" r="3" fill="#B71C1C" opacity="0.5"/>
      {/* polar ice cap */}
      <path d="M16 12 Q24 8 32 12 Q28 14 24 13 Q20 14 16 12Z" fill="white" opacity="0.8"/>
      {/* valles marineris crack */}
      <path d="M12 24 Q20 22 28 24 Q34 22 36 26" stroke="#8D1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* shine */}
      <path d="M14 14 Q18 12 20 16 Q16 15 14 14Z" fill="white" opacity="0.3"/>
      {/* stars */}
      <circle cx="6" cy="8" r="1.2" fill="white"/>
      <circle cx="40" cy="6" r="1.5" fill="white"/>
      <circle cx="44" cy="34" r="1" fill="white"/>
      <circle cx="4" cy="40" r="1.2" fill="white"/>
    </svg>
  );
}

export function NewMoonIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#212121"/>
      {/* dark moon with slight visible rim */}
      <circle cx="24" cy="24" r="16" fill="#1A1A1A"/>
      <circle cx="24" cy="24" r="16" fill="none" stroke="#424242" strokeWidth="1.5"/>
      {/* subtle crater shadows */}
      <circle cx="18" cy="20" r="3" fill="#262626" stroke="#303030" strokeWidth="0.5"/>
      <circle cx="28" cy="28" r="4" fill="#1E1E1E" stroke="#2C2C2C" strokeWidth="0.5"/>
      <circle cx="30" cy="18" r="2" fill="#252525" stroke="#303030" strokeWidth="0.5"/>
      {/* thin crescent rim glow */}
      <path d="M20 8 Q10 16 10 28 Q10 36 16 40" stroke="#607D8B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* stars around */}
      <circle cx="8" cy="10" r="1.5" fill="white"/>
      <circle cx="40" cy="8" r="2" fill="white"/>
      <circle cx="42" cy="32" r="1.5" fill="white"/>
      <circle cx="6" cy="36" r="1" fill="white"/>
      <circle cx="38" cy="42" r="1.2" fill="#B39DDB"/>
      {/* bright star nearby */}
      <polygon points="42,14 43,18 47,18 44,20.5 45,24 42,22 39,24 40,20.5 37,18 41,18" fill="white" opacity="0.8"/>
    </svg>
  );
}

// ─── LOOKUP TABLE (SVG fallbacks) ────────────────────────────────────────────

import { type ThemeId } from '@/lib/themes';
import iconSetsConfig from '@/config/icon-sets.json';

// Pre-build a symbol lookup: themeId → value (1-based) → emoji string
const _emojiMap: Record<string, string[]> = {};
for (const set of iconSetsConfig) {
  if (set.symbols?.length) _emojiMap[set.id] = set.symbols;
}

const ICON_MAP: Record<ThemeId, React.FC<IconProps>[]> = {
  shapes:    [Shape1Icon, Shape2Icon, Shape3Icon, Shape4Icon, Shape5Icon, Shape6Icon, Shape7Icon, Shape8Icon, Shape9Icon, Shape10Icon, Shape11Icon, Shape12Icon, Shape13Icon, Shape14Icon, Shape15Icon, Shape16Icon],
  adventure: [ExplorerGirlIcon, FoxIcon, MapIcon, BackpackIcon, FlowerIcon, TelescopeIcon, KeyIcon, RainbowIcon, TrophyIcon, CompassIcon, CampfireIcon, MoonLanternIcon, ButterflyAdventureIcon, MushroomIcon, WandIcon, DartboardIcon],
  superhero: [SpiderManIcon, SupermanIcon, BatmanIcon, WonderWomanIcon, IronManIcon, CaptainAmericaIcon, ThorIcon, HulkIcon, FlashIcon, VillainIcon, TornadoIcon, SparkleStarIcon, EagleIcon, CrossedSwordsIcon, MagnetIcon, BullseyeIcon],
  ocean:     [DolphinIcon, OctopusIcon, SharkIcon, ClownfishIcon, CrabIcon, PufferfishIcon, SquidIcon, TurtleIcon, LobsterIcon, WhaleIcon, SealIcon, SeashellIcon, CoralIcon, ShrimpIcon, FishIcon, WaveIcon],
  jungle:    [MonkeyIcon, LionIcon, ElephantIcon, GiraffeIcon, ZebraIcon, RhinoIcon, LeopardIcon, GorillaIcon, ParrotIcon, CrocodileIcon, LizardIcon, ButterflyJungleIcon, LeafClusterIcon, PalmTreeIcon, HibiscusIcon, CaterpillarIcon],
  space:     [RocketIcon, StarIcon, MoonIcon, CometIcon, SaturnIcon, EarthIcon, AlienIcon, UFOIcon, AstronautIcon, GalaxyIcon, TelescopeSpaceIcon, ShootingStarIcon, SatelliteIcon, SunSpaceIcon, NewMoonIcon, MarsIcon],
};

// ─── Custom image probe (public/themes/{themeId}/{value}.{ext}) ───────────────
//
// Each {themeId}/{value} slot is probed at most ONCE per session and the result
// is cached in _probeCache. Subsequent renders read from the cache directly.
//
// To use custom images, drop files into:
//   public/themes/{themeId}/{value}.png  (or .jpg .jpeg .webp .gif)
//
// Theme IDs: superhero | adventure | ocean | jungle | space | shapes
// Values: 1 – 9 (matching the grid symbols)
//
// If no file is found the SVG icon is used as the fallback.

const PROBE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

// undefined = not yet probed | null = all extensions failed | string = found URL
const _probeCache = new Map<string, string | null>();

function probeThemeImage(baseUrl: string, themeId: string, value: number): Promise<string | null> {
  const key = `${themeId}/${value}`;
  if (_probeCache.has(key)) return Promise.resolve(_probeCache.get(key) ?? null);

  return new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= PROBE_EXTS.length) {
        _probeCache.set(key, null);
        resolve(null);
        return;
      }
      // Normalise: BASE_URL ends with /, themes path has no leading /
      const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const src = `${base}themes/${themeId}/${value}.${PROBE_EXTS[i++]}`;
      const img = new window.Image();
      img.onload = () => { _probeCache.set(key, src); resolve(src); };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}

export function useThemeImageSrc(themeId: string, value: number): string | null | undefined {
  const base = import.meta.env.BASE_URL ?? '/';
  const key = `${themeId}/${value}`;

  const [src, setSrc] = React.useState<string | null | undefined>(() =>
    _probeCache.has(key) ? (_probeCache.get(key) ?? null) : undefined
  );

  React.useEffect(() => {
    if (_probeCache.has(key)) {
      setSrc(_probeCache.get(key) ?? null);
      return;
    }
    // Fire the probe; result updates state via setSrc
    probeThemeImage(base, themeId, value).then(setSrc);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return src;
}

// ─── ThemeIcon: public image → SVG fallback ───────────────────────────────────

export function ThemeIcon({ themeId, value, size = 40 }: { themeId: ThemeId; value: number; size?: number }) {
  const imageSrc = useThemeImageSrc(themeId, value);

  // Custom image found — render it
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`${themeId} ${value}`}
        draggable={false}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
        }}
      />
    );
  }

  // While probing (undefined) or failed (null) → SVG fallback if available
  const icons = ICON_MAP[themeId as ThemeId];
  if (icons) {
    const Icon = icons[(value - 1) % icons.length];
    if (Icon) return <Icon size={size} />;
  }

  // Emoji fallback for icon sets that have no SVG map (e.g. princess, vehicles, etc.)
  const emojis = _emojiMap[themeId];
  if (emojis?.length) {
    const sym = emojis[(value - 1) % emojis.length];
    return <span style={{ fontSize: size * 0.8, lineHeight: 1, userSelect: 'none' }}>{sym}</span>;
  }

  // Last resort: shapes
  const fallback = ICON_MAP.shapes;
  const FallbackIcon = fallback[(value - 1) % fallback.length];
  return FallbackIcon ? <FallbackIcon size={size} /> : null;
}
