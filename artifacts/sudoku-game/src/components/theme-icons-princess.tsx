import React from 'react';

interface IconProps { size?: number }

export function Princess1Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F8BBD9"/>
      {/* face */}
      <ellipse cx="24" cy="27" rx="11" ry="13" fill="#FFCCBC"/>
      {/* crown */}
      <polygon points="13,22 13,17 17,20 24,14 31,20 35,17 35,22" fill="#FFD700"/>
      {/* crown gems */}
      <circle cx="24" cy="16" r="2" fill="#E53935"/>
      <circle cx="17" cy="20" r="1.5" fill="#1E88E5"/>
      <circle cx="31" cy="20" r="1.5" fill="#43A047"/>
      {/* rosy cheeks */}
      <ellipse cx="16" cy="29" rx="3" ry="2" fill="#F48FB1" opacity="0.7"/>
      <ellipse cx="32" cy="29" rx="3" ry="2" fill="#F48FB1" opacity="0.7"/>
      {/* eyes */}
      <ellipse cx="20" cy="26" rx="1.5" ry="1.8" fill="#4E342E"/>
      <ellipse cx="28" cy="26" rx="1.5" ry="1.8" fill="#4E342E"/>
      {/* smile */}
      <path d="M20 32 Q24 36 28 32" stroke="#E91E63" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function Princess2Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#CE93D8"/>
      {/* crown base band */}
      <rect x="9" y="28" width="30" height="7" rx="2" fill="#FFD700"/>
      {/* crown 5 points */}
      <polygon points="9,28 9,18 13,23 16,16 19,22 24,13 29,22 32,16 35,23 39,18 39,28" fill="#FFD700"/>
      {/* gems on crown points */}
      <circle cx="24" cy="16" r="2.5" fill="#E53935"/>
      <circle cx="16" cy="20" r="2" fill="#1E88E5"/>
      <circle cx="32" cy="20" r="2" fill="#43A047"/>
      {/* sparkle dots */}
      <circle cx="14" cy="31" r="1.5" fill="white"/>
      <circle cx="24" cy="32" r="1.5" fill="white"/>
      <circle cx="34" cy="31" r="1.5" fill="white"/>
      <circle cx="19" cy="31.5" r="1" fill="white"/>
      <circle cx="29" cy="31.5" r="1" fill="white"/>
    </svg>
  );
}

export function Princess3Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F8BBD9"/>
      {/* castle wall base */}
      <rect x="8" y="28" width="32" height="14" rx="1" fill="#F48FB1"/>
      {/* main center tower */}
      <rect x="18" y="16" width="12" height="26" rx="1" fill="#EC407A"/>
      {/* left tower */}
      <rect x="7" y="20" width="10" height="22" rx="1" fill="#F48FB1"/>
      {/* right tower */}
      <rect x="31" y="20" width="10" height="22" rx="1" fill="#F48FB1"/>
      {/* center turret top */}
      <polygon points="18,16 20,12 24,10 28,12 30,16" fill="#EC407A"/>
      {/* left turret top */}
      <polygon points="7,20 9,15 12,13 15,15 17,20" fill="#F48FB1"/>
      {/* right turret top */}
      <polygon points="31,20 33,15 36,13 39,15 41,20" fill="#F48FB1"/>
      {/* arched door */}
      <path d="M21 42 L21 35 Q24 31 27 35 L27 42Z" fill="#880E4F"/>
      {/* heart window on center tower */}
      <path d="M22 22 Q22 19 24 21 Q26 19 26 22 Q26 25 24 26 Q22 25 22 22Z" fill="#FCE4EC"/>
      {/* flags */}
      <line x1="24" y1="10" x2="24" y2="7" stroke="#880E4F" strokeWidth="1.5"/>
      <polygon points="24,7 28,8.5 24,10" fill="#FFD700"/>
    </svg>
  );
}

