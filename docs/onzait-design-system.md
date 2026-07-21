# Onzait Design System

Purpose: active design-system source of truth for reusable UI decisions, component rules, and interaction behavior
Source of truth for: design rules, token usage, component state expectations, and reusable UI patterns
Update when: a reusable visual rule is decided, a token changes meaning, a component gains a new standard state, or a screen teaches us a pattern that should be reused
Last reviewed: 2026-07-21

## Active Sources

- Strategic foundation: `docs/onzait-step-1-foundation.md`
- Visual foundation: `docs/onzait-step-2-foundations.md`
- Token source: `shared/theme/tokens.js`
- App token facade: `shared/ui/components/theme.ts`
- Motion token facade: `shared/ui/components/motion.ts`
- Reusable app primitives: `shared/ui/components/`
- Auth layout primitives: `features/auth/components/auth-shell.tsx`

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
- Use `atomPalette`, `atomSpacing`, `atomTypeScale`, `atomControlHeights`, `atomRadii`, and related exports from `shared/ui/components/theme.ts` in app components.
- Use cobalt only for primary actions, active states, focus states, links, progress, and key system emphasis.
- Do not introduce one-off saturated colors into normal product UI.
- Keep borders subtle by default and rely on stronger borders only for hover, focus, validation, or selected states.
- Placeholder text should be clearly lighter than entered text while remaining readable.
- Form fields should use a clear hierarchy: subtle mono label, readable but lighter placeholder, subtle resting border, readable entered text, and icons that align with the text baseline without being clipped.

## Component State Rules

All interactive design-system items should define every relevant state before they are considered complete.

Every async UI surface must expose a loading state appropriate to its shape. Use skeletons for initial content loads, spinners for short actions, disabled states while a submitted action is in flight, optimistic states only when rollback behavior is clear, and clear retry/error states when loading fails.

Buttons should have clear, differentiable:

- normal
- hover
- pressed or active, when supported by the primitive
- loading, when the action can be async
- disabled

Button APIs should separate visual treatment from semantic color:

- `variant` describes treatment: `solid`, `bordered`, or `ghost`.
- `color` describes intent: `accent`, `neutral`, `warning`, `danger`, or `success`.
- Do not use `primary`, `secondary`, or destructive meaning as variant names. Express those as combinations such as `solid` + `accent`, `bordered` + `neutral`, or `solid` + `danger`.
- Use `solid` in general for primary actions.
- Use `bordered` in general for secondary actions.

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

Feature screens should not silently block while data loads. Lists, cards, forms, uploads, autocomplete results, and destructive actions all need explicit loading feedback.

## Motion Rules

Motion should reinforce the same technical architectural blueprint feeling as the visual system: precise, subtle, intentional, and operational. It should feel like interface instrumentation and live data resolving into place, not playful decoration.

Use `shared/ui/components/motion.ts` as the source of truth for reusable animation durations, easing, and scale values. Future reusable motion should add or reuse `atomMotion` tokens instead of introducing one-off timing values in screens.

Default motion behavior:

- Prefer short measured timing animations over springs.
- Use Reanimated for reusable app motion.
- Keep transforms very small. Press compression should confirm input without visibly bouncing or squishing the control.
- Use opacity, subtle scale, linear scans, measured thumb movement, and progress/data fills before decorative movement.
- Keep motion under control surfaces and data surfaces: focus states, selected states, loading skeletons, progress bars, active status indicators, and list/layout changes.

Avoid motion that feels cheerful, toy-like, or decorative:

- Do not use bounce presets, springy rebounds, large overshoot, elastic scaling, confetti-like effects, or ornamental loops in product UI.
- Do not make cards float upward as a default list entrance. Prefer fade-in or measured layout movement so content feels like it resolves into view.
- Do not pulse every status. Reserve pulsing for semantically live or active states such as `IN_PROGRESS`.

Current reusable patterns:

- Button and card press feedback uses tiny timed compression with no spring rebound.
- Input focus may use a very subtle accent glow in addition to the accent border.
- Segmented controls and pill selects move the active thumb with measured timing.
- Skeleton loading uses a low-opacity scanner pass rather than a shiny shimmer.
- Progress bars should animate visibly enough to read as data filling in; keep the fill measured, not playful.
- Active status dots pulse opacity at a fixed size, like an indicator light, rather than expanding as a halo.

