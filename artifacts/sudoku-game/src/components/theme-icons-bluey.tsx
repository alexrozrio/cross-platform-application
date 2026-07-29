import React from 'react'; interface IconProps { size?: number }

export function Bluey1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* Blue heeler face */}
    <ellipse cx="24" cy="25" rx="14" ry="13" fill="#1E88E5"/>
    {/* Ears */}
    <polygon points="12,14 8,4 17,12" fill="#1565C0"/>
    <polygon points="36,14 40,4 31,12" fill="#1565C0"/>
    {/* Tan snout patch */}
    <ellipse cx="24" cy="30" rx="8" ry="5" fill="#FFCC80"/>
    {/* Eyes */}
    <circle cx="19" cy="23" r="3" fill="#4E342E"/>
    <circle cx="29" cy="23" r="3" fill="#4E342E"/>
    <circle cx="20" cy="22" r="1" fill="white"/>
    <circle cx="30" cy="22" r="1" fill="white"/>
    {/* Nose */}
    <ellipse cx="24" cy="28" rx="2" ry="1.5" fill="#212121"/>
    {/* Mouth */}
    <path d="M21 31 Q24 34 27 31" stroke="#212121" strokeWidth="1.2" fill="none"/>
  </svg>
}

export function Bluey2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFE0B2"/>
    {/* Orange-red heeler face */}
    <ellipse cx="24" cy="25" rx="14" ry="13" fill="#EF6C00"/>
    {/* Ears */}
    <polygon points="12,14 8,4 17,12" fill="#BF360C"/>
    <polygon points="36,14 40,4 31,12" fill="#BF360C"/>
    {/* Cream snout patch */}
    <ellipse cx="24" cy="30" rx="8" ry="5" fill="#FFF3E0"/>
    {/* Eyes */}
    <circle cx="19" cy="23" r="3" fill="#4E342E"/>
    <circle cx="29" cy="23" r="3" fill="#4E342E"/>
    <circle cx="20" cy="22" r="1" fill="white"/>
    <circle cx="30" cy="22" r="1" fill="white"/>
    {/* Nose */}
    <ellipse cx="24" cy="28" rx="2" ry="1.5" fill="#212121"/>
    {/* Mouth */}
    <path d="M21 31 Q24 34 27 31" stroke="#212121" strokeWidth="1.2" fill="none"/>
  </svg>
}

export function Bluey3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* Kite diamond shape - 4 quadrants */}
    <polygon points="24,6 38,22 24,38 10,22" fill="#1E88E5"/>
    <polygon points="24,6 38,22 24,22" fill="#FDD835"/>
    <polygon points="10,22 24,22 24,38" fill="#E53935"/>
    {/* String going down */}
    <line x1="24" y1="38" x2="28" y2="44" stroke="#795548" strokeWidth="1.5"/>
    {/* Ribbon tail bows */}
    <ellipse cx="26" cy="40" rx="3" ry="1.5" fill="#E53935" transform="rotate(-20 26 40)"/>
    <ellipse cx="28" cy="43" rx="2.5" ry="1.2" fill="#FDD835" transform="rotate(-20 28 43)"/>
    {/* Kite center cross */}
    <line x1="24" y1="6" x2="24" y2="38" stroke="white" strokeWidth="1"/>
    <line x1="10" y1="22" x2="38" y2="22" stroke="white" strokeWidth="1"/>
  </svg>
}

export function Bluey4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* Green lawn */}
    <rect x="4" y="36" width="40" height="8" fill="#66BB6A"/>
    {/* House walls */}
    <rect x="10" y="22" width="28" height="18" fill="white"/>
    {/* Terracotta roof */}
    <polygon points="7,23 24,8 41,23" fill="#BF360C"/>
    {/* Roof tiles suggestion */}
    <polygon points="7,23 24,8 41,23" fill="none" stroke="#8D1C09" strokeWidth="1"/>
    {/* Door */}
    <rect x="20" y="30" width="8" height="10" fill="#795548"/>
    <circle cx="27" cy="35" r="1" fill="#FFD54F"/>
    {/* Window */}
    <rect x="12" y="26" width="7" height="6" fill="#81D4FA"/>
    <line x1="15.5" y1="26" x2="15.5" y2="32" stroke="white" strokeWidth="1"/>
    <line x1="12" y1="29" x2="19" y2="29" stroke="white" strokeWidth="1"/>
    {/* Tree */}
    <rect x="36" y="30" width="3" height="8" fill="#795548"/>
    <circle cx="37.5" cy="27" r="6" fill="#2E7D32"/>
  </svg>
}

