import React from 'react'; interface IconProps { size?: number }

export function Mickey1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Ear circles */}
    <circle cx="13" cy="14" r="9" fill="#212121"/>
    <circle cx="35" cy="14" r="9" fill="#212121"/>
    {/* Head circle */}
    <circle cx="24" cy="28" r="14" fill="#212121"/>
  </svg>
}

export function Mickey2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* Left loop */}
    <ellipse cx="11" cy="22" rx="9" ry="11" fill="#E91E63"/>
    {/* Right loop */}
    <ellipse cx="37" cy="22" rx="9" ry="11" fill="#E91E63"/>
    {/* Left tail */}
    <ellipse cx="7" cy="35" rx="5" ry="3" fill="#E91E63" transform="rotate(20 7 35)"/>
    {/* Right tail */}
    <ellipse cx="41" cy="35" rx="5" ry="3" fill="#E91E63" transform="rotate(-20 41 35)"/>
    {/* Center knot */}
    <ellipse cx="24" cy="24" rx="5" ry="4" fill="#C2185B"/>
    {/* Polka dots - left loop */}
    <circle cx="9" cy="18" r="1.5" fill="white"/>
    <circle cx="13" cy="24" r="1.5" fill="white"/>
    <circle cx="8" cy="26" r="1.5" fill="white"/>
    <circle cx="14" cy="30" r="1.5" fill="white"/>
    {/* Polka dots - right loop */}
    <circle cx="39" cy="18" r="1.5" fill="white"/>
    <circle cx="35" cy="24" r="1.5" fill="white"/>
    <circle cx="40" cy="26" r="1.5" fill="white"/>
    <circle cx="34" cy="30" r="1.5" fill="white"/>
  </svg>
}

export function Mickey3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* Left glove */}
    <ellipse cx="13" cy="26" rx="10" ry="11" fill="white"/>
    {/* Left fingers */}
    <ellipse cx="5" cy="20" rx="4" ry="3" fill="white"/>
    <ellipse cx="5" cy="25" rx="4" ry="3" fill="white"/>
    <ellipse cx="8" cy="16" rx="3.5" ry="3" fill="white"/>
    {/* Left cuff */}
    <rect x="8" y="33" width="12" height="4" rx="2" fill="#1E88E5"/>
    {/* Right glove */}
    <ellipse cx="35" cy="26" rx="10" ry="11" fill="white"/>
    {/* Right fingers */}
    <ellipse cx="43" cy="20" rx="4" ry="3" fill="white"/>
    <ellipse cx="43" cy="25" rx="4" ry="3" fill="white"/>
    <ellipse cx="40" cy="16" rx="3.5" ry="3" fill="white"/>
    {/* Right cuff */}
    <rect x="28" y="33" width="12" height="4" rx="2" fill="#1E88E5"/>
    {/* Dividing lines to suggest separate gloves */}
    <line x1="24" y1="15" x2="24" y2="44" stroke="#BBDEFB" strokeWidth="2"/>
  </svg>
}

export function Mickey4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* Water waves */}
    <path d="M4,36 Q10,32 16,36 Q22,40 28,36 Q34,32 40,36 Q44,38 44,40 L4,40 Z" fill="#29B6F6"/>
    {/* Boat hull */}
    <path d="M8,32 Q24,36 40,32 L38,26 L10,26 Z" fill="#8D6E63"/>
    {/* Boat cabin */}
    <rect x="14" y="18" width="20" height="10" rx="1" fill="#FFF9C4"/>
    {/* Windows */}
    <rect x="16" y="20" width="5" height="5" rx="1" fill="#81D4FA"/>
    <rect x="23" y="20" width="5" height="5" rx="1" fill="#81D4FA"/>
    <rect x="30" y="20" width="3" height="5" rx="1" fill="#81D4FA"/>
    {/* Smokestack */}
    <rect x="22" y="10" width="5" height="10" rx="1" fill="#212121"/>
    {/* Smoke puffs */}
    <circle cx="22" cy="8" r="3" fill="#B0BEC5" opacity="0.8"/>
    <circle cx="25" cy="5" r="2.5" fill="#B0BEC5" opacity="0.6"/>
    <circle cx="28" cy="3" r="2" fill="#B0BEC5" opacity="0.4"/>
    {/* Paddle wheel */}
    <circle cx="41" cy="30" r="5" fill="none" stroke="#795548" strokeWidth="2"/>
    <line x1="41" y1="25" x2="41" y2="35" stroke="#795548" strokeWidth="1.5"/>
    <line x1="36" y1="30" x2="46" y2="30" stroke="#795548" strokeWidth="1.5"/>
  </svg>
}

