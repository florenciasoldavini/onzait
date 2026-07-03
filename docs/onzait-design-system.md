# Onzait Design System

Purpose: active design-system source of truth for reusable UI decisions, component rules, and interaction behavior
Source of truth for: design rules, token usage, component state expectations, and reusable UI patterns
Update when: a reusable visual rule is decided, a token changes meaning, a component gains a new standard state, or a screen teaches us a pattern that should be reused
Last reviewed: 2026-07-03

## Active Sources

- Strategic foundation: `docs/onzait-step-1-foundation.md`
- Visual foundation: `docs/onzait-step-2-foundations.md`
- Token source: `theme/tokens.js`
- App token facade: `components/atoms/theme.ts`
- Reusable app primitives: `components/atoms/`
- Auth layout primitives: `components/auth/AuthShell.tsx`

The older `docs/onzait-design-guide.md` has been removed because it no longer matched the active token and component direction.

## System Direction

Onzait should feel calm, precise, structured, trustworthy, modern, premium, and technically literate.

The interface should prioritize clarity, structure, and operational confidence over decoration. Design decisions should come from reusable tokens and primitives before screen-local styles.

## Current Visual Decisions

- Theme scope is light mode only for now.
- The primary accent is cobalt blue.
- Surfaces use warm editorial neutrals rather than stark white everywhere.
- Typography uses Geist for primary UI text and JetBrains Mono for labels, metadata, and technical accents.
- Shape language is moderately rounded: controls use the shared control radius, cards use the shared card radius, and true pills are reserved for patterns that need them.
- Most hierarchy should come from typography, spacing, borders, and surface contrast before extra color.

## Token Usage Rules

- Prefer semantic tokens over raw primitive values in UI code.
- Use `atomPalette`, `atomSpacing`, `atomTypeScale`, `atomControlHeights`, `atomRadii`, and related exports from `components/atoms/theme.ts` in app components.
- Use cobalt only for primary actions, active states, focus states, links, progress, and key system emphasis.
- Do not introduce one-off saturated colors into normal product UI.
- Keep borders subtle by default and rely on stronger borders only for hover, focus, validation, or selected states.
- Placeholder text should be clearly lighter than entered text while remaining readable.
- Form fields should use a clear hierarchy: subtle mono label, readable but lighter placeholder, subtle resting border, readable entered text, and icons that align with the text baseline without being clipped.

## Component State Rules

All interactive design-system items should define every relevant state before they are considered complete.

Buttons should have clear, differentiable:

- normal
- hover
- pressed or active, when supported by the primitive
- loading, when the action can be async
- disabled

Inputs and text areas should have clear, differentiable:

- normal
- hover
- focus
- error
- disabled, when the field can be unavailable
- read-only, when the value can be locked but still visible
- success, when positive validation is intentionally shown

Selectable items such as tabs, nav buttons, segmented controls, checklist items, and filters should have clear, differentiable:

- normal
- hover
- selected
- disabled, when unavailable

State styling should be designed as a full set. Do not add only the happy-path state and leave the rest to default library behavior unless the default has been reviewed and intentionally accepted.

## Hover, Focus, And Selected Rules

Hover states should not change an element's semantic color.

Hover may only darken or strengthen the element's existing color role. Examples:

- A grey input border becomes a darker grey on hover.
- A neutral secondary button background becomes a slightly darker neutral on hover.
- A cobalt primary button becomes a darker cobalt on hover.

Focus and selected states may change an element's semantic color because they communicate stronger state. Examples:

- An input with a grey border can use the cobalt accent border on focus.
- A tab can move from neutral text to accent text when selected.
- A selected nav item can use an accent indicator or accent-toned surface.
- Bottom navigation items use muted neutral by default, darker neutral on hover, and accent color when selected.

Error and success states are validation states, so they may use their semantic status colors when those states are intentionally present.

## Cursor Rules

Clickable and interactive components should always expose the correct cursor as part of their UI styling on web.

- Enabled buttons, links, tabs, nav buttons, selectable cards, toggles, checkboxes, and other pressable controls should use a pointer cursor.
- Text inputs and text areas should use a text-entry cursor.
- Disabled or unavailable action elements should use a forbidden or not-allowed cursor.
- Read-only fields should communicate that the value can be selected or inspected but not edited.

No clickable item should keep the normal/default cursor. The cursor must make it clear that the element is actionable before the user clicks.

## Responsive Density Rules

Mobile-first controls should keep comfortable touch targets, but browser layouts should not automatically inherit the largest native control size.

- Forms that feel appropriately large on mobile may need compact control sizing on web.
- Auth forms use compact web controls while keeping larger native defaults.
- Social icon buttons should use a smaller browser size than native touch-first icon buttons.
- Smaller controls should usually use a smaller radius than taller controls so compact inputs and buttons do not become pill-like by accident.
- Density changes should be applied through shared component or layout constants, not one-off screen overrides.

## Responsive Size Rules

Size variants should be reviewed across mobile, tablet, and desktop before they become part of the design system.

- Large text, titles, headings, controls, icons, cards, and layout gaps may need smaller values on mobile than on desktop.
- Not every element needs breakpoint-specific sizing. Stable utility elements can keep the same size when they remain usable and visually balanced across screens.
- Size changes should be based on readability, touch comfort, hierarchy, available space, and visual balance.
- Components with named size variants should define what those sizes mean across relevant breakpoints instead of assuming one fixed value works everywhere.
- Responsive size behavior should live in shared tokens, components, or layout constants whenever the pattern is reusable.

Use judgment: responsive sizing is required when a fixed size hurts usability or composition, not as a mechanical rule for every element.

## Keyboard Safety Rules

Screens with editable fields must keep the active field visible and reachable when the mobile keyboard is open.

- Form screens may use a keyboard-safe scroll layout while the keyboard is open, but resting auth-style forms should not feel scrollable when their content fits.
- Password fields, submit buttons, and validation messages must not be hidden behind the keyboard.
- Shared layout primitives should own keyboard avoidance when the pattern is reusable.
- Keyboard-safe screens should preserve normal scrolling, safe-area padding, and tap behavior while the keyboard is open.

## Documentation Rule

When a reusable design decision is learned while building a screen, add it here in the same change. Keep rules short, concrete, and tied to reusable behavior. If a rule only applies to one screen, keep it near that screen instead of promoting it to the design system.
