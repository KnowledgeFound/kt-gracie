refactor(frontend): implement scalable frontend structure

- reorganized frontend architecture for maintainability
- separated layouts, components, pages, hooks, and services
- added shared UI module
- improved route organization
- updated import aliases and paths
- installed framer-motion
- installed lucide-react
- installed tailwindcss
- installed postcss
- optimized project scalability for team collaboration
- worked auth, profile to test user crud with localstorage
- drafted demo for quiz, leaderboad
- extend tailwind’s theme for consistent brand colours, spacing, fonts.

1. **Folder structure** matches the following skeleton:

```
src/
├── app/                        # Route-level pages only (thin wrappers)
│   ├── auth/
│   │   └── page.tsx
│   ├── home/
│   │   └── page.tsx
│   ├── leaderboard/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── quiz/
│   │   └── page.tsx
│   └── layout.tsx              # Root layout (nav, providers)
│
├── features/                   # ← Each team owns one folder here
│   ├── auth/                   # Team A
│   │   ├── components/         # UI components private to this feature
│   │   │   ├── CreateUserForm.tsx
│   │   │   ├── EditUserForm.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── hooks              # Feature-scoped hooks
│   │   ├── services           # API / canister calls for this feature
│   │   ├── types.ts            # Types owned by this feature
│   │   ├── constants.ts        # Magic values, config
│   │   ├── utils.ts            # Pure helpers (validation, etc.)
│   │   └── index.ts            # Public API — only export what other features need
│   │
│   ├── city/               # Team B
│   │   ├── components/
│   │   │   └── CityHeader.tsx
│   │   │   └── CloudLayer.tsx
│   │   │   └── DrawerMenu.tsx
│   │   │   └── DriftingCloud.tsx
│   │   │   └── HealthBadge.tsx
│   │   │   └── TokensBadge.tsx
│   │   │   └── UserBadge.tsx
│   │   └── index.ts
│   │
│   ├── greeting/               # Team C
│   │   ├── components/
│   │   │   └── GreetingForm.tsx
│   │   ├── hooks/
│   │   │   └── useGreet.ts
│   │   ├── services/
│   │   │   └── fetchGreeting.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── quiz/                   # Team D
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types.ts
│       └── index.ts
│
├── components/                 # Truly shared, design-system-level UI only
│   ├── ui/                     # Primitives: Button, Input, Modal, Badge…
│   │   ├── Button.tsx
│   │   ├── BackMenu.tsx
│   │   └── index.ts
│   └── layout/                 # App-wide layout shells
│       ├── MainLayout.tsx
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

2. **Barrel rule enforced**: every feature folder contains `index.ts` that exports **only** what other features/pages are allowed to import.
   - ✅ `import { UserCard } from '@/features/auth'`
   - ❌ `import UserCard from '@/features/auth/components/UserCard'`

3. **Import alias** `@/` is configured in `tsconfig.json` and `vite.config.js` (or equivalent) to point to `src/`.

4. **No relative imports that cross feature boundaries** (e.g. `../../../features/auth/...`).

5. **Naming conventions** applied:
   - Components: `PascalCase.tsx`
   - Hooks: `camelCase` with `use` prefix
   - Services: `camelCase.ts` (noun)
   - Stores: `camelCaseStore.ts`
   - Constants: `constants.ts` with `SCREAMING_SNAKE_CASE` values inside
   - Route pages: always `page.tsx`

6. **Team ownership map** documented in `README.md` or `CONTRIBUTING.md` (e.g., Team A → `features/auth/`, Team B → `features/greeting/`, Shared → `components/ui/` etc.)

7. **Existing code** can be migrated to the new structure (if applicable) without breaking functionality.
