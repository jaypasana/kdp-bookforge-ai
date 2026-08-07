import Link from "next/link";
import { FileText, Loader2, CheckCircle2, AlertTriangle, BookOpenText, DollarSign, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/book-project-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectCard } from "@/components/books/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const stats = await getDashboardStats(userId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
          </p>
        </div>
        <Button asChild>
          <Link href="/books/new">
            <Plus className="h-4 w-4" />
            Create New Book
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total projects" value={stats.total} icon={BookOpenText} />
        <StatCard label="Draft" value={stats.draft} icon={FileText} />
        <StatCard label="Generating" value={stats.generating} icon={Loader2} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Failed jobs" value={stats.failed} icon={AlertTriangle} />
        <StatCard
          label="Est. API cost"
          value={`$${stats.estimatedTotalCost.toFixed(2)}`}
          icon={DollarSign}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/books">View all</Link>
          </Button>
        </div>

        {stats.recent.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <BookOpenText className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No books yet. Enter a title and let KDP BookForge AI draft your first
                manuscript.
              </p>
              <Button asChild>
                <Link href="/books/new">
                  <Plus className="h-4 w-4" />
                  Create New Book
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recent.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
