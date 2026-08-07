"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import type { AuthorProfile } from "@prisma/client";
import {
  createBookProjectSchema,
  type CreateBookProjectFormInput,
} from "@/lib/validation/book-project";
import { BOOK_TYPES, READER_LEVELS, TONES, POINTS_OF_VIEW, DEFAULT_BOOK_SETTINGS } from "@/lib/constants/book-options";
import { estimateGenerationCost } from "@/lib/cost-estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

const STEPS = [
  { id: 1, title: "Book Idea" },
  { id: 2, title: "Book Settings" },
  { id: 3, title: "Author Profile" },
  { id: 4, title: "Generation Plan" },
] as const;

const STEP_FIELDS: Record<number, (keyof CreateBookProjectFormInput)[]> = {
  1: ["title", "subtitle", "niche", "bookType", "shortDescription", "targetAudience", "readerLevel", "primaryReaderProblem", "desiredTransformation"],
  2: ["language", "tone", "pointOfView", "targetWordCount", "chapterCount", "wordsPerChapter"],
  3: ["authorProfileId"],
  4: [],
};

const CONTENT_TOGGLES: Array<{ key: keyof CreateBookProjectFormInput; label: string }> = [
  { key: "includeCaseStudies", label: "Case studies" },
  { key: "includeExercises", label: "Exercises" },
  { key: "includeWorksheets", label: "Worksheets" },
  { key: "includeReflection", label: "Reflection questions" },
  { key: "includeChecklists", label: "Checklists" },
  { key: "includeFAQs", label: "FAQs" },
  { key: "includeGlossary", label: "Glossary" },
  { key: "includeBonusResources", label: "Bonus resources" },
  { key: "includeCitations", label: "Citations" },
  { key: "includeKdpPackage", label: "KDP marketing package" },
];

