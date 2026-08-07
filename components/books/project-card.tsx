import Link from "next/link";
import type { BookProject } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "./project-status-badge";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function ProjectCard({ project }: { project: BookProject }) {
  const canDownload = project.status === "APPROVED" || project.status === "READY_FOR_REVIEW";

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{project.title}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.niche && (
          <p className="text-sm text-muted-foreground line-clamp-1">{project.niche}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-1.5">
          <Progress value={project.progress} />
          <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>{project.totalWords.toLocaleString()} words</span>
          <span className="text-right">Updated {formatDate(project.updatedAt)}</span>
        </div>

        <div className="mt-auto flex gap-2 pt-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link href={`/books/${project.id}`}>Continue editing</Link>
          </Button>
          {canDownload && (
            <Button asChild size="sm" className="flex-1">
              <Link href={`/books/${project.id}?tab=export`}>Download</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
