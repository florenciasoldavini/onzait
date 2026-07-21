# Source Architecture

Purpose: define where product code belongs and which dependency directions are allowed
Source of truth for: feature ownership, shared code, infrastructure boundaries, and new-feature scaffolding
Update when: a new source layer is introduced or an ownership boundary changes
Last reviewed: 2026-07-21

## Canonical Structure

```text
app/                         Expo Router routes and layouts
features/                    Product domains
  <feature>/
    components/              Feature-only presentation
    constants/               Feature-owned stable values and labels
    errors/                  Feature-specific structured errors
    screens/                 Route-level product UI
    hooks/                   React state, React Query, and mutations
    providers/               Feature-owned React context state
    services/                Product workflows and orchestration
    repositories/            Raw persistence and external transport
    schemas/                 Runtime validation
    tests/                   Feature workflow and boundary tests
    types/                   Domain contracts
    utils/                   Pure feature-only helpers
shared/                      Product-agnostic reusable code
  hooks/
  splash/
  tests/
  theme/
  ui/
    components/              Onzait design-system components
    forms/                   Shared form composition
    icons/                   Central icon registry
    primitives/              Gluestack-generated primitives
  utils/
infrastructure/              SDK clients and technical adapters
  monitoring/
  query/
  supabase/
assets/                      Static app assets
docs/                        Maintained project documentation
scripts/                     Repository automation
supabase/                    Migrations, database tests, and Edge Functions
```

Feature directories may omit layers they do not need. Do not create empty folders merely to complete the template. Feature roots contain responsibility directories only; implementation modules should not be left loose at the feature root.

## Dependency Direction

```text
app route
  -> feature screen or component
    -> feature hook or service
      -> feature repository
        -> infrastructure client, Storage, or Edge Function
```

- Routes should contain route declarations, parameter normalization, guards, and delegation only.
- Screens and components must not import repositories or infrastructure directly.
- Hooks own React Query/cache behavior and call services.
- Services own product workflows and may compose repositories.
- Repositories own raw SDK, database, Storage, and external transport calls.
- Providers own React context state and call hooks or services rather than repositories or infrastructure.
- Shared code must not import a product feature.
- Cross-feature code must use the owning feature's hook, service, provider, or exported type; repository internals are not a cross-feature API.

ESLint enforces the most important import boundaries in `eslint.config.js`.

## Model Ownership

Each domain contract belongs to the feature that will implement it. Planned contracts are preserved in their future owner, such as `features/workers/types/` or `features/materials/types/`, instead of a global model directory.

An active entity must have one canonical TypeScript contract. Zod schemas validate that contract from the same feature; emitted `.js`, `.d.ts`, and source-map copies must not be committed beside TypeScript source. TypeScript runs with `noEmit` for the Expo application.

## Adding A Feature

1. Create `features/<feature>/` with only the layers required by the first implemented behavior.
2. Place route-level UI under `features/<feature>/screens/` and add a thin route under `app/`.
3. Keep platform variants beside the shared module using Expo suffixes such as `.web.tsx`, `.ios.tsx`, or `.android.tsx`.
4. Put reusable code in `shared/` only when it is genuinely product-agnostic or already needed by more than one feature.
5. Add unit, flow, and database/RLS tests appropriate to the feature.

## Adaptive Presentation

Onzait shares routes, feature state, hooks, services, and repositories across supported devices while allowing layout-specific navigation and feature presentations. Reusable layout classification and application-shell primitives belong under `shared/`; feature-specific compact, medium, or expanded presentations belong to the owning feature.

Use platform-specific files for genuine platform implementation differences, not as a substitute for width-driven adaptation. The complete layout contract, navigation model, presentation rules, and verification matrix live in [adaptive-layout-strategy.md](./adaptive-layout-strategy.md).

## Naming

- Directories and non-component modules use kebab-case.
- React components use named PascalCase exports; route screen files may keep a default export for Expo Router wrappers.
- Services use `.service.ts`, repositories use `.repository.ts`, and runtime schemas use `.schema.ts` or `.schemas.ts`.
- Avoid generic catch-all directories such as `lib/` and global layer directories such as `screens/`, `services/`, or `types/models/`.
