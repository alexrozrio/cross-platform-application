import React from 'react';

interface IconProps { size?: number }

export function Dora1Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#BBDEFB" />
      {/* blue face */}
      <circle cx="24" cy="22" r="17" fill="#1E88E5" />
      {/* white lower face */}
      <ellipse cx="24" cy="30" rx="12" ry="9" fill="white" />
      {/* left eye */}
      <circle cx="18" cy="17" r="5" fill="white" />
      <circle cx="18" cy="17" r="3" fill="#212121" />
      <circle cx="19.2" cy="15.8" r="1.2" fill="white" />
      {/* right eye */}
      <circle cx="30" cy="17" r="5" fill="white" />
      <circle cx="30" cy="17" r="3" fill="#212121" />
      <circle cx="31.2" cy="15.8" r="1.2" fill="white" />
      {/* red nose */}
      <circle cx="24" cy="24" r="3.5" fill="#E53935" />
      {/* whiskers left */}
      <line x1="5" y1="26" x2="17" y2="26" stroke="#1565C0" strokeWidth="1.5" />
      <line x1="5" y1="29" x2="17" y2="28" stroke="#1565C0" strokeWidth="1.5" />
      <line x1="5" y1="32" x2="17" y2="31" stroke="#1565C0" strokeWidth="1.5" />
      {/* whiskers right */}
      <line x1="43" y1="26" x2="31" y2="26" stroke="#1565C0" strokeWidth="1.5" />
      <line x1="43" y1="29" x2="31" y2="28" stroke="#1565C0" strokeWidth="1.5" />
      <line x1="43" y1="32" x2="31" y2="31" stroke="#1565C0" strokeWidth="1.5" />
      {/* smile */}
      <path d="M16 30 Q24 37 32 30" stroke="#212121" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* red collar */}
      <rect x="14" y="37" width="20" height="4" rx="2" fill="#E53935" />
      {/* gold bell */}
      <circle cx="24" cy="41" r="3" fill="#FDD835" />
      <line x1="24" y1="43" x2="24" y2="44" stroke="#F9A825" strokeWidth="1.5" />
    </svg>
  );
}

export function Dora2Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#BBDEFB" />
      {/* pouch shape */}
      <circle cx="24" cy="26" rx="16" r="16" fill="white" />
      {/* sewn edge dashes */}
      <circle cx="24" cy="26" r="14" fill="none" stroke="#90CAF9" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* opening crease */}
      <path d="M14 20 Q24 16 34 20" stroke="#90CAF9" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* star peeking out */}
      <polygon points="24,17 25.2,20.5 29,20.5 26,22.5 27.2,26 24,24 20.8,26 22,22.5 19,20.5 22.8,20.5" fill="#FDD835" />
      {/* spiral peeking out */}
      <path d="M30 19 Q32 17 31 15 Q29 13 27 15 Q25 17 27 19" stroke="#1E88E5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* pocket highlight */}
      <ellipse cx="19" cy="30" rx="4" ry="3" fill="#E3F2FD" opacity="0.8" />
    </svg>
  );
}

export function Dora3Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FCE4EC" />
      {/* door glow outline */}
      <rect x="11" y="6" width="26" height="38" rx="6" fill="#F48FB1" opacity="0.5" />
      {/* door shape */}
      <rect x="13" y="8" width="22" height="36" rx="5" fill="#E91E8C" />
      <rect x="14" y="9" width="20" height="34" rx="4" fill="#F06292" />
      {/* vertical stripe lines */}
      <line x1="18" y1="10" x2="18" y2="42" stroke="#E91E63" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="10" x2="24" y2="42" stroke="#E91E63" strokeWidth="1.5" opacity="0.6" />
      <line x1="30" y1="10" x2="30" y2="42" stroke="#E91E63" strokeWidth="1.5" opacity="0.6" />
      {/* gold doorknob */}
      <circle cx="30" cy="28" r="3.5" fill="#FDD835" />
      <circle cx="30" cy="28" r="2" fill="#F9A825" />
      {/* glow dots */}
      <circle cx="13" cy="8" r="1.5" fill="white" opacity="0.8" />
      <circle cx="35" cy="8" r="1.5" fill="white" opacity="0.8" />
      <circle cx="13" cy="44" r="1.5" fill="white" opacity="0.8" />
      <circle cx="35" cy="44" r="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

