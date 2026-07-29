import React from 'react'; interface IconProps { size?: number }

export function Shin1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* face */}
    <circle cx="24" cy="26" r="14" fill="#FFECB3"/>
    {/* black bowl-cut hair */}
    <ellipse cx="24" cy="14" rx="12" ry="8" fill="#1A1A1A"/>
    <rect x="12" y="14" width="24" height="6" fill="#1A1A1A"/>
    {/* very thick black eyebrows */}
    <rect x="15" y="20" width="8" height="3.5" rx="1.5" fill="#1A1A1A"/>
    <rect x="25" y="20" width="8" height="3.5" rx="1.5" fill="#1A1A1A"/>
    {/* tiny dot eyes */}
    <circle cx="19" cy="26" r="2" fill="#1A1A1A"/>
    <circle cx="29" cy="26" r="2" fill="#1A1A1A"/>
    {/* small round nose */}
    <circle cx="24" cy="30" r="2" fill="#FFCA28"/>
    {/* huge toothy grin */}
    <path d="M15 34 Q24 42 33 34" fill="#1A1A1A"/>
    <rect x="16" y="34" width="16" height="5" rx="1" fill="#FFFFFF"/>
    <line x1="20" y1="34" x2="20" y2="39" stroke="#1A1A1A" strokeWidth="1"/>
    <line x1="24" y1="34" x2="24" y2="39" stroke="#1A1A1A" strokeWidth="1"/>
    <line x1="28" y1="34" x2="28" y2="39" stroke="#1A1A1A" strokeWidth="1"/>
  </svg>
}

export function Shin2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* helmet main shape */}
    <path d="M10 30 Q10 14 24 12 Q38 14 38 30 L38 36 Q38 40 24 40 Q10 40 10 36 Z" fill="#F44336"/>
    {/* visor slits */}
    <rect x="14" y="22" width="8" height="4" rx="2" fill="#FFFFFF"/>
    <rect x="26" y="22" width="8" height="4" rx="2" fill="#FFFFFF"/>
    {/* center divider */}
    <rect x="23" y="20" width="2" height="8" fill="#C62828"/>
    {/* lightning bolt on forehead */}
    <polygon points="26,12 22,20 25,20 21,28 28,18 24,18" fill="#FFD600"/>
    {/* chin strap */}
    <path d="M10 30 Q8 36 14 38 Q24 42 34 38 Q40 36 38 30" stroke="#B71C1C" strokeWidth="2" fill="none"/>
    {/* hero shape side fins */}
    <path d="M10 20 Q6 18 8 28" stroke="#B71C1C" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M38 20 Q42 18 40 28" stroke="#B71C1C" strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Shin3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#F3E5F5"/>
    {/* fluffy head */}
    <circle cx="24" cy="24" r="14" fill="#FFFFFF"/>
    {/* fluffy texture dots */}
    <circle cx="16" cy="18" r="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
    <circle cx="24" cy="14" r="5" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
    <circle cx="32" cy="18" r="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
    {/* floppy left ear */}
    <ellipse cx="11" cy="26" rx="5" ry="8" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
    {/* floppy right ear */}
    <ellipse cx="37" cy="26" rx="5" ry="8" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
    {/* eyes */}
    <circle cx="19" cy="24" r="3" fill="#1A1A1A"/>
    <circle cx="29" cy="24" r="3" fill="#1A1A1A"/>
    <circle cx="20" cy="23" r="1" fill="#FFFFFF"/>
    <circle cx="30" cy="23" r="1" fill="#FFFFFF"/>
    {/* black nose */}
    <ellipse cx="24" cy="29" rx="3" ry="2" fill="#1A1A1A"/>
    {/* tongue out */}
    <ellipse cx="24" cy="34" rx="4" ry="3" fill="#F48FB1"/>
    {/* happy expression lines */}
    <path d="M14 28 Q16 30 14 32" stroke="#E0E0E0" strokeWidth="1.5" fill="none"/>
    <path d="M34 28 Q32 30 34 32" stroke="#E0E0E0" strokeWidth="1.5" fill="none"/>
  </svg>
}

