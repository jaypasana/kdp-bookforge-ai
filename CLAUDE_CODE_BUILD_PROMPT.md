# AI Amazon KDP Ebook Creation Platform

You are a senior full-stack software engineer, SaaS architect, AI workflow engineer, UX designer, database architect, security engineer, and quality-assurance specialist.

Build a complete, production-ready web application called:

**KDP BookForge AI**

KDP BookForge AI is an AI-powered book-creation platform that allows the user to enter an ebook title and automatically generates a complete, original, professionally structured nonfiction ebook using the OpenAI API.

The final output must be a downloadable, professionally formatted Microsoft Word DOCX manuscript suitable for review, editing, and eventual Amazon KDP submission.

Do not build only a visual mockup.

Build the full application, including:

- Frontend
- Backend
- Database
- OpenAI integration
- Prompt orchestration
- Background job processing
- Manuscript generation
- Quality-control workflow
- DOCX generation
- Project history
- Settings
- Error handling
- Testing
- Deployment documentation

The application must be modular, secure, maintainable, and designed for future SaaS commercialization.

## 1. PRIMARY USER EXPERIENCE

The simplest workflow should be:

1. User opens the application.
2. User clicks "Create New Book."
3. User enters the proposed ebook title.
4. User may optionally provide additional details.
5. User clicks "Generate Book."
6. The application automatically:
   - Interprets the title.
   - Identifies the likely niche.
   - Defines the target audience.
   - Identifies reader problems and desired outcomes.
   - Creates the book concept.
   - Develops the table of contents.
   - Creates detailed chapter topics and subtopics.
   - Generates the manuscript chapter by chapter.
   - Produces front matter and back matter.
   - Produces the complete Amazon KDP optimization package.
   - Reviews the content for quality, originality, repetition, coherence, and formatting.
   - Compiles everything into a DOCX file.
7. The user reviews the generated project.
8. The user may edit, regenerate, approve, or download the manuscript.

The minimum required input is:

- Ebook title

The app must be capable of intelligently determining reasonable defaults from the title.

Example:

Input: "AI for Real Estate Agents"

The app should infer:

- Niche: Artificial intelligence for real estate professionals
- Target audience: Realtors, brokers, property consultants, sales managers, and real estate teams
- Reader level: Beginner to intermediate
- Book style: Practical nonfiction business guide
- Reader goal: Save time, generate leads, automate follow-ups, improve marketing, and close more deals
- Approximate manuscript length: 40,000–60,000 words

The user must still be able to override all inferred settings before generation.

## 2. TECHNOLOGY STACK

Use the following stack unless there is a strong technical reason to choose an equivalent modern alternative:

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod validation

**Backend**
- Next.js server actions or route handlers
- TypeScript
- OpenAI official SDK
- RESTful or typed server-side service architecture

**Database**

Use PostgreSQL with:
- Prisma ORM
- Database migrations
- Seed data
- Proper foreign-key relationships

For easy local development, support:
- PostgreSQL through Docker Compose

For deployment, ensure compatibility with:
- Supabase
- Neon
- Railway PostgreSQL
- Vercel Postgres or an equivalent managed PostgreSQL service

**Authentication**

Implement secure authentication using one of:
- Auth.js
- Clerk
- Supabase Auth

Create:
- Sign up
- Login
- Logout
- Password reset
- Protected dashboard
- User-specific book projects

**Job Processing**

Long manuscript generation must not depend on one browser request remaining open.

Create a durable job-processing layer using one of:
- Inngest
- Trigger.dev
- BullMQ with Redis

Use queued, retryable jobs for:
- Book planning
- Outline generation
- Chapter generation
- Quality review
- Marketing package generation
- DOCX compilation

Do not generate an entire book in one OpenAI request.

**Document Generation**

Use a reliable DOCX-generation library such as:
- `docx` for Node.js

The exported file must be a valid `.docx` document.

## 3. APPLICATION DESIGN

Create a premium, modern SaaS interface inspired by professional publishing and productivity applications.

**Visual Style**
- Clean and premium
- Minimal but not empty
- Professional publishing aesthetic
- Desktop-first and mobile-responsive
- Strong visual hierarchy
- Accessible contrast
- Large readable typography
- Generous spacing
- Subtle shadows
- Rounded cards
- Clear progress indicators

**Suggested Brand Style**

