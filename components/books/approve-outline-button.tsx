"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function ApproveOutlineButton({ bookProjectId }: { bookProjectId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    setSubmitting(true);
    const res = await fetch(`/api/books/${bookProjectId}/approve-outline`, { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Unable to approve outline.");
      return;
    }
    toast.success("Outline approved. Chapter generation is starting.");
    router.refresh();
  }

  return (
    <Button onClick={handleApprove} disabled={submitting}>
      <CheckCircle2 className="h-4 w-4" />
      {submitting ? "Approving..." : "Approve Outline"}
    </Button>
  );
}
