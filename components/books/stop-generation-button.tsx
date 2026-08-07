"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function StopGenerationButton({ bookProjectId }: { bookProjectId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleStop() {
    setSubmitting(true);
    const res = await fetch(`/api/books/${bookProjectId}/cancel`, { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Unable to stop generation.");
      return;
    }
    toast.success("Generation stopped.");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Square className="h-3.5 w-3.5" />
          Stop generation
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stop generation?</AlertDialogTitle>
          <AlertDialogDescription>
            This stops the background generation job. Chapters already completed are kept —
            you can edit the project or delete it afterward.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep generating</AlertDialogCancel>
          <AlertDialogAction onClick={handleStop} disabled={submitting}>
            {submitting ? "Stopping..." : "Stop generation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
