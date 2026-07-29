import React from 'react'; interface IconProps { size?: number }

export function Paw1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* Four toe pads */}
    <ellipse cx="15" cy="15" rx="4" ry="5" fill="#1A237E"/>
    <ellipse cx="22" cy="12" rx="4" ry="5" fill="#1A237E"/>
    <ellipse cx="29" cy="12" rx="4" ry="5" fill="#1A237E"/>
    <ellipse cx="36" cy="15" rx="4" ry="5" fill="#1A237E"/>
    {/* Main pad */}
    <ellipse cx="25" cy="29" rx="11" ry="10" fill="#1A237E"/>
    {/* Inner pad highlight */}
    <ellipse cx="25" cy="29" rx="7" ry="6.5" fill="#283593"/>
  </svg>
}

export function Paw2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
    {/* Star badge - 6 points */}
    <polygon points="24,6 27.5,16 38,16 29.5,22 32.5,32 24,26 15.5,32 18.5,22 10,16 20.5,16" fill="#FFC107"/>
    {/* Inner star outline */}
    <polygon points="24,9 27,17 37,17 29.5,22.5 32,31 24,25.5 16,31 18.5,22.5 11,17 21,17" fill="none" stroke="#FF8F00" strokeWidth="0.8"/>
    {/* Blue center circle */}
    <circle cx="24" cy="22" r="6" fill="#1565C0"/>
    {/* Star in center */}
    <polygon points="24,17 25.2,20.3 28.8,20.3 26,22.4 27,25.7 24,23.5 21,25.7 22,22.4 19.2,20.3 22.8,20.3" fill="#FFEB3B"/>
  </svg>
}

export function Paw3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Helmet shell */}
    <ellipse cx="24" cy="22" rx="17" ry="16" fill="#E53935"/>
    {/* Brim / visor bar */}
    <rect x="10" y="30" width="28" height="4" rx="2" fill="#B71C1C"/>
    {/* Front shield / badge */}
    <rect x="19" y="20" width="10" height="8" rx="1" fill="#FFEB3B"/>
    <polygon points="24,21 25.2,23.5 24,25.5 22.8,23.5" fill="#E53935"/>
    {/* Visor slit */}
    <rect x="12" y="27" width="24" height="3" rx="1.5" fill="#7B1FA2" opacity="0.4"/>
    {/* Chin strap */}
    <path d="M11 34 Q11 40 17 41 Q24 42 31 41 Q37 40 37 34" stroke="#B71C1C" strokeWidth="2" fill="none"/>
    {/* Helmet ridge */}
    <rect x="22" y="8" width="4" height="14" rx="2" fill="#C62828"/>
  </svg>
}

export function Paw4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* Main rotor blade */}
    <rect x="8" y="10" width="32" height="5" rx="2.5" fill="#5C6BC0"/>
    <circle cx="24" cy="12" r="3" fill="#3949AB"/>
    {/* Rotor mast */}
    <rect x="22" y="12" width="4" height="5" fill="#3949AB"/>
    {/* Cabin - teardrop */}
    <ellipse cx="22" cy="26" rx="12" ry="9" fill="#42A5F5"/>
    {/* Window */}
    <ellipse cx="20" cy="24" rx="5" ry="4" fill="#B3E5FC"/>
    {/* Tail boom */}
    <rect x="30" y="24" width="12" height="4" rx="2" fill="#1E88E5"/>
    {/* Tail rotor */}
    <ellipse cx="41" cy="22" rx="2" ry="5" fill="#5C6BC0"/>
    {/* Skids */}
    <rect x="12" y="34" width="18" height="3" rx="1.5" fill="#1565C0"/>
    <rect x="13" y="31" width="3" height="4" rx="1" fill="#1E88E5"/>
    <rect x="24" y="31" width="3" height="4" rx="1" fill="#1E88E5"/>
  </svg>
}

export function Paw5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E8EAF6"/>
    {/* Left barrel */}
    <rect x="7" y="18" width="14" height="18" rx="7" fill="#5C6BC0"/>
    {/* Right barrel */}
    <rect x="27" y="18" width="14" height="18" rx="7" fill="#5C6BC0"/>
    {/* Bridge between barrels */}
    <rect x="18" y="23" width="12" height="6" rx="3" fill="#3949AB"/>
    {/* Left lens */}
    <circle cx="14" cy="27" r="5" fill="#1A237E"/>
    <circle cx="14" cy="27" r="3.5" fill="#42A5F5"/>
    <circle cx="12.5" cy="25.5" r="1.2" fill="#90CAF9"/>
    {/* Right lens */}
    <circle cx="34" cy="27" r="5" fill="#1A237E"/>
    <circle cx="34" cy="27" r="3.5" fill="#42A5F5"/>
    <circle cx="32.5" cy="25.5" r="1.2" fill="#90CAF9"/>
    {/* Neck strap */}
    <path d="M10 18 Q10 12 24 12 Q38 12 38 18" stroke="#7986CB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
}

