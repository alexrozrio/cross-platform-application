import React from 'react';

interface IconProps { size?: number }

export function Sheriff1Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* 6-point star badge */}
      <polygon points="24,6 26.5,16 36,12 30,20 40,24 30,28 36,36 26.5,32 24,42 21.5,32 12,36 18,28 8,24 18,20 12,12 21.5,16" fill="#FDD835" />
      <polygon points="24,8 26,16.5 34.5,13 29.5,20 38,24 29.5,28 34.5,35 26,31.5 24,40 22,31.5 13.5,35 18.5,28 10,24 18.5,20 13.5,13 22,16.5" fill="#F9A825" />
      {/* center circle */}
      <circle cx="24" cy="24" r="6" fill="#FDD835" stroke="#5D4037" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill="#5D4037" />
      <circle cx="22.5" cy="22.5" r="0.8" fill="#FDD835" />
      <circle cx="25.5" cy="22.5" r="0.8" fill="#FDD835" />
      <circle cx="24" cy="25.5" r="0.8" fill="#FDD835" />
    </svg>
  );
}

export function Sheriff2Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#EFEBE9" />
      {/* brim */}
      <ellipse cx="24" cy="32" rx="18" ry="4" fill="#6D4C41" />
      {/* crown */}
      <rect x="13" y="16" width="22" height="17" rx="4" fill="#8D6E63" />
      {/* crown top indent */}
      <path d="M16 16 Q20 11 24 12 Q28 11 32 16" fill="#8D6E63" />
      <path d="M16 16 Q20 12 24 13 Q28 12 32 16 L32 18 Q28 14 24 15 Q20 14 16 18Z" fill="#795548" />
      {/* hatband */}
      <rect x="13" y="28" width="22" height="4" rx="1" fill="#26C6DA" />
      {/* band buckle */}
      <rect x="21" y="28.5" width="6" height="3" rx="0.5" fill="#FDD835" />
    </svg>
  );
}

export function Sheriff3Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* soil mound */}
      <ellipse cx="24" cy="38" rx="10" ry="4" fill="#8D6E63" />
      {/* main trunk */}
      <rect x="21" y="16" width="6" height="22" rx="3" fill="#388E3C" />
      {/* left arm */}
      <rect x="12" y="20" width="10" height="5" rx="2.5" fill="#388E3C" />
      <rect x="12" y="15" width="5" height="10" rx="2.5" fill="#388E3C" />
      {/* right arm */}
      <rect x="26" y="22" width="10" height="5" rx="2.5" fill="#388E3C" />
      <rect x="31" y="17" width="5" height="10" rx="2.5" fill="#388E3C" />
      {/* spines */}
      <line x1="21" y1="22" x2="18" y2="20" stroke="#A5D6A7" strokeWidth="1" />
      <line x1="21" y1="26" x2="18" y2="25" stroke="#A5D6A7" strokeWidth="1" />
      <line x1="27" y1="22" x2="30" y2="20" stroke="#A5D6A7" strokeWidth="1" />
      <line x1="27" y1="26" x2="30" y2="25" stroke="#A5D6A7" strokeWidth="1" />
      <line x1="24" y1="16" x2="22" y2="13" stroke="#A5D6A7" strokeWidth="1" />
      <line x1="24" y1="16" x2="26" y2="13" stroke="#A5D6A7" strokeWidth="1" />
    </svg>
  );
}

export function Sheriff4Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#EFEBE9" />
      {/* neck */}
      <rect x="20" y="34" width="10" height="8" rx="3" fill="#A1887F" />
      {/* head */}
      <ellipse cx="26" cy="22" rx="13" ry="12" fill="#A1887F" />
      {/* mane */}
      <path d="M13 18 Q10 14 12 10 Q15 8 18 12 Q16 16 13 18Z" fill="#4E342E" />
      <path d="M13 22 Q9 20 10 16 Q12 12 16 14 Q15 18 13 22Z" fill="#4E342E" />
      <path d="M13 26 Q9 26 10 22 Q12 18 16 20 Q15 23 13 26Z" fill="#4E342E" />
      {/* eye */}
      <circle cx="30" cy="20" r="2.5" fill="#212121" />
      <circle cx="31" cy="19" r="0.8" fill="white" />
      {/* nostril */}
      <ellipse cx="37" cy="26" rx="2" ry="1.2" fill="#6D4C41" />
      {/* bridle */}
      <path d="M36 20 Q40 22 39 28" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 15 Q34 12 38 14" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Sheriff5Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF3E0" />
      {/* rope loop */}
      <circle cx="24" cy="22" r="12" stroke="#A1887F" strokeWidth="3.5" fill="none" />
      {/* rope texture on loop */}
      <circle cx="24" cy="22" r="12" stroke="#8D6E63" strokeWidth="1" fill="none" strokeDasharray="3 4" />
      {/* coiled tail */}
      <path d="M36 22 Q40 26 38 32 Q36 38 30 40 Q26 42 24 40" stroke="#A1887F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M36 22 Q40 26 38 32 Q36 38 30 40 Q26 42 24 40" stroke="#8D6E63" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="3 4" />
      {/* rope end */}
      <circle cx="24" cy="40" r="2" fill="#8D6E63" />
      {/* small texture marks */}
      <line x1="14" y1="15" x2="13" y2="13" stroke="#8D6E63" strokeWidth="1" />
      <line x1="18" y1="11" x2="17" y2="9" stroke="#8D6E63" strokeWidth="1" />
      <line x1="30" y1="11" x2="31" y2="9" stroke="#8D6E63" strokeWidth="1" />
    </svg>
  );
}

