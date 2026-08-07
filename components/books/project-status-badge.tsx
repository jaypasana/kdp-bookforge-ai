import { Badge } from "@/components/ui/badge";
import type { BookProjectStatus } from "@prisma/client";

export const STATUS_LABELS: Record<BookProjectStatus, string> = {
  SETUP: "Setup",
  PLANNING: "Planning",
  OUTLINE_GENERATION: "Outline generation",
  AWAITING_OUTLINE_APPROVAL: "Awaiting outline approval",
  GENERATING_CHAPTERS: "Generating chapters",
  QUALITY_REVIEW: "Quality review",
  GENERATING_KDP_PACKAGE: "Generating KDP package",
  COMPILING_DOCX: "Compiling DOCX",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

const STATUS_VARIANTS: Record<
  BookProjectStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SETUP: "outline",
  PLANNING: "secondary",
  OUTLINE_GENERATION: "secondary",
  AWAITING_OUTLINE_APPROVAL: "secondary",
  GENERATING_CHAPTERS: "secondary",
  QUALITY_REVIEW: "secondary",
  GENERATING_KDP_PACKAGE: "secondary",
  COMPILING_DOCX: "secondary",
  READY_FOR_REVIEW: "default",
  APPROVED: "default",
  FAILED: "destructive",
  CANCELLED: "outline",
  ARCHIVED: "outline",
};

export function ProjectStatusBadge({ status }: { status: BookProjectStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
