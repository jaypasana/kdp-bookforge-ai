import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Model routing, prompt versions, quality thresholds, and budget limits land here in
          the admin build phase.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>OpenAI configuration</CardTitle>
          <CardDescription>
            Model assignment is currently controlled via environment variables
            (OPENAI_MODEL_PRIMARY / FAST / REVIEW / RESEARCH). An in-app admin panel is
            coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          See the README for how to change models and prompt versions.
        </CardContent>
      </Card>
    </div>
  );
}
