import React from 'react';

interface IconProps { size?: number }

export function Vehicle1Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* car body */}
      <rect x="5" y="26" width="38" height="12" rx="4" fill="#E53935"/>
      {/* car roof cabin */}
      <path d="M12 26 Q15 18 20 17 L32 17 Q37 18 38 26Z" fill="#EF9A9A"/>
      {/* windows */}
      <path d="M15 26 Q17 20 20 19 L26 19 L27 26Z" fill="#90CAF9"/>
      <path d="M29 26 L30 19 L32 19 Q35 20 36 26Z" fill="#90CAF9"/>
      {/* headlights */}
      <rect x="38" y="28" width="4" height="4" rx="1" fill="#FFEE58"/>
      {/* tail lights */}
      <rect x="6" y="28" width="3" height="4" rx="1" fill="#FF1744"/>
      {/* wheels */}
      <circle cx="14" cy="38" r="5" fill="#37474F"/>
      <circle cx="14" cy="38" r="2.5" fill="#90A4AE"/>
      <circle cx="34" cy="38" r="5" fill="#37474F"/>
      <circle cx="34" cy="38" r="2.5" fill="#90A4AE"/>
    </svg>
  );
}

export function Vehicle2Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
      {/* bus body */}
      <rect x="4" y="18" width="40" height="20" rx="3" fill="#FDD835"/>
      {/* black bumper front */}
      <rect x="40" y="24" width="4" height="8" rx="1" fill="#212121"/>
      {/* black bumper rear */}
      <rect x="4" y="24" width="4" height="8" rx="1" fill="#212121"/>
      {/* windows row */}
      <rect x="10" y="20" width="6" height="7" rx="1" fill="#90CAF9"/>
      <rect x="18" y="20" width="6" height="7" rx="1" fill="#90CAF9"/>
      <rect x="26" y="20" width="6" height="7" rx="1" fill="#90CAF9"/>
      <rect x="34" y="20" width="5" height="7" rx="1" fill="#90CAF9"/>
      {/* door */}
      <rect x="5" y="21" width="4" height="10" rx="1" fill="#F9A825"/>
      {/* school bus text stripe */}
      <rect x="4" y="29" width="40" height="2" fill="#212121"/>
      {/* wheels */}
      <circle cx="12" cy="38" r="5" fill="#212121"/>
      <circle cx="12" cy="38" r="2.5" fill="#78909C"/>
      <circle cx="36" cy="38" r="5" fill="#212121"/>
      <circle cx="36" cy="38" r="2.5" fill="#78909C"/>
    </svg>
  );
}

export function Vehicle3Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
      {/* truck body */}
      <rect x="4" y="22" width="40" height="16" rx="3" fill="#E53935"/>
      {/* white stripe */}
      <rect x="4" y="28" width="40" height="3" fill="white"/>
      {/* cab / windshield area */}
      <rect x="30" y="16" width="14" height="10" rx="2" fill="#EF9A9A"/>
      <rect x="31" y="17" width="12" height="7" rx="1" fill="#90CAF9"/>
      {/* ladders on top */}
      <rect x="6" y="19" width="22" height="4" rx="1" fill="#B71C1C"/>
      <line x1="10" y1="19" x2="10" y2="23" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="14" y1="19" x2="14" y2="23" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="18" y1="19" x2="18" y2="23" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="22" y1="19" x2="22" y2="23" stroke="#FFD700" strokeWidth="1.5"/>
      {/* roof lights */}
      <rect x="32" y="14" width="3" height="3" rx="1" fill="#E53935"/>
      <rect x="37" y="14" width="3" height="3" rx="1" fill="#1E88E5"/>
      {/* headlight */}
      <rect x="40" y="24" width="4" height="4" rx="1" fill="#FFEE58"/>
      {/* wheels */}
      <circle cx="12" cy="38" r="5" fill="#212121"/>
      <circle cx="12" cy="38" r="2.5" fill="#78909C"/>
      <circle cx="26" cy="38" r="5" fill="#212121"/>
      <circle cx="26" cy="38" r="2.5" fill="#78909C"/>
      <circle cx="38" cy="38" r="5" fill="#212121"/>
      <circle cx="38" cy="38" r="2.5" fill="#78909C"/>
    </svg>
  );
}

