# Peptide Compendium

A full-stack peptide reference application built with React 18 + Vite + Supabase. Provides a structured, searchable, and favoritable reference for peptide compounds — including mechanisms of action, dosing protocols, stacking guides, and 20 curated multi-peptide stack protocols.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Architecture](#database-architecture)
- [Feature Reference](#feature-reference)
- [Component Architecture](#component-architecture)
- [Authentication](#authentication)
- [Theming](#theming)
- [Local Development](#local-development)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 (Vite 5, JSX, no TypeScript) |
| Backend / database | Supabase (PostgreSQL + Auth + RLS) |
| Drag and drop | `@hello-pangea/dnd` (React 18 fork of react-beautiful-dnd) |
| Styling | Plain CSS custom properties (no Tailwind, no CSS-in-JS) |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Auth | Supabase Auth — email + PIN (`signInWithPassword`) |

---

## Project Structure

```
peptide-compendium/
├── src/
│   ├── App.jsx          # All React components (single-file architecture)
│   ├── styles.css       # All styles (CSS custom properties, data-theme)
│   ├── main.jsx         # Vite entry point
│   └── lib/
│       └── supabase.js  # Supabase client + all data fetching functions
├── schema.sql           # Full DB schema + seed data + addendums
├── index.html
├── vite.config.js
├── package.json
└── .env                 # Not committed — see .env.example
```

All React components live in a single `App.jsx` file. This is intentional — the app is self-contained and the component count is manageable without splitting into separate files.

---

## Database Architecture

### Tables

#### `categories`
Top-level navigation groupings shown in the sidebar.

| Column | Type | Description |
|---|---|---|
| id | TEXT PK | Slug identifier (e.g. `ghrp`, `repair`) |
| label | TEXT | Display name |
| color_hex | TEXT | Accent color for the category |
| icon | TEXT | Icon name string |
| sort_order | INTEGER | Default sort position |

#### `peptides`
One row per compound. Core reference data.

| Column | Type | Description |
|---|---|---|
| id | TEXT PK | Slug identifier (e.g. `ipamorelin`, `bpc157`) |
| category_id | TEXT FK | Primary category |
| cross_category_ids | TEXT | Comma-separated extra category IDs for cross-listing |
| name | TEXT | Display name |
| aka | TEXT | Aliases / trade names |
| class | TEXT | Peptide class (e.g. "Selective GHRP") |
| status | TEXT | Regulatory status (FDA-Approved / Research / Clinical Trials) |
| mechanism | TEXT | Full mechanism of action description |
| dosing | TEXT | Typical dose range |
| frequency | TEXT | Dosing frequency |
| cycle | TEXT | Recommended cycle length |
| route | TEXT | Administration route |
| notes | TEXT | Clinical notes and practical guidance |
| sort_order | INTEGER | Display order within category |

#### `benefits`
One row per benefit per peptide.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| peptide_id | TEXT FK | |
| benefit | TEXT | Benefit statement |
| sort_order | INTEGER | |

#### `side_effects`
One row per side effect per peptide.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| peptide_id | TEXT FK | |
| effect | TEXT | Side effect description |
| sort_order | INTEGER | |

#### `stack_items`
Stacking guidance for each peptide — what to combine with and what to avoid.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| peptide_id | TEXT FK | |
| type | TEXT | `'do'` or `'dont'` |
| item | TEXT | Compound or substance name |
| reason | TEXT | Rationale for the recommendation |
| sort_order | INTEGER | |

#### `popular_stacks`
Curated multi-peptide protocol definitions.

| Column | Type | Description |
|---|---|---|
| id | TEXT PK | Slug identifier (e.g. `gh_pulse`, `healing`) |
| name | TEXT | Stack display name |
| tagline | TEXT | Short descriptor shown in sidebar |
| description | TEXT | Full protocol rationale |
| sort_order | INTEGER | |

#### `stack_members`
Individual peptide roles within a popular stack.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| stack_id | TEXT FK → popular_stacks | |
| peptide_id | TEXT FK → peptides | |
| role | TEXT | `'Core'` or `'Optional'` |
| note | TEXT | Stack-specific dosing and timing note |
| sort_order | INTEGER | |

#### `user_favorites`
Persisted favorites for authenticated users.

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | UUID FK → auth.users | |
| fav_key | TEXT | Composite key: `{category_id}||{peptide_id}` |

### Row Level Security

All tables have RLS enabled. Public tables (`categories`, `peptides`, `benefits`, `side_effects`, `stack_items`, `popular_stacks`, `stack_members`) allow public SELECT. `user_favorites` restricts all operations to `auth.uid() = user_id`.

### Cross-Category Listing

Peptides appear in multiple categories without data duplication via the `cross_category_ids` TEXT column. The `fetchAll()` function filters peptides into each category by checking both `category_id` (primary) and the comma-separated `cross_category_ids` list.

Example: `ta1`, `ll37`, `nadplus` are cross-listed into `longevity`; `collagen` is cross-listed into `repair`.

---

## Feature Reference

### Categories (12 total)

| ID | Label | Description |
|---|---|---|
| `ghrp` | GH Secretagogues | Ghrelin mimetics — GHRP-2, Ipamorelin, MK-677, Hexarelin |
| `ghrh` | GHRH Analogs | Sermorelin, Mod GRF 1-29, CJC-1295 with/without DAC |
| `repair` | Tissue Repair | BPC-157, TB-500, GHK-Cu, KPV, ARA-290, Collagen |
| `fatloss` | Fat Loss & Metabolic | AOD-9604, Fragment 176-191, Semaglutide, Tirzepatide, Retatrutide |
| `neuro` | Cognitive & Neuro | Semax, Selank, Dihexa, NAD+, Cerebrolysin |
| `longevity` | Anti-Aging & Longevity | Epitalon, Thymalin, MOTS-c, Humanin, SS-31, TA-1, LL-37, NAD+ |
| `sexual` | Sexual Function | PT-141, Melanotan II, Kisspeptin-10 |
| `cardio` | Cardiovascular | SS-31, Humanin, Thymosin Alpha-1 |
| `skin` | Skin, Hair & Collagen | GHK-Cu, Matrixyl, Snap-8, Collagen |
| `diabetes` | Diabetes & Metabolic | Semaglutide, Tirzepatide, ARA-290, Retatrutide, C-Peptide |
| `menopause` | Menopause & Hormonal | PT-141, Kisspeptin-10, Epitalon, Thymalin, Oxytocin |
| `stacks` | Popular Stacks | 20 curated multi-peptide protocols |

### Popular Stacks (20 total)

| ID | Name | Members |
|---|---|---|
| `gh_pulse` | The GH Pulse Protocol | Ipamorelin + Mod GRF 1-29 |
| `healing` | The Wolverine Stack | BPC-157 + TB-500 |
| `longevity_duo` | The Longevity Duo | Epitalon + Thymalin |
| `cognitive` | The Cognitive Stack | Semax + Selank |
| `metabolic` | Metabolic Optimization | MOTS-c + Humanin + SS-31 |
| `fat_loss` | Fat Loss Protocol | Semaglutide + AOD-9604 + Ipamorelin |
| `glow` | The Glow Protocol | GHK-Cu + Collagen + Matrixyl + Snap-8 |
| `athlete` | The Athlete's Stack | BPC-157 + TB-500 + Ipamorelin + Mod GRF 1-29 |
| `gut_repair` | Gut Repair Protocol | BPC-157 + KPV + Collagen |
| `immune_defense` | Immune Defense Stack | Thymosin Alpha-1 + Thymalin + LL-37 |
| `sleep_recovery` | Sleep & Recovery Stack | Ipamorelin + MK-677 + Epitalon |
| `brain` | The Brain Stack | Dihexa + Semax + NAD+ |
| `neuroprotection` | Neuroprotection Protocol | Cerebrolysin + Semax + NAD+ |
| `recomposition` | Body Recomposition | Ipamorelin + Mod GRF 1-29 + Fragment 176-191 |
| `mens_vitality` | Men's Vitality Stack | Kisspeptin-10 + PT-141 + Ipamorelin |
| `womens_wellness` | Women's Wellness Stack | Oxytocin + PT-141 + Kisspeptin-10 + Epitalon |
| `cardiovascular` | Cardiovascular Protection | SS-31 + Humanin + Thymosin Alpha-1 |
| `diabetic_neuro` | Diabetic Neuropathy Stack | C-Peptide + ARA-290 |
| `full_longevity` | Complete Longevity Protocol | Epitalon + Thymalin + NAD+ + MOTS-c |
| `skin_hair` | Skin & Hair Stack | GHK-Cu + TB-500 + Collagen |

### Search

Global search filters across all categories simultaneously. Matches against peptide name, aliases, and class. Results are shown filtered per category in the sidebar; categories with zero matches are hidden. The search bar has a clear (×) button. Drag-and-drop reordering is disabled while a search is active.

### Favorites

- **Anonymous users:** favorites stored in `localStorage` under key `peptide_favs` as `{ "categoryId||peptideId": true }`.
- **Authenticated users:** favorites synced to the `user_favorites` Supabase table. On sign-in, local favorites are merged into remote — any local favorites not yet in the DB are uploaded automatically.
- Favorites are toggleable from the detail view (star button) and indicated by a star icon in the sidebar list.
- The sidebar has a FAVORITES filter toggle that restricts the sidebar to favorited compounds only. Drag-and-drop is disabled while the filter is active.

### Drag-and-Drop Category Reordering

Categories can be reordered by dragging the `⠿` grip handle on the left side of each category header. The reordered sequence is saved to `localStorage` under key `peptide_cat_order` and applied on every load. The drag handle is only shown when search and favorites filter are both inactive (since filtering changes the visible set).

Implementation detail: `handleDragEnd` uses the `visible` (filtered) category array — not the full `categories` array — to calculate the new order. This prevents index mismatches when categories are hidden by filters.

### Stacking Guide with Linked Peptides

Each peptide's detail view includes a stacking guide with two panels: "Stack With" (green) and "Avoid Combining" (red). Peptide names mentioned in stacking guide text are automatically parsed and rendered as clickable links. Clicking a linked peptide name opens that peptide's detail in a modal popup, allowing navigation across the compound graph without leaving the current view.

The `parseItemText()` helper tokenizes stacking guide text by matching all known peptide names (sorted longest-first to avoid partial matches) and wrapping matches in link buttons.

### Peptide Modal

When a peptide name is clicked from within a Popular Stack detail view or a stacking guide, the full peptide detail view opens in a modal overlay. The modal:
- Closes on backdrop click or Escape key
- Renders the full `DetailView` component (same as the main detail panel)
- Supports favoriting from within the modal
- Supports further navigation — clicking a peptide link inside the modal replaces the modal content

---

## Component Architecture

All components are defined in `src/App.jsx`.

```
App
├── LoadingScreen          — shown during initial data fetch or on error
├── Sidebar
│   ├── ThemeToggle        — Dark / Dim / Light selector
│   ├── DragDropContext    — @hello-pangea/dnd drag context
│   │   └── Draggable      — one per category
│   └── SidebarAuth        — email + PIN sign in / create account
├── BreadcrumbBar          — shows current category › compound; hamburger on mobile
├── DetailView             — main detail panel for a selected peptide
│   ├── SecLabel           — section divider with accent color line
│   ├── DosingCard         — dose / frequency / cycle / route cards
│   ├── StatusPill         — color-coded regulatory status badge
│   └── StackPanel         — "stack with" and "avoid combining" panels
├── StacksDetailView       — detail panel for a selected popular stack
│   └── stack-member cards — clickable peptide name + role badge + note
└── PeptideModal           — overlay wrapping DetailView for popup navigation
```

### Key Hooks

| Hook | Purpose |
|---|---|
| `useTheme()` | Reads/writes theme to `localStorage`; applies `data-theme` attribute to `<html>` |
| `useBreakpoint()` | Returns `'mobile'` / `'tablet'` / `'desktop'` based on window width |

### Key State (App)

| State | Description |
|---|---|
| `categories` | Full enriched data tree from `fetchAll()` |
| `orderedCategories` | `categories` re-sorted by user's saved drag order |
| `selectedKey` | Active peptide key (`{catId}||{peptideId}`) |
| `selectedPeptide` | Active peptide object |
| `selectedCategory` | Category object for the active peptide |
| `selectedStack` | Active popular stack object (mutually exclusive with selectedPeptide) |
| `favorites` | `{ [key]: boolean }` map — localStorage for anon, Supabase for auth |
| `popupPeptide` / `popupCategory` | Peptide shown in the modal overlay |
| `catOrder` | Saved drag order from localStorage |
| `user` | Supabase auth user object or null |

### Data Flow

```
Supabase DB
    │
    ▼
fetchAll()               — parallel fetch of all 7 tables, assembled in JS
    │
    ▼
categories[]             — each category has peptides[] or stacks[] attached
    │
    ├── orderedCategories (useMemo, sorted by catOrder)
    └── peptideLookup    (useMemo, name → {peptide, category} map for link parsing)
```

`fetchAll()` in `src/lib/supabase.js` runs 7 parallel Supabase queries, then assembles the data tree in memory:
- Each peptide gets `benefits[]`, `sideEffects[]`, `stackDos[]`, `stackDonts[]` arrays attached
- Each popular stack gets `members[]` attached with `peptide_name` resolved via an in-memory ID lookup
- Each category gets its peptides filtered in (by `category_id` or `cross_category_ids`)

---

## Authentication

Auth uses Supabase Auth with `signInWithPassword` / `signUp`. No magic links.

### Sign In Flow
1. User enters email + numeric PIN (4–6 digits)
2. `supabase.auth.signInWithPassword({ email, password: pin })` is called
3. On success, `onAuthStateChange` fires, `user` state is set, remote favorites are fetched and merged
4. On failure, error message shown; user can switch to Create Account mode

### Create Account Flow
1. User switches to Create Account mode via toggle link
2. Same email + PIN form, calls `supabase.auth.signUp({ email, password: pin })`
3. **Requires "Enable email confirmations" to be OFF in Supabase Auth settings** for instant sign-in

### Supabase Auth Setting Required
In Supabase Dashboard → Authentication → Settings → disable **"Enable email confirmations"** to allow instant account creation without email verification.

### Favorites Merge on Sign-In
When a user signs in, any favorites accumulated anonymously (in localStorage) are automatically synced to their account. The merge logic uploads any local key that isn't already in the remote DB, then replaces the local state with the full merged set.

---

## Theming

Three themes: `light` (default), `dim`, `dark`.

- Theme is stored in `localStorage` under `peptide_theme`
- First-time visitors get `light` mode
- Returning visitors get their last selected theme
- Applied via `data-theme` attribute on `<html>`; all colors are CSS custom properties scoped to `[data-theme="..."]` selectors in `styles.css`

---

## Local Development

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your Supabase URL and anon key

# 3. Set up the database
# Open schema.sql, paste the full contents into the Supabase SQL Editor, and run it.
# This creates all tables, RLS policies, and seeds all data.

# 4. Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These are prefixed with `VITE_` so Vite exposes them to the browser bundle. Do not prefix with `VITE_` any secret keys — the anon key is safe to expose as it is restricted by RLS.

### Schema Notes

`schema.sql` is structured as:
- **Base schema** — full table creation, RLS, and seed data. Run once on a fresh project.
- **Addendum 1** — cross-category column, user_favorites table, new categories and peptides
- **Addendum 2** — popular_stacks and stack_members tables, RLS, and initial 7 stacks
- **Addendum 3** — 13 additional stacks and all stack members

On an existing project, run only the relevant addendum sections — do not re-run the base schema as it drops and recreates all tables.

---

## Deployment

### Vercel (current hosting)

The project auto-deploys to Vercel on every push to `main`.

**Initial setup:**
1. Push repo to GitHub
2. Import repo in Vercel — framework will be auto-detected as Vite
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Leave Root Directory blank (project files are at repo root)
5. Deploy

**Build settings (auto-detected, no changes needed):**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Supabase

The Supabase database is shared between local development and production — both environments point to the same project. Schema changes must be applied manually via the Supabase SQL Editor.