export function Shin4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* backpack main body */}
    <rect x="11" y="12" width="26" height="28" rx="4" fill="#FFD600"/>
    {/* top flap */}
    <rect x="11" y="12" width="26" height="8" rx="4" fill="#FFC107"/>
    {/* buckle clasp */}
    <rect x="20" y="18" width="8" height="4" rx="2" fill="#FF8F00"/>
    <rect x="22" y="19" width="4" height="2" rx="1" fill="#FFF9C4"/>
    {/* two shoulder straps */}
    <rect x="14" y="40" width="5" height="5" rx="2" fill="#FF8F00"/>
    <rect x="29" y="40" width="5" height="5" rx="2" fill="#FF8F00"/>
    {/* vertical center seam */}
    <line x1="24" y1="22" x2="24" y2="38" stroke="#FFB300" strokeWidth="1.5"/>
    {/* star patch */}
    <polygon points="24,26 25.5,29 29,29 26.5,31 27.5,35 24,33 20.5,35 21.5,31 19,29 22.5,29" fill="#FF6F00"/>
    {/* side pockets */}
    <rect x="11" y="26" width="4" height="8" rx="2" fill="#FFC107"/>
    <rect x="33" y="26" width="4" height="8" rx="2" fill="#FFC107"/>
  </svg>
}

export function Shin5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* petals */}
    <ellipse cx="24" cy="10" rx="5" ry="9" fill="#FFEE58"/>
    <ellipse cx="35" cy="14" rx="5" ry="9" fill="#FFEE58" transform="rotate(60 35 14)"/>
    <ellipse cx="38" cy="27" rx="5" ry="9" fill="#FFEE58" transform="rotate(120 38 27)"/>
    <ellipse cx="31" cy="38" rx="5" ry="9" fill="#FFEE58" transform="rotate(180 31 38)"/>
    <ellipse cx="17" cy="38" rx="5" ry="9" fill="#FFEE58" transform="rotate(240 17 38)"/>
    <ellipse cx="10" cy="27" rx="5" ry="9" fill="#FFEE58" transform="rotate(300 10 27)"/>
    {/* brown center */}
    <circle cx="24" cy="24" r="10" fill="#795548"/>
    {/* happy face in center */}
    <circle cx="20" cy="22" r="1.5" fill="#1A1A1A"/>
    <circle cx="28" cy="22" r="1.5" fill="#1A1A1A"/>
    <path d="M19 27 Q24 31 29 27" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* center dot pattern */}
    <circle cx="24" cy="17" r="1" fill="#5D4037"/>
    <circle cx="30" cy="20" r="1" fill="#5D4037"/>
    <circle cx="18" cy="20" r="1" fill="#5D4037"/>
  </svg>
}

export function Shin6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* crayon body */}
    <rect x="16" y="16" width="16" height="24" rx="4" fill="#FFEE58"/>
    {/* pointed tip */}
    <polygon points="16,16 32,16 24,6" fill="#F9A825"/>
    {/* tip point */}
    <polygon points="20,16 28,16 24,8" fill="#FF8F00"/>
    {/* label area */}
    <rect x="16" y="22" width="16" height="10" rx="0" fill="#FFFFFF" opacity="0.7"/>
    {/* color stripes in label */}
    <rect x="16" y="23" width="16" height="2" fill="#F44336" opacity="0.7"/>
    <rect x="16" y="26" width="16" height="2" fill="#FFEE58" opacity="0.7"/>
    <rect x="16" y="29" width="16" height="2" fill="#4CAF50" opacity="0.7"/>
    {/* bottom flat */}
    <rect x="16" y="38" width="16" height="3" rx="2" fill="#F9A825"/>
    {/* shine highlight */}
    <rect x="20" y="9" width="3" height="12" rx="1.5" fill="#FFFFFF" opacity="0.4"/>
  </svg>
}

