"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuthorProfile } from "@prisma/client";
import type { AuthorProfileInput } from "@/lib/validation/author-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Star, Pencil, Trash2 } from "lucide-react";
import { AuthorProfileForm } from "./author-profile-form";

export function AuthorProfileList({ profiles }: { profiles: AuthorProfile[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AuthorProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(values: AuthorProfileInput) {
    setSubmitting(true);
    const res = await fetch("/api/author-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Unable to create author profile.");
      return;
    }
    toast.success("Author profile created.");
    setCreateOpen(false);
    router.refresh();
  }

  async function handleUpdate(id: string, values: AuthorProfileInput) {
    setSubmitting(true);
    const res = await fetch(`/api/author-profiles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Unable to update author profile.");
      return;
    }
    toast.success("Author profile updated.");
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/author-profiles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Unable to delete author profile.");
      return;
    }
    toast.success("Author profile deleted.");
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/author-profiles/${id}/default`, { method: "POST" });
    if (!res.ok) {
      toast.error("Unable to set default profile.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New author profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>New author profile</DialogTitle>
            </DialogHeader>
            <AuthorProfileForm
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
              submitting={submitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile.penName || profile.authorName}
                  {profile.isDefault && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </Badge>
                  )}
                </CardTitle>
                {profile.authorTagline && (
                  <p className="text-sm text-muted-foreground">{profile.authorTagline}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">{profile.shortBio}</p>
              <div className="flex flex-wrap gap-2">
                {!profile.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(profile.id)}
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set default
                  </Button>
                )}
                <Dialog
                  open={editing?.id === profile.id}
                  onOpenChange={(open) => setEditing(open ? profile : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Edit author profile</DialogTitle>
                    </DialogHeader>
                    <AuthorProfileForm
                      defaultValues={{
                        authorName: profile.authorName,
                        penName: profile.penName ?? "",
                        shortBio: profile.shortBio,
                        longBio: profile.longBio,
                        website: profile.website ?? "",
                        email: profile.email ?? "",
                        authorTagline: profile.authorTagline ?? "",
                        publisherName: profile.publisherName ?? "",
                        copyrightHolder: profile.copyrightHolder ?? "",
                        defaultCTA: profile.defaultCTA ?? "",
                        bonusResourceUrl: profile.bonusResourceUrl ?? "",
                      }}
                      onSubmit={(values) => handleUpdate(profile.id, values)}
                      onCancel={() => setEditing(null)}
                      submitting={submitting}
                    />
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this author profile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can&apos;t be undone. Profiles used by an existing book
                        project can&apos;t be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(profile.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