export function Mickey5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#EDE7F6"/>
    {/* Main center tower */}
    <rect x="19" y="16" width="10" height="26" fill="#CE93D8"/>
    {/* Center spire */}
    <polygon points="24,4 27,16 21,16" fill="#7B1FA2"/>
    {/* Left tower */}
    <rect x="9" y="22" width="8" height="20" fill="#CE93D8"/>
    <polygon points="13,13 16,22 10,22" fill="#7B1FA2"/>
    {/* Right tower */}
    <rect x="31" y="22" width="8" height="20" fill="#CE93D8"/>
    <polygon points="35,13 38,22 32,22" fill="#7B1FA2"/>
    {/* Far left tower */}
    <rect x="3" y="28" width="6" height="14" fill="#BA68C8"/>
    <polygon points="6,21 8,28 4,28" fill="#7B1FA2"/>
    {/* Far right tower */}
    <rect x="39" y="28" width="6" height="14" fill="#BA68C8"/>
    <polygon points="42,21 44,28 40,28" fill="#7B1FA2"/>
    {/* Arched gate */}
    <rect x="21" y="32" width="6" height="10" rx="3" fill="#4A148C"/>
    {/* Sparkles */}
    <path d="M6,12 L7,9 L8,12 L11,11 L8,13 L11,15 L8,14 L7,17 L6,14 L3,15 L6,13 L3,11 Z" fill="#FFD54F"/>
    <path d="M38,8 L39,6 L40,8 L42,7 L40,9 L42,11 L40,10 L39,12 L38,10 L36,11 L38,9 L36,7 Z" fill="#FFD54F"/>
  </svg>
}

export function Mickey6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#1A237E"/>
    {/* Hat brim */}
    <ellipse cx="24" cy="38" rx="18" ry="4" fill="#283593"/>
    {/* Hat body */}
    <path d="M10,38 L14,10 L34,10 L38,38 Z" fill="#1A237E"/>
    <path d="M10,38 L14,10 L34,10 L38,38 Z" fill="none" stroke="#283593" strokeWidth="1"/>
    {/* Stars on hat */}
    <path d="M20,20 L21,17 L22,20 L25,19 L22,21 L25,23 L22,22 L21,25 L20,22 L17,23 L20,21 L17,19 Z" fill="#FFD54F"/>
    <path d="M28,30 L29,28 L30,30 L32,29 L30,31 L32,33 L30,32 L29,34 L28,32 L26,33 L28,31 L26,29 Z" fill="#FFD54F"/>
    {/* Crescent moon */}
    <path d="M16,32 Q18,27 22,28 Q18,26 17,30 Z" fill="#FFD54F"/>
    {/* Magical glow at base */}
    <ellipse cx="24" cy="37" rx="16" ry="3" fill="#3949AB" opacity="0.8"/>
    <ellipse cx="24" cy="38" rx="12" ry="2" fill="#5C6BC0" opacity="0.6"/>
  </svg>
}

export function Mickey7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* 8-point starburst - alternating long and short points */}
    <polygon points="24,4 26,20 40,8 28,22 44,24 28,26 40,40 26,28 24,44 22,28 8,40 20,26 4,24 20,22 8,8 22,20" fill="#F9A825"/>
    {/* Inner glow center */}
    <circle cx="24" cy="24" r="7" fill="#FDD835"/>
    <circle cx="24" cy="24" r="4" fill="#FFF9C4"/>
    <circle cx="24" cy="24" r="2" fill="#FFD54F"/>
  </svg>
}

export function Mickey8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Balloon body */}
    <ellipse cx="24" cy="20" rx="14" ry="16" fill="#E53935"/>
    {/* Highlight */}
    <ellipse cx="18" cy="13" rx="4" ry="5" fill="#EF9A9A" opacity="0.7"/>
    {/* Shine spot */}
    <ellipse cx="18" cy="13" rx="3" ry="4" fill="white" opacity="0.4"/>
    {/* Knot */}
    <ellipse cx="24" cy="36" rx="3" ry="2" fill="#C62828"/>
    {/* String */}
    <path d="M24,38 Q20,41 22,44 Q24,47 26,44" stroke="#C62828" strokeWidth="1.5" fill="none"/>
  </svg>
}