export function Shin7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* wafer cone */}
    <polygon points="24,44 13,24 35,24" fill="#FFCC80"/>
    {/* cone waffle pattern */}
    <line x1="15" y1="28" x2="33" y2="28" stroke="#FF8A65" strokeWidth="1"/>
    <line x1="13.5" y1="32" x2="34.5" y2="32" stroke="#FF8A65" strokeWidth="1"/>
    <line x1="16" y1="36" x2="32" y2="36" stroke="#FF8A65" strokeWidth="1"/>
    <line x1="19" y1="40" x2="29" y2="40" stroke="#FF8A65" strokeWidth="1"/>
    {/* ice cream white base */}
    <ellipse cx="24" cy="20" rx="11" ry="9" fill="#FFFFFF"/>
    {/* pink swirl */}
    <path d="M14 20 Q16 14 20 16 Q24 10 28 14 Q32 10 34 16 Q36 20 34 24 Q30 22 28 18 Q24 22 20 18 Q18 22 14 20 Z" fill="#F48FB1"/>
    {/* sprinkles */}
    <rect x="18" y="14" width="3" height="1.5" rx="0.5" fill="#F44336" transform="rotate(30 18 14)"/>
    <rect x="26" y="12" width="3" height="1.5" rx="0.5" fill="#2196F3" transform="rotate(-20 26 12)"/>
    <rect x="30" y="16" width="3" height="1.5" rx="0.5" fill="#4CAF50" transform="rotate(45 30 16)"/>
    <rect x="22" y="10" width="3" height="1.5" rx="0.5" fill="#FF9800" transform="rotate(10 22 10)"/>
    {/* cherry */}
    <circle cx="24" cy="8" r="3.5" fill="#E53935"/>
    <path d="M24 5 Q28 2 30 4" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
  </svg>
}

export function Shin8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* bus body */}
    <rect x="6" y="16" width="36" height="22" rx="4" fill="#FFD600"/>
    {/* roof */}
    <rect x="8" y="13" width="32" height="6" rx="3" fill="#FFC107"/>
    {/* windshield */}
    <rect x="10" y="17" width="28" height="12" rx="2" fill="#B3E5FC"/>
    {/* windshield divider */}
    <line x1="24" y1="17" x2="24" y2="29" stroke="#0288D1" strokeWidth="1.5"/>
    {/* grille */}
    <rect x="12" y="30" width="24" height="4" rx="1" fill="#FF8F00"/>
    <line x1="16" y1="30" x2="16" y2="34" stroke="#E65100" strokeWidth="1"/>
    <line x1="20" y1="30" x2="20" y2="34" stroke="#E65100" strokeWidth="1"/>
    <line x1="24" y1="30" x2="24" y2="34" stroke="#E65100" strokeWidth="1"/>
    <line x1="28" y1="30" x2="28" y2="34" stroke="#E65100" strokeWidth="1"/>
    <line x1="32" y1="30" x2="32" y2="34" stroke="#E65100" strokeWidth="1"/>
    {/* headlights */}
    <rect x="8" y="26" width="5" height="4" rx="2" fill="#FFFDE7"/>
    <rect x="35" y="26" width="5" height="4" rx="2" fill="#FFFDE7"/>
    {/* wheels */}
    <circle cx="14" cy="38" r="5" fill="#424242"/>
    <circle cx="14" cy="38" r="2.5" fill="#757575"/>
    <circle cx="34" cy="38" r="5" fill="#424242"/>
    <circle cx="34" cy="38" r="2.5" fill="#757575"/>
    {/* STOP arm */}
    <rect x="40" y="22" width="6" height="8" rx="1" fill="#F44336"/>
    <line x1="40" y1="26" x2="46" y2="26" stroke="#FFFFFF" strokeWidth="1.5"/>
  </svg>
}

export function Shin9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#F3E5F5"/>
    {/* ball base */}
    <circle cx="24" cy="24" r="18" fill="#FFFFFF"/>
    {/* 6 color sections */}
    <path d="M24 6 A18 18 0 0 1 39.6 15 L24 24 Z" fill="#F44336"/>
    <path d="M39.6 15 A18 18 0 0 1 39.6 33 L24 24 Z" fill="#2196F3"/>
    <path d="M39.6 33 A18 18 0 0 1 24 42 L24 24 Z" fill="#FFEE58"/>
    <path d="M24 42 A18 18 0 0 1 8.4 33 L24 24 Z" fill="#4CAF50"/>
    <path d="M8.4 33 A18 18 0 0 1 8.4 15 L24 24 Z" fill="#FF9800"/>
    <path d="M8.4 15 A18 18 0 0 1 24 6 L24 24 Z" fill="#9C27B0"/>
    {/* seam lines */}
    <circle cx="24" cy="24" r="18" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
    <line x1="24" y1="6" x2="24" y2="42" stroke="#FFFFFF" strokeWidth="1.5"/>
    <line x1="8.4" y1="15" x2="39.6" y2="33" stroke="#FFFFFF" strokeWidth="1.5"/>
    <line x1="8.4" y1="33" x2="39.6" y2="15" stroke="#FFFFFF" strokeWidth="1.5"/>
    {/* highlight */}
    <circle cx="30" cy="16" r="4" fill="#FFFFFF" opacity="0.4"/>
  </svg>
}