export function Vehicle4Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E8EAF6"/>
      {/* police car body */}
      <rect x="5" y="26" width="38" height="12" rx="4" fill="#1565C0"/>
      {/* white side door panel */}
      <rect x="14" y="27" width="20" height="10" rx="2" fill="white"/>
      {/* badge star on door */}
      <polygon points="24,29 24.8,31.5 27.5,31.5 25.4,33 26.1,35.5 24,34 21.9,35.5 22.6,33 20.5,31.5 23.2,31.5" fill="#FFD700"/>
      {/* cabin roof */}
      <path d="M12 26 Q15 18 20 17 L32 17 Q37 18 38 26Z" fill="#1976D2"/>
      {/* windows */}
      <path d="M16 26 Q18 20 21 19 L27 19 L28 26Z" fill="#90CAF9"/>
      <path d="M30 26 L31 19 L32 19 Q35 20 36 26Z" fill="#90CAF9"/>
      {/* lightbar on roof */}
      <rect x="18" y="15" width="12" height="4" rx="2" fill="#B0BEC5"/>
      <rect x="19" y="15.5" width="4" height="3" rx="1" fill="#E53935"/>
      <rect x="25" y="15.5" width="4" height="3" rx="1" fill="#1E88E5"/>
      {/* headlight */}
      <rect x="38" y="28" width="4" height="4" rx="1" fill="#FFEE58"/>
      {/* wheels */}
      <circle cx="14" cy="38" r="5" fill="#212121"/>
      <circle cx="14" cy="38" r="2.5" fill="#78909C"/>
      <circle cx="34" cy="38" r="5" fill="#212121"/>
      <circle cx="34" cy="38" r="2.5" fill="#78909C"/>
    </svg>
  );
}

export function Vehicle5Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E8F5E9"/>
      {/* ambulance boxy van body */}
      <rect x="5" y="20" width="38" height="18" rx="3" fill="white"/>
      {/* red stripe on side */}
      <rect x="5" y="28" width="38" height="4" fill="#E53935"/>
      {/* red cross on side */}
      <rect x="18" y="22" width="8" height="2.5" rx="1" fill="#E53935"/>
      <rect x="21" y="19.5" width="2.5" height="8" rx="1" fill="#E53935"/>
      {/* windshield */}
      <rect x="33" y="21" width="10" height="8" rx="2" fill="#90CAF9"/>
      {/* rear door */}
      <rect x="5" y="21" width="8" height="13" rx="1" fill="#F5F5F5"/>
      <line x1="9" y1="21" x2="9" y2="34" stroke="#BDBDBD" strokeWidth="1"/>
      {/* lightbar */}
      <rect x="20" y="17" width="18" height="4" rx="2" fill="#CFD8DC"/>
      <rect x="21" y="17.5" width="5" height="3" rx="1" fill="#E53935"/>
      <rect x="28" y="17.5" width="5" height="3" rx="1" fill="#1E88E5"/>
      {/* wheels */}
      <circle cx="13" cy="38" r="5" fill="#212121"/>
      <circle cx="13" cy="38" r="2.5" fill="#78909C"/>
      <circle cx="35" cy="38" r="5" fill="#212121"/>
      <circle cx="35" cy="38" r="2.5" fill="#78909C"/>
    </svg>
  );
}

