import React from 'react'; interface IconProps { size?: number }

export function Bheem1Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF9C4"/>
    {/* warm-brown face */}
    <circle cx="24" cy="26" r="14" fill="#8D5524"/>
    {/* black hair */}
    <ellipse cx="24" cy="13" rx="11" ry="7" fill="#1A1A1A"/>
    {/* hair base covering forehead */}
    <rect x="13" y="15" width="22" height="6" fill="#1A1A1A"/>
    {/* yellow headband */}
    <rect x="13" y="20" width="22" height="4" rx="2" fill="#FFD600"/>
    {/* face cover over hair bottom */}
    <ellipse cx="24" cy="28" rx="12" ry="11" fill="#8D5524"/>
    {/* whites of eyes */}
    <ellipse cx="19" cy="26" rx="3.5" ry="3.5" fill="#FFFFFF"/>
    <ellipse cx="29" cy="26" rx="3.5" ry="3.5" fill="#FFFFFF"/>
    {/* pupils */}
    <circle cx="19" cy="26" r="2" fill="#1A1A1A"/>
    <circle cx="29" cy="26" r="2" fill="#1A1A1A"/>
    {/* smile */}
    <path d="M17 33 Q24 40 31 33" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* teeth */}
    <path d="M18 34 Q24 39 30 34" fill="#FFFFFF"/>
  </svg>
}

export function Bheem2Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* laddoo body */}
    <circle cx="24" cy="26" r="15" fill="#FFC107"/>
    {/* shading highlight */}
    <circle cx="20" cy="21" r="5" fill="#FFD740" opacity="0.6"/>
    {/* pearl dots */}
    <circle cx="24" cy="14" r="1.8" fill="#FFFDE7"/>
    <circle cx="31" cy="17" r="1.8" fill="#FFFDE7"/>
    <circle cx="34" cy="24" r="1.8" fill="#FFFDE7"/>
    <circle cx="31" cy="31" r="1.8" fill="#FFFDE7"/>
    <circle cx="24" cy="34" r="1.8" fill="#FFFDE7"/>
    <circle cx="17" cy="31" r="1.8" fill="#FFFDE7"/>
    <circle cx="14" cy="24" r="1.8" fill="#FFFDE7"/>
    <circle cx="17" cy="17" r="1.8" fill="#FFFDE7"/>
    {/* green leaf */}
    <ellipse cx="35" cy="20" rx="5" ry="2.5" fill="#4CAF50" transform="rotate(-30 35 20)"/>
    <line x1="30" y1="22" x2="38" y2="18" stroke="#388E3C" strokeWidth="1"/>
    {/* aroma swirls */}
    <path d="M26 9 Q29 6 26 3" stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M30 8 Q33 5 30 2" stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Bheem3Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#ECEFF1"/>
    {/* handle */}
    <rect x="21" y="24" width="6" height="18" rx="3" fill="#8D6E63"/>
    {/* gold bands on handle */}
    <rect x="21" y="27" width="6" height="2.5" rx="1" fill="#FFD600"/>
    <rect x="21" y="33" width="6" height="2.5" rx="1" fill="#FFD600"/>
    {/* mace ball */}
    <circle cx="24" cy="18" r="10" fill="#546E7A"/>
    {/* spikes */}
    <polygon points="24,5 26,11 22,11" fill="#37474F"/>
    <polygon points="34,9 30,13 29,9" fill="#37474F"/>
    <polygon points="38,19 32,20 33,16" fill="#37474F"/>
    <polygon points="34,29 30,25 33,22" fill="#37474F"/>
    <polygon points="14,9 18,13 19,9" fill="#37474F"/>
    <polygon points="10,19 16,20 15,16" fill="#37474F"/>
    <polygon points="14,29 18,25 15,22" fill="#37474F"/>
    {/* center highlight */}
    <circle cx="21" cy="15" r="3" fill="#78909C" opacity="0.7"/>
  </svg>
}

