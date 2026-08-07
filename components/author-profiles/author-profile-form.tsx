"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorProfileSchema, type AuthorProfileInput } from "@/lib/validation/author-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AuthorProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues?: Partial<AuthorProfileInput>;
  onSubmit: (values: AuthorProfileInput) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthorProfileInput>({
    resolver: zodResolver(authorProfileSchema),
    defaultValues: {
      authorName: "",
      penName: "",
      shortBio: "",
      longBio: "",
      website: "",
      email: "",
      authorTagline: "",
      publisherName: "",
      copyrightHolder: "",
      defaultCTA: "",
      bonusResourceUrl: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author name</Label>
          <Input id="authorName" {...register("authorName")} />
          {errors.authorName && (
            <p className="text-sm text-destructive">{errors.authorName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="penName">Pen name (optional)</Label>
          <Input id="penName" {...register("penName")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortBio">Short bio</Label>
        <Textarea id="shortBio" rows={2} {...register("shortBio")} />
        {errors.shortBio && (
          <p className="text-sm text-destructive">{errors.shortBio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="longBio">Long &quot;About the Author&quot; bio</Label>
        <Textarea id="longBio" rows={4} {...register("longBio")} />
        {errors.longBio && (
          <p className="text-sm text-destructive">{errors.longBio.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="https://..." {...register("website")} />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Contact email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorTagline">Author tagline</Label>
        <Input id="authorTagline" {...register("authorTagline")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="publisherName">Publisher name</Label>
          <Input id="publisherName" {...register("publisherName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="copyrightHolder">Copyright holder</Label>
          <Input id="copyrightHolder" {...register("copyrightHolder")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCTA">Default call-to-action</Label>
        <Textarea id="defaultCTA" rows={2} {...register("defaultCTA")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bonusResourceUrl">Default bonus resource URL</Label>
        <Input
          id="bonusResourceUrl"
          placeholder="https://..."
          {...register("bonusResourceUrl")}
        />
        {errors.bonusResourceUrl && (
          <p className="text-sm text-destructive">{errors.bonusResourceUrl.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
