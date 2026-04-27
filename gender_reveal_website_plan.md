# Gender Reveal Website Plan

## Concept Overview
A simple, playful website that builds anticipation over ~5 weeks leading up to the reveal.

Tone: teasing, slightly mysterious, light humor.
Theme direction: "Case File / Investigation" (inspired by Bambi being an auditor).

Goal: give people a reason to return without overcomplicating the build.

---

## Landing Page (Homepage)

### Purpose
- Create intrigue immediately
- Establish countdown to reveal
- Direct users to 1–2 key actions

### Structure

#### 1. Headline

**The Baby Case File**  
*Bambi & Tahnee are expecting… but what are they expecting?*

Alternative tone options:
- *The Audit Is Underway… Boy or Girl?*
- *Classified: Baby Incoming*

---

#### 2. Countdown Timer

Displayed prominently:

**Reveal in:**  
`XX days · XX hours · XX minutes`

Purpose:
- Anchors the experience
- Gives urgency and reason to return

---

#### 3. Teaser Line

Short, playful, slightly absurd:

- *The evidence is inconclusive. The beagles are suspicious.*
- *Charlie and Bruce know something. They’re not talking.*
- *Experts remain divided. The dogs remain unhelpful.*

---

#### 4. Primary Actions (Buttons)

Keep this minimal:

- **Make Your Prediction** → leads to voting page
- **View Latest Clue** → leads to clue page

Optional later addition:
- **See All Guesses**

---

#### 5. Case File Section (Below the Fold)

Adds personality without complexity:

**Current Case Status**
- Suspects: Mum, Dad, Charlie, Bruce
- Evidence: questionable
- Reveal date: locked
- Public confidence: updating (can later reflect vote split)

---

## Core Pages

### 1. Voting Page (Team Boy vs Team Girl)

#### Purpose
- Main engagement driver
- Makes visitors feel invested

#### Features
- Two large options: **Team Boy** / **Team Girl**
- Show live percentage split
- Optional short message: "Why do you think so?"
- Lock voting after a chosen date (optional)

Keep it frictionless:
- No login
- One simple form

---

### 2. Clue Page

#### Purpose
- Drives repeat visits
- Builds suspense over time

#### Structure
- Display current week’s clue
- Archive previous clues below (optional)

#### Weekly Plan (5 weeks)
- Week 1: vague / generic
- Week 2: slightly directional
- Week 3: misleading or playful
- Week 4: almost revealing but ambiguous
- Week 5: strong tease without confirming

Clues should be:
- Short (1–2 lines)
- Not definitively solvable

---

### 3. Predictions Board

#### Purpose
- Adds personality
- Encourages sharing and comparison

#### Input fields
- Name
- Gender guess
- Baby name guess
- Birth date guess
- Weight guess (optional)

#### Display
- Simple list or table
- No sorting needed initially

---

### 4. Optional: Mini Quiz

#### Purpose
- Light entertainment
- Reinforces personality of parents

#### Example questions
- Who is more likely to want a sporty child?
- Who would secretly prefer a girl?
- Which dog will be the favourite sibling?

#### Output
- "Your prediction: Boy / Girl"

---

## Reveal Day Behavior

On reveal day, replace the homepage entirely.

### New Content
- Simple animation (balloon pop, paint splash, etc.)
- Clear message:

**It’s a BOY!** or **It’s a GIRL!**

Optional:
- Keep predictions visible
- Highlight closest guesses

---

## Easter Egg (Optional)

Small hidden interaction for curious users:

Ideas:
- Hidden clickable area or keyword
- Fake "leak" message (ambiguous)
- Scrambled hint

Keep it simple and not critical to the experience.

---

## Suggested Site Structure

Keep this minimal:

- `/` → Landing page (countdown + teaser)
- `/vote` → Prediction (Team Boy/Girl)
- `/clue` → Weekly clue
- `/predictions` → Guess board
- `/quiz` (optional)

---

## Tech Approach (Keep It Lightweight)

### Option 1: No-code
- Carrd
- Webflow

### Option 2: Simple custom build
- Basic React (Vite)
- Static pages where possible

### Data handling
- Google Forms + Sheets (simplest)
- Firebase (if more control needed)

---

## Guiding Principles

- Keep interactions minimal
- Prioritise return visits over feature count
- Make everything feel slightly playful and mysterious
- Avoid anything that requires accounts or friction

---

## Next Step

Define the **voting page UX** in detail (layout + interaction flow).