export function Bheem4Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#ECEFF1"/>
    {/* body */}
    <ellipse cx="24" cy="30" rx="11" ry="9" fill="#9E9E9E"/>
    {/* head */}
    <circle cx="24" cy="20" r="10" fill="#BDBDBD"/>
    {/* left ear */}
    <ellipse cx="11" cy="20" rx="5" ry="8" fill="#BDBDBD"/>
    <ellipse cx="11" cy="20" rx="3" ry="5.5" fill="#EF9A9A"/>
    {/* right ear */}
    <ellipse cx="37" cy="20" rx="5" ry="8" fill="#BDBDBD"/>
    <ellipse cx="37" cy="20" rx="3" ry="5.5" fill="#EF9A9A"/>
    {/* trunk */}
    <path d="M20 27 Q16 32 19 38 Q21 41 23 38" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" fill="none"/>
    {/* eyes */}
    <circle cx="20" cy="18" r="2.5" fill="#1A1A1A"/>
    <circle cx="28" cy="18" r="2.5" fill="#1A1A1A"/>
    <circle cx="21" cy="17" r="0.8" fill="#FFFFFF"/>
    <circle cx="29" cy="17" r="0.8" fill="#FFFFFF"/>
    {/* small tusks */}
    <ellipse cx="19" cy="27" rx="2" ry="1" fill="#FFF9C4" transform="rotate(-20 19 27)"/>
    <ellipse cx="29" cy="27" rx="2" ry="1" fill="#FFF9C4" transform="rotate(20 29 27)"/>
  </svg>
}

export function Bheem5Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF8E1"/>
    {/* crown base band */}
    <rect x="9" y="30" width="30" height="8" rx="3" fill="#FFD600"/>
    {/* crown arch body */}
    <path d="M9 30 L9 22 Q14 14 19 20 L24 12 L29 20 Q34 14 39 22 L39 30 Z" fill="#FFC107"/>
    {/* gems on points */}
    <circle cx="24" cy="13" r="3" fill="#F44336"/>
    <circle cx="15" cy="20" r="2.5" fill="#4CAF50"/>
    <circle cx="33" cy="20" r="2.5" fill="#2196F3"/>
    <ellipse cx="11" cy="26" rx="2" ry="2" fill="#9C27B0"/>
    <ellipse cx="37" cy="26" rx="2" ry="2" fill="#FF5722"/>
    {/* decorative lines on band */}
    <line x1="14" y1="30" x2="14" y2="38" stroke="#FFB300" strokeWidth="1"/>
    <line x1="20" y1="30" x2="20" y2="38" stroke="#FFB300" strokeWidth="1"/>
    <line x1="28" y1="30" x2="28" y2="38" stroke="#FFB300" strokeWidth="1"/>
    <line x1="34" y1="30" x2="34" y2="38" stroke="#FFB300" strokeWidth="1"/>
  </svg>
}

export function Bheem6Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFE0B2"/>
    {/* tiger face */}
    <circle cx="24" cy="26" r="14" fill="#FF7043"/>
    {/* white muzzle */}
    <ellipse cx="24" cy="32" rx="8" ry="6" fill="#FFFFFF"/>
    {/* forehead stripes */}
    <path d="M22 13 L21 19" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 12 L24 18" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 13 L27 19" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
    {/* cheek stripes */}
    <path d="M12 24 L18 26" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 28 L18 28" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36 24 L30 26" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36 28 L30 28" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
    {/* eyes */}
    <ellipse cx="19" cy="22" rx="3.5" ry="3" fill="#4CAF50"/>
    <ellipse cx="29" cy="22" rx="3.5" ry="3" fill="#4CAF50"/>
    <ellipse cx="19" cy="22" rx="1.5" ry="2.5" fill="#1A1A1A"/>
    <ellipse cx="29" cy="22" rx="1.5" ry="2.5" fill="#1A1A1A"/>
    {/* nose */}
    <ellipse cx="24" cy="29" rx="2.5" ry="1.5" fill="#E91E63"/>
    {/* mouth */}
    <path d="M22 31 Q24 34 26 31" stroke="#1A1A1A" strokeWidth="1.5" fill="none"/>
  </svg>
}