export function NewBookWizard({ authorProfiles }: { authorProfiles: AuthorProfile[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const defaultAuthorProfileId =
    authorProfiles.find((p) => p.isDefault)?.id ?? authorProfiles[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateBookProjectFormInput>({
    resolver: zodResolver(createBookProjectSchema),
    defaultValues: {
      ...DEFAULT_BOOK_SETTINGS,
      authorProfileId: defaultAuthorProfileId,
    },
  });

  const values = watch();
  const estimate = useMemo(
    () => estimateGenerationCost(Number(values.targetWordCount) || 50000),
    [values.targetWordCount]
  );

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields.length ? await trigger(fields) : true;
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function onSubmit(data: CreateBookProjectFormInput) {
    setSubmitting(true);
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      toast.error(json.error ?? "Unable to create book project.");
      return;
    }

    toast.success("Book project created. Generation is starting.");
    router.push(`/books/${json.project.id}`);
  }

  if (authorProfiles.length === 0) {
    return (
      <Alert>
        <AlertTitle>No author profile yet</AlertTitle>
        <AlertDescription>
          Create an author profile before starting a new book.{" "}
          <Link href="/brand-profiles" className="underline font-medium">
            Go to Brand Profiles
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
              s.id === step
                ? "border-primary bg-primary text-primary-foreground"
                : s.id < step
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground"
            }`}
          >
            <span className="font-medium">{s.id}</span>
            {s.title}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Book idea</CardTitle>
              <CardDescription>
                Only the title is required — KDP BookForge AI infers the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Ebook title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. AI for Real Estate Agents"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (optional)</Label>
                  <Input id="subtitle" {...register("subtitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Niche (optional)</Label>
                  <Input id="niche" {...register("niche")} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Book type (optional)</Label>
                  <Select
                    value={values.bookType}
                    onValueChange={(v) => setValue("bookType", v as CreateBookProjectFormInput["bookType"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Let AI decide" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOK_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reader experience level (optional)</Label>
                  <Select
                    value={values.readerLevel}
                    onValueChange={(v) => setValue("readerLevel", v as CreateBookProjectFormInput["readerLevel"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Let AI decide" />
                    </SelectTrigger>
                    <SelectContent>
                      {READER_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target audience (optional)</Label>
                <Input id="targetAudience" {...register("targetAudience")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short description (optional)</Label>
                <Textarea id="shortDescription" rows={2} {...register("shortDescription")} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryReaderProblem">Primary reader problem (optional)</Label>
                  <Textarea id="primaryReaderProblem" rows={2} {...register("primaryReaderProblem")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desiredTransformation">Desired transformation (optional)</Label>
                  <Textarea id="desiredTransformation" rows={2} {...register("desiredTransformation")} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Book settings</CardTitle>
              <CardDescription>Sensible defaults are pre-filled — adjust as needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" {...register("language")} />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={values.tone} onValueChange={(v) => setValue("tone", v as CreateBookProjectFormInput["tone"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Point of view</Label>
                  <Select
                    value={values.pointOfView}
                    onValueChange={(v) => setValue("pointOfView", v as CreateBookProjectFormInput["pointOfView"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POINTS_OF_VIEW.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="targetWordCount">Target word count</Label>
                  <Input
                    id="targetWordCount"
                    type="number"
                    {...register("targetWordCount", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapterCount">Number of chapters</Label>
                  <Input
                    id="chapterCount"
                    type="number"
                    {...register("chapterCount", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wordsPerChapter">Approx. words per chapter</Label>
                  <Input
                    id="wordsPerChapter"
                    type="number"
                    {...register("wordsPerChapter", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-sm font-medium">Include in manuscript</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CONTENT_TOGGLES.map((toggle) => (
                    <label
                      key={toggle.key}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-sm">{toggle.label}</span>
                      <Switch
                        checked={Boolean(values[toggle.key])}
                        onCheckedChange={(checked) => setValue(toggle.key, checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Author profile</CardTitle>
              <CardDescription>
                Used for front/back matter, copyright, and KDP author bios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Author profile</Label>
                <Select
                  value={values.authorProfileId}
                  onValueChange={(v) => setValue("authorProfileId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an author profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {authorProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.penName || p.authorName}
                        {p.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.authorProfileId && (
                  <p className="text-sm text-destructive">{errors.authorProfileId.message}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Need a different identity?{" "}
                <Link href="/brand-profiles" className="underline font-medium">
                  Manage author profiles
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Generation plan</CardTitle>
              <CardDescription>
                Review your settings, then generate. Detailed niche/audience inference and
                outline preview appear here once generation starts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Title: </span>
                  {values.title || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Book type: </span>
                  {values.bookType || "AI will infer"}
                </div>
                <div>
                  <span className="text-muted-foreground">Target length: </span>
                  {(values.targetWordCount ?? 0).toLocaleString()} words across{" "}
                  {values.chapterCount ?? 0} chapters
                </div>
                <div>
                  <span className="text-muted-foreground">Tone: </span>
                  {values.tone}
                </div>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Estimated API cost (estimate only)</AlertTitle>
                <AlertDescription>
                  ~${estimate.estimatedCostUsd.toFixed(2)} based on{" "}
                  {estimate.estimatedInputTokens.toLocaleString()} input and{" "}
                  {estimate.estimatedOutputTokens.toLocaleString()} output tokens. Actual cost is
                  tracked per API call once generation runs.
                </AlertDescription>
              </Alert>

              <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Full Autopilot</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically approve the outline and continue through final DOCX
                    generation without stopping for review.
                  </p>
                </div>
                <Switch
                  checked={values.fullAutopilot}
                  onCheckedChange={(checked) => setValue("fullAutopilot", checked)}
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Research mode</p>
                  <p className="text-xs text-muted-foreground">
                    Flags claims needing source verification instead of generalized explanations.
                  </p>
                </div>
                <Switch
                  checked={values.researchMode}
                  onCheckedChange={(checked) => setValue("researchMode", checked)}
                />
              </label>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {step < STEPS.length ? (
            <Button type="button" onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              <Sparkles className="h-4 w-4" />
              {submitting ? "Starting generation..." : "Generate Book"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
