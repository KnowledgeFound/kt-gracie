# Frontend Folder Structure Guide

Recommended architecture for a multi-feature React + TypeScript application where multiple teams work in parallel with minimal merge conflicts and clear ownership boundaries.

---

## Core Principle: Feature-First, Shared-Second

Each team owns a **feature slice**. Everything a feature needs — components, hooks, services, types, state — lives inside that feature's folder. Shared code only graduates to the top level when two or more features genuinely need it.

```
src/
├── app/                        # Route-level pages only (thin wrappers)
│   ├── auth/
│   │   └── page.tsx
│   ├── home/
│   │   └── page.tsx
│   ├── quiz/
│   │   └── page.tsx
│   └── layout.tsx              # Root layout (nav, providers)
│
├── features/                   # ← Each team owns one folder here
│   ├── auth/                   # Team A
│   │   ├── components/         # UI components private to this feature
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── UserCard.tsx
│   │   ├── hooks              # Feature-scoped hooks
│   │   ├── services           # API / canister calls for this feature
│   │   ├── types.ts            # Types owned by this feature
│   │   ├── constants.ts        # Magic values, config
│   │   ├── utils.ts            # Pure helpers (validation, etc.)
│   │   └── index.ts            # Public API — only export what other features need
│   │
│   ├── greeting/               # Team B
│   │   ├── components/
│   │   │   └── GreetingForm.tsx
│   │   ├── hooks/
│   │   │   └── useGreet.ts
│   │   ├── services/
│   │   │   └── fetchGreeting.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── quiz/                   # Team C 
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types.ts
│       └── index.ts
│
├── components/                 # Truly shared, design-system-level UI only
│   ├── ui/                     # Primitives: Button, Input, Modal, Badge…
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   └── layout/                 # App-wide layout shells
│       ├── MainLayout.tsx
│       ├── PageHeader.tsx
│       └── index.ts
│
├── hooks/                      # Shared hooks used by 2+ features
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── services/                   # Shared infrastructure (not feature-specific)
│   └── canister/
│       ├── agent.ts
│       └── actors.ts
│
├── store/                      # Global app-level state only (auth session, theme)
│   └── appStore.ts
│
├── lib/                        # Static data, third-party wrappers, utilities
│   ├── gracie-qa-corpus.json
│   └── motion.ts               # Re-export framer-motion with project defaults
│
├── types/                      # Global types shared across features
│   ├── api.ts
│   └── global.d.ts
│
├── config/                     # Environment, feature flags, constants
│   └── env.ts
│
├── App.tsx                     # Router setup only
├── main.tsx                    # Entry point, providers
└── index.css                   # Tailwind directives + global base styles
```

---

## What Goes Where — Decision Rules

### Put it in `features/<name>/` when:
- It is only used by one feature / one team
- It would cause a merge conflict if two teams edited the same file
- It has domain knowledge (user info, quiz scoring logic, greeting canister calls)

### Put it in `components/ui/` when:
- It is a pure presentational primitive with no business logic
- Any team could drop it into their feature without importing from another feature
- Examples: `Button`, `Input`, `Spinner`, `Badge`, `Modal`, `Tooltip`

### Put it in `hooks/` (top-level) when:
- Two or more features already use it
- It has zero feature-specific knowledge (debounce, localStorage, media query)

### Put it in `services/` (top-level) when:
- It is infrastructure shared by all features (ICP agent, HTTP client setup)
- Feature-specific API calls still live in `features/<name>/services/`

### Put it in `app/` when:
- It is a route entry point — thin, no business logic
- It composes feature components and passes route params down

---

## The `index.ts` Barrel Rule

Every feature folder **must** have an `index.ts` that explicitly declares its public API.

```ts
// features/auth/index.ts — only export what other features/pages need
export { default as UserCard } from './components/UserCard';
export type { User, AgeBucket } from './types';
// Do NOT export internal hooks, stores, or services
```

Other features import from the barrel, never from deep paths:

```ts
// ✅ correct
import { UserCard } from '@/features/auth';

// ❌ wrong — breaks encapsulation, causes tight coupling
import UserCard from '@/features/auth/components/UserCard';
```


## Team Ownership Map

```
Team A  →  features/auth/
Team B  →  features/greeting/
Team C  →  features/quiz/
Shared  →  components/ui/, hooks/, services/canister/
Platform → app/, config/, store/, main.tsx, App.tsx
```

Each team's PRs should only touch their own `features/<name>/` folder plus `app/<route>/page.tsx` for their route. Changes to `components/ui/` or `services/` require a cross-team review.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `UserCard.tsx` |
| Hook files | camelCase, `use` prefix | `useUser.ts` |
| Service files | camelCase, noun | `userStorage.ts` |
| Store files | camelCase, `Store` suffix | `userStore.ts` |
| Type files | camelCase | `types.ts` |
| Barrel files | always `index.ts` | `index.ts` |
| Route pages | always `page.tsx` | `page.tsx` |
| Constants | SCREAMING_SNAKE in file, camelCase file name | `constants.ts` |

---

## Import Alias Setup

Configure `@/` to point to `src/` so imports are always absolute and refactor-safe:

```ts
// tsconfig.json
"paths": { "@/*": ["./src/*"] }

// vite.config.js
alias: [{ find: "@", replacement: "/src" }]
```

Usage:
```ts
import { Button } from '@/components/ui';
import { useUser } from '@/features/auth';
import { agent } from '@/services/canister/agent';
```

Never use relative `../../` imports that cross feature boundaries.
