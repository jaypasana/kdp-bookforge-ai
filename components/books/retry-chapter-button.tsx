"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function RetryChapterButton({
  bookProjectId,
  chapterNumber,
}: {
  bookProjectId: string;
  chapterNumber: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleRetry() {
    setSubmitting(true);
    const res = await fetch(`/api/books/${bookProjectId}/retry-chapter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterNumber }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Unable to retry chapter.");
      return;
    }
    toast.success(`Regenerating chapter ${chapterNumber}...`);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRetry} disabled={submitting}>
      <RotateCcw className="h-3.5 w-3.5" />
      {submitting ? "Queuing..." : "Retry"}
    </Button>
  );
}