export function Princess4Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E1BEE7"/>
      {/* diamond facets */}
      <polygon points="24,8 32,20 24,26 16,20" fill="#81D4FA"/>
      <polygon points="24,8 32,20 38,28 24,26" fill="#4FC3F7"/>
      <polygon points="24,8 16,20 10,28 24,26" fill="#B3E5FC"/>
      <polygon points="24,26 10,28 24,40 38,28" fill="#29B6F6"/>
      <polygon points="24,26 10,28 24,40" fill="#0288D1"/>
      <polygon points="24,26 38,28 24,40" fill="#81D4FA"/>
      {/* sparkle lines */}
      <line x1="24" y1="4" x2="24" y2="7" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="41" x2="24" y2="44" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4" y1="24" x2="7" y2="24" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="41" y1="24" x2="44" y2="24" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="8" x2="10" y2="10" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="8" x2="38" y2="10" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="40" x2="10" y2="38" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="38" y2="38" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function Princess5Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F3E5F5"/>
      {/* neck */}
      <rect x="21" y="33" width="6" height="6" rx="2" fill="#FAFAFA"/>
      {/* horse head */}
      <ellipse cx="24" cy="26" rx="9" ry="10" fill="#FAFAFA"/>
      {/* snout */}
      <ellipse cx="24" cy="33" rx="5" ry="3.5" fill="#F5F5F5"/>
      {/* nostril */}
      <ellipse cx="22" cy="33.5" rx="1" ry="0.8" fill="#E0E0E0"/>
      <ellipse cx="26" cy="33.5" rx="1" ry="0.8" fill="#E0E0E0"/>
      {/* blue eye */}
      <ellipse cx="29" cy="24" rx="2" ry="2.2" fill="#1E88E5"/>
      <circle cx="29.5" cy="23.5" r="0.8" fill="white"/>
      {/* horn */}
      <polygon points="32,16 34,8 36,16" fill="#FFD700"/>
      <line x1="33" y1="11" x2="35" y2="11" stroke="#FFA000" strokeWidth="0.8"/>
      <line x1="32.5" y1="13.5" x2="35.5" y2="13.5" stroke="#FFA000" strokeWidth="0.8"/>
      {/* rainbow mane streaks */}
      <path d="M15 18 Q10 15 12 10" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M15 21 Q9 18 10 12" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M15 24 Q8 22 9 16" stroke="#FFEB3B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M16 27 Q9 26 10 20" stroke="#66BB6A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M17 29 Q11 30 13 24" stroke="#42A5F5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function Princess6Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
      {/* wand handle */}
      <rect x="22" y="26" width="5" height="18" rx="2.5" fill="#7B1FA2"/>
      {/* star at top */}
      <polygon points="24,8 25.8,13.5 31.5,13.5 26.9,17 28.5,22.5 24,19 19.5,22.5 21.1,17 16.5,13.5 22.2,13.5" fill="#FFD700"/>
      {/* sparkle lines from star */}
      <line x1="24" y1="5" x2="24" y2="7" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="7" x2="31.5" y2="5.5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="7" x2="16.5" y2="5.5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="33" y1="13" x2="35" y2="12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="13" x2="13" y2="12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      {/* small sparkle dots */}
      <circle cx="35" cy="20" r="1.5" fill="#FFD700"/>
      <circle cx="13" cy="20" r="1.5" fill="#FFD700"/>
      <circle cx="32" cy="28" r="1.2" fill="#F48FB1"/>
      <circle cx="16" cy="28" r="1.2" fill="#F48FB1"/>
    </svg>
  );
}

export function Princess7Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E8EAF6"/>
      {/* body/dress */}
      <path d="M19 30 Q24 28 29 30 L31 42 Q24 44 17 42Z" fill="#CE93D8"/>
      {/* torso */}
      <rect x="20" y="22" width="8" height="10" rx="3" fill="#F8BBD9"/>
      {/* head */}
      <circle cx="24" cy="18" r="6" fill="#FFCCBC"/>
      {/* hair */}
      <path d="M18 16 Q16 10 24 12 Q32 10 30 16" fill="#FFD54F"/>
      {/* butterfly wing left */}
      <ellipse cx="14" cy="24" rx="7" ry="5" fill="#F48FB1" transform="rotate(-20,14,24)"/>
      <ellipse cx="13" cy="30" rx="5" ry="3.5" fill="#CE93D8" transform="rotate(-10,13,30)"/>
      {/* butterfly wing right */}
      <ellipse cx="34" cy="24" rx="7" ry="5" fill="#F48FB1" transform="rotate(20,34,24)"/>
      <ellipse cx="35" cy="30" rx="5" ry="3.5" fill="#CE93D8" transform="rotate(10,35,30)"/>
      {/* wand */}
      <line x1="29" y1="25" x2="36" y2="18" stroke="#9575CD" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="36,18 37.5,14.5 39,18 35.5,16.5" fill="#FFD700"/>
      {/* sparkle dots */}
      <circle cx="40" cy="14" r="1.5" fill="#FFD700"/>
      <circle cx="37" cy="12" r="1" fill="#FFD700"/>
      <circle cx="41" cy="17" r="1" fill="#FFD700"/>
    </svg>
  );
}