export function Mickey9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#EDE7F6"/>
    {/* Wand handle */}
    <rect x="28" y="26" width="5" height="18" rx="2.5" fill="#4A148C"/>
    {/* Gold star tip */}
    <polygon points="24,6 25.5,11 31,11 26.5,14 28,19 24,16 20,19 21.5,14 17,11 22.5,11" fill="#FFD54F"/>
    {/* Sparkle trail */}
    <circle cx="20" cy="18" r="1.5" fill="#FFD54F"/>
    <circle cx="16" cy="22" r="1" fill="#CE93D8"/>
    <circle cx="14" cy="28" r="1.5" fill="#FFD54F"/>
    <circle cx="18" cy="32" r="1" fill="#CE93D8"/>
    {/* Glitter dots */}
    <circle cx="10" cy="16" r="1" fill="#FFD54F"/>
    <circle cx="8" cy="24" r="1.2" fill="#CE93D8"/>
    <circle cx="12" cy="34" r="1" fill="#FFD54F"/>
    <circle cx="34" cy="14" r="1" fill="#CE93D8"/>
    <circle cx="38" cy="20" r="1.2" fill="#FFD54F"/>
  </svg>
}

export function Mickey10Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#263238"/>
    {/* Clapper top (open) */}
    <rect x="6" y="8" width="36" height="10" rx="1" fill="#ECEFF1"/>
    {/* Stripes on top */}
    <rect x="11" y="8" width="5" height="10" fill="#212121"/>
    <rect x="21" y="8" width="5" height="10" fill="#212121"/>
    <rect x="31" y="8" width="5" height="10" fill="#212121"/>
    {/* Hinge */}
    <rect x="6" y="8" width="4" height="10" fill="#9E9E9E"/>
    {/* Bottom board */}
    <rect x="6" y="22" width="36" height="22" rx="1" fill="#ECEFF1"/>
    {/* Info lines */}
    <line x1="10" y1="28" x2="38" y2="28" stroke="#9E9E9E" strokeWidth="1"/>
    <line x1="10" y1="32" x2="38" y2="32" stroke="#9E9E9E" strokeWidth="1"/>
    <line x1="10" y1="36" x2="38" y2="36" stroke="#9E9E9E" strokeWidth="1"/>
    <line x1="10" y1="40" x2="28" y2="40" stroke="#9E9E9E" strokeWidth="1"/>
  </svg>
}

export function Mickey11Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* Outer rim */}
    <circle cx="24" cy="24" r="18" fill="none" stroke="#9E9E9E" strokeWidth="2.5"/>
    {/* Center hub */}
    <circle cx="24" cy="24" r="4" fill="#757575"/>
    {/* Spokes */}
    <line x1="24" y1="6" x2="24" y2="20" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="24" y1="28" x2="24" y2="42" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="6" y1="24" x2="20" y2="24" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="28" y1="24" x2="42" y2="24" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="11" y1="11" x2="21" y2="21" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="27" y1="27" x2="37" y2="37" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="37" y1="11" x2="27" y2="21" stroke="#9E9E9E" strokeWidth="1.5"/>
    <line x1="21" y1="27" x2="11" y2="37" stroke="#9E9E9E" strokeWidth="1.5"/>
    {/* Gondolas */}
    <rect x="21" y="4" width="6" height="4" rx="1" fill="#E53935"/>
    <rect x="36" y="13" width="6" height="4" rx="1" fill="#1E88E5"/>
    <rect x="38" y="21" width="6" height="4" rx="1" fill="#FDD835"/>
    <rect x="33" y="35" width="6" height="4" rx="1" fill="#43A047"/>
    <rect x="21" y="40" width="6" height="4" rx="1" fill="#E53935"/>
    <rect x="4" y="35" width="6" height="4" rx="1" fill="#9C27B0"/>
    <rect x="3" y="21" width="6" height="4" rx="1" fill="#FF7043"/>
    <rect x="9" y="11" width="6" height="4" rx="1" fill="#1E88E5"/>
    {/* Support frame */}
    <line x1="15" y1="42" x2="24" y2="42" stroke="#757575" strokeWidth="2"/>
    <line x1="33" y1="42" x2="24" y2="42" stroke="#757575" strokeWidth="2"/>
  </svg>
}