Primary colors:
- Deep navy
- Warm gold
- Soft cream
- White
- Muted slate

Do not use childish illustrations or overly futuristic AI imagery.

**Main Navigation**

Include:
- Dashboard
- New Book
- My Books
- Templates
- Brand Profiles
- Generation Queue
- Settings
- Help

## 4. DASHBOARD

The dashboard must show:
- Total book projects
- Draft projects
- Generating projects
- Completed manuscripts
- Failed jobs
- Total generated words
- Estimated OpenAI cost
- Most recent projects
- Current generation queue
- Quick "Create New Book" button

Each project card should show:
- Book title
- Niche
- Status
- Progress percentage
- Word count
- Date created
- Last updated
- Download button
- Continue editing button

Project statuses:
- Setup
- Planning
- Outline generation
- Awaiting outline approval
- Generating chapters
- Quality review
- Generating KDP package
- Compiling DOCX
- Ready for review
- Approved
- Failed
- Archived

## 5. NEW BOOK WORKFLOW

Create a guided wizard.

**Step 1: Book Idea**

Required:
- Proposed ebook title

Optional:
- Subtitle
- Niche
- Book type
- Short description
- Target audience
- Reader experience level
- Primary reader problem
- Desired transformation

**Step 2: Book Settings**

Include:
- Language
- Tone
- Point of view
- Target word count
- Number of chapters
- Approximate words per chapter
- Reading level
- Include case studies
- Include exercises
- Include worksheets
- Include reflection questions
- Include checklists
- Include FAQs
- Include glossary
- Include bonus resources
- Include citations
- Include KDP marketing package

Book-type options:
- How-to guide
- Business guide
- Professional handbook
- Self-help book
- Educational guide
- Workbook-supported guide
- Beginner-to-advanced manual
- Custom nonfiction

Default settings:
- 12 chapters
- 45,000–60,000 words
- Professional but conversational tone
- Beginner-to-advanced progression
- Practical examples
- Short paragraphs
- Action steps
- Chapter summaries
- No unnecessary repetition

**Step 3: Author Profile**

Allow the user to select or create an author profile containing:
- Author name
- Pen name
- Short author bio
- Long About the Author
- Website
- Email
- Social links
- Existing books
- Author tagline
- Publisher name
- Copyright holder
- Default CTA
- Default bonus-resource link

Provide a default author profile for:

Jay Pasana

Suggested default positioning:

Jay Pasana is an entrepreneur, business systems strategist, author, and AI automation advocate who creates practical resources that help entrepreneurs and professionals simplify complex challenges, improve productivity, and build scalable systems.

Make every field editable.

**Step 4: Generation Plan**

Before manuscript generation, display the AI-generated:
- Niche interpretation
- Target reader
- Reader pain points
- Reader goals
- Unique selling proposition
- Proposed title
- Proposed subtitle
- Book promise
- Book positioning
- Proposed table of contents
- Estimated word count
- Estimated API cost

Allow the user to:
- Approve the plan
- Edit the outline
- Regenerate the plan
- Reorder chapters
- Add a chapter
- Remove a chapter
- Edit chapter topics
- Edit chapter subtopics

The system should support an optional "Full Autopilot" setting that approves the outline automatically and continues through final DOCX generation.

Default Full Autopilot setting: Off

## 6. OPENAI API INTEGRATION

Use the official OpenAI SDK.

Use the OpenAI Responses API rather than legacy architecture where practical.

Store the API key securely in server-side environment variables.

Never expose the API key in:
- Browser JavaScript
- Client-side logs
- API responses
- Database records
- Generated files

Required environment variable:

```
OPENAI_API_KEY=
```

Also support:

```
OPENAI_MODEL_PRIMARY=
OPENAI_MODEL_FAST=
OPENAI_MODEL_REVIEW=
OPENAI_MODEL_RESEARCH=
```

Do not hard-code a model that may become unavailable.

Provide sensible defaults through environment configuration and document how to change them.

**Model Routing**

Design model routing so the administrator can assign different models to different tasks.

Suggested task routing:

Primary reasoning model:
- Market positioning
- Book architecture
- Outline creation
- Difficult chapters
- Final review

Fast lower-cost model:
- Metadata extraction
- Summaries
- Formatting cleanup
- Tag generation
- Classification

Review model:
- Repetition checks
- Logical consistency
- Style adherence
- Chapter scoring
- Marketing-copy review