export function Sheriff6Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#EFEBE9" />
      {/* boot shaft */}
      <path d="M18 8 L18 30 Q18 34 14 36 L14 40 L32 40 L32 36 Q28 36 27 32 L27 8 Z" fill="#8D6E63" />
      {/* boot toe (pointed) */}
      <path d="M14 40 L14 36 Q18 34 18 30 L27 30 Q27 34 34 36 L34 40 Z" fill="#795548" />
      <path d="M27 36 Q32 36 36 38 L34 40 L14 40 Z" fill="#6D4C41" />
      {/* heel */}
      <rect x="14" y="37" width="6" height="5" rx="1" fill="#5D4037" />
      {/* spur */}
      <circle cx="12" cy="39" r="3" fill="none" stroke="#FDD835" strokeWidth="1.5" />
      <line x1="15" y1="39" x2="12" y2="39" stroke="#FDD835" strokeWidth="1.5" />
      {/* stitched toe decoration */}
      <path d="M19 35 Q22 33 26 35" stroke="#FFCC80" strokeWidth="1" fill="none" strokeDasharray="2 2" />
      {/* boot seam */}
      <line x1="22" y1="8" x2="22" y2="28" stroke="#6D4C41" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

export function Sheriff7Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* horseshoe U shape */}
      <path d="M12 14 Q12 36 24 36 Q36 36 36 14" stroke="#FDD835" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M12 14 Q12 36 24 36 Q36 36 36 14" stroke="#F9A825" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* nail holes left side */}
      <circle cx="13" cy="14" r="2" fill="#5D4037" />
      <circle cx="12" cy="19" r="2" fill="#5D4037" />
      <circle cx="12.5" cy="24" r="2" fill="#5D4037" />
      {/* nail holes right side */}
      <circle cx="35" cy="14" r="2" fill="#5D4037" />
      <circle cx="36" cy="19" r="2" fill="#5D4037" />
      <circle cx="35.5" cy="24" r="2" fill="#5D4037" />
      {/* nail holes bottom */}
      <circle cx="18" cy="35" r="2" fill="#5D4037" />
      <circle cx="30" cy="35" r="2" fill="#5D4037" />
    </svg>
  );
}

export function Sheriff8Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFEBEE" />
      {/* gambrel roof */}
      <path d="M8 22 L16 10 L32 10 L40 22 Z" fill="#5D4037" />
      <path d="M12 22 L16 14 L32 14 L36 22 Z" fill="#795548" />
      {/* barn body */}
      <rect x="10" y="22" width="28" height="20" fill="#C62828" />
      {/* large door */}
      <rect x="16" y="28" width="16" height="14" fill="#5D4037" />
      {/* X on door */}
      <line x1="16" y1="28" x2="32" y2="42" stroke="white" strokeWidth="2" />
      <line x1="32" y1="28" x2="16" y2="42" stroke="white" strokeWidth="2" />
      {/* hayloft window */}
      <rect x="20" y="14" width="8" height="6" rx="1" fill="#FDD835" />
      <line x1="24" y1="14" x2="24" y2="20" stroke="#5D4037" strokeWidth="1" />
      <line x1="20" y1="17" x2="28" y2="17" stroke="#5D4037" strokeWidth="1" />
      {/* weathervane */}
      <line x1="24" y1="6" x2="24" y2="10" stroke="#5D4037" strokeWidth="1.5" />
      <polygon points="24,6 22,9 26,9" fill="#FDD835" />
    </svg>
  );
}