export function Dora4Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E0F7FA" />
      {/* stick handle */}
      <rect x="22" y="24" width="4" height="18" rx="2" fill="#A1887F" />
      {/* propeller H-shape base bar */}
      <rect x="12" y="18" width="24" height="5" rx="2.5" fill="#66BB6A" />
      {/* propeller left blade */}
      <rect x="10" y="10" width="12" height="14" rx="3" fill="#4CAF50" />
      {/* propeller right blade */}
      <rect x="26" y="10" width="12" height="14" rx="3" fill="#4CAF50" />
      {/* center hub */}
      <circle cx="24" cy="20" r="4" fill="#388E3C" />
      <circle cx="24" cy="20" r="2" fill="#A5D6A7" />
      {/* spin-effect curved lines */}
      <path d="M8 14 Q16 8 24 12" stroke="#80CBC4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M40 14 Q32 8 24 12" stroke="#80CBC4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M8 26 Q16 32 24 28" stroke="#80CBC4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M40 26 Q32 32 24 28" stroke="#80CBC4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Dora5Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFEBEE" />
      {/* bell body */}
      <path d="M14 20 Q12 28 12 32 Q12 40 24 40 Q36 40 36 32 Q36 28 34 20 Z" fill="#FDD835" />
      <path d="M15 20 Q13 28 13 32 Q13 38 24 38 Q35 38 35 32 Q35 28 33 20 Z" fill="#FFE082" />
      {/* top loop */}
      <path d="M19 14 Q24 10 29 14" stroke="#F9A825" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* red ribbon */}
      <rect x="14" y="22" width="20" height="5" rx="2" fill="#E53935" />
      <rect x="21" y="19" width="6" height="5" rx="1" fill="#EF9A9A" />
      {/* clapper */}
      <ellipse cx="24" cy="38" rx="3" ry="2" fill="#F9A825" />
      <line x1="24" y1="34" x2="24" y2="38" stroke="#F9A825" strokeWidth="2" />
      {/* shine dot */}
      <circle cx="30" cy="18" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}

export function Dora6Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#EFEBE9" />
      {/* bottom pancake */}
      <ellipse cx="24" cy="32" rx="14" ry="5" fill="#FF8F00" />
      <ellipse cx="24" cy="30" rx="14" ry="5" fill="#FFA726" />
      {/* red bean filling */}
      <ellipse cx="24" cy="28" rx="12" ry="3" fill="#7B1FA2" />
      <ellipse cx="24" cy="27" rx="10" ry="2" fill="#6A1B9A" />
      {/* top pancake */}
      <ellipse cx="24" cy="24" rx="14" ry="5" fill="#FF8F00" />
      <ellipse cx="24" cy="22" rx="14" ry="5" fill="#FFA726" />
      {/* top surface highlight */}
      <ellipse cx="20" cy="21" rx="5" ry="2" fill="#FFCC80" opacity="0.5" />
      {/* steam wisps */}
      <path d="M18 16 Q16 12 18 8" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M24 15 Q22 11 24 7" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M30 16 Q28 12 30 8" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Dora7Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF9C4" />
      {/* flashlight body cylinder */}
      <rect x="18" y="20" width="14" height="20" rx="4" fill="#757575" />
      <rect x="19" y="21" width="12" height="18" rx="3" fill="#9E9E9E" />
      {/* lens front circle */}
      <circle cx="25" cy="20" r="6" fill="#616161" />
      <circle cx="25" cy="20" r="5" fill="#FFF59D" />
      <circle cx="25" cy="20" r="4" fill="#FFEE58" />
      {/* glowing tip */}
      <circle cx="25" cy="14" r="3" fill="#FFF176" opacity="0.8" />
      {/* triangular light beam */}
      <polygon points="18,14 32,14 38,4 12,4" fill="#FFF9C4" opacity="0.5" />
      <polygon points="20,14 30,14 34,7 16,7" fill="#FFEE58" opacity="0.4" />
      {/* button on body */}
      <circle cx="25" cy="32" r="2.5" fill="#424242" />
      <circle cx="25" cy="32" r="1.5" fill="#616161" />
    </svg>
  );
}