The administrator must be able to configure models from the settings page.

## 7. PROMPT ORCHESTRATION SYSTEM

Do not place one giant prompt directly inside a UI component.

Create a dedicated prompt library with:
- Versioned system prompts
- Versioned task prompts
- Prompt templates
- Variables
- Output schemas
- Prompt testing support
- Prompt-version history

Suggested directory: `/lib/prompts/`

Files:
- `book-discovery.ts`
- `market-positioning.ts`
- `outline-generator.ts`
- `chapter-brief.ts`
- `chapter-writer.ts`
- `chapter-reviewer.ts`
- `continuity-reviewer.ts`
- `front-matter.ts`
- `back-matter.ts`
- `kdp-package.ts`
- `marketing-package.ts`
- `docx-formatter.ts`
- `final-quality-review.ts`

Use structured JSON outputs for planning and metadata tasks.

Validate all structured responses with Zod.

If JSON validation fails:
1. Retry once with a repair instruction.
2. Attempt safe JSON extraction.
3. Record the failure.
4. Show a meaningful error to the user.
5. Do not silently lose content.

## 8. MASTER BOOK-CREATION LOGIC

Incorporate the following principles into the prompt system.

**System Role**

The model should act as:
- Award-winning nonfiction author
- Professional developmental editor
- Amazon KDP publishing strategist
- Instructional designer
- SEO specialist
- Subject-matter researcher
- Conversion copywriter
- Quality-control editor

**Core Mission**

Create a premium Amazon Kindle book that becomes a strong candidate for excellent reader satisfaction, organic recommendations, positive reviews, and commercial success.

Never claim that bestseller status is guaranteed.

The manuscript must be:
- Original
- Reader-focused
- Actionable
- Coherent
- Professionally structured
- Free of filler
- Free of fabricated claims
- Free of unnecessary repetition
- Appropriate for the selected audience
- Consistent from chapter to chapter

The model must not copy existing books.

It must identify typical information gaps in the niche and produce a resource that is more practical, organized, and useful than a generic introductory book.

## 9. BOOK DISCOVERY STAGE

From the title and optional user inputs, generate:
- Interpreted niche
- Book type
- Ideal reader
- Reader demographics when relevant
- Reader experience level
- Biggest frustrations
- Main fears
- Primary goals
- Desired transformation
- Frequently asked questions
- Common beginner mistakes
- Intermediate challenges
- Advanced strategies
- Common myths
- Knowledge gaps
- Purchase motivation
- Unique selling proposition
- Recommended tone
- Recommended chapter count
- Recommended word count
- Recommended bonuses
- Topics requiring careful factual verification
- Whether a disclaimer is required

Return this as validated structured JSON.

Example schema:

```ts
type BookDiscovery = {
  interpretedTitle: string;
  proposedSubtitle: string;
  niche: string;
  bookType: string;
  targetAudience: string[];
  readerLevel: string;
  painPoints: string[];
  desiredOutcomes: string[];
  frequentlyAskedQuestions: string[];
  commonMistakes: string[];
  knowledgeGaps: string[];
  uniqueSellingProposition: string;
  bookPromise: string;
  recommendedTone: string;
  recommendedChapterCount: number;
  recommendedWordCount: number;
  disclaimerRequired: boolean;
  disclaimerReason?: string;
  sensitiveTopics: string[];
};
```

## 10. TABLE OF CONTENTS GENERATOR

Generate a logical table of contents that moves the reader from beginner to advanced.

Default:
- 10–15 chapters
- 4–8 major subtopics per chapter

Each chapter plan must include:
- Chapter number
- Chapter title
- Chapter goal
- Chapter summary
- Learning objectives
- Main topics
- Subtopics
- Practical examples
- Suggested case study
- Step-by-step process
- Common mistakes
- Pro tips
- FAQs
- Exercises
- Reflection questions
- Action checklist
- Key takeaways
- Transition to the next chapter
- Target word count

Each chapter must contribute something unique.

Reject or revise outlines that contain:
- Duplicate chapter concepts
- Weak progression
- Chapters that could be merged
- Generic filler sections
- Unsupported promises
- Titles unrelated to the book promise

Calculate the total estimated manuscript length.

## 11. CHAPTER BRIEF GENERATION

Before writing each chapter, generate an internal chapter brief.