export function Vehicle6Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#1A237E"/>
      {/* rocket body */}
      <rect x="19" y="16" width="10" height="22" rx="4" fill="white"/>
      {/* rocket nose cone */}
      <path d="M19 16 Q24 6 29 16Z" fill="#E53935"/>
      {/* porthole window */}
      <circle cx="24" cy="24" r="4" fill="#90CAF9"/>
      <circle cx="24" cy="24" r="2.5" fill="#42A5F5"/>
      {/* left fin */}
      <path d="M19 32 L13 40 L19 38Z" fill="#E53935"/>
      {/* right fin */}
      <path d="M29 32 L35 40 L29 38Z" fill="#E53935"/>
      {/* fire exhaust */}
      <ellipse cx="24" cy="40" rx="4" ry="3" fill="#FFD700"/>
      <ellipse cx="24" cy="42" rx="2.5" ry="2" fill="#FF9800"/>
      <ellipse cx="24" cy="44" rx="1.5" ry="1.5" fill="#FF5722"/>
      {/* small stars */}
      <circle cx="10" cy="12" r="1.2" fill="white"/>
      <circle cx="38" cy="8" r="1" fill="white"/>
      <circle cx="6" cy="28" r="0.8" fill="white"/>
      <circle cx="42" cy="20" r="1" fill="white"/>
    </svg>
  );
}

export function Vehicle7Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* fuselage body */}
      <ellipse cx="22" cy="26" rx="16" ry="6" fill="white"/>
      {/* nose cone */}
      <path d="M38 26 Q44 24 44 26 Q44 28 38 26Z" fill="#E0E0E0"/>
      {/* tail fin vertical */}
      <path d="M6 26 Q6 18 10 18 L10 22Z" fill="#CFD8DC"/>
      {/* tail fin horizontal */}
      <path d="M6 26 L8 22 L12 24Z" fill="#CFD8DC"/>
      <path d="M6 26 L8 30 L12 28Z" fill="#CFD8DC"/>
      {/* swept wings */}
      <path d="M24 24 Q30 16 38 15 Q36 20 30 22 L24 24Z" fill="#E0E0E0"/>
      <path d="M24 28 Q30 36 38 37 Q36 32 30 30 L24 28Z" fill="#E0E0E0"/>
      {/* windows row */}
      <circle cx="28" cy="23" r="1.5" fill="#90CAF9"/>
      <circle cx="32" cy="23" r="1.5" fill="#90CAF9"/>
      <circle cx="36" cy="23" r="1.5" fill="#90CAF9"/>
      <circle cx="24" cy="23" r="1.5" fill="#90CAF9"/>
      {/* stripe */}
      <rect x="10" y="24" width="30" height="2" rx="1" fill="#1E88E5"/>
    </svg>
  );
}

export function Vehicle8Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
      {/* boiler cylinder */}
      <rect x="8" y="22" width="28" height="14" rx="5" fill="#E65100"/>
      {/* boiler highlight */}
      <rect x="8" y="22" width="28" height="5" rx="3" fill="#FF8A65"/>
      {/* cab section */}
      <rect x="30" y="16" width="12" height="20" rx="2" fill="#BF360C"/>
      {/* cab window */}
      <rect x="32" y="18" width="8" height="7" rx="1" fill="#90CAF9"/>
      {/* smokestack */}
      <rect x="14" y="12" width="5" height="12" rx="2" fill="#4E342E"/>
      {/* smoke puff */}
      <circle cx="16" cy="10" r="3" fill="#BDBDBD"/>
      <circle cx="20" cy="9" r="2.5" fill="#BDBDBD"/>
      <circle cx="13" cy="9" r="2" fill="#BDBDBD"/>
      {/* large front wheel */}
      <circle cx="12" cy="36" r="7" fill="#4E342E"/>
      <circle cx="12" cy="36" r="4" fill="#795548"/>
      <circle cx="12" cy="36" r="2" fill="#4E342E"/>
      {/* smaller rear wheels */}
      <circle cx="28" cy="36" r="5" fill="#4E342E"/>
      <circle cx="28" cy="36" r="2.5" fill="#795548"/>
      <circle cx="38" cy="36" r="5" fill="#4E342E"/>
      <circle cx="38" cy="36" r="2.5" fill="#795548"/>
      {/* connecting rod */}
      <rect x="12" y="35" width="16" height="2" rx="1" fill="#FFB300"/>
    </svg>
  );
}

