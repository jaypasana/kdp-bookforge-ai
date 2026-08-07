import { Check } from "lucide-react";
import type { BookProjectStatus } from "@prisma/client";
import { STATUS_LABELS } from "./project-status-badge";
import { cn } from "@/lib/utils";

const TIMELINE_ORDER: BookProjectStatus[] = [
  "SETUP",
  "PLANNING",
  "OUTLINE_GENERATION",
  "AWAITING_OUTLINE_APPROVAL",
  "GENERATING_CHAPTERS",
  "QUALITY_REVIEW",
  "GENERATING_KDP_PACKAGE",
  "COMPILING_DOCX",
  "READY_FOR_REVIEW",
  "APPROVED",
];

export function StatusTimeline({ status }: { status: BookProjectStatus }) {
  if (status === "FAILED" || status === "CANCELLED" || status === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        Current status: <span className="font-medium text-foreground">{STATUS_LABELS[status]}</span>
      </p>
    );
  }

  const currentIndex = TIMELINE_ORDER.indexOf(status);

  return (
    <ol className="flex flex-wrap gap-2">
      {TIMELINE_ORDER.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={s}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
              active && "border-primary bg-primary text-primary-foreground font-medium",
              done && !active && "border-accent/50 bg-accent/10 text-accent",
              !done && !active && "border-border text-muted-foreground"
            )}
          >
            {done && <Check className="h-3 w-3" />}
            {STATUS_LABELS[s]}
          </li>
        );
      })}
    </ol>
  );
}