The chapter brief must include:
- Purpose of the chapter
- Reader knowledge before the chapter
- Reader knowledge after the chapter
- Facts or concepts that must be explained
- Required examples
- Required exercises
- Important terminology
- Information already covered in earlier chapters
- Topics reserved for later chapters
- Continuity notes
- Target length
- Required calls to action
- Tone requirements
- Claims requiring verification

This chapter brief should prevent repetition and improve continuity.

Store chapter briefs in the database.

## 12. CHAPTER WRITING PROMPT

Use the following writing principles for every chapter:

Write Chapter [NUMBER]: [CHAPTER TITLE].

Requirements:
- Professional but conversational
- Original
- Practical and actionable
- Clear enough for beginners
- Valuable enough for intermediate readers
- Advanced concepts introduced progressively
- Short, readable paragraphs
- Natural headings
- Useful bullet lists only where appropriate
- Plain-language explanations
- Practical examples
- Realistic scenarios
- No filler
- No fake quotations
- No fake testimonials
- No invented research
- No unsupported statistics
- No repeated introduction material
- No excessive recaps
- No excessive motivational language
- No references to being an AI
- No mention of prompts or internal generation processes

Suggested chapter structure:
1. Chapter opening
2. Why the topic matters
3. Key concepts
4. Detailed explanation
5. Step-by-step implementation
6. Practical example or realistic scenario
7. Common mistakes
8. Pro tips
9. Frequently asked questions
10. Chapter summary
11. Action checklist
12. Exercises
13. Reflection questions
14. Key takeaways
15. Transition to the next chapter

Do not force every heading into every chapter when it would make the writing unnatural.

Target chapter length should be configurable.

Default: 3,500–5,000 words per core chapter

Long chapters must be generated in sections and then assembled.

Do not request a full 5,000-word chapter in one fragile API call.

Suggested chapter pipeline:
1. Generate chapter opening and core concepts.
2. Generate implementation sections.
3. Generate examples and case study.
4. Generate mistakes, tips, and FAQ.
5. Generate summary and exercises.
6. Assemble the chapter.
7. Run a chapter-level editing pass.

## 13. CONTINUITY ENGINE

Maintain a project-level "Book Bible."

The Book Bible must store:
- Book promise
- Target audience
- Tone
- Preferred terminology
- Definitions
- Key frameworks
- Named examples
- Case-study characters
- Previously discussed concepts
- Chapter summaries
- Claims used
- Tools mentioned
- Acronyms
- Style rules
- Topics still to be discussed
- Prohibited repetition

After every chapter:
1. Generate a concise chapter memory.
2. Update the Book Bible.
3. Send only the relevant continuity context to the next chapter.
4. Do not resend the entire manuscript unnecessarily.

This is important for controlling token usage and preventing contradictory content.

## 14. FACTUAL-ACCURACY CONTROLS

The application must distinguish between:
- General explanatory content
- Time-sensitive information
- Legal guidance
- Medical guidance
- Financial guidance
- Tax guidance
- Technical product specifications
- Regulations
- Platform policies

For high-stakes or time-sensitive material:
- Mark claims requiring verification.
- Avoid presenting generalized content as professional advice.
- Use cautious language where appropriate.
- Generate an appropriate disclaimer.
- Add visible editor notes for facts requiring manual verification.
- Never invent citations.

Create an optional "Research Mode."

When Research Mode is disabled:
- Do not fabricate sources.
- Use general, durable explanations.
- Add `[SOURCE VERIFICATION REQUIRED]` notes where current evidence is needed.

When Research Mode is enabled:
- Build the architecture so verified sources can later be retrieved through an approved search provider.
- Store source title, publisher, URL, date, and supported claim.
- Do not include a source unless it was actually retrieved.

The first version may implement Research Mode as an extensible provider interface.

## 15. ORIGINALITY AND COPYRIGHT SAFEGUARDS

The app must instruct the model to:
- Produce original language.
- Avoid mimicking the distinctive style of living authors.
- Avoid copying book structures too closely.
- Avoid generating summaries or companion books based on copyrighted works unless authorized.
- Avoid copyrighted characters, settings, branded frameworks, and trademark misuse.
- Avoid lyrics, poems, long quotations, and proprietary text.
- Never claim that the manuscript has passed a plagiarism database unless an actual plagiarism service was used.