export function Vehicle9Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
      {/* main rotor blade */}
      <rect x="4" y="17" width="40" height="3" rx="1.5" fill="#90A4AE"/>
      <circle cx="24" cy="18.5" r="3" fill="#546E7A"/>
      {/* fuselage */}
      <path d="M10 22 Q12 18 18 18 L32 18 Q38 20 40 24 Q38 28 34 28 L14 28 Q10 28 10 22Z" fill="#4DD0E1"/>
      {/* tail boom */}
      <path d="M10 22 Q6 24 4 26 L4 28 Q6 28 10 26Z" fill="#26C6DA"/>
      {/* tail rotor */}
      <rect x="3" y="22" width="2" height="8" rx="1" fill="#90A4AE"/>
      <circle cx="4" cy="26" r="1.5" fill="#546E7A"/>
      {/* cabin window */}
      <ellipse cx="28" cy="23" rx="5" ry="4" fill="#B2EBF2"/>
      {/* skids */}
      <line x1="15" y1="28" x2="15" y2="34" stroke="#546E7A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="28" x2="30" y2="34" stroke="#546E7A" strokeWidth="2" strokeLinecap="round"/>
      <rect x="10" y="34" width="14" height="2.5" rx="1" fill="#546E7A"/>
      <rect x="26" y="34" width="10" height="2.5" rx="1" fill="#546E7A"/>
    </svg>
  );
}

export function Vehicle10Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* water */}
      <path d="M4 34 Q10 30 16 34 Q22 38 28 34 Q34 30 44 34 L44 44 L4 44Z" fill="#2196F3"/>
      {/* hull */}
      <path d="M10 34 Q12 40 24 40 Q36 40 38 34Z" fill="white"/>
      {/* mast */}
      <line x1="22" y1="34" x2="22" y2="10" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
      {/* main sail */}
      <path d="M22 12 L22 32 L38 26Z" fill="white"/>
      {/* red stripe on sail */}
      <path d="M22 18 L35 23 L22 24Z" fill="#E53935"/>
      {/* jib sail */}
      <path d="M22 16 L22 28 L12 26Z" fill="#F5F5F5"/>
      {/* pennant flag */}
      <polygon points="22,10 28,11.5 22,13" fill="#E53935"/>
    </svg>
  );
}

export function Vehicle11Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
      {/* sleek racing body */}
      <path d="M4 30 Q6 24 12 22 L36 22 Q42 22 44 26 L44 32 Q40 34 8 34 Q4 34 4 30Z" fill="#E53935"/>
      {/* cockpit */}
      <path d="M18 22 Q20 16 26 16 L32 16 Q36 17 36 22Z" fill="#FF8A65"/>
      <path d="M20 22 Q22 18 26 17 L32 17 Q34 18 34 22Z" fill="#90CAF9"/>
      {/* rear spoiler */}
      <rect x="4" y="20" width="6" height="3" rx="1" fill="#B71C1C"/>
      <rect x="3" y="20" width="2" height="6" rx="1" fill="#B71C1C"/>
      {/* number 1 on side */}
      <rect x="22" y="25" width="2.5" height="6" rx="1" fill="white"/>
      <path d="M20 26 L22 24.5 L22 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* exhaust pipe */}
      <rect x="44" y="27" width="4" height="2.5" rx="1" fill="#9E9E9E"/>
      {/* large wheels */}
      <circle cx="12" cy="34" r="6" fill="#212121"/>
      <circle cx="12" cy="34" r="3" fill="#616161"/>
      <circle cx="36" cy="34" r="6" fill="#212121"/>
      <circle cx="36" cy="34" r="3" fill="#616161"/>
    </svg>
  );
}

