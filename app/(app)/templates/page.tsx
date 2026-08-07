import { Card, CardContent } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Reusable book-setting presets (book type, tone, structure) are coming in a later
          build phase.
        </p>
      </div>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No templates yet. For now, configure settings directly in the New Book wizard.
        </CardContent>
      </Card>
    </div>
  );
}
