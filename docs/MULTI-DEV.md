# JobsearchAI – Full Task List for Modular, Conflict-Free Development  
(Designed for 1–4 developers or AI agents to work in parallel with ZERO merge conflicts)

| Epic | Can Start In Parallel? | Blocks Other Epics? | Key Files That Must NOT Be Touched by Others While This Epic Is Active | Recommended Team Split |
|------|-------------------------|----------------------|--------------------------------------------------------------------------|-------------------------|
| Epic 0 | Always first – unblocker | No | `src/lib/storage.ts`, `src/lib/vectorDB.ts`, `.cursorrules`, `CONTRIBUTING.md` | Solo or lead dev |
| Epic 1 | After Epic 0 | No | `src/pages/onboarding/`, `src/components/resume/`, `src/lib/storage.ts` (only additions) | Dev A |
| Epic 2 | After Epic 1 | No | `src/lib/groqClient.ts`, `src/lib/searchClient.ts`, `src/hooks/useSkillsExtractor.ts`, `src/hooks/useJobSearch.ts` | Dev B (can start day 2–3) |
| Epic 3 | After Epic 2 | No | `src/pages/dashboard/`, `src/components/job/`, `src/lib/vectorDB.ts` (matching logic) | Dev A or C |
| Epic 4 | After Epic 3 | No | `src/components/SupportBot.tsx`, `src/lib/rag.ts` | Dev B or C |

Now the complete, atomic, conflict-free task list:

### Epic 0 – Project Memory Bank & AI-Dev Tooling (Blocker – Do First)

**PR 0-1: Initialize typed MemoryBank service**  
Commits & subtasks (all touch only `src/lib/storage.ts` and new files):
- [chore] Add `src/types/session.ts` – define `Session`, `UserProfile`, `JobCache` interfaces
- [feat] Create `src/lib/memoryBank.ts` – wrapper around existing IndexedDB with methods: `saveSession`, `loadSession`, `updateSession`, `clearSession`
- [feat] Add session schema migration in IndexedDB init
- [refactor] Export MemoryBank as singleton hook `useMemoryBank()`
- [test] Add vitest suite for MemoryBank (mock IDB)
- [docs] Document MemoryBank API in README.md

**PR 0-2: Cursor IDE rules & conventions**  
Commits (no code conflicts):
- [chore] Add `.cursorrules` with 15+ project-specific rules (naming, SOLID, hooks, shadcn, Groq patterns)
- [chore] Add `CONTRIBUTING.md` with PR template and “How to ask Cursor to create a PR from this list”
- [chore] Add ESLint custom rules for hook naming and Zod usage

Epic 0 complete → unblocks everything else

### Epic 1 – Onboarding Wizard & Resume Upload (Safe for Dev A)

**PR 1-1: Multi-step onboarding route & progress tracker**
- [feat] Add `/onboarding` route with 4 steps in `src/pages/onboarding/`
- [feat] Create `OnboardingLayout.tsx` with progress bar (shadcn Progress)
- [feat] Add `useOnboardingProgress()` hook (stores step in MemoryBank)

**PR 1-2: Step 1 & 2 – User basics + job preferences**
- [feat] `Step1Basics.tsx` – name, current title, years exp, target salary
- [feat] `Step2Preferences.tsx` – remote/onsite, locations, role keywords, must-have tech
- [feat] Zod schemas in `src/schemas/onboarding.ts`
- [feat] Auto-save to MemoryBank on “Next”

**PR 1-3: Step 3 – Resume upload & text input**
- [feat] `ResumeUpload.tsx` – drag-drop, PDF + TXT support (reuse existing parser)
- [feat] Fallback textarea for paste resume
- [feat] On upload → parse → store raw text in MemoryBank as `resumeRaw`
- [ui] Add loading spinner + success toast

**PR 1-4: Step 4 – Review & confirm**
- [feat] Summary card of all entered data
- [feat] “Start Job Search” button → navigates to `/searching` loading page

