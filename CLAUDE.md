# CLAUDE.md — Ninjoku

## Project Overview

Standalone Naruto-themed daily puzzle web game ("dle") with three game modes. Built as a portfolio project — no backend required, fully client-side.

## Stack

- **React + Vite** — frontend framework
- **Tailwind CSS v4** — styling (utility classes only, no custom CSS)
- **TypeScript** — type safety
- No backend. All data is static JSON bundled at build time.

## Design

- **Design file**: `narutodle.pen` (Pencil MCP)
- **Theme**: "Konoha Scroll" — light mode, warm parchment tones
- **Accent colors**:
  - Classic mode: `#E85D04` (Naruto orange)
  - Grid mode: neutral (`#C8B89A`)
  - Pyramid mode: `#2D6A55` (Konoha forest green)
- **Background**: `#FBF4E3` (parchment)
- **Surface**: `#FFFCF5` (cream)
- **Text primary**: `#1A1209`
- **Text muted**: `#6B5B45` / `#5C4A35`
- **Border**: `#C8B89A`
- **Fonts**: Teko (all UI text — logo, headers, body, buttons), JetBrains Mono (data/numbers). Loaded via `@fontsource` (self-hosted, no Google Fonts dependency).
- **Dark theme**: designed but Konoha Scroll (light) is the primary

## Screens Designed

1. **Home** — landing, logo, daily counter, Enter button
2. **Mode Selection** — 3 cards (Classic, Grid, Pyramid) with difficulty toggles
3. **Classic Game** — character guess table with color-coded feedback
4. **Grid Challenge** — 3×3 grid with row/column criteria
5. **Pyramid Challenge** — pyramid of 10 cells with row criteria
6. **Results** — end-of-game stats
7. **How to Play Modal** — tabbed modal (Classic / Grid / Pyramid tabs)

---

## Game Modes

### 1. Classic — Character Guess

Wordle-style: guess the mystery Naruto character of the day.

**Difficulty:**
- **Casual**: 8 guesses
- **Pro**: 1 guess (one wrong = game over)

**Fields per guess (9 columns):**

| Field | Type | Feedback |
|---|---|---|
| Character | Name + image | — |
| Affiliation | Multi-value | Green (match) / Yellow (partial) / Red (no match) |
| Clan | Exact | Green / Red |
| Rank | Ordered | Green / Arrow up / Arrow down / Red |
| Nature Type | Multi-value | Green / Yellow / Red |
| Kekkei Genkai | Multi-value | Green / Yellow / Red |
| Arc of Debut | Ordered (saga order) | Green / Arrow up / Arrow down / Red |
| Gender | Exact | Green / Red |
| Status | Exact (Alive/Deceased) | Green / Red |

**Color feedback:**
- 🟢 Green = exact match
- 🟡 Yellow = partial match (some values overlap)
- 🔴 Red = no match
- ↑ Arrow up = target value is higher
- ↓ Arrow down = target value is lower

---

### 2. Grid Challenge

MovieGrid-style: fill a 3×3 grid where each cell needs a character matching BOTH its row AND column criteria.

**Rules:**
- 9 cells total
- Characters cannot be reused across the grid
- Rarity % shown per correct cell (how common that pick was)

**Difficulty:**
- **Casual**: unlimited guesses
- **Pro**: one wrong answer ends the game

**Grid criteria pool** (used as row/column labels):

| Category | Examples |
|---|---|
| Village/Affiliation | Konoha, Akatsuki, Sand, Mist... |
| Clan | Uchiha, Hyuga, Senju, Nara... |
| Rank | Genin, Chunin, Jonin, Kage, ANBU... |
| Nature Type | Fire, Wind, Lightning, Earth, Water... |
| Kekkei Genkai (reduced list) | Sharingan, Byakugan, Wood Release, Ice Release, Lava Release, Storm Release, Boil Release, Magnet Release, Scorch Release, Explosion Release, Crystal Release, Swift Release |
| Team | Team 7, Team 8, Team 10, Team Guy... |
| Role | Sensor, Medic, Jinchuriki, Puppeteer... |
| Transformation | Sage Mode, Tailed Beast Mode, Susano'o... |

Note: **Species removed** from grid criteria (too few named non-human characters).

---