export function Vehicle12Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E8F5E9"/>
      {/* tractor body / hood */}
      <rect x="16" y="22" width="22" height="14" rx="3" fill="#388E3C"/>
      {/* engine hood */}
      <rect x="30" y="24" width="12" height="8" rx="2" fill="#2E7D32"/>
      {/* cab */}
      <rect x="17" y="14" width="14" height="12" rx="2" fill="#43A047"/>
      {/* cab window */}
      <rect x="19" y="15" width="10" height="7" rx="1" fill="#90CAF9"/>
      {/* exhaust pipe */}
      <rect x="36" y="16" width="3" height="10" rx="1.5" fill="#1B5E20"/>
      {/* exhaust puff */}
      <circle cx="37.5" cy="14" r="2" fill="#B0BEC5"/>
      <circle cx="40" cy="13" r="1.5" fill="#CFD8DC"/>
      {/* large back wheel */}
      <circle cx="20" cy="36" r="9" fill="#1B5E20"/>
      <circle cx="20" cy="36" r="5.5" fill="#2E7D32"/>
      <circle cx="20" cy="36" r="2.5" fill="#1B5E20"/>
      {/* tread lines on big wheel */}
      <line x1="20" y1="27" x2="20" y2="45" stroke="#1B5E20" strokeWidth="1.5"/>
      <line x1="11" y1="36" x2="29" y2="36" stroke="#1B5E20" strokeWidth="1.5"/>
      {/* small front wheel */}
      <circle cx="36" cy="38" r="5" fill="#1B5E20"/>
      <circle cx="36" cy="38" r="2.5" fill="#2E7D32"/>
    </svg>
  );
}

export function Vehicle13Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
      {/* balloon envelope */}
      <ellipse cx="24" cy="20" rx="14" ry="16" fill="#FFEB3B"/>
      {/* vertical color stripes on balloon */}
      <path d="M24 4 Q26 4 29 6 Q30 10 30 20 Q30 30 28 35 L24 36 L24 4Z" fill="#E53935"/>
      <path d="M24 4 Q22 4 19 6 Q18 10 18 20 Q18 30 20 35 L24 36 L24 4Z" fill="#43A047"/>
      <path d="M29 6 Q33 9 35 16 Q36 22 34 30 Q32 34 28 35 L30 20 Q30 10 29 6Z" fill="#1E88E5"/>
      <path d="M19 6 Q15 9 13 16 Q12 22 14 30 Q16 34 20 35 L18 20 Q18 10 19 6Z" fill="#1E88E5"/>
      {/* ropes */}
      <line x1="17" y1="35" x2="19" y2="42" stroke="#795548" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="31" y1="35" x2="29" y2="42" stroke="#795548" strokeWidth="1.5" strokeLinecap="round"/>
      {/* basket */}
      <rect x="18" y="41" width="12" height="6" rx="2" fill="#8D6E63"/>
      <line x1="21" y1="41" x2="21" y2="47" stroke="#6D4C41" strokeWidth="1"/>
      <line x1="27" y1="41" x2="27" y2="47" stroke="#6D4C41" strokeWidth="1"/>
    </svg>
  );
}

export function Vehicle14Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#ECEFF1"/>
      {/* rear wheel */}
      <circle cx="32" cy="34" r="8" fill="#37474F"/>
      <circle cx="32" cy="34" r="4.5" fill="#607D8B"/>
      <circle cx="32" cy="34" r="2" fill="#37474F"/>
      {/* front wheel */}
      <circle cx="12" cy="34" r="8" fill="#37474F"/>
      <circle cx="12" cy="34" r="4.5" fill="#607D8B"/>
      <circle cx="12" cy="34" r="2" fill="#37474F"/>
      {/* frame / swingarm */}
      <line x1="12" y1="34" x2="32" y2="34" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      {/* seat */}
      <rect x="20" y="22" width="12" height="4" rx="2" fill="#212121"/>
      {/* main frame triangle */}
      <line x1="12" y1="34" x2="22" y2="22" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="22" x2="32" y2="28" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      {/* handlebars */}
      <line x1="32" y1="26" x2="36" y2="22" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="36" y1="22" x2="40" y2="22" stroke="#546E7A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* sporty exhaust pipe */}
      <path d="M32 34 Q36 32 38 30 Q40 28 42 30" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* headlight */}
      <ellipse cx="38" cy="24" rx="2.5" ry="2" fill="#FFEE58"/>
    </svg>
  );
}