export function Shin10Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* lollipop round candy */}
    <circle cx="24" cy="20" r="15" fill="#FFFFFF"/>
    {/* pink+white swirl pattern */}
    <path d="M24 5 Q34 10 34 20 Q34 30 24 35 Q14 30 14 20 Q14 10 24 5 Z" fill="#F48FB1"/>
    <path d="M24 5 Q30 12 28 20 Q26 28 18 30 Q12 26 14 20 Q16 10 24 5 Z" fill="#FFFFFF"/>
    <path d="M24 5 Q27 13 24 20 Q21 27 16 28 Q12 24 14 20 Q14 12 24 5 Z" fill="#F48FB1"/>
    <path d="M24 20 Q24 28 20 32 Q16 30 14 26 Q18 28 22 22 Z" fill="#FFFFFF"/>
    {/* candy outline */}
    <circle cx="24" cy="20" r="15" fill="none" stroke="#F06292" strokeWidth="1.5"/>
    {/* white stick */}
    <rect x="22" y="34" width="4" height="12" rx="2" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1"/>
    {/* candy wrapper twist at base */}
    <ellipse cx="24" cy="35" rx="5" ry="2" fill="#F8BBD0"/>
  </svg>
}

export function Shin11Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* kite diamond shape — 4 color triangles */}
    <polygon points="24,4 40,24 24,36 8,24" fill="#FFFFFF"/>
    <polygon points="24,4 40,24 24,20" fill="#F44336"/>
    <polygon points="40,24 24,36 24,20" fill="#FFEE58"/>
    <polygon points="24,36 8,24 24,20" fill="#4CAF50"/>
    <polygon points="8,24 24,4 24,20" fill="#2196F3"/>
    {/* kite cross struts */}
    <line x1="24" y1="4" x2="24" y2="36" stroke="#FFFFFF" strokeWidth="1.5"/>
    <line x1="8" y1="24" x2="40" y2="24" stroke="#FFFFFF" strokeWidth="1.5"/>
    {/* kite outline */}
    <polygon points="24,4 40,24 24,36 8,24" fill="none" stroke="#90CAF9" strokeWidth="1.5"/>
    {/* tail with bows */}
    <path d="M24 36 Q26 40 24 44" stroke="#795548" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <ellipse cx="25.5" cy="38" rx="3" ry="1.5" fill="#F44336" transform="rotate(15 25.5 38)"/>
    <ellipse cx="24" cy="42" rx="3" ry="1.5" fill="#2196F3" transform="rotate(-10 24 42)"/>
    {/* string */}
    <path d="M8 24 Q2 30 4 38" stroke="#9E9E9E" strokeWidth="1" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Shin12Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* big bold 5-point star */}
    <polygon points="24,4 28.5,17 43,17 31.5,25.5 36,39 24,31 12,39 16.5,25.5 5,17 19.5,17" fill="#FFD600"/>
    {/* star outline */}
    <polygon points="24,4 28.5,17 43,17 31.5,25.5 36,39 24,31 12,39 16.5,25.5 5,17 19.5,17" fill="none" stroke="#FFB300" strokeWidth="1.5"/>
    {/* shine dot top-right */}
    <circle cx="35" cy="12" r="3" fill="#FFFDE7" opacity="0.8"/>
    <circle cx="35" cy="12" r="1.5" fill="#FFFFFF"/>
    {/* subtle happy face inside */}
    <circle cx="20" cy="22" r="1.5" fill="#FF8F00"/>
    <circle cx="28" cy="22" r="1.5" fill="#FF8F00"/>
    <path d="M19 27 Q24 31 29 27" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Shin13Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* cake base */}
    <ellipse cx="24" cy="36" rx="16" ry="5" fill="#CE93D8"/>
    <rect x="8" y="28" width="32" height="10" rx="4" fill="#E1BEE7"/>
    {/* pink frosting drip */}
    <rect x="8" y="22" width="32" height="8" rx="3" fill="#F48FB1"/>
    <path d="M12 28 Q14 32 12 36" stroke="#F48FB1" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M18 28 Q20 33 18 36" stroke="#F48FB1" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M30 28 Q32 33 30 36" stroke="#F48FB1" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M36 28 Q38 32 36 36" stroke="#F48FB1" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 4 candles */}
    <rect x="15" y="16" width="3" height="8" rx="1" fill="#FFEE58"/>
    <rect x="20" y="14" width="3" height="10" rx="1" fill="#F44336"/>
    <rect x="25" y="16" width="3" height="8" rx="1" fill="#4CAF50"/>
    <rect x="30" y="14" width="3" height="10" rx="1" fill="#2196F3"/>
    {/* flames */}
    <ellipse cx="16.5" cy="15" rx="2" ry="3" fill="#FF9800"/>
    <ellipse cx="21.5" cy="13" rx="2" ry="3" fill="#FF9800"/>
    <ellipse cx="26.5" cy="15" rx="2" ry="3" fill="#FF9800"/>
    <ellipse cx="31.5" cy="13" rx="2" ry="3" fill="#FF9800"/>
    {/* star sprinkles */}
    <polygon points="13,26 14,28 12,27 14,27 13,28" fill="#FFD600"/>
    <polygon points="24,25 25,27 23,26 25,26 24,27" fill="#FFD600"/>
    <polygon points="35,26 36,28 34,27 36,27 35,28" fill="#FFD600"/>
  </svg>
}

