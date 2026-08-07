import { auth } from "@/lib/auth";
import { listAuthorProfiles } from "@/lib/services/author-profile-service";
import { NewBookWizard } from "@/components/books/new-book-wizard";

export default async function NewBookPage() {
  const session = await auth();
  const authorProfiles = await listAuthorProfiles(session!.user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create New Book</h1>
        <p className="text-muted-foreground">
          Enter a title — KDP BookForge AI infers the niche, audience, and full book plan.
        </p>
      </div>
      <NewBookWizard authorProfiles={authorProfiles} />
    </div>
  );
}