export function Sheriff9Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD" />
      {/* wings spread */}
      <path d="M24 26 C20 22 12 18 4 20 C8 24 10 28 12 30 C16 28 20 27 24 26Z" fill="#4E342E" />
      <path d="M24 26 C28 22 36 18 44 20 C40 24 38 28 36 30 C32 28 28 27 24 26Z" fill="#4E342E" />
      {/* wing tips */}
      <path d="M4 20 C2 18 3 14 6 14 C8 16 8 18 8 20Z" fill="#3E2723" />
      <path d="M44 20 C46 18 45 14 42 14 C40 16 40 18 40 20Z" fill="#3E2723" />
      {/* body */}
      <ellipse cx="24" cy="28" rx="6" ry="8" fill="#4E342E" />
      {/* white head */}
      <circle cx="24" cy="18" r="7" fill="white" />
      {/* yellow beak */}
      <polygon points="24,22 22,25 26,25" fill="#FDD835" />
      {/* eyes */}
      <circle cx="21" cy="17" r="2" fill="#212121" />
      <circle cx="27" cy="17" r="2" fill="#212121" />
      <circle cx="21.7" cy="16.3" r="0.7" fill="white" />
      <circle cx="27.7" cy="16.3" r="0.7" fill="white" />
      {/* tail feathers */}
      <path d="M19 34 L16 42 L20 40 L24 44 L28 40 L32 42 L29 34Z" fill="#4E342E" />
    </svg>
  );
}

export function Sheriff10Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* serrated coin edge */}
      {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((a, i) => (
        <circle key={i} cx={24 + 21 * Math.cos(a * Math.PI / 180)} cy={24 + 21 * Math.sin(a * Math.PI / 180)} r="2" fill="#F9A825" />
      ))}
      {/* coin face */}
      <circle cx="24" cy="24" r="17" fill="#FDD835" />
      <circle cx="24" cy="24" r="15" fill="#FFD54F" />
      {/* star on coin */}
      <polygon points="24,13 25.8,19.5 32.5,19.5 27.1,23.5 28.9,30 24,26 19.1,30 20.9,23.5 15.5,19.5 22.2,19.5" fill="#F9A825" />
      {/* shine glint top right */}
      <ellipse cx="32" cy="14" rx="3" ry="1.5" fill="white" opacity="0.7" transform="rotate(-30,32,14)" />
      <circle cx="34" cy="12" r="1.2" fill="white" opacity="0.6" />
    </svg>
  );
}

export function Sheriff11Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFEBEE" />
      {/* triangle bandana */}
      <polygon points="8,38 40,38 24,14" fill="#C62828" />
      {/* polka dots */}
      <circle cx="18" cy="30" r="2" fill="white" />
      <circle cx="26" cy="28" r="2" fill="white" />
      <circle cx="34" cy="32" r="2" fill="white" />
      <circle cx="22" cy="36" r="2" fill="white" />
      <circle cx="30" cy="36" r="2" fill="white" />
      <circle cx="14" cy="36" r="2" fill="white" />
      <circle cx="24" cy="22" r="1.5" fill="white" />
      <circle cx="20" cy="24" r="1.5" fill="white" />
      <circle cx="28" cy="24" r="1.5" fill="white" />
      {/* tied knot at top */}
      <circle cx="24" cy="14" r="4" fill="#B71C1C" />
      <ellipse cx="20" cy="12" rx="3" ry="2" fill="#C62828" transform="rotate(-20,20,12)" />
      <ellipse cx="28" cy="12" rx="3" ry="2" fill="#C62828" transform="rotate(20,28,12)" />
    </svg>
  );
}

export function Sheriff12Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF3E0" />
      {/* outer rim */}
      <circle cx="24" cy="24" r="17" stroke="#8D6E63" strokeWidth="3" fill="none" />
      {/* inner rim */}
      <circle cx="24" cy="24" r="13" stroke="#A1887F" strokeWidth="1.5" fill="none" />
      {/* 8 spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line
          key={i}
          x1={24 + 4 * Math.cos(a * Math.PI / 180)}
          y1={24 + 4 * Math.sin(a * Math.PI / 180)}
          x2={24 + 17 * Math.cos(a * Math.PI / 180)}
          y2={24 + 17 * Math.sin(a * Math.PI / 180)}
          stroke="#8D6E63"
          strokeWidth="2"
        />
      ))}
      {/* hub center */}
      <circle cx="24" cy="24" r="4" fill="#8D6E63" />
      <circle cx="24" cy="24" r="2" fill="#FFF3E0" />
    </svg>
  );
}

export function Sheriff13Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF3E0" />
      {/* sky rays */}
      {[270, 255, 285, 240, 300, 225, 315].map((a, i) => (
        <line
          key={i}
          x1="24"
          y1="30"
          x2={24 + 22 * Math.cos(a * Math.PI / 180)}
          y2={30 + 22 * Math.sin(a * Math.PI / 180)}
          stroke="#FFB74D"
          strokeWidth="2"
          opacity="0.6"
        />
      ))}
      {/* sun semicircle */}
      <path d="M8 30 A16 16 0 0 1 40 30 Z" fill="#FF9800" />
      <path d="M10 30 A14 14 0 0 1 38 30 Z" fill="#FFB74D" />
      {/* horizon ground */}
      <rect x="4" y="30" width="40" height="4" fill="#8D6E63" />
      {/* desert mesa */}
      <path d="M30 30 L30 22 L40 22 L40 30 Z" fill="#6D4C41" />
      {/* cactus silhouette */}
      <rect x="12" y="20" width="3" height="10" fill="#388E3C" />
      <rect x="8" y="23" width="5" height="2" fill="#388E3C" />
      <rect x="14" y="21" width="5" height="2" fill="#388E3C" />
    </svg>
  );
}

