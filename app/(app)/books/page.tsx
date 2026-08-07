import Link from "next/link";
import { Plus, BookOpenText } from "lucide-react";
import { auth } from "@/lib/auth";
import { listBookProjects } from "@/lib/services/book-project-service";
import { ProjectCard } from "@/components/books/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function MyBooksPage() {
  const session = await auth();
  const projects = await listBookProjects(session!.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Books</h1>
        <Button asChild>
          <Link href="/books/new">
            <Plus className="h-4 w-4" />
            Create New Book
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpenText className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">You haven&apos;t created any books yet.</p>
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
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
