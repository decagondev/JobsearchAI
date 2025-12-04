# Product Requirements Document (PRD): JobsearchAI

## Overview
**Product Name**: JobsearchAI  
**Version**: 1.0 (MVP - Front-End Only)  
**Description**: JobsearchAI is an AI-powered web application designed to assist technical job seekers in discovering, analyzing, and preparing for relevant job opportunities. Users upload their resume, provide additional details (e.g., preferred roles, locations, experience level), and the app leverages AI (via Groq SDK) to extract skills, search the web for matching jobs (using Tavily or Serper API), summarize opportunities, and generate personalized preparation tasks. The app builds on an existing starter repository with a chatbot featuring RAG capabilities, preserving and extending it for job-specific interactions.  

All functionality is front-end only for MVP, using IndexedDB for persistence, in-memory vector storage for caching, and client-side API calls. Post-MVP considerations (e.g., backend for scalability) are out of scope.  

**Key Principles**:  
- **Leverage Existing Stack**: Reuse shadcn-style UI components, Tailwind CSS 4, Vite + React + TypeScript, React Router, Groq SDK, PDF.js parsing, in-memory vectorDB, and IndexedDB storage. Extend the chatbot (`SupportBot.tsx`) for job search RAG queries.  
- **SOLID Adherence**: Single Responsibility (e.g., separate parsers from search logic), Open-Closed (extensible hooks for new search providers), Liskov Substitution (interchangeable AI models), Interface Segregation (focused hooks), Dependency Inversion (abstract services like search APIs).  
- **User-Centric Flow**: Step-by-step wizard for data gathering → Web search → AI analysis → Recommendations. In-memory caching via vectorDB to avoid redundant API calls.  
- **Extensibility**: Modular design for adding backend later (e.g., abstract storage layers).  

**Target Users**: Technical job seekers (e.g., software engineers) with resumes in PDF/TXT format.  
**Success Metrics**: User completion rate of prep tasks, session retention, feedback on job relevance (tracked via local analytics if added post-MVP).  

**Tech Additions (Minimal)**:  
- Tavily or Serper API client (via npm, client-side).  
- Zod for schema validation.  
- TanStack Query for API caching/state.  
- No new heavy deps; use existing parsers and vectorDB.  

**Assumptions/Constraints**:  
- API keys (Groq, Tavily/Serper) stored in `.env` and handled client-side (warn users on security).  
- Web searches limited to 10-20 results per query for cost/efficiency.  
- No user auth; session-based via IndexedDB.  

## High-Level User Flow
1. **Onboarding**: Landing page → Form for role preferences, location, etc.  
2. **Resume Upload**: Parse PDF/TXT → Extract skills/experience via Groq.  
3. **Search & Match**: Query web for jobs → Embed & match via vectorDB → Summarize top 5-10.  
4. **Recommendations**: AI generates prep tasks (e.g., "Practice LeetCode on X topic").  
5. **Chatbot**: RAG-enhanced chat for follow-ups (e.g., "Mock interview on this job").  
6. **Persistence**: Save session data in IndexedDB; resume embeddings in vectorDB cache.  

## Epics Breakdown
Epics are grouped by phase, with PRs (pull requests) as major deliverables, commits as atomic changes, and subtasks for implementation details. Each PR includes tests (Vitest, existing setup) and follows SOLID. Designed for AI-assisted building (e.g., Cursor IDE) via clear, modular specs.  

### Epic 0: Development Setup & Tooling (Initialize Memory Bank & Cursor Rules)
**Description**: Establish project memory (session state management) and AI-coding guidelines. Leverage existing `storage.ts` (IndexedDB) for a "memory bank" to track user sessions/jobs. Add `.cursorrules` for Cursor IDE to enforce conventions.  
**Priority**: P0 (Blocker).  
**Effort**: 1-2 days.  
**Dependencies**: None (starter repo).  

#### PR 1: Initialize Memory Bank Service
- **Description**: Abstract IndexedDB into a typed "MemoryBank" service for session data (e.g., user profile, job cache). Extend existing `storage.ts`.  
- **Acceptance Criteria**:  
  - CRUD ops for sessions (e.g., save/load user skills).  
  - Type-safe with TS interfaces.  
  - Integrates with vectorDB for embedding persistence.  
