import { useMemo } from "react";
import { buildShareCardSvg, type ShareCardData } from "@/lib/share-card";

export function ShareCardPreview({ data }: { data: ShareCardData }) {
  const imageSrc = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildShareCardSvg(data))}`,
    [data],
  );

  return (
    <div className="rounded-xl border bg-muted/30 p-2 shadow-inner">
      <img
        src={imageSrc}
        alt={`Preview of ${data.title} share card`}
        className="w-full rounded-lg"
      />
    </div>
  );
}