### 3. Pyramid Challenge

MoviePyramid-style: fill a pyramid of 10 cells tier by tier.

**Structure:**
```
          [ ]           ← Row 1 (1 cell)  — 100 − rarity pts
        [ ][ ]          ← Row 2 (2 cells) — 125 − rarity pts
      [ ][ ][ ]         ← Row 3 (3 cells) — 150 − rarity pts
    [ ][ ][ ][ ]        ← Row 4 (4 cells) — 200 − rarity pts
```

**Rules:**
- Each row has a visible criterion (e.g. "Have Mangekyou Sharingan")
- Type/search a character for each cell
- **10 guesses exactly** — one per cell, no extras
- A wrong guess permanently wastes that guess
- No character can appear more than once
- **Pro mode only** — no casual difficulty

**Scoring:** `Points = Row bonus − rarity %`. Rarer picks score more.

---

## Difficulty System

| Mode | Casual | Pro |
|---|---|---|
| Classic | 8 guesses | 1 guess |
| Grid | Unlimited guesses | 1 wrong = game over |
| Pyramid | — | Only mode (10 exact guesses) |

The difficulty toggle (Casual / Pro) is embedded in each mode card on the Mode Selection screen. Pyramid shows a "PRO MODE ONLY" badge instead of a toggle.

---

## Character Data

**Source**: Dattebayo API (`dattebayo-api.onrender.com`) used as build-time data source only.

**Strategy**: Run a one-time script to fetch all characters → generate `src/data/characters.json` → ship statically. No runtime API calls.

**API field mapping:**

| Game field | API field |
|---|---|
| name | `name` |
| image | `images[0]` |
| affiliation | `personal.affiliation[]` |
| clan | `personal.clan` |
| rank | `rank.ninjaRank` (pick canonical rank) |
| natureType | `natureType[]` |
| kekkeiGenkai | `personal.kekkeiGenkai[]` |
| arcOfDebut | `debut.anime` → map episode → arc name (manual) |
| gender | `personal.sex` |
| status | Manual (not in API) |

**Manual curation needed:**
- `status` (Alive / Deceased) — add manually for ~150 main characters
- `arcOfDebut` — map episode numbers to arc names
- Filter out minor/unnamed characters

---

## Daily Puzzle System

- Same puzzle for all users each day (seeded by date)
- Use `YYYY-MM-DD` date string as seed for deterministic character/grid selection
- Rotation: cycle through a curated list of characters in pseudo-random order
- **No backend needed**: seed logic runs client-side

---

## Persistence (localStorage)

Keys to store:
- `narutodle_classic_YYYY-MM-DD` — today's Classic game state
- `narutodle_grid_YYYY-MM-DD` — today's Grid game state
- `narutodle_pyramid_YYYY-MM-DD` — today's Pyramid game state
- `narutodle_stats` — all-time stats (streak, wins, total plays per mode)
- `narutodle_difficulty` — last selected difficulty per mode

---

## Project Structure (planned)

```
Ninjoku/
├── narutodle.pen          # Pencil design file
├── CLAUDE.md
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data/
│   │   └── characters.json    # Static character data (generated)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Modal.tsx
│   │   ├── classic/
│   │   │   ├── ClassicGame.tsx
│   │   │   ├── GuessRow.tsx
│   │   │   └── FieldCell.tsx
│   │   ├── grid/
│   │   │   ├── GridGame.tsx
│   │   │   └── GridCell.tsx
│   │   ├── pyramid/
│   │   │   ├── PyramidGame.tsx
│   │   │   └── PyramidCell.tsx
│   │   └── shared/
│   │       ├── CharacterSearch.tsx
│   │       └── HowToPlay.tsx
│   ├── hooks/
│   │   ├── useDailyPuzzle.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── seed.ts            # Date-based puzzle seeding
│   │   └── feedback.ts        # Classic mode color feedback logic
│   └── styles/
│       └── index.css
├── scripts/
│   └── fetch-characters.ts    # Build-time data fetcher
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Code Conventions

- All code comments and strings in **English**
- Tailwind utility classes only — no custom CSS
- Functional components + hooks — no class components
- TypeScript strict mode
- No external state management library — React state + custom hooks only

## Communication

- Always respond in **Spanish** unless asked otherwise