export function Shin14Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E8F5E9"/>
    {/* stem wrap cone */}
    <polygon points="16,38 32,38 28,44 20,44" fill="#A5D6A7"/>
    <polygon points="16,38 32,38 24,28" fill="#81C784"/>
    {/* stems */}
    <line x1="18" y1="38" x2="14" y2="18" stroke="#4CAF50" strokeWidth="2"/>
    <line x1="21" y1="36" x2="18" y2="14" stroke="#4CAF50" strokeWidth="2"/>
    <line x1="24" y1="36" x2="24" y2="12" stroke="#4CAF50" strokeWidth="2"/>
    <line x1="27" y1="36" x2="30" y2="14" stroke="#4CAF50" strokeWidth="2"/>
    <line x1="30" y1="38" x2="34" y2="18" stroke="#4CAF50" strokeWidth="2"/>
    {/* flowers */}
    <circle cx="14" cy="15" r="5" fill="#F44336"/>
    <circle cx="14" cy="15" r="2.5" fill="#FFEE58"/>
    <circle cx="18" cy="11" r="5" fill="#FF9800"/>
    <circle cx="18" cy="11" r="2.5" fill="#FFEE58"/>
    <circle cx="24" cy="9" r="5" fill="#F48FB1"/>
    <circle cx="24" cy="9" r="2.5" fill="#FFEE58"/>
    <circle cx="30" cy="11" r="5" fill="#FF9800"/>
    <circle cx="30" cy="11" r="2.5" fill="#FFEE58"/>
    <circle cx="34" cy="15" r="5" fill="#F44336"/>
    <circle cx="34" cy="15" r="2.5" fill="#FFEE58"/>
    {/* ribbon */}
    <path d="M16 38 Q24 34 32 38" stroke="#F06292" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="36" r="2" fill="#F06292"/>
  </svg>
}

