import { auth } from "@/lib/auth";
import { listAuthorProfiles } from "@/lib/services/author-profile-service";
import { AuthorProfileList } from "@/components/author-profiles/author-profile-list";

export default async function BrandProfilesPage() {
  const session = await auth();
  const profiles = await listAuthorProfiles(session!.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Profiles</h1>
        <p className="text-muted-foreground">
          Author identities used for front/back matter, copyright pages, and KDP author bios.
        </p>
      </div>
      <AuthorProfileList profiles={profiles} />
    </div>
  );
}