- **Commits/Subtasks**:  
  1. **[feat] Add MemoryBank interface**: Define TS types for session (e.g., `{ userId: string, skills: string[], jobs: Job[] }`). Subtask: Update `lib/storage.ts` with new methods (`saveSession`, `loadSession`).  
  2. **[refactor] Extend IndexedDB wrapper**: Add schema migration for 'sessions' store. Subtask: Use IDBKeyRange for queries; test with Vitest.  
  3. **[test] Add MemoryBank unit tests**: Cover edge cases (e.g., empty DB). Subtask: Mock IDB; assert data round-trip.  
  4. **[docs] Update README**: Add MemoryBank usage example.  

#### PR 2: Add Cursor Rules & Conventions
- **Description**: Create `.cursorrules` file for AI-assisted coding, enforcing SOLID, naming (e.g., PascalCase components), and stack patterns.  
- **Acceptance Criteria**:  
  - Rules cover existing patterns (e.g., hooks for services).  
  - Includes prompts for generating PRs/epics.  
- **Commits/Subtasks**:  
  1. **[chore] Create .cursorrules**: Define rules like "Use Zod for props validation; Prefer TanStack Query for state." Subtask: Include SOLID examples.  
  2. **[docs] Add CONTRIBUTING.md**: Link to rules; outline epic/PR flow. Subtask: Template for AI-generated code.  
  3. **[chore] Enforce via ESLint**: Add rules for naming/conventions. Subtask: Update `.eslintrc`.  

### Epic 1: User Onboarding & Data Gathering
**Description**: Build step-by-step form wizard for user input (preferences, experience). Store in MemoryBank. Reuse React Router for multi-step pages; shadcn forms.  
**Priority**: P1.  
**Effort**: 3-4 days.  
**Dependencies**: Epic 0.  

#### PR 1: Onboarding Wizard Components
- **Description**: Add `/onboarding` route with steps (Step1: Basics, Step2: Preferences). Use existing `ui/` for forms.  
- **Acceptance Criteria**:  
  - Validates input with Zod.  
  - Saves partial data to MemoryBank on step change.  
- **Commits/Subtasks**:  
  1. **[feat] Add OnboardingPage.tsx**: Router setup in `pages/`. Subtask: Use `useNavigate` for steps.  
  2. **[feat] Create form steps**: `Step1Basics.tsx` (name, location); integrate shadcn `<Form>`. Subtask: Zod schema export.  
  3. **[feat] Integrate MemoryBank**: Hook to save/load form state. Subtask: Use `useEffect` for persistence.  
  4. **[test] Form validation tests**: Snapshot inputs.  

#### PR 2: Resume Upload & Initial Parsing
- **Description**: Extend existing `pdfParser.ts`/`fileParser.ts` for resume-specific extraction (skills, experience). Trigger on wizard completion.  
- **Acceptance Criteria**:  
  - Drag-drop UI with existing parsers.  
  - Basic text extraction; no AI yet.  
- **Commits/Subtasks**:  
  1. **[feat] Add ResumeUpload.tsx**: In wizard Step3; use `ui/` Button/Dropzone. Subtask: Handle file types (PDF/TXT).  
  2. **[refactor] Enhance parsers**: Add resume-specific regex (e.g., skills keywords). Subtask: Export typed `ResumeData`.  
  3. **[test] Parser edge cases**: Mock files; assert extracted sections.  

### Epic 2: AI Skills Extraction & Web Search Integration
**Description**: Use Groq to extract skills from resume/text. Integrate Tavily/Serper for job searches. Cache queries in vectorDB.  
**Priority**: P1.  
**Effort**: 4-5 days.  
**Dependencies**: Epic 1.  

#### PR 1: Groq-Powered Skills Extraction
- **Description**: Extend `groqClient.ts` with prompt for skill extraction. Embed results in vectorDB.  
- **Acceptance Criteria**:  
  - Outputs `{ skills: string[], experience: number }`.  
  - SOLID: Separate `useSkillsExtractor` hook.  
- **Commits/Subtasks**:  
  1. **[feat] Add skills extraction prompt**: In `lib/groqClient.ts`. Subtask: Chain to existing client.  
  2. **[feat] Create useSkillsExtractor hook**: In new `hooks/` dir. Subtask: Call on resume parse; embed via `vectorDB.ts`.  
  3. **[test] Mock Groq responses**: Assert parsed skills array.  