export function Bluey5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
    {/* Left page */}
    <rect x="6" y="12" width="17" height="26" rx="1" fill="#FFFDE7"/>
    <rect x="6" y="12" width="17" height="26" rx="1" stroke="#FFA000" strokeWidth="1.5"/>
    {/* Right page */}
    <rect x="25" y="12" width="17" height="26" rx="1" fill="#FFFDE7"/>
    <rect x="25" y="12" width="17" height="26" rx="1" stroke="#FFA000" strokeWidth="1.5"/>
    {/* Spine */}
    <rect x="21" y="12" width="6" height="26" fill="#F57F17"/>
    {/* Text lines left page */}
    <line x1="9" y1="18" x2="20" y2="18" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="9" y1="22" x2="20" y2="22" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="9" y1="26" x2="20" y2="26" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="9" y1="30" x2="20" y2="30" stroke="#BDBDBD" strokeWidth="1.2"/>
    {/* Text lines right page */}
    <line x1="28" y1="18" x2="39" y2="18" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="28" y1="22" x2="39" y2="22" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="28" y1="26" x2="39" y2="26" stroke="#BDBDBD" strokeWidth="1.2"/>
    <line x1="28" y1="30" x2="39" y2="30" stroke="#BDBDBD" strokeWidth="1.2"/>
  </svg>
}

export function Bluey6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E8EAF6"/>
    {/* Ball base */}
    <circle cx="24" cy="24" r="17" fill="#E53935"/>
    {/* Panel segments */}
    <path d="M24,7 Q35,14 35,24 Q35,34 24,41 Q13,34 13,24 Q13,14 24,7 Z" fill="#1E88E5"/>
    <path d="M7,24 Q14,13 24,13 Q24,13 24,24 Q14,24 7,24 Z" fill="#FDD835"/>
    <path d="M41,24 Q34,35 24,35 Q24,35 24,24 Q34,24 41,24 Z" fill="#43A047"/>
    {/* Seam lines */}
    <path d="M24,7 Q35,14 35,24 Q35,34 24,41" stroke="white" strokeWidth="1.2" fill="none"/>
    <path d="M24,7 Q13,14 13,24 Q13,34 24,41" stroke="white" strokeWidth="1.2" fill="none"/>
    <line x1="7" y1="24" x2="41" y2="24" stroke="white" strokeWidth="1.2"/>
    {/* Highlight */}
    <ellipse cx="18" cy="17" rx="4" ry="3" fill="white" opacity="0.5"/>
  </svg>
}

export function Bluey7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* Sand base */}
    <ellipse cx="24" cy="40" rx="18" ry="4" fill="#F9A825"/>
    {/* Main tower center */}
    <rect x="19" y="18" width="10" height="20" fill="#FFD54F"/>
    {/* Battlements center */}
    <rect x="19" y="14" width="2.5" height="5" fill="#FFD54F"/>
    <rect x="23" y="14" width="2.5" height="5" fill="#FFD54F"/>
    <rect x="27" y="14" width="2.5" height="5" fill="#FFD54F"/>
    {/* Left tower */}
    <rect x="9" y="23" width="8" height="15" fill="#FFC107"/>
    <rect x="9" y="20" width="2" height="4" fill="#FFC107"/>
    <rect x="12" y="20" width="2" height="4" fill="#FFC107"/>
    <rect x="15" y="20" width="2" height="4" fill="#FFC107"/>
    {/* Right tower */}
    <rect x="31" y="23" width="8" height="15" fill="#FFC107"/>
    <rect x="31" y="20" width="2" height="4" fill="#FFC107"/>
    <rect x="34" y="20" width="2" height="4" fill="#FFC107"/>
    <rect x="37" y="20" width="2" height="4" fill="#FFC107"/>
    {/* Moat line */}
    <path d="M8 38 Q24 42 40 38" stroke="#29B6F6" strokeWidth="1.5" fill="none"/>
    {/* Flag */}
    <line x1="24" y1="6" x2="24" y2="15" stroke="#795548" strokeWidth="1.2"/>
    <polygon points="24,6 30,9 24,12" fill="#E53935"/>
  </svg>
}