Create an originality review that detects:
- Repeated phrases within the manuscript
- Repetitive examples
- Template-like chapter openings
- Overused transitions
- Duplicate paragraphs
- Suspiciously specific unattributed quotations

Label this review: "Internal Originality and Repetition Review"

Do not label it: "Certified Plagiarism Check"

Allow future integration with a third-party plagiarism-checking API.

## 16. QUALITY-ASSURANCE PIPELINE

Every manuscript should pass through multiple review stages.

**Chapter Review**

Score every chapter from 1–100 for:
- Clarity
- Depth
- Practical value
- Organization
- Audience fit
- Originality
- Readability
- Example quality
- Actionability
- Repetition control
- Tone consistency
- Transition quality

Minimum passing score: 85

If a chapter scores below 85:
1. Identify exact weaknesses.
2. Generate a revision brief.
3. Revise only the weak sections.
4. Re-score the chapter.
5. Allow a maximum configurable number of automatic revision attempts.

Default: Two automatic revision attempts

**Full Manuscript Review**

Check:
- Book promise is fulfilled
- Logical progression
- Chapter balance
- Missing topics
- Repetition
- Contradictions
- Terminology consistency
- Tone consistency
- Duplicate case studies
- Weak transitions
- Unsupported factual claims
- Incomplete exercises
- Missing front matter
- Missing back matter
- Formatting readiness

Produce:
- Overall score
- Section-level scores
- Issues found
- Automatic fixes made
- Items requiring human review

The manuscript must never be described as "KDP Ready" until the user approves the human-review checklist.

Use these labels:
- AI Draft Complete
- Quality Review Complete
- Human Review Required
- Approved for Export
- KDP Preparation Complete

## 17. FRONT MATTER

Generate configurable front matter:
- Half-title page
- Title page
- Copyright page
- Disclaimer
- Dedication
- Acknowledgments
- Table of contents
- Introduction
- How to use this book

**Copyright Page Template**

Include editable fields:
- Book title
- Author
- Copyright year
- Copyright holder
- Edition
- Publisher
- Rights statement
- Disclaimer statement
- ISBN placeholder
- Website

Do not create a false ISBN.

Use a placeholder when none is provided: `ISBN: [To be assigned]`

**Disclaimer Logic**

Generate a disclaimer only when appropriate.

Possible disclaimer categories:
- General educational
- Business
- Financial
- Legal
- Medical or health
- Technology
- Professional-services
- Results and earnings
- Affiliate disclosure

Never imply that a generated disclaimer replaces advice from a qualified attorney.

## 18. BACK MATTER

Generate:
- Conclusion
- Final action plan
- About the Author
- Short author bio
- Long author bio
- Review request
- Call-to-action page
- Bonus Resources page
- Other books by the author
- Reader community invitation
- Newsletter invitation
- Contact page
- Acknowledgments when placed at the end

Make all URLs editable.

Do not insert invented links.

Use placeholders when the user has not supplied a URL. Example: `[INSERT BONUS RESOURCE URL]`

## 19. AMAZON KDP OPTIMIZATION PACKAGE

Generate a separate KDP Marketing Package that includes:

**Market Positioning**
- Ideal customer profile
- Reader pain points
- Reader goals
- Purchase motivation
- Book promise
- Unique selling proposition
- Differentiation strategy

**Titles and Subtitles**

Generate:
- 10 SEO-conscious title options
- 10 subtitle options
- Recommended title and subtitle combination
- Explanation of the recommendation

Do not use:
- Misleading claims
- Unauthorized trademarks
- Competitor author names
- "Bestseller" unless factually earned
- Keyword stuffing
- Unverifiable superlatives

**Amazon Description**

Generate:
- Strong opening hook
- Reader problem
- Desired transformation
- Benefits
- What the reader will learn
- Scannable bullet points
- Ideal-reader statement
- Clear call to action

Provide:
- Plain-text version
- Amazon-compatible HTML version

**Keywords**

Generate:
- Primary keyword
- Secondary keywords
- Long-tail keyword ideas
- Reader-intent phrases
- Seven backend keyword-field suggestions
- Keywords to avoid

Do not promise real search volume unless the application has verified marketplace data.

Label AI-generated keywords as: "Keyword hypotheses requiring marketplace validation"

**Categories**

Generate category recommendations with:
- Category name
- Relevance
- Reader-intent fit
- Competition assumptions
- Validation note

Do not claim that categories are currently available without live verification.

