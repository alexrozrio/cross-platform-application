import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileContentDisclosureProps {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}

/**
 * Keeps long-form help and SEO copy in the page for every viewport, while
 * collapsing it behind an accessible control on small screens.
 */
export function MobileContentDisclosure({
  id,
  title,
  className,
  children,
}: MobileContentDisclosureProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-left font-semibold text-foreground md:hidden",
          expanded && "mb-4",
        )}
        aria-controls={id}
        aria-expanded={expanded}
        data-testid={`button-expand-${id}`}
        onClick={() => setExpanded((current) => !current)}
      >
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      <div
        id={id}
        className={expanded ? "block" : "hidden md:block"}
        data-testid={`section-content-${id}`}
      >
        {children}
      </div>
    </div>
  );
}