export function Bluey8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* Wooden frame */}
    <rect x="5" y="28" width="38" height="5" rx="2" fill="#795548"/>
    {/* Legs */}
    <line x1="10" y1="33" x2="8" y2="43" stroke="#795548" strokeWidth="3"/>
    <line x1="38" y1="33" x2="40" y2="43" stroke="#795548" strokeWidth="3"/>
    {/* Xylophone bars - rainbow order */}
    <rect x="7" y="18" width="5" height="12" rx="1" fill="#E53935"/>
    <rect x="13" y="20" width="5" height="10" rx="1" fill="#FF7043"/>
    <rect x="19" y="22" width="5" height="8" rx="1" fill="#FDD835"/>
    <rect x="25" y="22" width="5" height="8" rx="1" fill="#66BB6A"/>
    <rect x="31" y="24" width="5" height="6" rx="1" fill="#1E88E5"/>
    <rect x="37" y="26" width="4" height="4" rx="1" fill="#7B1FA2"/>
    {/* Mallets */}
    <line x1="14" y1="8" x2="18" y2="22" stroke="#795548" strokeWidth="2"/>
    <circle cx="13" cy="7" r="3" fill="#FFCC80"/>
    <line x1="32" y1="8" x2="28" y2="22" stroke="#795548" strokeWidth="2"/>
    <circle cx="33" cy="7" r="3" fill="#FFCC80"/>
  </svg>
}

export function Bluey9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* Bandaid body */}
    <rect x="8" y="16" width="32" height="16" rx="8" fill="#FFCC80"/>
    {/* Left tab */}
    <ellipse cx="12" cy="24" rx="5" ry="8" fill="#FFCC80"/>
    {/* Right tab */}
    <ellipse cx="36" cy="24" rx="5" ry="8" fill="#FFCC80"/>
    {/* Gauze center pad */}
    <rect x="17" y="19" width="14" height="10" rx="1" fill="#FFFDE7"/>
    <rect x="17" y="19" width="14" height="10" rx="1" stroke="#F0D080" strokeWidth="1"/>
    {/* Gauze dots */}
    <circle cx="21" cy="22" r="1" fill="#F0D080"/>
    <circle cx="24" cy="22" r="1" fill="#F0D080"/>
    <circle cx="27" cy="22" r="1" fill="#F0D080"/>
    <circle cx="21" cy="26" r="1" fill="#F0D080"/>
    <circle cx="24" cy="26" r="1" fill="#F0D080"/>
    <circle cx="27" cy="26" r="1" fill="#F0D080"/>
    {/* Hole strips on tabs */}
    <circle cx="12" cy="22" r="1.5" fill="#FFB74D"/>
    <circle cx="12" cy="26" r="1.5" fill="#FFB74D"/>
    <circle cx="36" cy="22" r="1.5" fill="#FFB74D"/>
    <circle cx="36" cy="26" r="1.5" fill="#FFB74D"/>
  </svg>
}

export function Bluey10Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* Car body */}
    <rect x="6" y="26" width="36" height="12" rx="4" fill="#E53935"/>
    {/* Car cabin */}
    <rect x="12" y="18" width="20" height="10" rx="3" fill="#EF9A9A"/>
    {/* Windows */}
    <rect x="14" y="20" width="7" height="6" rx="2" fill="#81D4FA"/>
    <rect x="23" y="20" width="7" height="6" rx="2" fill="#81D4FA"/>
    {/* Wheels */}
    <circle cx="14" cy="38" r="5" fill="#212121"/>
    <circle cx="14" cy="38" r="2.5" fill="#757575"/>
    <circle cx="34" cy="38" r="5" fill="#212121"/>
    <circle cx="34" cy="38" r="2.5" fill="#757575"/>
    {/* Headlights */}
    <circle cx="41" cy="29" r="2.5" fill="#FFF176"/>
    <circle cx="41" cy="34" r="2.5" fill="#FFCC02"/>
    {/* Bumper */}
    <rect x="38" y="27" width="4" height="12" rx="2" fill="#BDBDBD"/>
  </svg>
}

export function Bluey11Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E3F2FD"/>
    {/* Balloon body */}
    <ellipse cx="24" cy="20" rx="14" ry="16" fill="#1E88E5"/>
    {/* Highlight */}
    <ellipse cx="18" cy="13" rx="4" ry="5" fill="#90CAF9" opacity="0.7"/>
    {/* Knot */}
    <ellipse cx="24" cy="36" rx="3" ry="2" fill="#1565C0"/>
    {/* String */}
    <path d="M24,38 Q20,41 22,44 Q24,47 26,44" stroke="#1565C0" strokeWidth="1.5" fill="none"/>
    {/* Shine spot */}
    <ellipse cx="19" cy="14" rx="3" ry="4" fill="white" opacity="0.4"/>
  </svg>
}

export function Bluey12Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#C8E6C9"/>
    {/* Grass mound */}
    <ellipse cx="24" cy="42" rx="14" ry="4" fill="#66BB6A"/>
    {/* Trunk */}
    <rect x="21" y="30" width="6" height="14" fill="#795548"/>
    {/* Round tree top */}
    <circle cx="24" cy="22" r="14" fill="#2E7D32"/>
    {/* Lighter inner blob */}
    <circle cx="20" cy="18" r="7" fill="#388E3C"/>
    <circle cx="28" cy="20" r="6" fill="#43A047"/>
  </svg>
}