export function Dora8Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* bread slice shape */}
      <path d="M10 38 L10 22 Q10 12 24 10 Q38 12 38 22 L38 38 Z" fill="#FFB74D" />
      <path d="M11 38 L11 22 Q11 13 24 11 Q37 13 37 22 L37 38 Z" fill="#FFCC80" />
      {/* crust bottom */}
      <rect x="10" y="36" width="28" height="4" rx="1" fill="#FF8F00" />
      {/* burned-in squiggly text lines */}
      <path d="M14 20 Q16 18 18 20 Q20 22 22 20" stroke="#8D6E63" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14 25 Q17 23 20 25 Q23 27 26 25 Q29 23 32 25" stroke="#8D6E63" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14 30 Q17 28 20 30 Q23 32 26 30" stroke="#8D6E63" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* steam wisps */}
      <path d="M17 10 Q15 6 17 2" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M24 9 Q22 5 24 1" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M31 10 Q29 6 31 2" stroke="#B0BEC5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Dora9Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#EDE7F6" />
      {/* glow circle behind star */}
      <circle cx="24" cy="24" r="12" fill="#B39DDB" opacity="0.4" />
      <circle cx="24" cy="24" r="9" fill="#CE93D8" opacity="0.3" />
      {/* 4-pointed compass star */}
      <polygon points="24,8 27,21 40,24 27,27 24,40 21,27 8,24 21,21" fill="#FDD835" />
      <polygon points="24,10 26.5,21.5 38,24 26.5,26.5 24,38 21.5,26.5 10,24 21.5,21.5" fill="#FFE082" />
      {/* center */}
      <circle cx="24" cy="24" r="3" fill="#F9A825" />
      {/* 4 smaller star dots around */}
      <circle cx="10" cy="12" r="2" fill="#FDD835" />
      <circle cx="38" cy="12" r="2" fill="#FDD835" />
      <circle cx="10" cy="36" r="2" fill="#FDD835" />
      <circle cx="38" cy="36" r="2" fill="#FDD835" />
    </svg>
  );
}

export function Dora10Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD" />
      {/* cloud shadow below */}
      <ellipse cx="24" cy="36" rx="14" ry="3" fill="#90CAF9" opacity="0.5" />
      {/* cloud body — 3 bumps on top, flat bottom */}
      <rect x="10" y="24" width="28" height="12" rx="2" fill="white" />
      {/* bump left */}
      <circle cx="15" cy="24" r="7" fill="white" />
      {/* bump middle */}
      <circle cx="24" cy="20" r="9" fill="white" />
      {/* bump right */}
      <circle cx="33" cy="24" r="7" fill="white" />
      {/* light-blue outline shadow */}
      <path d="M10 36 Q10 38 12 38 L36 38 Q38 38 38 36 L38 28 Q34 32 33 32 Q28 32 24 28 Q20 32 15 32 Q12 32 10 28 Z" fill="#E3F2FD" opacity="0.4" />
    </svg>
  );
}

