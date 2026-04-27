import { Flame } from "lucide-react";

export function HeatMeter({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={`h-3.5 w-3.5 ${i < level ? "fill-chili text-chili" : "text-muted"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