export function Shin15Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* robot legs */}
    <rect x="17" y="38" width="6" height="6" rx="1" fill="#78909C"/>
    <rect x="25" y="38" width="6" height="6" rx="1" fill="#78909C"/>
    {/* robot body */}
    <rect x="13" y="24" width="22" height="16" rx="3" fill="#90A4AE"/>
    {/* arms */}
    <rect x="6" y="26" width="8" height="5" rx="2" fill="#78909C"/>
    <rect x="34" y="26" width="8" height="5" rx="2" fill="#78909C"/>
    {/* chest light */}
    <circle cx="24" cy="33" r="3" fill="#4CAF50"/>
    <circle cx="24" cy="33" r="1.5" fill="#FFFFFF" opacity="0.7"/>
    {/* body buttons */}
    <circle cx="17" cy="28" r="2" fill="#F44336"/>
    <circle cx="24" cy="28" r="2" fill="#FFEE58"/>
    <circle cx="31" cy="28" r="2" fill="#2196F3"/>
    {/* neck */}
    <rect x="20" y="20" width="8" height="5" rx="1" fill="#78909C"/>
    {/* head */}
    <rect x="13" y="9" width="22" height="13" rx="3" fill="#B0BEC5"/>
    {/* antenna */}
    <line x1="24" y1="9" x2="24" y2="4" stroke="#78909C" strokeWidth="2"/>
    <circle cx="24" cy="3" r="2" fill="#F44336"/>
    {/* eyes */}
    <circle cx="19" cy="15" r="3.5" fill="#FFFFFF"/>
    <circle cx="29" cy="15" r="3.5" fill="#FFFFFF"/>
    <circle cx="19" cy="15" r="2" fill="#2196F3"/>
    <circle cx="29" cy="15" r="2" fill="#2196F3"/>
    <circle cx="19" cy="15" r="1" fill="#1A1A1A"/>
    <circle cx="29" cy="15" r="1" fill="#1A1A1A"/>
    {/* mouth grill */}
    <rect x="17" y="19" width="14" height="3" rx="1" fill="#78909C"/>
    <line x1="20" y1="19" x2="20" y2="22" stroke="#546E7A" strokeWidth="1"/>
    <line x1="24" y1="19" x2="24" y2="22" stroke="#546E7A" strokeWidth="1"/>
    <line x1="28" y1="19" x2="28" y2="22" stroke="#546E7A" strokeWidth="1"/>
  </svg>
}

export function Shin16Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#F3E5F5"/>
    {/* house walls */}
    <rect x="9" y="26" width="30" height="18" rx="2" fill="#FFECB3"/>
    {/* roof */}
    <polygon points="6,27 24,10 42,27" fill="#EF5350"/>
    {/* roof trim */}
    <polygon points="6,27 24,10 42,27" fill="none" stroke="#B71C1C" strokeWidth="1.5"/>
    {/* yellow door */}
    <rect x="20" y="34" width="8" height="10" rx="2" fill="#FFD600"/>
    <circle cx="27" cy="39" r="1" fill="#FF8F00"/>
    {/* left window */}
    <rect x="11" y="29" width="9" height="8" rx="2" fill="#B3E5FC"/>
    <line x1="15.5" y1="29" x2="15.5" y2="37" stroke="#81D4FA" strokeWidth="1"/>
    <line x1="11" y1="33" x2="20" y2="33" stroke="#81D4FA" strokeWidth="1"/>
    {/* right window */}
    <rect x="28" y="29" width="9" height="8" rx="2" fill="#B3E5FC"/>
    <line x1="32.5" y1="29" x2="32.5" y2="37" stroke="#81D4FA" strokeWidth="1"/>
    <line x1="28" y1="33" x2="37" y2="33" stroke="#81D4FA" strokeWidth="1"/>
    {/* left flower box */}
    <rect x="11" y="36" width="9" height="3" rx="1" fill="#8D6E63"/>
    <circle cx="13" cy="35" r="2" fill="#F44336"/>
    <circle cx="16" cy="34" r="2" fill="#FF9800"/>
    <circle cx="19" cy="35" r="2" fill="#F48FB1"/>
    {/* right flower box */}
    <rect x="28" y="36" width="9" height="3" rx="1" fill="#8D6E63"/>
    <circle cx="30" cy="35" r="2" fill="#F44336"/>
    <circle cx="33" cy="34" r="2" fill="#FF9800"/>
    <circle cx="36" cy="35" r="2" fill="#F48FB1"/>
    {/* chimney */}
    <rect x="30" y="14" width="5" height="8" rx="1" fill="#BCAAA4"/>
    <rect x="29" y="13" width="7" height="3" rx="1" fill="#A1887F"/>
  </svg>
}