export function Bheem7Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* drum body (barrel shape) */}
    <ellipse cx="24" cy="24" rx="14" ry="10" fill="#8D6E63"/>
    {/* wider middle bulge via path */}
    <path d="M10 20 Q7 24 10 28 L38 28 Q41 24 38 20 Z" fill="#A1887F"/>
    {/* left drum head */}
    <ellipse cx="11" cy="24" rx="4" ry="10" fill="#D7CCC8"/>
    <ellipse cx="11" cy="24" rx="2.5" ry="8" fill="#BCAAA4"/>
    {/* right drum head */}
    <ellipse cx="37" cy="24" rx="4" ry="10" fill="#D7CCC8"/>
    <ellipse cx="37" cy="24" rx="2.5" ry="8" fill="#BCAAA4"/>
    {/* red decorative band */}
    <rect x="10" y="21" width="28" height="6" rx="2" fill="#F44336" opacity="0.85"/>
    {/* rope lacing pattern */}
    <path d="M14 14 L18 21" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M24 12 L24 20" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M34 14 L30 21" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M14 34 L18 27" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M24 36 L24 28" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M34 34 L30 27" stroke="#FFD600" strokeWidth="1.5"/>
  </svg>
}

export function Bheem8Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FCE4EC"/>
    {/* lily pad */}
    <ellipse cx="24" cy="38" rx="14" ry="5" fill="#4CAF50"/>
    <path d="M24 33 L24 38" stroke="#2E7D32" strokeWidth="1.5"/>
    {/* petals */}
    <ellipse cx="24" cy="18" rx="4" ry="8" fill="#F48FB1"/>
    <ellipse cx="30" cy="20" rx="4" ry="8" fill="#F48FB1" transform="rotate(45 30 20)"/>
    <ellipse cx="33" cy="26" rx="4" ry="8" fill="#EC407A" transform="rotate(90 33 26)"/>
    <ellipse cx="30" cy="32" rx="4" ry="8" fill="#F48FB1" transform="rotate(135 30 32)"/>
    <ellipse cx="24" cy="34" rx="4" ry="8" fill="#EC407A" transform="rotate(180 24 34)"/>
    <ellipse cx="18" cy="32" rx="4" ry="8" fill="#F48FB1" transform="rotate(-135 18 32)"/>
    <ellipse cx="15" cy="26" rx="4" ry="8" fill="#EC407A" transform="rotate(-90 15 26)"/>
    <ellipse cx="18" cy="20" rx="4" ry="8" fill="#F48FB1" transform="rotate(-45 18 20)"/>
    {/* center */}
    <circle cx="24" cy="26" r="5" fill="#FDD835"/>
    <circle cx="24" cy="26" r="3" fill="#F9A825"/>
  </svg>
}

export function Bheem9Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#ECEFF1"/>
    {/* blade */}
    <path d="M14 38 Q20 28 28 16 Q32 10 34 10 Q34 12 30 16 Q38 20 36 26 Q34 30 26 28 Z" fill="#B0BEC5"/>
    {/* gleam line on blade */}
    <path d="M22 30 Q28 20 32 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
    {/* golden guard crosspiece */}
    <rect x="22" y="28" width="12" height="4" rx="2" fill="#FFD600" transform="rotate(-30 22 28)"/>
    {/* handle */}
    <rect x="10" y="34" width="10" height="6" rx="3" fill="#6D4C41" transform="rotate(-30 10 34)"/>
    {/* pommel */}
    <circle cx="11" cy="41" r="3" fill="#8D6E63"/>
    {/* handle wrap */}
    <path d="M12 36 L18 32" stroke="#FFD600" strokeWidth="1.5"/>
    <path d="M13 38 L19 34" stroke="#FFD600" strokeWidth="1.5"/>
  </svg>
}

export function Bheem10Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* main wall */}
    <rect x="8" y="26" width="32" height="14" rx="1" fill="#BCAAA4"/>
    {/* merlons (battlements) */}
    <rect x="8" y="21" width="5" height="7" rx="1" fill="#A1887F"/>
    <rect x="15" y="21" width="5" height="7" rx="1" fill="#A1887F"/>
    <rect x="22" y="21" width="5" height="7" rx="1" fill="#A1887F"/>
    <rect x="29" y="21" width="5" height="7" rx="1" fill="#A1887F"/>
    <rect x="35" y="21" width="5" height="7" rx="1" fill="#A1887F"/>
    {/* left tower */}
    <rect x="6" y="18" width="10" height="22" rx="1" fill="#D7CCC8"/>
    <rect x="6" y="14" width="4" height="6" rx="1" fill="#BCAAA4"/>
    <rect x="12" y="14" width="4" height="6" rx="1" fill="#BCAAA4"/>
    {/* right tower */}
    <rect x="32" y="18" width="10" height="22" rx="1" fill="#D7CCC8"/>
    <rect x="32" y="14" width="4" height="6" rx="1" fill="#BCAAA4"/>
    <rect x="38" y="14" width="4" height="6" rx="1" fill="#BCAAA4"/>
    {/* arched gateway */}
    <path d="M19 40 L19 30 Q24 24 29 30 L29 40 Z" fill="#5D4037"/>
    {/* flag */}
    <line x1="9" y1="14" x2="9" y2="6" stroke="#795548" strokeWidth="1.5"/>
    <polygon points="9,6 16,9 9,12" fill="#FF7043"/>
  </svg>
}

