# AGENTS.md

EVE Online mining timer: a client-only Preact app that turns pasted survey scanner results into per-asteroid countdowns
and a cargo hold tracker. Deployed to GitHub Pages from `main`. See `README.md` for features and the mining formulas.

## Commands

- `npm run dev`: start the Vite dev server
- `npm run build`: typecheck and build into `docs/` (build output, don't edit)
- `npm run lint`: typecheck, oxlint (`--deny-warnings`) and prettier check in parallel
- `npm run lint:oxlint:fix` / `npm run lint:prettier:fix`: auto-fix lint and formatting
- `npm test`: run vitest (use `npx vitest run` for a single non-watch run)

CI runs `npm run lint` and `npm test` on every PR to `main`. Both must pass.

## Stack

- Preact + TypeScript, Vite with `@preact/preset-vite` (aliases `react` to `preact/compat` for zustand)
- Tailwind CSS v4, custom UI primitives in `src/components/ui/` (no component library)
- State in zustand stores with `persist` (`src/utils/use-*-store.ts`)
- Icons are local SVGs in `src/assets/icons/`, rendered with `src/components/ui/icon.tsx`

## Layout

- `src/components/`: app components, `src/components/ui/` for reusable primitives
- `src/config/ores.ts`: ore definitions (unit volume, compression ratio, name mapping)
- `src/utils/mining-math.ts`: per-cycle yield, crit and residue math
- `src/utils/mining-sim.ts`: simulation for the low/high (mean ± 1σ) ranges
- `src/utils/parse-scanner-result/`: survey scanner paste parser
- `src/utils/use-global-store.ts`: ore rows, cargo, timers, undo
- `research/`: background research and sources for the game mechanics

## Conventions

- Prettier: no semicolons, single quotes, trailing commas, 120 char width, tailwind class sorting
- Kebab-case file names, tests next to the source as `*.spec.ts`
- Import local files with the `.ts` / `.tsx` extension
- Keep comments short and lowercase, explaining why rather than what
- Mining mechanics follow the post-Catalyst (Nov 2025) rules. When changing the math, update `README.md`, the tests and
  the research notes if the formulas change
