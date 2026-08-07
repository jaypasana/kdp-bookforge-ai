import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/app-shell";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AppShell name={session?.user?.name} email={session?.user?.email}>
      {children}
    </AppShell>
  );
}