export function Vehicle15Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
      {/* water waves above */}
      <path d="M4 22 Q8 18 12 22 Q16 26 20 22 Q24 18 28 22 Q32 26 36 22 Q40 18 44 22" stroke="#29B6F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* submarine body */}
      <ellipse cx="24" cy="30" rx="17" ry="8" fill="#FDD835"/>
      {/* conning tower */}
      <rect x="19" y="22" width="10" height="8" rx="2" fill="#F9A825"/>
      {/* periscope */}
      <rect x="22" y="16" width="2.5" height="8" rx="1" fill="#F57F17"/>
      <rect x="20" y="15" width="5" height="2" rx="1" fill="#F57F17"/>
      {/* porthole windows */}
      <circle cx="14" cy="30" r="3" fill="#B2EBF2"/>
      <circle cx="14" cy="30" r="1.5" fill="#4DD0E1"/>
      <circle cx="24" cy="30" r="3" fill="#B2EBF2"/>
      <circle cx="24" cy="30" r="1.5" fill="#4DD0E1"/>
      <circle cx="34" cy="30" r="3" fill="#B2EBF2"/>
      <circle cx="34" cy="30" r="1.5" fill="#4DD0E1"/>
      {/* propeller */}
      <circle cx="41" cy="30" r="2" fill="#F57F17"/>
      <ellipse cx="41" cy="26" rx="1.5" ry="3" fill="#FFA000"/>
      <ellipse cx="41" cy="34" rx="1.5" ry="3" fill="#FFA000"/>
    </svg>
  );
}

export function Vehicle16Icon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="#F3E5F5"/>
      {/* rear wheel */}
      <circle cx="33" cy="34" r="9" fill="#4A148C"/>
      <circle cx="33" cy="34" r="6" fill="#7B1FA2"/>
      <circle cx="33" cy="34" r="3" fill="#4A148C"/>
      {/* rear wheel spokes */}
      <line x1="33" y1="25" x2="33" y2="43" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="24" y1="34" x2="42" y2="34" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="26.5" y1="27.5" x2="39.5" y2="40.5" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="39.5" y1="27.5" x2="26.5" y2="40.5" stroke="#AB47BC" strokeWidth="1.5"/>
      {/* front wheel */}
      <circle cx="14" cy="34" r="9" fill="#4A148C"/>
      <circle cx="14" cy="34" r="6" fill="#7B1FA2"/>
      <circle cx="14" cy="34" r="3" fill="#4A148C"/>
      {/* front wheel spokes */}
      <line x1="14" y1="25" x2="14" y2="43" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="5" y1="34" x2="23" y2="34" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="7.5" y1="27.5" x2="20.5" y2="40.5" stroke="#AB47BC" strokeWidth="1.5"/>
      <line x1="20.5" y1="27.5" x2="7.5" y2="40.5" stroke="#AB47BC" strokeWidth="1.5"/>
      {/* diamond frame */}
      <line x1="14" y1="34" x2="24" y2="22" stroke="#CE93D8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="34" x2="24" y2="30" stroke="#CE93D8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="22" x2="33" y2="34" stroke="#CE93D8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="30" x2="33" y2="34" stroke="#CE93D8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="22" x2="24" y2="30" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round"/>
      {/* handlebars */}
      <line x1="33" y1="25" x2="36" y2="21" stroke="#9C27B0" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="36" y1="21" x2="40" y2="21" stroke="#9C27B0" strokeWidth="2.5" strokeLinecap="round"/>
      {/* seat */}
      <rect x="21" y="20" width="8" height="3" rx="1.5" fill="#6A1B9A"/>
    </svg>
  );
}
