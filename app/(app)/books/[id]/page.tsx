import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookProject } from "@/lib/services/book-project-service";
import { ProjectStatusBadge } from "@/components/books/project-status-badge";
import { StatusTimeline } from "@/components/books/status-timeline";
import { ApproveOutlineButton } from "@/components/books/approve-outline-button";
import { RetryChapterButton } from "@/components/books/retry-chapter-button";
import { StopGenerationButton } from "@/components/books/stop-generation-button";
import { DeleteProjectButton } from "@/components/books/delete-project-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import type { Outline } from "@/lib/prompts/outline-generator";
import type { KdpPackage } from "@/lib/prompts/kdp-package";
import type { FrontMatter } from "@/lib/prompts/front-matter";
import type { BackMatter } from "@/lib/prompts/back-matter";
import { IN_PROGRESS_STATUSES } from "@/lib/constants/project-status";

export default async function BookProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const project = await getBookProject(session!.user.id, id);

  if (!project) notFound();

  const outline = project.outlines[0]?.structuredData as unknown as Outline | undefined;
  const kdpPackage = project.kdpPackage as
    | (typeof project.kdpPackage & { positioning?: KdpPackage["positioning"] })
    | null;
  const frontMatter = project.frontMatter as unknown as FrontMatter | null;
  const backMatter = project.backMatter as unknown as BackMatter | null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
            {project.subtitle && (
              <p className="text-muted-foreground">{project.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.status === "AWAITING_OUTLINE_APPROVAL" && (
              <ApproveOutlineButton bookProjectId={project.id} />
            )}
            {IN_PROGRESS_STATUSES.has(project.status) && (
              <StopGenerationButton bookProjectId={project.id} />
            )}
            <DeleteProjectButton bookProjectId={project.id} title={project.title} />
          </div>
        </div>
        <StatusTimeline status={project.status} />
        {project.errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{project.errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="frontback">Front/Back Matter</TabsTrigger>
          <TabsTrigger value="kdp">KDP Package</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Niche: </span>
                {project.niche ?? "Not yet inferred"}
              </div>
              <div>
                <span className="text-muted-foreground">Book type: </span>
                {project.bookType ?? "Not yet inferred"}
              </div>
              <div>
                <span className="text-muted-foreground">Target length: </span>
                {project.targetWordCount.toLocaleString()} words / {project.chapterCount}{" "}
                chapters
              </div>
              <div>
                <span className="text-muted-foreground">Words generated so far: </span>
                {project.totalWords.toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Tone: </span>
                {project.tone ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Author profile: </span>
                {project.authorProfile?.penName || project.authorProfile?.authorName || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Estimated cost: </span>
                {project.estimatedCost ? `$${project.estimatedCost.toFixed(2)}` : "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Actual cost so far: </span>$
                {project.actualCost.toFixed(2)}
              </div>
              {project.fullAutopilot && <Badge variant="secondary">Full Autopilot</Badge>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outline" className="space-y-3">
          {!outline ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                The outline will appear here once generated.
              </CardContent>
            </Card>
          ) : (
            <>
              {project.status === "AWAITING_OUTLINE_APPROVAL" && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Review the outline before chapters are generated</AlertTitle>
                  <AlertDescription>
                    Approve it to continue, or come back later — chapter generation waits for
                    your approval.
                  </AlertDescription>
                </Alert>
              )}
              {outline.chapters.map((chapter) => (
                <Card key={chapter.chapterNumber}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {chapter.chapterNumber}. {chapter.chapterTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {chapter.chapterSummary}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="chapters" className="space-y-3">
          {project.chapters.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Chapters will appear here once outline generation completes.
              </CardContent>
            </Card>
          ) : (
            project.chapters.map((chapter) => (
              <Card key={chapter.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">
                      {chapter.chapterNumber}. {chapter.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {chapter.actualWordCount.toLocaleString()} /{" "}
                      {chapter.targetWordCount.toLocaleString()} words
                      {chapter.score ? ` · score ${chapter.score}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{chapter.status}</Badge>
                    {(chapter.status === "APPROVED" || chapter.status === "FAILED") && (
                      <RetryChapterButton
                        bookProjectId={project.id}
                        chapterNumber={chapter.chapterNumber}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="frontback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Front matter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {frontMatter ? (
                <>
                  <p>{frontMatter.introduction}</p>
                  <p className="text-muted-foreground">{frontMatter.howToUseThisBook}</p>
                  {frontMatter.disclaimer && (
                    <Alert>
                      <AlertTitle>Disclaimer ({frontMatter.disclaimer.category})</AlertTitle>
                      <AlertDescription>{frontMatter.disclaimer.text}</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Not generated yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Back matter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {backMatter ? (
                <>
                  <p>{backMatter.conclusion}</p>
                  <p className="text-muted-foreground">{backMatter.callToAction}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Not generated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kdp">
          {kdpPackage ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended title</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-medium">
                    {(kdpPackage.titles as unknown as string[] | null)?.[0] ?? "—"}
                  </p>
                  <p className="text-muted-foreground">
                    {(kdpPackage.description as unknown as { plainText?: string } | null)
                      ?.plainText ?? ""}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Keywords</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {(kdpPackage.keywords as unknown as { disclaimer?: string } | null)
                    ?.disclaimer}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                The KDP optimization package will appear here once generated.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Export becomes available once the manuscript reaches Ready for Review.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
