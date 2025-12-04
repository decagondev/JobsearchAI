# JobsearchAI – Fully Tickable Task List  
(Ready for GitHub Projects, Notion, Linear, or just copy-paste into a markdown file)

Copy this entire list into a `.md` file or your project tracker and start ticking!

### Epic 0 – Project Setup & Memory Bank (Do this first – unblocks everything)

#### PR 0-1: Initialize typed MemoryBank service
- [ ] Create `src/types/session.ts` – Session, UserProfile, Job interfaces  
- [ ] Create `src/lib/memoryBank.ts` – wrapper around IndexedDB  
- [ ] Add methods: saveSession, loadSession, updateSession, clearSession  
- [ ] Add schema migration for new 'sessions' store  
- [ ] Export singleton hook `useMemoryBank()`  
- [ ] Write Vitest suite for MemoryBank (mock IndexedDB)  
- [ ] Add MemoryBank usage example to README.md  

#### PR 0-2: Cursor IDE rules & conventions
- [ ] Create `.cursorrules` with 15+ project rules (SOLID, naming, hooks, Zod, shadcn)  
- [ ] Create `CONTRIBUTING.md` with PR template & Cursor instructions  
- [ ] Add custom ESLint rules for hook naming and Zod usage  

Epic 0 complete when all above are checked

### Epic 1 – Onboarding Wizard & Resume Upload (Safe for Dev A – start right after Epic 0)

#### PR 1-1: Multi-step onboarding layout
- [ ] Add `/onboarding` route with sub-routes (/step1, /step2, etc.)  
- [ ] Create `OnboardingLayout.tsx` with shadcn Progress bar  
- [ ] Create `useOnboardingProgress()` hook that uses MemoryBank  

#### PR 1-2: Steps 1 & 2 – Basics + Preferences
- [ ] Create `Step1Basics.tsx` (name, current title, years exp, salary)  
- [ ] Create `Step2Preferences.tsx` (remote/onsite, locations, tech stack, role keywords)  
- [ ] Create Zod schemas in `src/schemas/onboarding.ts`  
- [ ] Auto-save form data to MemoryBank on “Next”  

#### PR 1-3: Step 3 – Resume upload
- [ ] Create `ResumeUpload.tsx` component (drag-drop + file picker)  
- [ ] Support PDF + TXT (reuse existing parser)  
- [ ] Add fallback textarea for paste resume  
- [ ] On successful parse → store raw text as `resumeRaw` in MemoryBank  
- [ ] Show loading spinner + success toast  

#### PR 1-4: Step 4 – Review & start search
- [ ] Create `Step4Review.tsx` – summary cards of all collected data  
- [ ] Add “Start My Job Search” button → navigates to `/searching`  

### Epic 2 – AI Skills Extraction + Web Search (Safe for Dev B – start after Epic 1)

#### PR 2-1: Groq skills & experience extraction
- [ ] Create `src/lib/prompts/skillsExtraction.prompt.ts`  
- [ ] Create `useExtractSkills()` hook  
- [ ] Auto-run extraction after resume upload  
- [ ] Save `skills[]`, `seniority`, `domains[]` to MemoryBank  
- [ ] Add 5 example resume tests (mock Groq responses)  

#### PR 2-2: Tavily search integration
- [ ] Run `npm install tavily-js`  
- [ ] Create `src/lib/search/tavilyClient.ts` (singleton)  
- [ ] Add VITE_TAVILY_API_KEY to `.env.example`  
- [ ] Create `buildSearchQuery()` helper  
- [ ] Create `useJobSearch()` TanStack Query hook (max 10 results)  
- [ ] Cache raw job results + embeddings in MemoryBank & vectorDB  

#### PR 2-3: Auto-trigger search flow
- [ ] On “Start My Job Search” → trigger `useJobSearch`  
- [ ] Create `/searching` page with realtime progress UI (skeleton → results)  
- [ ] Navigate to `/dashboard` when search complete  

### Epic 3 – Dashboard, Matching & Prep Plans (Start after Epic 2)

#### PR 3-1: Vector similarity matching
- [ ] Add `findSimilarJobs(userEmbedding, limit = 8)` to vectorDB  
- [ ] Generate user embedding from skills + resume  
- [ ] Re-rank Tavily results by similarity score  
- [ ] Write unit tests for similarity ranking  

#### PR 3-2: Dashboard UI
- [ ] Create `/dashboard` route  
- [ ] Create `JobList.tsx` and reusable `JobCard.tsx`  
- [ ] Show match percentage badge on each card  
- [ ] Add “View Details” accordion (summary loads lazily)  

#### PR 3-3: Job summarization & personalized prep tasks
- [ ] Create `src/lib/prompts/jobSummaryAndTasks.prompt.ts`  
- [ ] Create `useGeneratePrepPlan(job)` hook (returns summary + tasks)  
- [ ] Create `PrepChecklist.tsx` with checkbox persistence in MemoryBank  
- [ ] Auto-generate plan when user expands a JobCard  

#### PR 3-4: Empty states & error handling
- [ ] Beautiful “No jobs found” empty state with suggestions  
- [ ] Global error boundary + toast on API failures  
- [ ] Retry button on search failure  

### Epic 4 – Job-Coach Chatbot Upgrade (Start after Epic 3)

#### PR 4-1: Inject job context into RAG chatbot
- [ ] On dashboard load → add all job snippets + resume to vectorDB context  
- [ ] Add “Job Coach” mode to existing SupportBot dropdown  
- [ ] Update system prompt to be job-coaching specific  

#### PR 4-2: Quick actions from JobCard
- [ ] Add buttons: “Mock interview”, “Tailor resume”, “Explain this job”  
- [ ] Click → opens chatbot with pre-filled prompt + correct context  

#### PR 4-3: Full session persistence
- [ ] On page unload → serialize MemoryBank + vectorDB to IndexedDB  
- [ ] On app load → restore full session (onboarding, jobs, tasks, chat)  

### Bonus Parallel Epics (Can be done anytime after Epic 0)

#### Epic 5 – UI Polish & Accessibility
- [ ] Dark mode toggle (already in shadcn – just expose it)  
- [ ] Keyboard navigation in wizard  
- [ ] All forms accessible (aria labels, focus states)  
- [ ] Responsive mobile layout fixes  

#### Epic 6 – Local Analytics & Feedback
- [ ] Track which jobs user clicks (local only)  
- [ ] Add thumbs up/down on AI summaries → store preference  
- [ ] “How useful was this?” modal after 3 tasks  

#### Epic 7 – Export & Share
- [ ] “Export My Plan” → generate beautiful PDF (use existing PDF tools)  
- [ ] Copyable markdown summary of top 5 jobs + tasks  