export function Sheriff14Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#ECEFF1" />
      {/* bell ring handle */}
      <path d="M20 10 Q24 8 28 10" stroke="#90A4AE" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* bell body */}
      <path d="M14 14 Q12 24 12 30 Q12 38 24 38 Q36 38 36 30 Q36 24 34 14 Z" fill="#B0BEC5" />
      <path d="M15 14 Q13 24 13 30 Q13 36 24 36 Q35 36 35 30 Q35 24 33 14 Z" fill="#CFD8DC" />
      {/* texture lines */}
      <line x1="15" y1="20" x2="33" y2="20" stroke="#90A4AE" strokeWidth="1" opacity="0.6" />
      <line x1="14" y1="25" x2="34" y2="25" stroke="#90A4AE" strokeWidth="1" opacity="0.6" />
      <line x1="14" y1="30" x2="34" y2="30" stroke="#90A4AE" strokeWidth="1" opacity="0.6" />
      {/* clapper */}
      <line x1="24" y1="30" x2="24" y2="37" stroke="#78909C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="38" r="2" fill="#78909C" />
      {/* rim at bottom */}
      <ellipse cx="24" cy="38" rx="12" ry="2" fill="#90A4AE" />
    </svg>
  );
}

export function Sheriff15Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF9C4" />
      {/* hay bale cylinder body */}
      <rect x="10" y="16" width="28" height="20" rx="3" fill="#FFD54F" />
      {/* straw texture */}
      <line x1="10" y1="19" x2="38" y2="19" stroke="#F9A825" strokeWidth="1" />
      <line x1="10" y1="22" x2="38" y2="22" stroke="#F9A825" strokeWidth="1" />
      <line x1="10" y1="25" x2="38" y2="25" stroke="#F9A825" strokeWidth="1" />
      <line x1="10" y1="28" x2="38" y2="28" stroke="#F9A825" strokeWidth="1" />
      <line x1="10" y1="31" x2="38" y2="31" stroke="#F9A825" strokeWidth="1" />
      <line x1="10" y1="34" x2="38" y2="34" stroke="#F9A825" strokeWidth="1" />
      {/* end caps (ellipses) */}
      <ellipse cx="10" cy="26" rx="3" ry="10" fill="#FFB300" />
      <ellipse cx="38" cy="26" rx="3" ry="10" fill="#FFB300" />
      {/* rope band 1 */}
      <rect x="10" y="20" width="28" height="3" rx="1" fill="#A1887F" opacity="0.8" />
      {/* rope band 2 */}
      <rect x="10" y="29" width="28" height="3" rx="1" fill="#A1887F" opacity="0.8" />
    </svg>
  );
}

export function Sheriff16Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF3E0" />
      {/* floppy left ear */}
      <ellipse cx="13" cy="26" rx="5" ry="9" fill="#FFB74D" transform="rotate(-10,13,26)" />
      <ellipse cx="13" cy="26" rx="3" ry="6.5" fill="#FFA726" transform="rotate(-10,13,26)" />
      {/* floppy right ear */}
      <ellipse cx="35" cy="26" rx="5" ry="9" fill="#FFB74D" transform="rotate(10,35,26)" />
      <ellipse cx="35" cy="26" rx="3" ry="6.5" fill="#FFA726" transform="rotate(10,35,26)" />
      {/* face */}
      <circle cx="24" cy="24" r="13" fill="#FFD54F" />
      {/* left eye */}
      <circle cx="19" cy="21" r="3" fill="#212121" />
      <circle cx="20" cy="20" r="1" fill="white" />
      {/* right eye */}
      <circle cx="29" cy="21" r="3" fill="#212121" />
      <circle cx="30" cy="20" r="1" fill="white" />
      {/* nose */}
      <ellipse cx="24" cy="27" rx="3.5" ry="2.5" fill="#212121" />
      <circle cx="23" cy="26.5" r="0.8" fill="white" opacity="0.7" />
      {/* happy mouth */}
      <path d="M18 30 Q24 35 30 30" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* forehead patch */}
      <ellipse cx="24" cy="15" rx="4" ry="2.5" fill="#FFA726" />
    </svg>
  );
}