export function Princess8Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* rainbow arcs - 6 colors, bold */}
      <path d="M7 30 Q7 10 24 10 Q41 10 41 30" stroke="#E53935" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M9 30 Q9 12 24 12 Q39 12 39 30" stroke="#FF9800" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M11 30 Q11 14 24 14 Q37 14 37 30" stroke="#FFEB3B" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M13 30 Q13 16 24 16 Q35 16 35 30" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M15 30 Q15 18 24 18 Q33 18 33 30" stroke="#2196F3" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M17 30 Q17 20 24 20 Q31 20 31 30" stroke="#3F51B5" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* white clouds at ends */}
      <ellipse cx="8" cy="32" rx="5" ry="3.5" fill="white"/>
      <ellipse cx="6" cy="30" rx="3.5" ry="3" fill="white"/>
      <ellipse cx="11" cy="30" rx="3" ry="2.5" fill="white"/>
      <ellipse cx="40" cy="32" rx="5" ry="3.5" fill="white"/>
      <ellipse cx="42" cy="30" rx="3.5" ry="3" fill="white"/>
      <ellipse cx="37" cy="30" rx="3" ry="2.5" fill="white"/>
    </svg>
  );
}

export function Princess9Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
      {/* left bow loop */}
      <ellipse cx="14" cy="22" rx="8" ry="6" fill="#F48FB1" transform="rotate(-20,14,22)"/>
      {/* right bow loop */}
      <ellipse cx="34" cy="22" rx="8" ry="6" fill="#F48FB1" transform="rotate(20,34,22)"/>
      {/* left tail */}
      <path d="M20 26 Q14 32 10 38 Q12 36 16 38 Q18 34 22 28Z" fill="#F06292"/>
      {/* right tail */}
      <path d="M28 26 Q34 32 38 38 Q36 36 32 38 Q30 34 26 28Z" fill="#F06292"/>
      {/* center knot */}
      <ellipse cx="24" cy="24" rx="4" ry="4" fill="white"/>
      <ellipse cx="24" cy="24" rx="3" ry="2.5" fill="#F8BBD9"/>
    </svg>
  );
}

export function Princess10Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
      {/* stem */}
      <path d="M24 40 Q22 34 24 28" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* left leaf */}
      <path d="M24 34 Q18 30 16 34 Q19 36 24 34Z" fill="#4CAF50"/>
      {/* right leaf */}
      <path d="M24 34 Q30 30 32 34 Q29 36 24 34Z" fill="#4CAF50"/>
      {/* rose outer petals */}
      <circle cx="24" cy="22" r="9" fill="#E53935"/>
      <ellipse cx="24" cy="13.5" rx="4" ry="3.5" fill="#EF5350"/>
      <ellipse cx="24" cy="30.5" rx="4" ry="3.5" fill="#EF5350"/>
      <ellipse cx="15.5" cy="22" rx="3.5" ry="4" fill="#EF5350"/>
      <ellipse cx="32.5" cy="22" rx="3.5" ry="4" fill="#EF5350"/>
      {/* inner spiral */}
      <circle cx="24" cy="22" r="5" fill="#C62828"/>
      <circle cx="24" cy="22" r="3" fill="#E53935"/>
      <path d="M24 19 Q27 20 26 23 Q25 26 22 24 Q20 22 22 20 Q23 18 24 19Z" fill="#B71C1C"/>
    </svg>
  );
}