export function Paw6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* SUV body */}
    <rect x="5" y="25" width="38" height="14" rx="3" fill="#1565C0"/>
    {/* Cabin top */}
    <rect x="11" y="17" width="26" height="10" rx="3" fill="#1976D2"/>
    {/* Windows */}
    <rect x="13" y="18.5" width="10" height="7" rx="1.5" fill="#B3E5FC"/>
    <rect x="25" y="18.5" width="10" height="7" rx="1.5" fill="#B3E5FC"/>
    {/* Light bar on roof */}
    <rect x="14" y="15" width="20" height="3" rx="1.5" fill="#EF5350"/>
    <rect x="16" y="15.5" width="4" height="2" rx="1" fill="#FFEB3B"/>
    <rect x="22" y="15.5" width="4" height="2" rx="1" fill="#2196F3"/>
    <rect x="28" y="15.5" width="4" height="2" rx="1" fill="#FFEB3B"/>
    {/* Wheels */}
    <circle cx="13" cy="39" r="5" fill="#212121"/>
    <circle cx="13" cy="39" r="2.5" fill="#607D8B"/>
    <circle cx="35" cy="39" r="5" fill="#212121"/>
    <circle cx="35" cy="39" r="2.5" fill="#607D8B"/>
    {/* Paw print on door */}
    <ellipse cx="22" cy="31" rx="3" ry="2.5" fill="#BBDEFB"/>
    <circle cx="19" cy="28.5" r="1.2" fill="#BBDEFB"/>
    <circle cx="22" cy="27.5" r="1.2" fill="#BBDEFB"/>
    <circle cx="25" cy="28.5" r="1.2" fill="#BBDEFB"/>
  </svg>
}

export function Paw7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
    {/* Bone body horizontal bar */}
    <rect x="12" y="21" width="24" height="6" rx="3" fill="#D7CCC8"/>
    {/* Left top knob */}
    <circle cx="12" cy="19" r="5" fill="#BCAAA4"/>
    {/* Left bottom knob */}
    <circle cx="12" cy="29" r="5" fill="#BCAAA4"/>
    {/* Right top knob */}
    <circle cx="36" cy="19" r="5" fill="#BCAAA4"/>
    {/* Right bottom knob */}
    <circle cx="36" cy="29" r="5" fill="#BCAAA4"/>
    {/* Overlap cover for cleaner look */}
    <rect x="12" y="21" width="24" height="6" fill="#D7CCC8"/>
    {/* Highlight */}
    <rect x="16" y="22" width="16" height="2" rx="1" fill="#EFEBE9"/>
  </svg>
}

export function Paw8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Box body */}
    <rect x="10" y="20" width="28" height="22" rx="3" fill="#E53935"/>
    {/* Handle on top */}
    <rect x="18" y="15" width="12" height="7" rx="3.5" fill="none" stroke="#B71C1C" strokeWidth="3"/>
    {/* White cross */}
    <rect x="20" y="25" width="8" height="3" rx="1.5" fill="#fff"/>
    <rect x="22.5" y="22.5" width="3" height="8" rx="1.5" fill="#fff"/>
    {/* Latch */}
    <rect x="28" y="31" width="5" height="4" rx="1" fill="#B71C1C"/>
    <circle cx="30.5" cy="33" r="1" fill="#FFCDD2"/>
    {/* Bottom edge */}
    <rect x="10" y="39" width="28" height="3" rx="1.5" fill="#C62828"/>
  </svg>
}