export function Bluey13Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* Sand at base */}
    <ellipse cx="24" cy="43" rx="20" ry="4" fill="#F9A825"/>
    {/* Bucket body */}
    <path d="M13,20 L15,40 L29,40 L31,20 Z" fill="#FDD835"/>
    {/* Red stripe on bucket */}
    <path d="M13,27 L14.5,33 L29.5,33 L31,27 Z" fill="#E53935"/>
    {/* Bucket rim */}
    <rect x="12" y="18" width="20" height="3" rx="1" fill="#F9A825"/>
    {/* Handle */}
    <path d="M16,18 Q22,10 28,18" stroke="#F9A825" strokeWidth="2" fill="none"/>
    {/* Shovel beside bucket */}
    <line x1="35" y1="10" x2="35" y2="40" stroke="#795548" strokeWidth="2.5"/>
    <ellipse cx="35" cy="37" rx="4" ry="5" fill="#FFCC80"/>
    <rect x="32" y="37" width="6" height="5" rx="1" fill="#FFCC80"/>
    <rect x="33" y="8" width="4" height="4" rx="1" fill="#8D6E63"/>
  </svg>
}

export function Bluey14Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFE0B2"/>
    {/* Basketball */}
    <circle cx="24" cy="24" r="17" fill="#EF6C00"/>
    {/* Seam lines */}
    <path d="M7,24 Q14,14 24,14 Q34,14 41,24" stroke="#212121" strokeWidth="2" fill="none"/>
    <path d="M7,24 Q14,34 24,34 Q34,34 41,24" stroke="#212121" strokeWidth="2" fill="none"/>
    <line x1="24" y1="7" x2="24" y2="41" stroke="#212121" strokeWidth="2"/>
    {/* Highlight */}
    <ellipse cx="16" cy="15" rx="4" ry="3" fill="white" opacity="0.3"/>
  </svg>
}

export function Bluey15Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#EDE7F6"/>
    {/* Frisbee disc */}
    <ellipse cx="24" cy="26" rx="18" ry="8" fill="#7B1FA2"/>
    {/* Concentric rings */}
    <ellipse cx="24" cy="26" rx="14" ry="6" fill="none" stroke="#E53935" strokeWidth="2"/>
    <ellipse cx="24" cy="26" rx="10" ry="4" fill="none" stroke="#FDD835" strokeWidth="2"/>
    <ellipse cx="24" cy="26" rx="6" ry="2.5" fill="none" stroke="#1E88E5" strokeWidth="1.5"/>
    {/* Center dome */}
    <ellipse cx="24" cy="25" rx="4" ry="2" fill="#CE93D8"/>
    {/* Motion blur lines */}
    <line x1="6" y1="22" x2="2" y2="20" stroke="#9C27B0" strokeWidth="2" opacity="0.6"/>
    <line x1="6" y1="26" x2="2" y2="26" stroke="#9C27B0" strokeWidth="2" opacity="0.6"/>
    <line x1="42" y1="22" x2="46" y2="20" stroke="#9C27B0" strokeWidth="2" opacity="0.6"/>
    <line x1="42" y1="26" x2="46" y2="26" stroke="#9C27B0" strokeWidth="2" opacity="0.6"/>
  </svg>
}

export function Bluey16Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E8F5E9"/>
    {/* Trampoline legs */}
    <line x1="9" y1="30" x2="6" y2="44" stroke="#9E9E9E" strokeWidth="3"/>
    <line x1="13" y1="30" x2="11" y2="44" stroke="#9E9E9E" strokeWidth="3"/>
    <line x1="35" y1="30" x2="37" y2="44" stroke="#9E9E9E" strokeWidth="3"/>
    <line x1="39" y1="30" x2="41" y2="44" stroke="#9E9E9E" strokeWidth="3"/>
    {/* Frame bars */}
    <rect x="8" y="28" width="32" height="4" rx="2" fill="#757575"/>
    {/* Jumping mat */}
    <ellipse cx="24" cy="30" rx="15" ry="5" fill="#1E88E5"/>
    {/* Spring coils top edge */}
    <path d="M9,28 L11,24 L13,28 L15,24 L17,28 L19,24 L21,28 L23,24 L25,28 L27,24 L29,28 L31,24 L33,28 L35,24 L37,28 L39,24" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
    {/* Mat surface details */}
    <line x1="10" y1="30" x2="38" y2="30" stroke="#1565C0" strokeWidth="1" opacity="0.5"/>
  </svg>
}
