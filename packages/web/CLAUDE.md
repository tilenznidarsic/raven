# Web App (`@org/web`) Guidelines

React + Vite + TypeScript app, styled with Tailwind CSS v4, tested with Vitest.

## Components

- Declare components with the `function` keyword, not arrow functions:
  ```tsx
  // Good
  export function UserCard() {
    return <div />;
  }

  // Avoid
  export const UserCard = () => <div />;
  ```
- One component per file. Name the file after the component (`UserCard.tsx`).
- Colocation rule for where a component file lives:
  - Used by only one component → put it next to that component (same folder).
  - Reused across features → put it in `src/shared/components/`.
- Prefer a default export for the main component of a file; use named exports for
  helpers colocated in the same file.

## Custom hooks

- Custom hooks (`useX`) go in `src/shared/hooks/`, one hook per file (`useDebounce.ts`).
- Hooks must start with `use` and follow the Rules of Hooks (call unconditionally,
  top level only).

## Utilities

- Pure utility/helper functions go in `src/shared/utils/`, grouped by concern
  (`formatDate.ts`, `classNames.ts`).
- Utils must be pure and framework-agnostic (no React imports, no side effects).

## Suggested structure

```
src/
  app/                 # root App component and app-level composition
  features/            # feature folders; component-only helpers live beside them
  shared/
    components/        # reusable components
    hooks/             # reusable custom hooks
    utils/             # pure helper functions
  styles.css           # Tailwind entry (@import 'tailwindcss')
  main.tsx             # app bootstrap
```

## Styling

- Use Tailwind utility classes for styling. Do not add `.css`/`.module.css` files
  for component styles.
- Global styles belong in `src/styles.css`; keep it to Tailwind's `@import` plus
  theme customization (`@theme`) only.
- For conditional/merged class strings, use a `classNames`/`cn` helper in
  `shared/utils` rather than string concatenation.

## TypeScript

- Strict mode is on — keep it that way. Avoid `any`; prefer `unknown` + narrowing.
- Type component props with an explicit `Props` type/interface. Avoid `React.FC`.
- Do not use non-null assertions (`!`) to silence the compiler; narrow instead.

## Testing

- Tests are Vitest + React Testing Library, colocated as `*.spec.tsx` next to the
  file under test.
- Test behavior via the rendered output, not implementation details.

## Nx / tooling

- Requires Node >= 20.12 (Vite 8). Use `nvm use 22` before running tasks.
- Run tasks through Nx, never the underlying tool directly:
  - `nx serve @org/web` — dev server
  - `nx build @org/web` — production build
  - `nx test @org/web` — unit tests
  - `nx typecheck @org/web` — type check
  - `nx lint @org/web` — lint
- Import shared code via the workspace path aliases, not deep relative paths
  (`../../../`) across feature boundaries.

## Conventions

- Keep components small and focused; extract logic into hooks and utils.
- Prefer named, descriptive props over boolean-heavy APIs.
- Co-locate a component's tests, styles-in-Tailwind, and helper files with it.
