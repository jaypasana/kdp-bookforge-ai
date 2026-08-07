import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function QueuePage() {
  const session = await auth();
  const jobs = await prisma.generationJob.findMany({
    where: { bookProject: { userId: session!.user.id } },
    include: { bookProject: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generation Queue</h1>
        <p className="text-muted-foreground">Recent background jobs across all your books.</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No generation jobs yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <Link href={`/books/${job.bookProjectId}`} className="font-medium underline">
                    {job.bookProject.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.jobType} · attempt {job.attempt}
                  </p>
                </div>
                <Badge
                  variant={
                    job.status === "FAILED"
                      ? "destructive"
                      : job.status === "SUCCEEDED"
                        ? "default"
                        : "secondary"
                  }
                >
                  {job.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