export function Princess11Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
      {/* mirror handle */}
      <rect x="21" y="33" width="6" height="12" rx="3" fill="#FFB300"/>
      <rect x="20" y="36" width="8" height="2" rx="1" fill="#FFA000"/>
      {/* mirror frame */}
      <ellipse cx="24" cy="22" rx="12" ry="14" fill="#FFD54F"/>
      {/* mirror surface */}
      <ellipse cx="24" cy="22" rx="10" ry="12" fill="#E3F2FD"/>
      {/* sparkle glint */}
      <line x1="19" y1="14" x2="20" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="15" x2="21" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      {/* small reflection shine */}
      <ellipse cx="20" cy="18" rx="3" ry="4" fill="white" opacity="0.4"/>
    </svg>
  );
}

export function Princess12Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
      {/* carriage body - pumpkin round */}
      <ellipse cx="24" cy="26" rx="14" ry="12" fill="#FF8A65"/>
      {/* pumpkin ridges */}
      <path d="M16 17 Q14 26 16 35" stroke="#F4511E" strokeWidth="2" fill="none"/>
      <path d="M20 15 Q18 26 20 37" stroke="#F4511E" strokeWidth="2" fill="none"/>
      <path d="M24 14 Q24 26 24 38" stroke="#F4511E" strokeWidth="2" fill="none"/>
      <path d="M28 15 Q30 26 28 37" stroke="#F4511E" strokeWidth="2" fill="none"/>
      <path d="M32 17 Q34 26 32 35" stroke="#F4511E" strokeWidth="2" fill="none"/>
      {/* door */}
      <rect x="20" y="22" width="8" height="10" rx="3" fill="#FFCCBC"/>
      {/* heart on door */}
      <path d="M23 26 Q23 24 24 25 Q25 24 25 26 Q25 28 24 29 Q23 28 23 26Z" fill="#E91E63"/>
      {/* large gold wheels */}
      <circle cx="13" cy="34" r="6" fill="#FFD700"/>
      <circle cx="13" cy="34" r="3.5" fill="#FFA000"/>
      <circle cx="13" cy="34" r="1.5" fill="#FFD700"/>
      <circle cx="35" cy="34" r="6" fill="#FFD700"/>
      <circle cx="35" cy="34" r="3.5" fill="#FFA000"/>
      <circle cx="35" cy="34" r="1.5" fill="#FFD700"/>
      {/* bow on top */}
      <ellipse cx="20" cy="15" rx="5" ry="3" fill="#F48FB1" transform="rotate(-20,20,15)"/>
      <ellipse cx="28" cy="15" rx="5" ry="3" fill="#F48FB1" transform="rotate(20,28,15)"/>
      <circle cx="24" cy="15" r="2.5" fill="white"/>
    </svg>
  );
}

export function Princess13Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* slipper sole */}
      <ellipse cx="24" cy="34" rx="15" ry="5" fill="#90CAF9"/>
      {/* heel */}
      <rect x="9" y="30" width="4" height="8" rx="1" fill="#64B5F6"/>
      {/* slipper upper body */}
      <path d="M13 30 Q14 20 22 18 Q32 16 37 24 Q38 28 36 30 Q28 34 13 30Z" fill="#BBDEFB"/>
      {/* toe highlight */}
      <ellipse cx="32" cy="25" rx="4" ry="2.5" fill="#E3F2FD" opacity="0.8"/>
      {/* sparkle dots */}
      <circle cx="38" cy="18" r="1.8" fill="#FFD700"/>
      <circle cx="41" cy="22" r="1.2" fill="#FFD700"/>
      <circle cx="40" cy="14" r="1.2" fill="#FFD700"/>
      <circle cx="10" cy="20" r="1.5" fill="#FFD700"/>
      <circle cx="8" cy="25" r="1" fill="#FFD700"/>
      <circle cx="12" cy="16" r="1" fill="#FFD700"/>
    </svg>
  );
}

