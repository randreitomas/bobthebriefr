# BobTheBriefr

**IBM AI Builders Challenge — July 2026**  
Solo submission by Ralph Andrei Masangkay

> AI-powered event creative brief co-pilot for organizers. Describe your event; get a full production-ready creative brief in seconds.

---

## Live Demo

Deployed on Vercel → https://bobthebriefr.vercel.app/

## Demo Video

[Watch the 3-minute walkthrough →](#) _(YouTube unlisted / Loom link added before submission)_

---

## Problem Statement

Event organizers and creative teams spend hours writing briefs before production can begin — theme concepts, palettes, copy angles, sponsor decks, and logistics notes. The process is repetitive, inconsistent, and often the bottleneck between "we have an event idea" and "the team can start executing."

## Solution

**BobTheBriefr** takes a structured 6-field event intake and generates a complete creative brief covering five production sections. Organizers can compare three creative directions, merge two favorites, tune tone with sliders, regenerate individual sections, export to PDF, and revisit past briefs from local history.

## Challenge Theme

**July 2026 — Reimagine Creative Industries with AI**  
BobTheBriefr is a creative ideation platform and personalized creative assistant for the event production industry.

---

## What It Does

| Section | Output |
|---|---|
| **Theme Concept** | 2–3 sentence concept + 5 moodboard keywords |
| **Color Palette** | Primary / secondary / accent hex codes + rationale |
| **Copy & Messaging** | Tagline, headline, body copy angle |
| **Sponsor Deck** | Value proposition, audience snapshot, Bronze/Silver/Gold tier names |
| **Logistics Notes** | Venue type, 3 key production elements, risk watch-out |

### Key features

- **Single brief generation** — full 5-section brief from the intake form
- **Compare 3 directions** — parallel creative angles (Bold & Dramatic / Refined & Understated / Warm & Human)
- **Merge directions** — synthesize two directions into one brief
- **Per-section regenerate** — re-roll one section without touching the rest
- **Tone controls** — formality, energy, and industry sliders shape prompt tone
- **History** — last 20 briefs saved in `localStorage`
- **Export** — copy plain text or print/save as PDF

---

## How IBM Bob Was Used

Per the [challenge requirements](https://aibuilderschallenge-bob.bemyapp.com/#page-block-kqt38zuotlq), **IBM Bob is the primary development tool** used to build this project:

- **Architecture & scaffolding** — component structure, view state machine, and TypeScript types
- **Prompt engineering** — two-pass creative → schema enforcement pipeline and direction/merge prompts
- **UI/UX iteration** — hero page, direction picker, tone controls, and responsive layout
- **Code review & hardening** — error boundaries, JSON validation, API proxy, and security fixes

---

## AI Approach & Architecture

### IBM stack

| Technology | Role |
|------------|------|
| **IBM Bob** | Primary development co-pilot (required by challenge) |
| **IBM Granite** (`ibm/granite-4-h-small`) | Runtime foundation model (us-south); Tokyo Lite may use Llama fallback |
| **watsonx.ai** | Hosted inference + API |

Runtime inference uses **IBM Granite on watsonx.ai** via a server-side proxy so API keys never ship to the browser.

### Architecture diagram

```
User (React app)
     │
     ▼
/api/brief proxy  ──►  IBM IAM token  ──►  watsonx chat API
     │                         │
     │                         └── IBM Granite 3.8B Instruct
     ▼
validateBrief() → 5-section brief UI
```

### Two-pass pipeline

```
User fills form
     ↓
Pass 1 — Creative generation (temperature 0.8, Granite)
     ↓
Pass 2 — JSON schema enforcement (temperature 0, Granite)
     ↓
Validated JSON → React renders 5-section brief
```

Implemented in `src/lib/ibmBob.ts` · routed in `server/aiRouter.ts`.

### Multi-direction flow

Three parallel pipelines run with distinct creative angle hints. Users pick one direction or merge two via a synthesis prompt.

### Security & API keys

- `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` are **server-side only** (Vite middleware in dev + Vercel `/api/brief` in prod)
- No host API keys in the client bundle
- **Bring Your Own Key (BYOK)** — visitors paste their own watsonx credentials (API key + project ID + region); stored in `localStorage`, sent only with their requests
- AI output validated before render; HTML escaped in PDF export

### Public deployment: whose API gets used?

| Mode | Who pays / rate limits |
|------|------------------------|
| **Default (host keys)** | Everyone uses *your* watsonx Lite instance — fine for demos |
| **BYOK enabled** | Each user spends *their own* IBM Cloud quota |
| **Self-hosted** | Whoever deploys sets their own `.env` |

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **IBM Granite 3.8B Instruct** on **watsonx.ai**
- **IBM Bob** for AI-assisted development
- CSS custom properties (no UI framework)
- **Vercel** for deployment (SPA + serverless API proxy)

---

## Local Development

### Prerequisites

- Node.js 18+
- IBM Cloud account with [watsonx.ai Lite](https://cloud.ibm.com/registration)
- watsonx **project ID** + IBM Cloud **API key**

### watsonx setup (first time)

1. Register at [IBM Cloud](https://cloud.ibm.com/registration)
2. Create a **watsonx.ai** service (Lite plan)
3. Open [watsonx.ai](https://dataplatform.cloud.ibm.com/) → create or open a project
4. Copy **Project ID** from project settings
5. Create an [API key](https://cloud.ibm.com/iam/apikeys)
6. From the Philippines, use **Tokyo** (`jp-tok`) or **Sydney** (`au-syd`) endpoint

### Setup

```bash
git clone https://github.com/your-username/bobthebriefr
cd bobthebriefr
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `WATSONX_API_KEY` | IBM Cloud API key (**server-side**) |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID (**server-side**) |
| `WATSONX_URL` | Region endpoint (default: `https://jp-tok.ml.cloud.ibm.com`) |
| `WATSONX_MODEL` | Model ID (default: `ibm/granite-4-h-small`; Tokyo: `meta-llama/llama-3-3-70b-instruct`) |

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Troubleshooting watsonx

**`project_id is not associated with a WML instance`**

Your watsonx **project** exists but is not linked to a **watsonx.ai Runtime / Watson Machine Learning** service. Fix:

1. [IBM Cloud → Resource list](https://cloud.ibm.com/resources) — create **watsonx.ai** (Lite) if you do not have one. Note the **region** (e.g. Tokyo, Sydney).
2. Open [watsonx.ai](https://dataplatform.cloud.ibm.com/) → your project → **Manage** → **Services & integrations**.
3. Click **Associate service** → select your **Watson Machine Learning** / watsonx.ai instance → **Associate**.
4. Set `WATSONX_URL` to the **same region** as that service:

   | Region | `WATSONX_URL` |
   |--------|----------------|
   | Tokyo | `https://jp-tok.ml.cloud.ibm.com` |
   | Sydney | `https://au-syd.ml.cloud.ibm.com` |
   | Dallas | `https://us-south.ml.cloud.ibm.com` |

5. Restart `npm run dev` after updating `.env`.

**`Model ... was not found` / `model_not_supported`**

`ibm/granite-3-8b-instruct` is **deprecated**. Use `ibm/granite-4-h-small` instead.

**Tokyo (jp-tok) Lite** often has **no Granite models** in the catalog. Either:

- Set `WATSONX_MODEL=meta-llama/llama-3-3-70b-instruct` in `.env` (works on Tokyo today), or
- Create a **Dallas (us-south)** watsonx project + WML instance for Granite (`WATSONX_URL=https://us-south.ml.cloud.ibm.com`)

The server auto-tries fallback models if the configured one is unavailable.

Direct link (replace `YOUR_PROJECT_ID`):  
`https://dataplatform.cloud.ibm.com/projects/YOUR_PROJECT_ID/manage/services?context=wx`

### Production (Vercel)

1. Deploy the repo to Vercel
2. Set `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, and `WATSONX_URL` in environment variables
3. The `/api/brief` serverless function calls watsonx Granite

---

## Project Structure

```
src/
  components/
    HeroPage.tsx          # Landing page
    EventForm.tsx         # 6-field intake + demo presets
    BriefDisplay.tsx      # Renders all 5 brief sections
    BriefSection.tsx      # Section card with per-section Regenerate
    ColorPalette.tsx      # Hex swatches
    DirectionPicker.tsx   # Compare / merge 3 directions
    ToneControlsPanel.tsx # Formality / energy / industry sliders
    BriefHistory.tsx      # localStorage history panel
    LoadingBrief.tsx      # Skeleton loading + cancel
    ExportButton.tsx      # Copy + PDF export
    ErrorBoundary.tsx     # Catches render crashes
    ApiKeySettings.tsx    # BYOK: user watsonx credentials
  hooks/
    useBriefGeneration.ts # AI state, cancel, progress
  types/
    brief.ts              # Domain types
  lib/
    prompt.ts             # Prompt templates
    ibmBob.ts             # Two-pass AI pipeline client
    parseBrief.ts         # JSON parse + schema validation
    history.ts            # localStorage CRUD
    pdfExport.ts          # Print-to-PDF export
    escapeHtml.ts         # HTML escaping for PDF
    userKeys.ts           # BYOK localStorage helpers
  App.tsx                 # View orchestration
api/
  brief.ts                # Vercel serverless watsonx proxy
server/
  aiRouter.ts             # watsonx Granite routing
  watsonxAuth.ts          # IBM IAM token exchange
  briefPlugin.ts          # Vite dev middleware
```

---

## Judging Criteria

| Criterion | How BobTheBriefr addresses it |
|---|---|
| **Technical Execution** | Two-pass Granite pipeline with JSON validation; watsonx proxy with IAM auth; TypeScript throughout |
| **Innovation** | 3-direction compare + merge UX; tone controls; per-section regeneration |
| **Challenge Fit** | Directly targets creative industries — event production is a core creative workflow |
| **Feasibility** | Solo-buildable prototype; demo presets let judges evaluate in 10 seconds |
| **Real-World Impact** | Immediately usable deliverable for event organizers, agencies, and student orgs |
| **Best Use of Technology** | IBM Bob + Granite on watsonx |

---

## IBM SkillsBuild

Certificate: _(add link or image before submission)_

---

## Links

- [IBM Granite Community](https://github.com/ibm-granite-community)
- [watsonx.ai](https://cloud.ibm.com/registration)

---

*Built with IBM Bob · Powered by IBM Granite on watsonx · IBM AI Builders Challenge — July 2026*