**Pricing Strategy**

Generate recommended ranges for:
- Kindle launch price
- Kindle regular price
- Paperback
- Hardcover
- Promotional price

Include:
- Pricing rationale
- Royalty considerations
- Competitor-validation checklist
- International pricing reminder

Do not hard-code pricing as permanent Amazon policy.

**Launch Strategy**

Generate:
- Pre-launch checklist
- Launch-day checklist
- Week-one plan
- Week-two plan
- Week-three plan
- Week-four plan
- Review-generation strategy compliant with platform rules
- Email strategy
- Social-media strategy
- Amazon Ads starter ideas
- Long-term catalog strategy

**30-Day Marketing Plan**

Create one specific activity for each day.

Categories:
- Email
- Social media
- Short-form video
- Reader engagement
- Author platform
- Amazon listing optimization
- Bonus resources
- Cross-promotion
- Advertising
- Review follow-up

**Email Sequence**

Generate:
- Welcome email
- Pre-launch email
- Launch announcement
- Value email
- Behind-the-book email
- Reader follow-up
- Review request
- Bonus-resource email
- Related-book upsell
- Newsletter template

**Social Content**

Generate:
- 10 Facebook posts
- 10 Instagram captions
- 10 LinkedIn posts when relevant
- 10 X posts
- 10 Threads posts
- 10 Pinterest descriptions
- 5 short-form video scripts

**Amazon A+ Content**

Generate modular copy for:
- Hero module
- Problem and solution module
- Key benefit module
- Inside-the-book module
- Author module
- Feature comparison module
- FAQ module
- Closing CTA

Keep A+ content separate from the manuscript DOCX unless the user chooses to include it as an appendix.

## 20. DOCX GENERATION

Generate a professional `.docx` manuscript.

**DOCX Requirements**

Use proper Word styles:
- Title
- Subtitle
- Heading 1
- Heading 2
- Heading 3
- Normal
- Quote
- Bullet List
- Numbered List

Create:
- Title page
- Copyright page
- Optional disclaimer
- Dedication
- Acknowledgments
- Clickable table of contents or Word-compatible TOC field
- Proper chapter page breaks
- Consistent heading hierarchy
- Paragraph spacing
- Page numbers when appropriate
- Header and footer options
- About the Author
- Bonus Resources
- CTA page

Formatting defaults:
- Readable serif body font
- Professional sans-serif heading font
- 11- or 12-point body text
- 1.15–1.3 line spacing
- No excessive blank lines
- No manually typed page numbers in the table of contents
- No tracked changes
- No comments
- No hidden prompt text
- No internal generation metadata
- No markdown symbols in the final DOCX

Do not include markdown characters such as `#`, `##`, `**`, or triple backticks.

Convert all content into native Word formatting.

**Export Options**

Allow the user to choose:
1. Manuscript only
2. Manuscript plus KDP package
3. KDP package only
4. Full project archive

Recommended files:
- `[book-slug]-manuscript.docx`
- `[book-slug]-kdp-package.docx`
- `[book-slug]-quality-report.docx`
- `[book-slug]-project-data.json`

Optional ZIP:
- All exported files
- Cover brief
- Marketing assets
- Project metadata

## 21. MANUSCRIPT EDITOR

Create an in-app editor.

The user should be able to:
- Edit title and subtitle
- Edit front matter
- Edit chapters
- Edit back matter
- Edit marketing package
- Save changes
- Undo and redo
- Regenerate selected text
- Expand selected text
- Shorten selected text
- Rewrite tone
- Simplify selected text
- Add an example
- Add a checklist
- Run a quality review
- Lock approved sections

Do not overwrite user-edited content without warning.

Track content source:
- AI-generated
- User-edited
- AI-revised
- Approved

Create revision history for each section.

## 22. REGENERATION CONTROLS

Support granular regeneration.

The user can regenerate:
- Full book concept
- Subtitle
- Outline
- Individual chapter
- Individual section
- Example
- Case study
- Exercise
- FAQ
- Chapter summary
- Author bio
- Description
- Keywords
- Social posts
- A+ content

Before regeneration:
- Preserve the previous version.
- Show a comparison.
- Allow restore.
- Respect locked sections.

## 23. COST AND TOKEN CONTROLS

Build an API usage dashboard.

Track:
- Model
- Task
- Input tokens
- Output tokens
- Estimated cost
- Generation duration
- Retry count
- Project total
- User total

