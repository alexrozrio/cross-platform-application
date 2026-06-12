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

// ─── LOOKUP TABLE (SVG fallbacks) ────────────────────────────────────────────

import { type ThemeId } from '@/lib/themes';

const ICON_MAP: Record<ThemeId, React.FC<IconProps>[]> = {
  shapes:     [Shape1Icon, Shape2Icon, Shape3Icon, Shape4Icon, Shape5Icon, Shape6Icon, Shape7Icon, Shape8Icon, Shape9Icon],
  adventure:  [ExplorerGirlIcon, FoxIcon, MapIcon, BackpackIcon, FlowerIcon, TelescopeIcon, KeyIcon, RainbowIcon, TrophyIcon],
  superhero:  [SpiderManIcon, SupermanIcon, BatmanIcon, WonderWomanIcon, IronManIcon, CaptainAmericaIcon, ThorIcon, HulkIcon, FlashIcon],
  ocean:      [DolphinIcon, OctopusIcon, SharkIcon, ClownfishIcon, CrabIcon, PufferfishIcon, SquidIcon, TurtleIcon, LobsterIcon],
  jungle:     [MonkeyIcon, LionIcon, ElephantIcon, GiraffeIcon, ZebraIcon, RhinoIcon, LeopardIcon, GorillaIcon, ParrotIcon],
  space:      [RocketIcon, StarIcon, MoonIcon, CometIcon, SaturnIcon, EarthIcon, AlienIcon, UFOIcon, AstronautIcon],
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

function useThemeImageSrc(themeId: string, value: number): string | null | undefined {
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

  // While probing (undefined) or failed (null) → SVG fallback
  const icons = ICON_MAP[themeId as ThemeId] ?? ICON_MAP.shapes;
  const Icon = icons[(value - 1) % icons.length];
  return Icon ? <Icon size={size} /> : null;
}