export function Mickey12Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#1A237E"/>
    {/* Central burst */}
    <circle cx="24" cy="22" r="4" fill="#FFF9C4"/>
    {/* Red rays */}
    <line x1="24" y1="18" x2="24" y2="6" stroke="#E53935" strokeWidth="3"/>
    <line x1="24" y1="26" x2="24" y2="38" stroke="#E53935" strokeWidth="3"/>
    <line x1="20" y1="22" x2="8" y2="22" stroke="#E53935" strokeWidth="3"/>
    <line x1="28" y1="22" x2="40" y2="22" stroke="#E53935" strokeWidth="3"/>
    {/* Gold diagonal rays */}
    <line x1="21" y1="19" x2="12" y2="10" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="27" y1="19" x2="36" y2="10" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="21" y1="25" x2="12" y2="34" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="27" y1="25" x2="36" y2="34" stroke="#FFD54F" strokeWidth="2.5"/>
    {/* Blue sparkle dots */}
    <circle cx="10" cy="8" r="2" fill="#90CAF9"/>
    <circle cx="38" cy="8" r="2" fill="#90CAF9"/>
    <circle cx="6" cy="22" r="2" fill="#90CAF9"/>
    <circle cx="42" cy="22" r="2" fill="#90CAF9"/>
    <circle cx="10" cy="36" r="2" fill="#90CAF9"/>
    <circle cx="38" cy="36" r="2" fill="#90CAF9"/>
    {/* Extra sparkle */}
    <circle cx="20" cy="12" r="1.5" fill="#FDD835"/>
    <circle cx="28" cy="12" r="1.5" fill="#FDD835"/>
    <circle cx="20" cy="32" r="1.5" fill="#FDD835"/>
    <circle cx="28" cy="32" r="1.5" fill="#FDD835"/>
  </svg>
}

export function Mickey13Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Bow tie left wing */}
    <polygon points="24,20 8,14 8,34 24,28" fill="#E53935"/>
    {/* Bow tie right wing */}
    <polygon points="24,20 40,14 40,34 24,28" fill="#E53935"/>
    {/* Center knot */}
    <ellipse cx="24" cy="24" rx="4" ry="5" fill="#C62828"/>
    {/* Polka dots - left */}
    <circle cx="13" cy="20" r="2" fill="white"/>
    <circle cx="18" cy="28" r="2" fill="white"/>
    <circle cx="11" cy="28" r="2" fill="white"/>
    <circle cx="18" cy="20" r="2" fill="white"/>
    {/* Polka dots - right */}
    <circle cx="35" cy="20" r="2" fill="white"/>
    <circle cx="30" cy="28" r="2" fill="white"/>
    <circle cx="37" cy="28" r="2" fill="white"/>
    <circle cx="30" cy="20" r="2" fill="white"/>
  </svg>
}

export function Mickey14Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
    {/* Wooden stick */}
    <rect x="22" y="34" width="4" height="12" rx="2" fill="#8D6E63"/>
    {/* Ice cream bar - three circle mouse shape */}
    {/* Ear circles */}
    <circle cx="15" cy="16" r="8" fill="#5D4037"/>
    <circle cx="33" cy="16" r="8" fill="#5D4037"/>
    {/* Head circle */}
    <circle cx="24" cy="26" r="11" fill="#5D4037"/>
    {/* Chocolate coating highlight */}
    <circle cx="15" cy="16" r="7" fill="#4E342E"/>
    <circle cx="33" cy="16" r="7" fill="#4E342E"/>
    <circle cx="24" cy="26" r="10" fill="#4E342E"/>
    {/* Vanilla inside peek - head */}
    <circle cx="24" cy="26" r="8" fill="#FFF3E0"/>
    {/* Bite mark on head */}
    <circle cx="24" cy="26" r="8" fill="#4E342E"/>
    {/* Actually make it look like chocolate-dipped by adding drip */}
    <path d="M16,24 Q14,28 15,32" stroke="#3E2723" strokeWidth="2" fill="none"/>
    {/* Highlight on chocolate */}
    <ellipse cx="20" cy="14" rx="2.5" ry="2" fill="#6D4C41" opacity="0.8"/>
    <ellipse cx="29" cy="14" rx="2.5" ry="2" fill="#6D4C41" opacity="0.8"/>
    <ellipse cx="20" cy="23" rx="3" ry="2" fill="#6D4C41" opacity="0.8"/>
  </svg>
}

