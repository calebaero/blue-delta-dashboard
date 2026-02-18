# CLAUDE.md — Blue Delta Jeans Dashboard Demo

## Architecture
- Vite 6 + React 19 + TypeScript (strict mode)
- All code in `src/`, entry at `src/main.tsx`
- Use `@/` path alias (mapped to `src/` in tsconfig and vite config)

## UI & Styling
- shadcn/ui for ALL UI components — never hand-roll what shadcn provides
- Tailwind CSS v4 with `@tailwindcss/vite` plugin — utility classes only
- No separate CSS files except `src/index.css` for Tailwind imports and CSS variables
- Lucide React for all icons (shadcn default icon set)
- Brand primary color: indigo-700 (#4338ca) — use for active states, primary buttons, sidebar accents
- Brand accent: slate-800 (#1e293b) — use for headings and emphasis
- Support dark mode via shadcn theme toggle (class-based)

## State Management
- Zustand for global state — one store file per domain in `src/stores/`
- Each store has typed state + actions for CRUD operations
- All data is in-memory mock data — no backend, no API calls, no localStorage
- Mock data generated at app initialization from seed functions in `src/data/`

## Routing
- React Router v7 with `createBrowserRouter`
- URL-driven navigation: `/customers`, `/customers/:id`, `/customers/:id?tab=measurements`
- All routes defined in `src/router.tsx`

## Data
- @faker-js/faker with `faker.seed(42)` for reproducible mock data
- All TypeScript interfaces in `src/data/types.ts`
- Generator functions in separate files under `src/data/`
- Relational integrity: every foreign key reference must resolve to a real record

## Charts
- Recharts for all charts and visualizations
- Use ResponsiveContainer wrapper on every chart
- Consistent color palette across all charts

## Tables
- TanStack Table v8 with shadcn/ui DataTable recipe
- Include column sorting, filtering, and pagination on all data tables

## Code Style
- Functional components only — no class components
- Named exports for components, default exports for pages
- No `any` types — use proper TypeScript interfaces
- Collocate related hooks in `src/hooks/`
- Utility functions in `src/lib/utils.ts`

## What NOT to do
- No Redux, no Context API for global state
- No CSS modules, no styled-components, no Emotion
- No Next.js patterns (no "use server", no server components, no API routes)
- No real API calls or fetch to external services
- No localStorage or sessionStorage
- No class components
- No inline styles (use Tailwind)