Allow administrator limits:
- Maximum words per project
- Maximum chapters
- Maximum automatic revisions
- Monthly token budget
- Per-user token budget
- Maximum concurrent jobs
- Model access by plan

Before starting a project, show an estimated cost range. Clearly label it as an estimate.

Do not expose internal chain-of-thought or hidden reasoning.

Store only necessary output, task summaries, and structured results.

## 24. FAILURE RECOVERY

Each generation stage must be resumable.

Store progress after every successful stage.

If generation fails at Chapter 7:
- Do not restart Chapters 1–6.
- Mark Chapter 7 as failed.
- Allow retry.
- Continue the pipeline after successful retry.

Implement:
- Exponential backoff
- Rate-limit handling
- Timeout handling
- Idempotent jobs
- Duplicate-job protection
- Structured error logs
- User-friendly error messages
- Administrator debugging information

Provide buttons:
- Retry step
- Resume generation
- Cancel job
- Restart failed chapter
- Export completed content

## 25. DATABASE DESIGN

Create Prisma models for at least: User, AuthorProfile, BookProject, BookDiscovery, Outline, Chapter, ChapterSection, BookBible, KdpPackage, QualityReview, GenerationJob, ApiUsage, PromptTemplate, Export, Revision.

(See full field lists in the original specification — id/timestamps plus the domain fields described in each section above: user auth fields; author profile fields; book project settings/status/progress/cost fields; structured JSON discovery/outline/book-bible data; chapter number/title/summary/word counts/status/lock/score; chapter section order/heading/content/source-type/version; KDP package titles/subtitles/description/keywords/categories/pricing/launch plan/marketing plan/email sequence/social content/A+ content; quality review type/score/issues/recommendations; generation job type/status/progress/attempt/error; API usage task/model/tokens/cost; prompt template name/version/system+user prompt/schema/active flag; export type/filename/path/size; revision entity/version/content/source.)

Use JSONB only where flexible structured data is genuinely appropriate.

Add indexes for: userId, bookProjectId, status, createdAt, chapterNumber, jobType.

## 26. ADMIN SETTINGS

Create an administrator panel for:
- OpenAI model assignments
- Prompt versions
- Default word counts
- Default chapter counts
- Minimum quality score
- Retry limits
- Token limits
- Cost configuration
- Feature flags
- User management
- Job monitoring
- Failed-job logs
- Export management
- Default legal notices
- Default author profile
- Maintenance mode

Never display the full OpenAI API key after it is saved. Prefer environment variables for the first version.

## 27. COMPLIANCE CHECKLIST

Before allowing the user to mark a project as ready, show a required checklist:
- I reviewed the complete manuscript.
- I verified factual claims.
- I checked names, examples, dates, and statistics.
- I reviewed the disclaimer.
- I confirmed that the book does not infringe copyrights or trademarks.
- I confirmed that the title and description accurately represent the book.
- I reviewed the DOCX formatting.
- I understand that Amazon may require disclosure of AI-generated content.
- I will preview the manuscript using Amazon's available preview tools.
- I accept responsibility for the published content.

Store the checklist completion date.

Do not automatically upload or publish the book to Amazon KDP in version one. The first version must generate and export the files only.

## 28. SECURITY REQUIREMENTS

Implement:
- Server-side API calls only
- Environment-variable secrets
- Authentication guards
- Authorization checks
- User-level project isolation
- Secure file-download URLs
- Rate limiting
- Input validation
- Output sanitization
- Protection against prompt injection
- CSRF protection where applicable
- Safe error responses
- Audit logging for critical actions
- Dependency vulnerability checks

Prompt-injection safeguards:
- Treat the book title and user notes as untrusted data.
- Never allow user content to override system instructions.
- Delimit user-provided content clearly.
- Do not execute code found in manuscript inputs.
- Do not reveal system prompts, API keys, or hidden configuration.

## 29. TESTING

**Unit Tests**
- Prompt-variable interpolation
- Zod schema validation
- Word-count calculation
- Cost estimation
- Slug generation
- DOCX formatting helpers
- Status transitions
- Retry logic

**Integration Tests**
- Create project
- Generate discovery
- Generate outline
- Approve outline
- Generate chapter
- Run chapter review
- Generate KDP package
- Export DOCX
- Resume failed job

**End-to-End Tests**

