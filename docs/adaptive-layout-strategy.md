# Adaptive Layout Strategy

Purpose: define how Onzait adapts its navigation, information density, and screen composition across phones, tablets, and desktop browsers
Source of truth for: layout classes, adaptive navigation, presentation boundaries, and cross-device UI expectations
Update when: breakpoints, navigation patterns, supported device classes, or adaptive presentation rules change
Last reviewed: 2026-07-21

## Status

This document records the approved product direction and the baseline implementation introduced on 2026-07-21.

The baseline now includes centralized compact, medium, and expanded layout classification; bottom, rail, and sidebar navigation; an expanded Projects table and toolbar; adaptive project detail and form compositions; expanded Profile section navigation; and a bounded Tasks workspace. Future features must use and extend this foundation rather than returning to one enlarged mobile composition.

Authentication intentionally retains its centered, bounded form-card composition on larger screens. That is a conventional desktop pattern for focused entry flows and does not need to mirror the authenticated workspace shell.

## Product Decision

Onzait will remain one cross-platform product with shared routes, domain logic, data access, permissions, and feature state. It will deliberately use different navigation and content compositions when the available space or interaction context calls for them.

This is not a decision to build separate mobile, tablet, and desktop applications. It is a decision to provide layout-specific presentations over the same product workflows.

```text
shared route + feature hook/service + feature state
                         |
                         v
              adaptive presentation
             /          |          \
        compact       medium      expanded
```

## Layout Classes

The initial layout classes align with the existing design tokens:

| Class    |     Initial width | Typical contexts                                    | Primary goal                                                         |
| -------- | ----------------: | --------------------------------------------------- | -------------------------------------------------------------------- |
| Compact  |      below 768 px | Phones, narrow browser windows, tablet split-screen | Clear touch-first hierarchy with minimal simultaneous controls       |
| Medium   |       768-1279 px | Tablets, small laptops, larger split-screen windows | Use extra space without reducing touch usability or crowding content |
| Expanded | 1280 px and above | Desktop browsers and wide tablets                   | Increase information density, scanability, and parallel context      |

These thresholds are starting points, not device assumptions. They may be tuned after representative screens are implemented and tested.

Layout selection must primarily use the available window or container width, not `Platform.OS`. A browser can be narrow, an iPad can be in split-screen, and a large Android tablet can provide an expanded workspace. Platform checks remain appropriate when the underlying capability or interaction is genuinely platform-specific.

## Navigation Model

All layout classes expose the same primary destinations and preserve the same route URLs.

### Compact

- Use bottom navigation for three to five primary destinations.
- Keep destination labels visible rather than relying on icons alone.
- Place account or infrequent settings destinations in the primary navigation only while the destination count remains appropriate.
- Use native-feeling stacks, sheets, and full-screen flows for secondary navigation.

### Medium

- Prefer a collapsed navigation rail when the content width remains usable.
- Retain bottom navigation for constrained portrait or split-screen layouts.
- A temporary overlay drawer may be used when navigation cannot remain visible.
- Do not assume that every tablet should use one fixed navigation pattern in every orientation.

### Expanded

- Use a persistent sidebar with icons, labels, clear active state, brand context, and account access.
- Keep the sidebar separate from the scrollable feature content.
- Use an overlay drawer only as a fallback for constrained widths; the default desktop navigation is a persistent sidebar, not a modal drawer.
- Move primary creation actions into the page header or toolbar instead of retaining a mobile floating action button.

Changing layout class must not change permissions, route meaning, query state, or product behavior. Browser resizing and device rotation must not unexpectedly reset the active route or discard authored form state.

## Adaptive Feature Presentation

Navigation adaptation alone is insufficient. Feature screens must also change composition and information density when a wider layout enables a more conventional and efficient workflow.

### Projects

| Compact                                         | Medium                                        | Expanded                                                              |
| ----------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| Project cards in one column                     | Two-column cards or compact rows              | Dense project table with sortable columns                             |
| Search followed by compact sort/filter controls | More controls visible in one row              | Search, filters, view controls, and creation action in a page toolbar |
| Filters in a sheet or modal                     | Sheet, popover, or compact filter panel       | Popovers or persistent inline filters                                 |
| Floating New Project action                     | Floating or labeled action depending on space | Labeled New Project header action                                     |
| Full list or full map                           | Full view or optional selection preview       | List/map split view where it materially improves the workflow         |

The project cards and project table are alternate presentations of the same project collection. Search, sort, filters, loading, empty, and error state should be controlled once and supplied to the active presentation.