export function Paw9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#ECEFF1"/>
    {/* Main body */}
    <rect x="14" y="14" width="20" height="28" rx="4" fill="#90A4AE"/>
    {/* Antenna */}
    <rect x="21" y="6" width="6" height="10" rx="3" fill="#607D8B"/>
    <circle cx="24" cy="6" r="2" fill="#F44336"/>
    {/* Display screen */}
    <rect x="16" y="16" width="16" height="8" rx="2" fill="#455A64"/>
    <rect x="17" y="17" width="14" height="6" rx="1" fill="#80CBC4"/>
    {/* Speaker grill lines */}
    <line x1="16" y1="27" x2="32" y2="27" stroke="#607D8B" strokeWidth="1"/>
    <line x1="16" y1="29" x2="32" y2="29" stroke="#607D8B" strokeWidth="1"/>
    <line x1="16" y1="31" x2="32" y2="31" stroke="#607D8B" strokeWidth="1"/>
    {/* Buttons */}
    <circle cx="19" cy="35" r="2.5" fill="#F44336"/>
    <circle cx="29" cy="35" r="2.5" fill="#4CAF50"/>
    <rect x="20" y="38" width="8" height="3" rx="1.5" fill="#546E7A"/>
  </svg>
}

export function Paw10Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* Ring base - white */}
    <circle cx="24" cy="25" r="14" fill="#fff"/>
    {/* Orange sections */}
    <path d="M24 11 A14 14 0 0 1 38 25 L24 25 Z" fill="#FF6F00"/>
    <path d="M38 25 A14 14 0 0 1 24 39 L24 25 Z" fill="#fff"/>
    <path d="M24 39 A14 14 0 0 1 10 25 L24 25 Z" fill="#FF6F00"/>
    <path d="M10 25 A14 14 0 0 1 24 11 L24 25 Z" fill="#fff"/>
    {/* Inner white circle (hole) */}
    <circle cx="24" cy="25" r="7" fill="#E0F7FA"/>
    {/* Ring outline */}
    <circle cx="24" cy="25" r="14" fill="none" stroke="#E65100" strokeWidth="1.5"/>
    <circle cx="24" cy="25" r="7" fill="none" stroke="#E65100" strokeWidth="1.5"/>
    {/* Rope at top */}
    <path d="M24 11 Q22 7 20 9 Q22 5 24 7 Q26 5 28 9 Q26 7 24 11" fill="#FFCC02"/>
  </svg>
}

export function Paw11Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* Rope coil */}
    <ellipse cx="24" cy="36" rx="10" ry="5" fill="none" stroke="#8D6E63" strokeWidth="2.5"/>
    <ellipse cx="24" cy="34" rx="8" ry="4" fill="none" stroke="#8D6E63" strokeWidth="2"/>
    <ellipse cx="24" cy="32" rx="6" ry="3" fill="none" stroke="#8D6E63" strokeWidth="2"/>
    {/* Rope going up */}
    <line x1="18" y1="32" x2="18" y2="18" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Hook - J shape */}
    <path d="M18 18 Q18 10 24 10 Q30 10 30 16 Q30 20 24 20" stroke="#607D8B" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Hook tip */}
    <path d="M24 20 Q22 22 23 24" stroke="#607D8B" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Hook point */}
    <circle cx="23" cy="24" r="2" fill="#455A64"/>
  </svg>
}

export function Paw12Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* Megaphone cone body */}
    <polygon points="10,18 10,30 36,38 36,10" fill="#FF6F00"/>
    {/* Front opening ring */}
    <ellipse cx="36" cy="24" rx="4" ry="14" fill="#E65100"/>
    {/* Handle / back piece */}
    <rect x="6" y="21" width="7" height="6" rx="3" fill="#E65100"/>
    {/* Sound wave arcs */}
    <path d="M38 18 Q43 21 43 24 Q43 27 38 30" stroke="#FFB74D" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M40 15 Q47 19 47 24 Q47 29 40 33" stroke="#FFB74D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Highlight on cone */}
    <polygon points="10,18 36,10 36,14 10,22" fill="#FFA726" opacity="0.5"/>
  </svg>
}

export function Paw13Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* Shield shape */}
    <path d="M24 6 L40 13 L40 28 Q40 38 24 44 Q8 38 8 28 L8 13 Z" fill="#1565C0"/>
    {/* Shield inner */}
    <path d="M24 10 L36 16 L36 28 Q36 36 24 41 Q12 36 12 28 L12 16 Z" fill="#1976D2"/>
    {/* Star at top */}
    <polygon points="24,11 25,14 28,14 25.5,15.8 26.5,18.8 24,17 21.5,18.8 22.5,15.8 20,14 23,14" fill="#FFEB3B"/>
    {/* Paw print inside shield */}
    <ellipse cx="24" cy="31" rx="6" ry="5.5" fill="#BBDEFB"/>
    <circle cx="18.5" cy="24.5" r="2.2" fill="#BBDEFB"/>
    <circle cx="24" cy="23" r="2.2" fill="#BBDEFB"/>
    <circle cx="29.5" cy="24.5" r="2.2" fill="#BBDEFB"/>
  </svg>
}

