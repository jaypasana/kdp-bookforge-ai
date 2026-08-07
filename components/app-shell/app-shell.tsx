"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

export function AppShell({
  name,
  email,
  children,
}: {
  name?: string | null;
  email?: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center px-5 text-lg font-semibold tracking-tight">
          KDP BookForge <span className="ml-1 text-sidebar-primary">AI</span>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-none bg-sidebar p-0 text-sidebar-foreground"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 items-center px-5 text-lg font-semibold tracking-tight">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    KDP BookForge <span className="ml-1 text-sidebar-primary">AI</span>
                  </Link>
                </div>
                <div onClick={() => setMobileOpen(false)}>
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground md:hidden">
              KDP BookForge AI
            </span>
          </div>

          <UserMenu name={name} email={email} />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