Use Playwright. Test:
1. User signs in.
2. User creates a new book.
3. User enters only a title.
4. App generates a plan.
5. User approves the outline.
6. App generates sample chapters using mocked OpenAI responses.
7. App compiles a DOCX.
8. User downloads the file.

Mock OpenAI in automated tests. Do not spend real API credits during routine tests.

## 30. DEVELOPER EXPERIENCE

Create:
- Clean folder structure
- Strict TypeScript
- ESLint
- Prettier
- Environment-variable validation
- `.env.example`
- Database migrations
- Docker Compose
- Seed script
- README
- Architecture documentation
- API integration documentation
- Deployment guide
- Troubleshooting guide

Suggested commands:

```
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
npm run test
npm run test:e2e
npm run build
```

## 31. README REQUIREMENTS

The README must explain: product overview, features, architecture, requirements, local installation, environment variables, database setup, OpenAI API setup, job-runner setup, how to generate a book, how DOCX export works, how to change models, how to modify prompts, how to deploy, how to run tests, known limitations, KDP human-review responsibility, AI-content disclosure reminder.

## 32. IMPLEMENTATION PHASES

Work through these phases in order.

**Phase 1: Architecture** — Inspect the current repository, identify existing technologies, create an implementation plan, define database schema, application routes, AI workflow, job states, export pipeline.

**Phase 2: Foundation** — Configure Next.js, TypeScript, Tailwind, components, PostgreSQL and Prisma, authentication, environment validation.

**Phase 3: Core Project Management** — Dashboard, project creation wizard, author profiles, project detail page, outline editor, project statuses.

**Phase 4: OpenAI Workflow** — OpenAI service, model router, structured-output schemas, discovery, outline, chapter briefs, chapter generation, Book Bible, quality reviews, KDP package.

**Phase 5: Job Processing** — Queue, retries, progress, resume, failure recovery, usage tracking.

**Phase 6: Editor** — Chapter editor, locking, revision history, section regeneration, quality reports.

**Phase 7: DOCX** — Manuscript formatting, KDP package formatting, quality report, download system.

**Phase 8: Testing and Documentation** — Unit tests, integration tests, end-to-end tests, README, deployment documentation.

## 33. CODING RULES

- Use production-quality code.
- Do not leave critical functionality as pseudocode.
- Do not create fake buttons.
- Do not use placeholder handlers for required features.
- Do not put all logic in one file.
- Use service and repository layers where useful.
- Keep components focused.
- Use typed interfaces.
- Validate all external input.
- Handle OpenAI errors explicitly.
- Add comments only where they provide real value.
- Avoid excessive abstraction.
- Prefer maintainability over cleverness.
- Do not expose secrets.
- Do not silently catch errors.
- Make the application usable after setup.

## 34. INITIAL MVP ACCEPTANCE CRITERIA

The MVP is complete only when all these conditions are met:

1. A user can register and log in.
2. A user can create an author profile.
3. A user can enter only an ebook title.
4. The application infers the niche and audience.
5. The application generates a structured book plan.
6. The user can approve or edit the outline.
7. The app generates chapters through queued OpenAI jobs.
8. The app tracks chapter progress.
9. Failed chapters can be retried.
10. The app generates front matter.
11. The app generates back matter.
12. The app generates the KDP optimization package.
13. The app performs quality reviews.
14. The user can edit generated content.
15. The user can download a valid DOCX manuscript.
16. The app records token usage and estimated cost.
17. The application builds without TypeScript errors.
18. Automated tests pass.
19. The README contains complete setup instructions.
20. No API key is exposed to the browser.

## 35. STARTING INSTRUCTION

Begin now. First:

1. Inspect the repository and existing files.
2. Summarize what is already present.
3. Create a concrete implementation plan.
4. Set up the project architecture.
5. Implement the application phase by phase.
6. Run tests after every major phase.
7. Fix all linting, type, build, and test errors.
8. Do not stop after creating the interface.
9. Continue until the working MVP meets the acceptance criteria.
10. At completion, provide:
    - Summary of implemented features
    - File structure
    - Setup commands
    - Required environment variables
    - Database migration instructions
    - OpenAI setup instructions
    - Deployment instructions
    - Test results
    - Known limitations
    - Recommended next development phase

Use reasonable assumptions when minor product details are missing. Prioritize a secure, functional, maintainable application over unnecessary visual complexity.