export function Paw14Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* Tower support legs */}
    <line x1="14" y1="44" x2="20" y2="30" stroke="#5C6BC0" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="34" y1="44" x2="28" y2="30" stroke="#5C6BC0" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="16" y1="44" x2="20" y2="30" stroke="#7986CB" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="32" y1="44" x2="28" y2="30" stroke="#7986CB" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Cross bracing */}
    <line x1="15" y1="38" x2="33" y2="38" stroke="#7986CB" strokeWidth="1.5"/>
    {/* Tower cylinder */}
    <rect x="17" y="12" width="14" height="20" rx="7" fill="#42A5F5"/>
    {/* Platform railing */}
    <ellipse cx="24" cy="12" rx="10" ry="3" fill="#1E88E5"/>
    <rect x="14" y="9" width="20" height="4" rx="2" fill="#1565C0"/>
    {/* Railing posts */}
    <line x1="15" y1="9" x2="15" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    <line x1="20" y1="9" x2="20" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    <line x1="24" y1="9" x2="24" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    <line x1="28" y1="9" x2="28" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    <line x1="33" y1="9" x2="33" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    <line x1="15" y1="5" x2="33" y2="5" stroke="#1565C0" strokeWidth="1.5"/>
    {/* Windows */}
    <rect x="20" y="16" width="8" height="5" rx="2" fill="#B3E5FC"/>
    <rect x="20" y="24" width="8" height="4" rx="2" fill="#B3E5FC"/>
  </svg>
}

export function Paw15Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* Water wave */}
    <path d="M5 38 Q10 34 15 38 Q20 42 25 38 Q30 34 35 38 Q40 42 45 38" stroke="#29B6F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Boat hull */}
    <path d="M8 32 Q8 38 24 38 Q40 38 40 32 L36 28 L12 28 Z" fill="#FF6F00"/>
    {/* Boat rim */}
    <rect x="10" y="26" width="28" height="4" rx="2" fill="#E65100"/>
    {/* Life rings on side */}
    <circle cx="15" cy="30" r="3.5" fill="#fff"/>
    <circle cx="15" cy="30" r="2" fill="#E0F7FA"/>
    <path d="M11.5 30 A3.5 3.5 0 0 1 15 26.5" stroke="#FF6F00" strokeWidth="1.5" fill="none"/>
    <path d="M15 33.5 A3.5 3.5 0 0 1 18.5 30" stroke="#FF6F00" strokeWidth="1.5" fill="none"/>
    <circle cx="33" cy="30" r="3.5" fill="#fff"/>
    <circle cx="33" cy="30" r="2" fill="#E0F7FA"/>
    <path d="M29.5 30 A3.5 3.5 0 0 1 33 26.5" stroke="#FF6F00" strokeWidth="1.5" fill="none"/>
    <path d="M33 33.5 A3.5 3.5 0 0 1 36.5 30" stroke="#FF6F00" strokeWidth="1.5" fill="none"/>
    {/* Motor at back */}
    <rect x="33" y="22" width="8" height="7" rx="2" fill="#546E7A"/>
    <rect x="36" y="28" width="2" height="5" rx="1" fill="#37474F"/>
  </svg>
}

export function Paw16Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* Light beam triangle */}
    <polygon points="30,20 30,32 46,38 46,14" fill="#FFEE58" opacity="0.8"/>
    <polygon points="30,22 30,30 44,36 44,16" fill="#FFF176" opacity="0.6"/>
    {/* Flashlight body cylinder */}
    <rect x="8" y="20" width="24" height="8" rx="4" fill="#F9A825"/>
    {/* Grip rings */}
    <line x1="13" y1="20" x2="13" y2="28" stroke="#F57F17" strokeWidth="1.5"/>
    <line x1="17" y1="20" x2="17" y2="28" stroke="#F57F17" strokeWidth="1.5"/>
    <line x1="21" y1="20" x2="21" y2="28" stroke="#F57F17" strokeWidth="1.5"/>
    {/* Head/lens end */}
    <ellipse cx="30" cy="24" rx="4" ry="5.5" fill="#F57F17"/>
    <ellipse cx="30" cy="24" rx="2.5" ry="4" fill="#FFEE58"/>
    {/* Button on top */}
    <circle cx="20" cy="20" r="2" fill="#E65100"/>
    {/* Tail end */}
    <ellipse cx="8" cy="24" rx="2" ry="4" fill="#E65100"/>
  </svg>
}
