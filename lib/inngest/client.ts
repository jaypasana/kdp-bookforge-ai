import { Inngest, EventSchemas } from "inngest";

type BookProjectEvents = {
  "book/generate.requested": {
    data: { bookProjectId: string };
  };
  "book/outline.approved": {
    data: { bookProjectId: string };
  };
  "book/chapter.retry": {
    data: { bookProjectId: string; chapterNumber: number };
  };
  "book/generation.cancelled": {
    data: { bookProjectId: string };
  };
};

export const inngest = new Inngest({
  id: "kdp-bookforge-ai",
  schemas: new EventSchemas().fromRecord<BookProjectEvents>(),
});