export function Dora11Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF8E1" />
      {/* scroll left curl */}
      <ellipse cx="10" cy="24" rx="4" ry="16" fill="#FFCC80" />
      <ellipse cx="10" cy="24" rx="2.5" ry="14" fill="#FFE0B2" />
      {/* scroll right curl */}
      <ellipse cx="38" cy="24" rx="4" ry="16" fill="#FFCC80" />
      <ellipse cx="38" cy="24" rx="2.5" ry="14" fill="#FFE0B2" />
      {/* scroll paper */}
      <rect x="10" y="8" width="28" height="32" fill="#FFF8E1" />
      <rect x="11" y="9" width="26" height="30" fill="#FFF3E0" />
      {/* dotted trail path */}
      <path d="M14 38 Q14 30 18 26 Q22 22 18 18 Q14 14 18 11" stroke="#8D6E63" strokeWidth="1.5" fill="none" strokeDasharray="2 2" strokeLinecap="round" />
      {/* X-mark for treasure */}
      <line x1="27" y1="14" x2="35" y2="20" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="14" x2="27" y2="20" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round" />
      {/* torn curled edges */}
      <path d="M10 8 Q12 6 14 8 Q16 6 18 8" stroke="#FFCC80" strokeWidth="1.5" fill="none" />
      <path d="M10 40 Q12 42 14 40 Q16 42 18 40" stroke="#FFCC80" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function Dora12Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E0F7FA" />
      {/* glow rings */}
      <circle cx="24" cy="32" r="18" fill="none" stroke="#80DEEA" strokeWidth="1.5" opacity="0.5" />
      <circle cx="24" cy="32" r="20" fill="none" stroke="#B2EBF2" strokeWidth="1" opacity="0.4" />
      {/* bowl base ring */}
      <ellipse cx="24" cy="38" rx="16" ry="4" fill="#0097A7" />
      <ellipse cx="24" cy="36" rx="16" ry="4" fill="#00ACC1" />
      {/* bowl body */}
      <path d="M8 36 Q8 24 24 20 Q40 24 40 36 Z" fill="#00BCD4" />
      <path d="M9 36 Q9 25 24 21 Q39 25 39 36 Z" fill="#26C6DA" />
      {/* dome/top */}
      <ellipse cx="24" cy="22" rx="14" ry="6" fill="#E0F7FA" />
      <ellipse cx="24" cy="21" rx="12" ry="5" fill="white" opacity="0.7" />
      {/* clock face on top */}
      <circle cx="24" cy="21" r="5" fill="#ECEFF1" />
      <circle cx="24" cy="21" r="4" fill="white" />
      <line x1="24" y1="17.5" x2="24" y2="21" stroke="#212121" strokeWidth="1" strokeLinecap="round" />
      <line x1="24" y1="21" x2="27" y2="21" stroke="#212121" strokeWidth="1" strokeLinecap="round" />
      {/* control panel buttons */}
      <circle cx="16" cy="30" r="2" fill="#E53935" />
      <circle cx="21" cy="30" r="2" fill="#FDD835" />
      <circle cx="26" cy="30" r="2" fill="#43A047" />
      <circle cx="31" cy="30" r="2" fill="#1E88E5" />
    </svg>
  );
}

export function Dora13Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#ECEFF1" />
      {/* antenna */}
      <line x1="24" y1="8" x2="24" y2="14" stroke="#78909C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="7" r="3" fill="#EF5350" />
      {/* square head */}
      <rect x="13" y="13" width="22" height="20" rx="3" fill="#B0BEC5" />
      <rect x="14" y="14" width="20" height="18" rx="2" fill="#CFD8DC" />
      {/* left eye */}
      <circle cx="19" cy="21" r="4" fill="white" />
      <circle cx="19" cy="21" r="2.5" fill="#1E88E5" />
      <circle cx="19" cy="21" r="1.5" fill="#212121" />
      <circle cx="19.8" cy="20.2" r="0.7" fill="white" />
      {/* right eye */}
      <circle cx="29" cy="21" r="4" fill="white" />
      <circle cx="29" cy="21" r="2.5" fill="#1E88E5" />
      <circle cx="29" cy="21" r="1.5" fill="#212121" />
      <circle cx="29.8" cy="20.2" r="0.7" fill="white" />
      {/* mouth line */}
      <path d="M18 29 Q24 32 30 29" stroke="#90A4AE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* body */}
      <rect x="16" y="33" width="16" height="10" rx="2" fill="#B0BEC5" />
      {/* heart on chest */}
      <path d="M24 37 C24 37 20 34 20 36.5 C20 38 22 39 24 41 C26 39 28 38 28 36.5 C28 34 24 37 24 37Z" fill="#EF5350" />
      {/* stubby arms */}
      <rect x="8" y="33" width="8" height="5" rx="2.5" fill="#B0BEC5" />
      <rect x="32" y="33" width="8" height="5" rx="2.5" fill="#B0BEC5" />
    </svg>
  );
}