## Hover, Focus, And Selected Rules

Hover states should not change an element's semantic color.

Hover may only darken or strengthen the element's existing color role. Examples:

- A grey input border becomes a darker grey on hover.
- A bordered neutral button background becomes a slightly darker neutral on hover.
- A solid accent button becomes a darker accent on hover.

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

## Icon Rules

Product UI should not import icon libraries directly inside screens or components.

- All app icons should be exported from the central icon registry in `shared/ui/icons/index.tsx`.
- Screens and reusable components should import named app icons from `@/shared/ui/icons`, not from `lucide-react-native`.
- Every app icon should follow the shared icon contract: `color` plus a tokenized `size`.
- Icon sizes should use the standard scale `xs`, `sm`, `md`, and `lg` instead of raw pixel values in product UI.
- If the underlying icon library changes later, the swap should happen in the central icon registry instead of across product screens.

Icon meaning should also stay consistent across the product.

- Use the same icon for the same concept every time. If `ProjectsIcon` represents projects, every project reference should use `ProjectsIcon`.
- Use the same icon for the same action every time. Delete actions should all use the same delete icon, link actions should all use the same link icon, and password visibility should use the shared visibility icons.
- Do not choose alternate icons for variety when the meaning is the same. Visual consistency is more important than decorative variation.
- Add new icons to the registry only when there is a new concept or action that the existing icons do not clearly cover.

## Destructive Action Confirmation Rules

Critical delete actions must never mutate persistent data directly from a menu item, icon button, swipe action, or first tap.

- Open an explicit confirmation modal before deleting projects, accounts, files, records, or other persistent user data.
- Name the affected entity or clearly describe what will be removed and whether the action can be restored.
- Provide distinct Cancel and danger-styled Delete actions; Delete must not be the modal's default focused action.
- Disable dismissal and repeat submission while deletion is pending, show loading on the Delete action, and keep recoverable errors visible in the modal.
- Confirmation is a UX safeguard only; authorization and ownership enforcement must still happen in trusted service, repository, and database layers.

## Action Feedback Rules

Use the shared app toast for short, non-blocking feedback after an action completes.

- Show a success toast after a create, update, delete, upload, or similar mutation succeeds.
- Show an error toast when an action fails, but keep validation errors beside their fields and recoverable modal errors inside the modal as well.
- Do not show a toast for navigation-only actions such as opening an edit screen.
- Use one concise toast per outcome with a direct title and an optional helpful description.
- Toasts use the shared outlined tonal treatment with a light status background and matching border and text, appear at the top center, and remain visible for six seconds by default.
- Toasts supplement visible loading, disabled, validation, and error states; they do not replace them.

## Responsive Density Rules

Mobile-first controls should keep comfortable touch targets, but browser layouts should not automatically inherit the largest native control size.

- Forms that feel appropriately large on mobile may need compact control sizing on web.
- Auth forms use compact web controls while keeping larger native defaults.
- Social icon buttons should use a smaller browser size than native touch-first icon buttons.
- Smaller controls should usually use a smaller radius than taller controls so compact inputs and buttons do not become pill-like by accident.
- Density changes should be applied through shared component or layout constants, not one-off screen overrides.

## Form Spacing Rules

Form fields and their primary CTA should have enough vertical separation to read as related steps, not a compressed block.

- Consecutive inputs should not visually touch or feel stacked too tightly.
- The primary CTA should have at least the same breathing room from the last field as fields have from each other.
- Shared form stacks should use reusable spacing constants instead of per-screen margin tweaks.

## Form Completion Rules

Forms should make completion state obvious before the user submits.

- Production submit forms should use `react-hook-form` with a Zod schema resolver. Form state, field errors, validity, submission, and edit dirty-state should come from that form controller rather than duplicated local `useState` validation.
- Local component state is still appropriate for transient UI-only behavior such as password visibility, picker open state, autocomplete popovers, and non-submit search/filter fields.
- Submit buttons stay disabled until every required input is complete.
- Edit-form submit buttons also stay disabled until `react-hook-form` reports a dirty field or an attached asset picker has a pending change.
- Use one labeling convention per form, not both required and optional markers.
- The current shared convention is to label optional fields with a discreet `(optional)` hint and leave required fields unmarked.
- Disabled submit buttons are guidance only; validation and authorization still belong in schemas, services, repositories, and database policies.

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