No file overlap with Epic 2 → can run fully in parallel after Epic 0

### Epic 2 – AI Extraction + Web Search (Safe for Dev B – starts after Epic 1)

**PR 2-1: Groq skills & experience extraction**
- [feat] Add `src/lib/prompts/skillsExtraction.prompt.ts`
- [feat] Create `useExtractSkills()` hook (uses Groq + existing client)
- [feat] On resume parse complete → auto-run extraction → save `skills[]`, `seniority`, `domains[]` to MemoryBank
- [test] Mock Groq responses with 5 example resumes

**PR 2-2: Tavily search integration (chosen over Serper for AI-friendly results)**
- [chore] `npm install tavily-js`
- [feat] Create `src/lib/search/tavilyClient.ts` – singleton with API key from VITE_TAVILY_API_KEY
- [feat] Create `buildSearchQuery(skills, preferences)` helper
- [feat] Create `useJobSearch()` TanStack Query hook
  - Queries Tavily with 10 results max
  - Returns title, company, url, snippet
  - Auto-caches in MemoryBank + vectorDB (title + snippet embedded)

**PR 2-3: Auto-trigger search on onboarding complete**
- [feat] In final onboarding step, on “Start Search” → trigger `useJobSearch`
- [feat] Navigate to `/searching` page showing realtime progress (shadcn Skeleton → results)

No file conflicts with Epic 1 (different lib files

### Epic 3 – Dashboard, Matching & Prep Plans (Dev A or C – starts after Epic 2)

**PR 3-1: Vector similarity matching**
- [feat] Extend `vectorDB.ts` with `findSimilarJobs(userEmbedding, limit = 8)`
- [feat] On search complete → embed user skills → run similarity → reorder results
- [test] Unit tests with fake embeddings

**PR 3-2: Dashboard page & JobCard component**
- [feat] Create `/dashboard` route
- [feat] `JobList.tsx` + reusable `JobCard.tsx` (shadcn Card + Badge for match %)
- [feat] Show match score (cosine → %)
- [ui] “View Details” → opens accordion with full summary (generated next PR)

**PR 3-3: Groq job summarization & prep tasks**
- [feat] Add prompt `jobSummaryAndTasks.prompt.ts`
  - Input: job description + user skills
  - Output JSON: `{ summary: string, missingSkills: string[], tasks: Task[] }`
- [feat] `useGeneratePrepPlan(job)` hook
- [feat] Store tasks in MemoryBank per job
- [ui] `PrepChecklist.tsx` with checkbox persistence

**PR 3-4: Empty state & error handling**
- [ui] Beautiful empty state if no jobs found
- [feat] Global error boundary + toast on API failure

### Epic 4 – Job-Coach Chatbot Upgrade (Dev B or C – starts after Epic 3)

**PR 4-1: Inject job context into existing RAG chatbot**
- [feat] On dashboard load → add all job docs + user resume to vectorDB context
- [feat] Add new mode “Job Coach” in SupportBot dropdown
- [feat] System prompt: “You are an expert job coach. Use the provided job listings and user resume…”

**PR 4-2: Quick actions from JobCard**
- [feat] Buttons on JobCard: “Mock interview for this job”, “Improve my resume for this role”
- [feat] Click → opens chatbot with pre-filled prompt and correct context

**PR 4-3: Session persistence**
- [feat] On page unload → serialize entire MemoryBank + vectorDB to IndexedDB
- [feat] On load → restore and continue exactly where user left

### Bonus Parallel Epics (Can be done anytime after Epic 0)

**Epic 5 – UI Polish & Accessibility** (any dev, no conflicts)
**Epic 6 – Analytics & Feedback Loop** (local storage only)
**Epic 7 – Export & Share** (generate PDF report of jobs + plan)

This structure guarantees:
- Zero merge conflicts if followed
- 2–3 developers can work at full speed from day 2
- Every PR is <300 LOC and fully testable
- Cursor or any AI agent can execute any PR end-to-end with the subtask list
