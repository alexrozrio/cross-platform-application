import { forwardRef, type SVGProps } from "react";

type SnakeIconProps = SVGProps<SVGSVGElement> & { size?: number | string };

/**
 * Lucide-style snake icon. lucide-react does not ship a snake glyph,
 * so this mirrors its conventions (24x24, stroke=currentColor, strokeWidth 2).
 */
export const Snake = forwardRef<SVGSVGElement, SnakeIconProps>(
  ({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 13C6 13 6 20 10 20c4 0 4-10 8.5-10" />
      <circle cx="20.4" cy="10" r="2.3" />
      <path d="M22.4 10l1.4-.9M22.4 10l1.4.9" />
      <circle cx="21" cy="9.1" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),
);
Snake.displayName = "Snake";