export function Bheem11Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#EFEBE9"/>
    {/* body */}
    <ellipse cx="22" cy="32" rx="10" ry="8" fill="#8D6E63"/>
    {/* neck */}
    <rect x="20" y="22" width="6" height="8" rx="3" fill="#8D6E63"/>
    {/* head */}
    <ellipse cx="26" cy="18" rx="7" ry="6" fill="#A1887F"/>
    {/* mane */}
    <path d="M19 14 Q22 8 28 10 Q34 8 36 14" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* front legs rearing */}
    <path d="M18 34 Q12 28 10 20" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M22 36 Q18 30 16 22" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* back legs */}
    <path d="M24 38 L22 46" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round"/>
    <path d="M28 36 L28 44" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round"/>
    {/* saddle cloth */}
    <ellipse cx="22" cy="32" rx="8" ry="5" fill="#F44336" opacity="0.8"/>
    {/* eye */}
    <circle cx="28" cy="17" r="1.5" fill="#1A1A1A"/>
    {/* tail */}
    <path d="M30 36 Q36 38 38 44" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Bheem12Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E8F5E9"/>
    {/* bow curve */}
    <path d="M10 10 Q4 24 10 38" stroke="#6D4C41" strokeWidth="4" strokeLinecap="round" fill="none"/>
    {/* bowstring */}
    <line x1="10" y1="10" x2="10" y2="38" stroke="#8D6E63" strokeWidth="1.5"/>
    {/* arrow shaft */}
    <line x1="12" y1="24" x2="42" y2="18" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>
    {/* arrowhead */}
    <polygon points="42,18 36,15 37,21" fill="#546E7A"/>
    {/* fletching feathers */}
    <path d="M12 24 Q9 20 12 17" stroke="#F44336" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M14 23 Q11 20 14 17" stroke="#FF7043" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* string pull indicator */}
    <path d="M10 24 Q16 22 22 23" stroke="#795548" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
}

export function Bheem13Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#E0F7FA"/>
    {/* tail fan feathers */}
    <path d="M24 30 Q10 20 8 10" stroke="#26A69A" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q12 22 14 10" stroke="#00BCD4" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q16 20 20 8" stroke="#26A69A" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q22 18 24 7" stroke="#00BCD4" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q28 18 28 7" stroke="#26A69A" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q32 20 34 8" stroke="#00BCD4" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q36 22 38 10" stroke="#26A69A" strokeWidth="3" fill="none"/>
    <path d="M24 30 Q38 24 40 14" stroke="#00BCD4" strokeWidth="3" fill="none"/>
    {/* eye spots on feathers */}
    <circle cx="9" cy="11" r="2.5" fill="#4CAF50"/>
    <circle cx="9" cy="11" r="1.2" fill="#1A1A1A"/>
    <circle cx="15" cy="11" r="2.5" fill="#4CAF50"/>
    <circle cx="15" cy="11" r="1.2" fill="#1A1A1A"/>
    <circle cx="21" cy="8" r="2.5" fill="#4CAF50"/>
    <circle cx="21" cy="8" r="1.2" fill="#1A1A1A"/>
    <circle cx="28" cy="8" r="2.5" fill="#4CAF50"/>
    <circle cx="28" cy="8" r="1.2" fill="#1A1A1A"/>
    <circle cx="35" cy="9" r="2.5" fill="#4CAF50"/>
    <circle cx="35" cy="9" r="1.2" fill="#1A1A1A"/>
    <circle cx="40" cy="15" r="2.5" fill="#4CAF50"/>
    <circle cx="40" cy="15" r="1.2" fill="#1A1A1A"/>
    {/* body */}
    <ellipse cx="24" cy="34" rx="6" ry="5" fill="#1565C0"/>
    {/* neck */}
    <rect x="22" y="28" width="5" height="7" rx="2" fill="#0288D1"/>
    {/* head */}
    <circle cx="24" cy="25" r="4" fill="#0288D1"/>
    {/* crown */}
    <path d="M22 22 Q24 17 26 22" stroke="#FFD600" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="17" r="1.5" fill="#FFD600"/>
    {/* eye */}
    <circle cx="25" cy="24" r="1.5" fill="#FFFFFF"/>
    <circle cx="25" cy="24" r="0.8" fill="#1A1A1A"/>
  </svg>
}