### Project Detail

- Compact layouts use a clear vertical sequence of summary, progress, actions, and feature sections.
- Medium layouts may group related summary and action surfaces into two columns.
- Expanded layouts should support a two- or multi-pane composition when this improves scanning and preserves useful context.
- Destructive and overflow actions must remain discoverable and follow the same confirmation rules at every size.

### Profile And Settings

- Compact layouts may use segmented controls or stacked settings sections.
- Expanded layouts should use settings sub-navigation with a stable content panel when multiple sections are available.
- Account and sign-out access should remain easy to locate from the expanded application shell.

### Forms

- Use one column by default on compact layouts.
- Use two columns only for fields that are logically related and can be completed comfortably side by side.
- Preserve readable line lengths and intentional form maximum widths; do not stretch fields merely because horizontal space exists.
- Validation, dirty state, submission state, and data transformation remain shared across presentations.

### Overlays And Actions

- Prefer sheets or full-screen presentations for complex compact-layout flows.
- Prefer centered dialogs, anchored menus, and popovers on expanded layouts.
- Prefer floating actions on compact layouts only when they represent the screen's dominant action.
- Prefer labeled page-header or toolbar actions in expanded layouts.

## Source Architecture

The adaptive shell belongs at the application layout boundary. It is responsible for selecting bottom navigation, a navigation rail, or a persistent sidebar. Route declarations remain under `app/` and must continue delegating product UI to feature screens.

Reusable layout classification and shell primitives belong under `shared/`. A single shared hook or provider should expose a semantic layout class such as `compact`, `medium`, or `expanded`; feature screens should not reproduce raw breakpoint logic independently.

Feature-specific presentations belong to the owning feature. When layouts differ substantially, prefer small explicit presentation components such as:

```text
features/projects/
  components/
    projects-compact-view.tsx
    projects-expanded-view.tsx
  screens/
    projects-screen.tsx        shared query, filter, and view orchestration
```

Do not duplicate repositories, services, hooks, schemas, routes, or full feature workflows for each device class. Avoid a single oversized screen filled with unrelated breakpoint conditionals; extract presentation components when their structures materially differ.

Use Expo platform suffixes such as `.web.tsx`, `.ios.tsx`, and `.android.tsx` only for genuine platform implementation differences. Width-driven layout differences should normally remain shared so they also work on tablets, resized browsers, and split-screen windows.

## Design And Interaction Rules

- Mobile-first defines the initial hierarchy, not the final composition at every width.
- External interface references may inform structure and interaction patterns, but they do not override Onzait's typography, color, spacing, shape, or component rules.
- Expanded layouts should use their available width to improve scanability or parallel context, not simply enlarge mobile controls.
- Content density, navigation placement, action placement, and overlay behavior may adapt independently.
- Shared tokens own reusable breakpoints, margins, navigation dimensions, and content-width constraints.
- Pointer hover, keyboard focus, shortcuts, and cursor behavior must be considered for desktop web.
- Touch targets, safe areas, rotation, and on-screen keyboard behavior must be considered for iOS and Android.
- Important destinations and actions must not appear only on hover.
- The same loading, empty, error, permission, and destructive-confirmation states must exist in every presentation.

## Verification Matrix

Adaptive feature work is not complete until representative behavior is checked in at least:

- a narrow phone portrait viewport;
- phone landscape when the flow supports it;
- tablet portrait;
- tablet landscape;
- a constrained tablet split-screen or narrow web viewport;
- a standard desktop viewport;
- a wide desktop viewport up to the supported content maximum.

Verification should cover navigation continuity, browser resizing or device rotation, keyboard and focus order, touch target sizes, overflow, long content, loading/error/empty states, and preservation of in-progress form state.

## Implementation Sequence

1. Introduce the centralized layout classification and document any tuned thresholds in the design tokens.
2. Build the adaptive application shell while preserving the current routes and auth guard behavior.
3. Use Projects as the reference feature: compact cards, an intentional medium composition, and an expanded table/toolbar experience.
4. Apply the established pattern to project detail, profile/settings, forms, actions, filters, and overlays.
5. Add viewport and device-class verification to the normal feature completion workflow.

## Explicit Non-Goals

- Separate mobile and desktop applications.
- Separate route trees for the same product destinations.
- Treating `web` as synonymous with desktop or `native` as synonymous with phone.
- Rendering complete duplicate interfaces simultaneously and hiding one with styles.
- Applying arbitrary per-screen breakpoints without a shared semantic layout contract.
- Converting every card to a table merely because the expanded layout has more room.