export function Mickey15Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* Party hat body */}
    <polygon points="24,4 8,40 40,40" fill="#E91E63"/>
    {/* Diagonal stripes */}
    <polygon points="24,4 20,12 24,20 28,12" fill="#FDD835"/>
    <polygon points="16,22 12,30 20,30" fill="#1E88E5"/>
    <polygon points="32,22 36,30 28,30" fill="#1E88E5"/>
    <polygon points="11,32 8,40 16,40" fill="#FDD835"/>
    <polygon points="37,32 40,40 32,40" fill="#FDD835"/>
    {/* Pom-pom on tip */}
    <circle cx="24" cy="5" r="5" fill="white"/>
    <circle cx="24" cy="5" r="4" fill="#F8BBD0"/>
    {/* Hat brim line */}
    <line x1="8" y1="40" x2="40" y2="40" stroke="#C2185B" strokeWidth="2"/>
    {/* Elastic string */}
    <path d="M8,40 Q6,44 10,45" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
    {/* Confetti dots around */}
    <circle cx="8" cy="16" r="2" fill="#E53935"/>
    <circle cx="38" cy="14" r="2" fill="#1E88E5"/>
    <circle cx="5" cy="30" r="1.5" fill="#FDD835"/>
    <circle cx="42" cy="28" r="1.5" fill="#43A047"/>
    <circle cx="12" cy="8" r="1.5" fill="#9C27B0"/>
    <circle cx="36" cy="8" r="1.5" fill="#FF7043"/>
  </svg>
}

export function Mickey16Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* Vertical poles */}
    <line x1="12" y1="18" x2="12" y2="42" stroke="#9E9E9E" strokeWidth="2"/>
    <line x1="20" y1="16" x2="20" y2="42" stroke="#9E9E9E" strokeWidth="2"/>
    <line x1="28" y1="16" x2="28" y2="42" stroke="#9E9E9E" strokeWidth="2"/>
    <line x1="36" y1="18" x2="36" y2="42" stroke="#9E9E9E" strokeWidth="2"/>
    {/* Scalloped conical roof */}
    <polygon points="24,4 6,20 42,20" fill="#E91E63"/>
    {/* Scallop edges */}
    <path d="M6,20 Q10,16 14,20 Q18,16 22,20 Q26,16 30,20 Q34,16 38,20 Q41,16 42,20" fill="#C2185B"/>
    {/* Roof stripes */}
    <line x1="24" y1="4" x2="10" y2="20" stroke="#F48FB1" strokeWidth="1.5"/>
    <line x1="24" y1="4" x2="17" y2="20" stroke="#F48FB1" strokeWidth="1.5"/>
    <line x1="24" y1="4" x2="24" y2="20" stroke="#F48FB1" strokeWidth="1.5"/>
    <line x1="24" y1="4" x2="31" y2="20" stroke="#F48FB1" strokeWidth="1.5"/>
    <line x1="24" y1="4" x2="38" y2="20" stroke="#F48FB1" strokeWidth="1.5"/>
    {/* Platform / base ring */}
    <rect x="6" y="40" width="36" height="4" rx="2" fill="#F48FB1"/>
    {/* Left horse silhouette */}
    <ellipse cx="15" cy="32" rx="5" ry="4" fill="#CE93D8"/>
    <rect x="12" y="30" width="3" height="10" rx="1" fill="#CE93D8"/>
    <ellipse cx="18" cy="29" rx="3" ry="2" fill="#CE93D8"/>
    {/* Right horse silhouette */}
    <ellipse cx="33" cy="32" rx="5" ry="4" fill="#CE93D8"/>
    <rect x="33" y="30" width="3" height="10" rx="1" fill="#CE93D8"/>
    <ellipse cx="30" cy="29" rx="3" ry="2" fill="#CE93D8"/>
    {/* Festive flags on roof tip */}
    <polygon points="24,4 28,7 24,8" fill="#FDD835"/>
    {/* Flag pennants from roof edge */}
    <polygon points="8,20 13,17 13,20" fill="#FDD835"/>
    <polygon points="22,20 27,17 27,20" fill="#1E88E5"/>
    <polygon points="36,20 41,17 41,20" fill="#E53935"/>
  </svg>
}