#### PR 2: Web Search Service
- **Description**: Add Tavily/Serper client (choose Tavily for AI-optimized searches). Abstract as service for extensibility.  
- **Acceptance Criteria**:  
  - Queries like "software engineer jobs remote Python skills".  
  - Returns job URLs/titles; cache embeddings.  
- **Commits/Subtasks**:  
  1. **[feat] Install & init Tavily client**: `npm i tavily-js`; env var setup. Subtask: Create `lib/searchClient.ts`.  
  2. **[feat] Add useJobSearch hook**: TanStack Query integration. Subtask: Embed results in vectorDB for RAG.  
  3. **[test] API mock**: Fake responses; test query building.  

### Epic 3: Job Matching, Summarization & Recommendations
**Description**: Match jobs via vector similarity; Groq summarizes and generates prep tasks. Display in dashboard.  
**Priority**: P2.  
**Effort**: 5 days.  
**Dependencies**: Epic 2.  

#### PR 1: Job Dashboard & Matching
- **Description**: New `/dashboard` route; list matched jobs with summaries.  
- **Acceptance Criteria**:  
  - Top 5 jobs via vectorDB similarity search.  
  - Reusable `JobCard` in `ui/`.  
- **Commits/Subtasks**:  
  1. **[feat] Add DashboardPage.tsx**: Router + query fetch. Subtask: Use existing `MarkdownRenderer` for summaries.  
  2. **[feat] Implement matching logic**: Extend `vectorDB.ts` with cosine similarity. Subtask: Hook `useJobMatcher`.  
  3. **[test] Similarity tests**: Mock embeddings; assert ranks.  

#### PR 2: Prep Tasks Generation
- **Description**: Groq prompt for tasks (e.g., "3 steps to prep for this job"). Save to MemoryBank.  
- **Acceptance Criteria**:  
  - Per-job tasks; checklist UI.  
- **Commits/Subtasks**:  
  1. **[feat] Add tasks prompt to groqClient**: Chain to summarization. Subtask: Output `{ tasks: Task[] }` type.  
  2. **[feat] PrepTasks component**: In dashboard; shadcn Accordion. Subtask: Persist completion in MemoryBank.  
  3. **[test] Prompt validation**: Ensure tasks are actionable.  

### Epic 4: Enhanced Chatbot & Extensibility
**Description**: Adapt existing `SupportBot.tsx` for job RAG (e.g., query job docs). Add modes like "Prep Coach".  
**Priority**: P2.  
**Effort**: 2-3 days.  
**Dependencies**: Epic 3.  

#### PR 1: Job-Specific RAG in Chatbot
- **Description**: Extend RAG to include job embeddings; new prompts.  
- **Acceptance Criteria**:  
  - Context from MemoryBank/jobs.  
  - Floating chat persists across routes.  
- **Commits/Subtasks**:  
  1. **[feat] Update SupportBot modes**: Add "JobCoach". Subtask: Inject job context to `vectorDB.ts` queries.  
  2. **[refactor] Abstract RAG hook**: For reusability. Subtask: SOLID interface for contexts.  
  3. **[test] RAG retrieval**: Mock docs; assert relevant chunks.  

#### PR 2: Polish & Extensibility Hooks
- **Description**: Add hooks for future backend (e.g., `useBackendSearch?`). Global error handling.  
- **Acceptance Criteria**:  
  - Fallback to local if backend added.  
- **Commits/Subtasks**:  
  1. **[feat] Add extensible services**: E.g., `searchProvider` prop.  
  2. **[chore] Global Toaster for errors**: Use shadcn.  
  3. **[docs] API docs**: JSDoc for hooks.  

## Post-MVP Roadmap (Out of Scope)
- Backend (Node/Supabase) for secure API keys, user auth, scalable search.  
- Advanced features: Email alerts, interview scheduling integration.  
- Analytics: Track job applications.  

## Risks & Mitigations
- **API Costs**: Limit searches; cache aggressively.  
- **Privacy**: Client-side only; warn on resume upload.  
- **Accuracy**: Iterative Groq prompts; user feedback loop in chat.  
