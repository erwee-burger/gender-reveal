7XpBARziDx4KYXOv

# Pikkewyn Case File

A playful gender reveal teaser site for Bambi, Tahnee, and Pikkewyn.

The site is built as a small Vite + React app and is intended to be simple to update over the weeks leading up to the reveal. It uses a case-file theme, animated water, blue/pink colour teasing, swimming fish, a clickable gold fish, and a latest evidence section.

## Current Features

- Landing page with countdown to the reveal window: `7-13 June 2026`.
- Manual theme setting in `src/config.js`:
  - `balanced`
  - `blue-leaning`
  - `pink-leaning`
- Animated water background.
- 24 background fish:
  - 12 blue
  - 12 pink
- One clickable gold fish that shows a speech bubble.
- Princess Pikkewyn hero image with animated pink glitter background.
- Evidence log for weekly clues and suspicious updates.
- **Baby Pool** — on-site prediction form backed by Supabase. Lives on a second page reached via the "Join the Baby Pool" hero button. Guests guess gender, birth date, time, weight (0.1 kg steps), length, hair colour, eye colour, and name's first letter. Uniqueness enforced by name (case-insensitive, database constraint). Real-time duplicate name warning as you type. Coloured confetti blast on submission — blue for boy, pink for girl. Multiple people can submit from the same device.
- **Anonymous Guess Board** — public home-page insights backed by aggregate-only Supabase RPCs. Names, IDs, and raw prediction rows are not sent to the browser. Detailed charts only appear after at least 3 guesses.
- **Leaderboard** — built and ready (password-protected, BabyHunch-compatible 100-point scoring), currently hidden from the UI. Re-enable by restoring the import and section in `src/App.jsx`.

## Main Files

- `src/config.js` - main editable content, theme settings, and `poolConfig` (including `revealResult`).
- `src/App.jsx` - page structure and interactive elements.
- `src/styles.css` - visual design, animations, responsive layout.
- `src/lib/supabase.js` - Supabase client (reads env vars).
- `src/lib/scoring.js` - BabyHunch-compatible scoring logic.
- `src/components/PredictionForm.jsx` - baby pool submission form.
- `src/components/PredictionInsights.jsx` - anonymous aggregate guess board.
- `src/components/Leaderboard.jsx` - password-gated leaderboard.
- `supabase/prediction-insights.sql` - privacy-preserving RPCs and RLS policy update.
- `public/assets/` - image assets used by the site.
- `tests/landing.spec.js` - Playwright smoke tests.

## Local Development

Install dependencies:

```powershell
npm install
```

Start the dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Run end-to-end tests:

```powershell
npm run test:e2e
```

## Updating Content

Most day-to-day updates should happen in `src/config.js`.

To change the colour direction:

```js
theme: "blue-leaning"
```

To add future clues, add items to `evidenceLog`. Keep the newest clue first. The page uses the first item as the featured/latest evidence and treats older items as the archive.

### After the reveal

Fill in `poolConfig.revealResult` in `src/config.js`, then push to `main`. Vercel deploys automatically and the leaderboard instantly recalculates everyone's score.

```js
export const poolConfig = {
  revealResult: {
    gender: "girl",          // "boy" or "girl"
    birthDate: "2026-06-10", // YYYY-MM-DD
    birthTime: "14:23",      // HH:MM (24-hour)
    weightG: 3200,           // grams
    lengthCm: 51.0,          // centimetres
    hairColour: "brown",     // blonde | brown | black | red | bald
    eyeColour: "blue",       // blue | brown | green | hazel | grey
    nameLetter: "S"          // single uppercase letter
  }
};
```

## Production Deployment

Production is deployed through Vercel from GitHub.

The GitHub repository is:

```text
https://github.com/erwee-burger/gender-reveal
```

Vercel is connected to the GitHub repo. When changes are merged or pushed to `origin/main`, Vercel automatically builds and deploys the latest production version.

Expected Vercel settings:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: project root

The following environment variables are required. Set them in Vercel (**Settings → Environment Variables**) and in a local `.env` file (which is git-ignored):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co        ← base URL only, no trailing slash or /rest/v1/
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_LEADERBOARD_PASSWORD=your-secret-password
```

**Supabase setup** — create a project at [supabase.com](https://supabase.com), then run this SQL in the SQL Editor:

```sql
CREATE TABLE predictions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  name        TEXT NOT NULL,
  name_key    TEXT GENERATED ALWAYS AS (lower(trim(name))) STORED UNIQUE,
  gender      TEXT NOT NULL CHECK (gender IN ('boy', 'girl')),
  birth_date  DATE NOT NULL,
  birth_time  TIME NOT NULL,
  weight_g    INTEGER NOT NULL,
  length_cm   NUMERIC(4,1) NOT NULL,
  hair_colour TEXT NOT NULL,
  eye_colour  TEXT NOT NULL,
  name_letter CHAR(1) NOT NULL
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert once" ON predictions FOR INSERT WITH CHECK (true);
```

Then run `supabase/prediction-insights.sql` in the SQL Editor. This drops the old public read policy if it exists and adds:

- `get_prediction_insights()` — returns only anonymous aggregate counts.
- `prediction_name_exists(input_name text)` — returns only a boolean for the duplicate-name warning.

Copy the project URL and `anon` public key from **Project Settings → API** into your env vars.

## Recommended Workflow

Create a branch for changes:

```powershell
git switch -c my-change
```

Make edits, then verify:

```powershell
npm run build
npm run test:e2e
```

Commit and push:

```powershell
git add .
git commit -m "Describe the change"
git push -u origin my-change
```

Open a pull request into `main`. Once it is merged to `origin/main`, Vercel deploys it to production automatically.