export function Princess14Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFFDE7"/>
      {/* upper left wing */}
      <ellipse cx="14" cy="18" rx="9" ry="7" fill="#CE93D8" transform="rotate(-30,14,18)"/>
      {/* upper right wing */}
      <ellipse cx="34" cy="18" rx="9" ry="7" fill="#CE93D8" transform="rotate(30,34,18)"/>
      {/* lower left wing */}
      <ellipse cx="12" cy="30" rx="7" ry="5" fill="#F48FB1" transform="rotate(15,12,30)"/>
      {/* lower right wing */}
      <ellipse cx="36" cy="30" rx="7" ry="5" fill="#F48FB1" transform="rotate(-15,36,30)"/>
      {/* wing eye spots */}
      <circle cx="14" cy="18" r="3" fill="#FFD700"/>
      <circle cx="14" cy="18" r="1.5" fill="#E91E63"/>
      <circle cx="34" cy="18" r="3" fill="#FFD700"/>
      <circle cx="34" cy="18" r="1.5" fill="#E91E63"/>
      {/* body */}
      <ellipse cx="24" cy="25" rx="3" ry="7" fill="#4E342E"/>
      {/* antennae */}
      <path d="M22 19 Q18 12 16 9" stroke="#4E342E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="16" cy="9" r="2" fill="#E91E63"/>
      <path d="M26 19 Q30 12 32 9" stroke="#4E342E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="32" cy="9" r="2" fill="#E91E63"/>
    </svg>
  );
}

export function Princess15Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#311B92"/>
      {/* crescent moon */}
      <circle cx="20" cy="20" r="10" fill="#FFD700"/>
      <circle cx="24" cy="17" r="9" fill="#311B92"/>
      {/* large gold star */}
      <polygon points="36,22 37.8,27.5 43.5,27.5 38.9,31 40.5,36.5 36,33 31.5,36.5 33.1,31 28.5,27.5 34.2,27.5" fill="#FFD700"/>
      {/* small scattered stars */}
      <polygon points="10,30 10.8,32.5 13.5,32.5 11.3,34 12.1,36.5 10,35 7.9,36.5 8.7,34 6.5,32.5 9.2,32.5" fill="#FFD700"/>
      <polygon points="14,10 14.5,11.5 16,11.5 14.9,12.3 15.3,13.8 14,13 12.7,13.8 13.1,12.3 12,11.5 13.5,11.5" fill="#FFD700"/>
      <polygon points="6,18 6.5,19.5 8,19.5 6.9,20.3 7.3,21.8 6,21 4.7,21.8 5.1,20.3 4,19.5 5.5,19.5" fill="#FFD700"/>
      <circle cx="30" cy="10" r="1.5" fill="#FFD700"/>
      <circle cx="8" cy="38" r="1.2" fill="#FFD700"/>
      <circle cx="42" cy="12" r="1" fill="#FFD700"/>
    </svg>
  );
}

export function Princess16Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
      {/* bottom cake tier */}
      <rect x="8" y="30" width="32" height="12" rx="3" fill="#F48FB1"/>
      {/* top cake tier */}
      <rect x="13" y="20" width="22" height="12" rx="3" fill="#F8BBD9"/>
      {/* frosting on bottom tier */}
      <path d="M8 30 Q12 27 16 30 Q20 27 24 30 Q28 27 32 30 Q36 27 40 30" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* frosting on top tier */}
      <path d="M13 20 Q16 17 19 20 Q22 17 24 20 Q27 17 31 20 Q33 17 35 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* heart decorations */}
      <path d="M14 35 Q14 33 15 34 Q16 33 16 35 Q16 37 15 37.5 Q14 37 14 35Z" fill="#E91E63"/>
      <path d="M22 35 Q22 33 23 34 Q24 33 24 35 Q24 37 23 37.5 Q22 37 22 35Z" fill="#E91E63"/>
      <path d="M30 35 Q30 33 31 34 Q32 33 32 35 Q32 37 31 37.5 Q30 37 30 35Z" fill="#E91E63"/>
      {/* candles */}
      <rect x="18" y="13" width="3" height="8" rx="1" fill="#FFEB3B"/>
      <rect x="22.5" y="11" width="3" height="10" rx="1" fill="#4FC3F7"/>
      <rect x="27" y="13" width="3" height="8" rx="1" fill="#FF8A65"/>
      {/* flames */}
      <path d="M18.5 13 Q19.5 10 20.5 13" fill="#FFD700"/>
      <path d="M23 11 Q24 8 25 11" fill="#FFD700"/>
      <path d="M27.5 13 Q28.5 10 29.5 13" fill="#FFD700"/>
    </svg>
  );
}
