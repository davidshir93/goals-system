# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (opens browser at localhost:3000)
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

A personal goal tracking app with **Year > Quarter > Week** hierarchy using Firebase Firestore for data persistence.

### Data Flow
- **Firebase Auth** (`src/context/AuthContext.tsx`): Email/password and Google sign-in
- **React Query** for all data fetching with optimistic updates (`src/data/queries.ts`)
- **GoalsContext** (`src/context/GoalsContext.tsx`): Tracks currently selected year/quarter/week IDs
- **RootLayout** (`src/layouts/RootLayout.tsx`): Loads all periods and goals data, auto-selects most recent period

### Firestore Structure
Paths defined in `src/lib/paths.ts`:
```
usersData/{uid}/
  categories/
  identities/
  years/{yearId}/
    yearlyGoals/
    quarters/{quarterId}/
      quarterlyGoals/
      weeks/{weekId}/
        weeklygoals/
```

### Goal Hierarchy
- **YearGoal**: Has category, identity, WOOP fields (wish/outcome/obstacles/plan), tracks quarterProgress
- **QuarterGoal**: Links to parentYearGoalId, tracks weeklyProgress
- **WeekGoal**: Links to parentQuarterGoalId, has planned/done counts

Types in `src/types/GoalTypes.ts`, form schemas in `src/components/GoalForm.tsx`.

### Key Patterns
- Mutations use optimistic updates with rollback on error
- `enrichGoal()` utility adds category/identity/parent goal data for display
- `@/*` path alias maps to `./src/*`
- UI components in `src/components/ui/` are shadcn/ui based (Radix + CVA)

### Environment Variables
Firebase config via Vite env vars (`VITE_FIREBASE_*`). See `src/firebase.ts`.