export function Bheem14Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFEBEE"/>
    {/* flagpole */}
    <rect x="15" y="8" width="3" height="34" rx="1.5" fill="#795548"/>
    {/* saffron flag waving */}
    <path d="M18 10 Q28 13 36 10 Q30 16 36 22 Q28 19 18 22 Z" fill="#FF6F00"/>
    {/* chakra/sun symbol on flag */}
    <circle cx="27" cy="16" r="4" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="27" cy="16" r="2.5" fill="#FF6F00"/>
    <circle cx="27" cy="16" r="1" fill="#FFFFFF"/>
    {/* wind motion lines */}
    <path d="M36 11 Q40 13 38 15" stroke="#FFCC02" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M36 16 Q42 18 40 21" stroke="#FFCC02" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* base of pole */}
    <rect x="12" y="40" width="9" height="4" rx="2" fill="#5D4037"/>
  </svg>
}

export function Bheem15Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#FFF3E0"/>
    {/* torch handle */}
    <rect x="20" y="28" width="8" height="16" rx="4" fill="#795548"/>
    {/* handle wrapping */}
    <rect x="20" y="30" width="8" height="2" rx="1" fill="#5D4037"/>
    <rect x="20" y="34" width="8" height="2" rx="1" fill="#5D4037"/>
    <rect x="20" y="38" width="8" height="2" rx="1" fill="#5D4037"/>
    {/* torch top cup */}
    <rect x="18" y="24" width="12" height="6" rx="2" fill="#5D4037"/>
    {/* flames - layered yellow/orange/red */}
    <path d="M24 7 Q28 12 26 18 Q32 14 30 22 Q26 20 24 24 Q22 20 18 22 Q16 14 22 18 Q20 12 24 7 Z" fill="#FFEE58"/>
    <path d="M24 10 Q27 14 25 19 Q29 16 28 22 Q25 20 24 24 Q23 20 20 22 Q19 16 23 19 Q21 14 24 10 Z" fill="#FF9800"/>
    <path d="M24 13 Q26 16 25 20 Q27 18 26 22 Q24.5 20 24 24 Q23.5 20 22 22 Q21 18 23 20 Q22 16 24 13 Z" fill="#F44336"/>
  </svg>
}

export function Bheem16Icon({ size = 48 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#BBDEFB"/>
    {/* shield outer edge */}
    <circle cx="24" cy="24" r="19" fill="#1565C0"/>
    {/* ring 1 */}
    <circle cx="24" cy="24" r="16" fill="#FFF9C4"/>
    {/* ring 2 */}
    <circle cx="24" cy="24" r="13" fill="#1976D2"/>
    {/* ring 3 */}
    <circle cx="24" cy="24" r="10" fill="#FFC107"/>
    {/* ring 4 */}
    <circle cx="24" cy="24" r="7" fill="#1565C0"/>
    {/* center gem boss */}
    <circle cx="24" cy="24" r="4" fill="#F44336"/>
    <circle cx="22" cy="22" r="1.5" fill="#FF8A80" opacity="0.8"/>
    {/* ornate edge decorations */}
    <circle cx="24" cy="6" r="2" fill="#FFD600"/>
    <circle cx="39" cy="15" r="2" fill="#FFD600"/>
    <circle cx="39" cy="33" r="2" fill="#FFD600"/>
    <circle cx="24" cy="42" r="2" fill="#FFD600"/>
    <circle cx="9" cy="33" r="2" fill="#FFD600"/>
    <circle cx="9" cy="15" r="2" fill="#FFD600"/>
  </svg>
}
