<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# KOK Practice — Agent Context

## What is this app?

Smart εξάσκηση για τον Κώδικα Οδικής Κυκλοφορίας (ΚΟΚ).
Driving licence theory practice app for the Greek road code exam.

## Stack

- **Next.js 16** + React 19 + TypeScript (strict)
- **Tailwind CSS 4** — utility-first, no component libraries except shadcn via `clsx` + `tailwind-merge`
- **Biome** — linter & formatter (single quotes, 2 spaces, semicolons, trailing commas ES5)
- **Supabase** — database + auth via `@supabase/ssr`
- **TanStack Query** — server state / data fetching on client
- **Zod + react-hook-form** — form validation
- **pnpm** — package manager, never use npm or yarn

## Project Structure

```
app/             Next.js App Router pages & layouts
  (exam)/        exam-taking routes (route group, no layout segment in URL)
  practice/      free practice mode
components/
  ui/            shared low-level UI primitives
lib/
  supabase/
    client.ts    browser client (use in Client Components)
    server.ts    server client (use in Server Components / Server Actions)
types/
  database.ts    Supabase DB types + convenience aliases
```

## Database Schema

Four tables in Supabase (project: vhamcqwzyuerbrgsijjw):

| Table  | Description |
|--------|-------------|
| `kateg` | Exam categories (Β car, Α moto, C truck, D bus, ADR) |
| `quest` | Questions — `qlang`: 1=Greek 2=English 3=Russian 4=Albanian |
| `answer` | 2-4 answers per question; `acorr=true` marks the correct one |
| `numbs` | Distribution matrix: how many questions to draw per page-group per category |

Key relations:
- `quest.qkateg → kateg.kcod`
- `answer.aqcod → quest.qcod` (CASCADE DELETE)
- `numbs.kcod → kateg.kcod`

## Exam Generation Logic

To create a random exam for category `kcod`:
1. Query `numbs` for `kcod` → get list of `(pcod, numb)` pairs
2. For each `pcod`, query `quest` where `qkateg=kcod AND qpag=pcod AND qlang=1`
3. Pick `numb` random rows
4. Load answers for each question from `answer`

## Coding Conventions

- **Imports at top of file** — no inline imports
- **Server Components by default** — add `'use client'` only when needed
- **Server Actions** in `actions/` folder, named exports, use `'use server'`
- **No `any`** in database-related code — use generated types from `types/database.ts`
- **Switch statements** over discriminated unions must have exhaustive `never` default
- **cn()** helper for merging Tailwind classes: `import { cn } from '@/lib/utils'`
- Prefer `async/await` over `.then()` chains
- Keep components under 200 lines; extract sub-components if needed
