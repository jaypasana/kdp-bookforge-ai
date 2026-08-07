import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQS = [
  {
    q: "What's the minimum I need to provide?",
    a: "Just an ebook title. Everything else — niche, audience, outline, chapters, front/back matter, and the KDP marketing package — is inferred automatically. You can override any of it in the New Book wizard.",
  },
  {
    q: "Is the manuscript ready to publish as-is?",
    a: "No. Every manuscript needs a human review pass before publishing — verify facts, check for copyright issues, and review the compliance checklist on the project page before exporting as \"Approved for Export.\"",
  },
  {
    q: "Does this publish directly to Amazon KDP?",
    a: "Not in this version. KDP BookForge AI generates the manuscript and marketing package as downloadable files — you upload them to KDP yourself.",
  },
  {
    q: "What if a chapter fails to generate?",
    a: "Failed chapters can be retried individually from the project page without re-generating earlier chapters. See the Generation Queue for job status.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
        <p className="text-muted-foreground">Common questions about KDP BookForge AI.</p>
      </div>
      <div className="space-y-4">
        {FAQS.map((item) => (
          <Card key={item.q}>
            <CardHeader>
              <CardTitle className="text-base">{item.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
