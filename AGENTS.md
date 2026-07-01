<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PromptPilot

A modern **AI Prompt Workspace** — not a commodity prompt generator. The moat is the
compounding prompt **library**: prompts saved as reusable, versioned *recipes* with
`{variable}` tokens. "Chat in → recipe out → re-run forever." Wedge user: content
creators & marketers. Managed AI (we hold the keys). Freemium, metered per generation.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first config; tokens live in `src/app/globals.css` `@theme`)
- **Prisma 6** + **PostgreSQL** — pinned to 6 deliberately (Prisma 7 ships a breaking
  driver-adapter config; revisit later). Classic `url = env("DATABASE_URL")`.
- **Auth.js v5** (`next-auth@beta`) + `@auth/prisma-adapter`
- **@anthropic-ai/sdk** — Claude is the default managed model, key server-only
- `zod` (input validation), `lucide-react` (icons), `cva` + `clsx` + `tailwind-merge`

## Two load-bearing architecture rules

1. **Everything is Workspace-scoped** — even solo users get a `PERSONAL` workspace.
   Teams/sharing become additive, never a rewrite.
2. **Prompts are immutable-versioned** — `Prompt` (identity) + `PromptVersion`
   (snapshot: template + variables JSON + model config). Editing = new version;
   `Prompt.currentVersionId` points at the live one. Unlocks history/optimizer/A-B/
   evaluator with no schema change. See `prisma/schema.prisma` (fully commented).

## Request-flow conventions

- **Reads**: Server Components → `src/server/data/*` (every query takes `workspaceId`;
  components never call Prisma directly). *(data layer not built yet)*
- **Mutations** (save, star, edit→new version, archive): **Server Actions** in
  `src/server/actions/*`.
- **Generation only**: a **Route Handler** at `/api/prompts/generate` that streams
  tokens (`ReadableStream`). Metering (`UsageCounter` vs plan) is enforced here,
  server-side — never trust the client.

## Folder map (`src/`)

```
app/(app)/{library,create,p/[slug],settings}   authenticated app; (app)/layout = sidebar shell
app/api/prompts/generate                        streaming generation (todo)
components/ui/       design-system primitives: button, card, badge, tag, input, var-token
components/prompt/   prompt-card, template-preview
components/layout/   sidebar, usage-meter, mark
lib/                 utils(cn), variables(parse {tokens}), mock-data (temp), ai/*(todo)
server/              context, data/, actions/  (todo)
```

## Design system (locked)

- **Neutrals**: warm paper ground `#FBFAF7`, ink `#1B1E1C`. **One accent**: deep pine
  `#1F6F5C` (+ `mint` `#E4F0EB` soft). Semantic amber/gold kept separate from accent.
- **Type**: `font-serif` (system serif) for editorial headings; `font-sans` (system)
  for UI; **`font-mono` (Cascadia/Consolas) for every prompt/template** — the recurring
  brand motif. No web fonts (system stacks; zero load latency).
- **The motif**: `{variable}` renders via `<VarToken>` as a mint mono pill — same in
  the library, cards, and (later) run fields.
- Tokens are Tailwind utilities: `bg-ground bg-surface text-ink text-ink-2 border-hairline
  bg-accent text-accent bg-mint`, `rounded-sm/md/lg`, `shadow-sm/md/lg`.

## Commands

```
npm run dev      # dev server (Turbopack)
npm run build    # production build + typecheck
npx prisma generate | migrate dev | studio
```

## Build sequence (status)

1. ✅ Positioning, scope, design system (see the visual preview artifact)
2. ✅ Data model (`prisma/schema.prisma`)
3. ✅ Scaffold + design tokens + UI primitives + **Library** shell (mock data)
4. ⬜ **Next**: Auth.js + DB wiring (Prisma client, session, `getCurrentWorkspace`)
5. ⬜ Create flow (conversational generator + streaming `/api/prompts/generate`)
6. ⬜ Save/run/version server actions; swap mock data for `server/data`
7. ⬜ Freemium metering enforcement; Settings/usage