export function Dora14Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E" />
      {/* star dots */}
      <circle cx="8" cy="10" r="1.2" fill="white" />
      <circle cx="38" cy="8" r="1.5" fill="white" />
      <circle cx="42" cy="20" r="1" fill="white" />
      <circle cx="6" cy="30" r="1.2" fill="white" />
      <circle cx="40" cy="38" r="1" fill="white" />
      <circle cx="12" cy="40" r="1.5" fill="white" />
      {/* rocket fins (left) */}
      <polygon points="16,32 12,40 20,36" fill="#EF5350" />
      {/* rocket fins (right) */}
      <polygon points="32,32 36,40 28,36" fill="#EF5350" />
      {/* rocket body */}
      <rect x="18" y="12" width="12" height="26" rx="6" fill="#FDD835" />
      <rect x="19" y="13" width="10" height="24" rx="5" fill="#FFE082" />
      {/* nose cone */}
      <path d="M18 16 Q24 6 30 16 Z" fill="#FF6F00" />
      <path d="M19 16 Q24 8 29 16 Z" fill="#FFA726" />
      {/* porthole window */}
      <circle cx="24" cy="24" r="5" fill="#90CAF9" />
      <circle cx="24" cy="24" r="4" fill="#E3F2FD" />
      <circle cx="22" cy="22" r="1.5" fill="white" opacity="0.8" />
      {/* fire blast at base */}
      <polygon points="20,38 24,46 28,38 26,36 22,36" fill="#FF6F00" />
      <polygon points="21,38 24,44 27,38 26,37 22,37" fill="#FFEE58" />
    </svg>
  );
}

export function Dora15Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD" />
      {/* rainbow arcs — 6 colors, outermost to innermost */}
      {/* Red */}
      <path d="M6 32 Q6 12 24 12 Q42 12 42 32" stroke="#EF5350" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Orange */}
      <path d="M8 32 Q8 15 24 15 Q40 15 40 32" stroke="#FF9800" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Yellow */}
      <path d="M10 32 Q10 18 24 18 Q38 18 38 32" stroke="#FDD835" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Green */}
      <path d="M12 32 Q12 21 24 21 Q36 21 36 32" stroke="#43A047" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Blue */}
      <path d="M14 32 Q14 24 24 24 Q34 24 34 32" stroke="#1E88E5" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Indigo/Violet */}
      <path d="M16 32 Q16 27 24 27 Q32 27 32 32" stroke="#7B1FA2" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* white cloud left base */}
      <circle cx="8" cy="33" r="5" fill="white" />
      <circle cx="5" cy="35" r="4" fill="white" />
      <circle cx="11" cy="35" r="4" fill="white" />
      {/* white cloud right base */}
      <circle cx="40" cy="33" r="5" fill="white" />
      <circle cx="37" cy="35" r="4" fill="white" />
      <circle cx="43" cy="35" r="4" fill="white" />
    </svg>
  );
}

export function Dora16Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#BBDEFB" />
      {/* gift box body */}
      <rect x="10" y="26" width="28" height="18" rx="3" fill="#1E88E5" />
      <rect x="11" y="27" width="26" height="16" rx="2" fill="#42A5F5" />
      {/* gift box lid */}
      <rect x="9" y="21" width="30" height="7" rx="2" fill="#1565C0" />
      <rect x="10" y="22" width="28" height="5" rx="1.5" fill="#1976D2" />
      {/* ribbon vertical */}
      <rect x="22" y="21" width="4" height="23" fill="#FDD835" />
      {/* ribbon horizontal */}
      <rect x="9" y="24" width="30" height="4" fill="#FDD835" />
      {/* bow left loop */}
      <ellipse cx="18" cy="20" rx="6" ry="4" fill="#F9A825" transform="rotate(-20,18,20)" />
      {/* bow right loop */}
      <ellipse cx="30" cy="20" rx="6" ry="4" fill="#F9A825" transform="rotate(20,30,20)" />
      {/* bow center knot */}
      <circle cx="24" cy="21" r="3.5" fill="#FDD835" />
      {/* question mark on front */}
      <path d="M22 31 Q22 28 24 27 Q26 26 26 28 Q26 30 24 31 L24 33" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="36" r="1.5" fill="white" />
      {/* sparkle dots */}
      <circle cx="9" cy="18" r="1.5" fill="#FDD835" />
      <circle cx="39" cy="18" r="1.5" fill="#FDD835" />
      <circle cx="6" cy="28" r="1" fill="#FDD835" />
      <circle cx="42" cy="28" r="1" fill="#FDD835" />
    </svg>
  );
}
