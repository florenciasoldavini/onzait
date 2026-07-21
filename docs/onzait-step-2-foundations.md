# Onzait Design System

## Step 2 Foundations

This document defines the visual foundations of the Onzait design system.

Step 1 established the strategic layer:

- product purpose
- user profile
- interface personality
- UX principles
- decision rules

Step 2 turns that into the system foundation that design and code will actually build on:

- token categories
- token naming rules
- color foundations
- semantic color tokens
- typography foundations
- spacing and layout foundations
- radius and border rules
- elevation and motion rules
- baseline component behavior

This is the first practical source of truth for the system.

## Locked Direction

The following decisions are considered approved for `v1`:

- theme scope: `light only`
- primary accent strategy: `single cobalt accent`
- typography: `Geist` + `JetBrains Mono`
- surface mood: `warmer editorial white`
- density: `balanced baseline with spacious key moments`
- shape language: `moderately rounded across cards and controls`

These decisions should guide all future token and component work unless intentionally revised.

## Foundation Principles

The visual foundation should produce interfaces that feel:

- calm
- precise
- premium
- technically structured
- easy to scan

The system should avoid:

- generic bright-white SaaS styling
- too many accent colors
- compact tool-panel density by default
- overly bubbly or playful shapes
- muddy shadow-heavy depth

## Token Architecture

The system should be implemented in two layers:

### 1. Primitive Tokens

Primitive tokens are raw values.

Examples:

- raw color values
- numeric spacing values
- font sizes
- line heights
- radius values
- shadow values

Primitive tokens should not be used directly in screen code unless there is a strong reason.

### 2. Semantic Tokens

Semantic tokens are the actual product-facing design decisions.

Examples:

- `bg.canvas`
- `bg.surface`
- `text.primary`
- `text.muted`
- `border.default`
- `action.primary.bg`

Semantic tokens should be the default language used in components and screens.

## Naming Rules

All tokens should follow these rules:

- name by meaning, not appearance
- prefer role-based naming over raw-value naming in UI code
- avoid one-off token names tied to a single screen
- use consistent group prefixes

Recommended groups:

- `color.*`
- `type.*`
- `space.*`
- `radius.*`
- `border.*`
- `shadow.*`
- `motion.*`
- `layout.*`

Examples:

- good: `color.text.primary`
- good: `space.section.lg`
- good: `radius.control.md`
- bad: `blueButtonBg`
- bad: `homeCardRadius`
- bad: `gray300Text`

## Color Foundations

Onzait uses a warm editorial light surface system with one strong accent color.

### Color Intent

- surfaces should feel calm and slightly softened, not stark and sterile
- text should be high-contrast and structurally clear
- cobalt should be the only high-energy accent
- secondary emphasis should come from hierarchy, spacing, and typography before additional colors

### Primitive Color Palette

These are the raw values for `v1`.

#### Neutral Surfaces

- `color.primitive.neutral.0`: `#ffffff`
- `color.primitive.neutral.25`: `#fbf9f8`
- `color.primitive.neutral.50`: `#f5f3f3`
- `color.primitive.neutral.100`: `#efeded`
- `color.primitive.neutral.150`: `#e9e8e7`
- `color.primitive.neutral.200`: `#e4e2e2`
- `color.primitive.neutral.300`: `#dbdad9`

#### Text and Structural Neutrals

- `color.primitive.ink.900`: `#1b1c1c`
- `color.primitive.ink.700`: `#303031`
- `color.primitive.ink.600`: `#434656`
- `color.primitive.ink.500`: `#5f5e5e`
- `color.primitive.ink.400`: `#737688`
- `color.primitive.ink.300`: `#c3c5d9`

#### Accent

- `color.primitive.blue.500`: `#0055ff`
- `color.primitive.blue.600`: `#004dea`
- `color.primitive.blue.700`: `#0041c8`
- `color.primitive.blue.100`: `#e3e6ff`
- `color.primitive.blue.200`: `#dce1ff`
- `color.primitive.blue.300`: `#b6c4ff`

#### Functional

- `color.primitive.error.500`: `#ba1a1a`
- `color.primitive.error.100`: `#ffdad6`
- `color.primitive.error.700`: `#93000a`

## Semantic Color Tokens

These are the tokens components should actually use.

### Background and Surface

- `color.bg.canvas`: `#fbf9f8`
- `color.bg.surface`: `#ffffff`
- `color.bg.surface-low`: `#f5f3f3`
- `color.bg.surface-raised`: `#efeded`
- `color.bg.surface-strong`: `#e9e8e7`
- `color.bg.inverse`: `#303031`

### Text

- `color.text.primary`: `#1b1c1c`
- `color.text.secondary`: `#434656`
- `color.text.muted`: `#737688`
- `color.text.inverse`: `#f2f0f0`
- `color.text.accent`: `#0055ff`

### Border

- `color.border.default`: `#c3c5d9`
- `color.border.subtle`: `#e4e2e2`
- `color.border.strong`: `#737688`
- `color.border.accent`: `#0055ff`

### Action

- `color.action.primary.bg`: `#0055ff`
- `color.action.primary.bg-hover`: `#004dea`
- `color.action.primary.bg-pressed`: `#0041c8`
- `color.action.primary.text`: `#ffffff`

- `color.action.secondary.bg`: `#ffffff`
- `color.action.secondary.bg-hover`: `#f5f3f3`
- `color.action.secondary.text`: `#1b1c1c`
- `color.action.secondary.border`: `#c3c5d9`

### Status

- `color.status.error.bg`: `#ffdad6`
- `color.status.error.text`: `#93000a`
- `color.status.error.accent`: `#ba1a1a`

## Color Usage Rules

- Use cobalt only for primary actions, active states, links, progress, and key system emphasis.
- Do not introduce additional saturated brand colors into normal UI.
- Most hierarchy should come from typography, spacing, and surface contrast before color.
- Borders should stay subtle by default.
- Dark surfaces should be used intentionally, not as a default section style.

## Typography Foundations

Typography is one of the main structural tools of the system.

### Font Roles

- `Geist`: primary interface typeface
- `JetBrains Mono`: technical accent typeface

### Usage Rules

- Use `Geist` for all primary UI text.
- Use `JetBrains Mono` for labels, metadata, codes, breadcrumbs, coordinates, and small system accents.
- Do not use mono for large paragraphs or major headlines.
- Weight contrast should create hierarchy before color does.

### Type Scale

#### Display

- `type.display.xl`
  - font family: `Geist`
  - font size: `72`
  - line height: `79`
  - weight: `900`
  - letter spacing: `-0.04em`

#### Headline

- `type.headline.lg`
  - font family: `Geist`
  - font size: `48`
  - line height: `58`
  - weight: `900`
  - letter spacing: `-0.02em`

- `type.headline.lg-mobile`
  - font family: `Geist`
  - font size: `32`
  - line height: `38`
  - weight: `900`
  - letter spacing: `-0.02em`

- `type.headline.md`
  - font family: `Geist`
  - font size: `24`
  - line height: `31`
  - weight: `800`
  - letter spacing: `-0.01em`

#### Body

- `type.body.lg`
  - font family: `Geist`
  - font size: `18`
  - line height: `29`
  - weight: `400`

- `type.body.md`
  - font family: `Geist`
  - font size: `16`
  - line height: `26`
  - weight: `400`

- `type.body.sm`
  - font family: `Geist`
  - font size: `14`
  - line height: `22`
  - weight: `400`

#### Label and Mono

- `type.label.ui`
  - font family: `Geist`
  - font size: `14`
  - line height: `14`
  - weight: `600`
  - letter spacing: `0.02em`

- `type.label.mono`
  - font family: `JetBrains Mono`
  - font size: `12`
  - line height: `12`
  - weight: `500`
  - letter spacing: `0.05em`

## Typography Usage Rules

- Headlines should feel structural and compressed.
- Body copy should feel clean and calm, never cramped.
- Small labels should be used sparingly and intentionally.
- Metadata should read like technical support information, not decorative texture.

## Spacing Foundations

Onzait uses a `4px` base unit with a balanced default rhythm and occasional spacious moments.

### Primitive Spacing Scale

- `space.1`: `4`
- `space.2`: `8`
- `space.3`: `12`
- `space.4`: `16`
- `space.5`: `20`
- `space.6`: `24`
- `space.8`: `32`
- `space.10`: `40`
- `space.12`: `48`
- `space.16`: `64`
- `space.20`: `80`
- `space.24`: `96`

### Semantic Spacing

- `space.inline.xs`: `8`
- `space.inline.sm`: `12`
- `space.inline.md`: `16`
- `space.inline.lg`: `24`

- `space.stack.sm`: `8`
- `space.stack.md`: `24`
- `space.stack.lg`: `48`
- `space.stack.xl`: `96`

- `space.section.sm`: `32`
- `space.section.md`: `48`
- `space.section.lg`: `64`
- `space.section.xl`: `96`

### Density Rule

Default product density should be `balanced`.

Use more spacious spacing in:

- auth
- onboarding
- major headers
- top-of-screen summary areas

Use tighter spacing only when:

- the screen is data-dense
- the grouping remains clear
- readability is not reduced

## Layout Foundations

The layout system should feel editorial and controlled.

### Grid

- desktop: `12` columns
- tablet: `8` columns
- mobile: `4` columns

### Width and Margins

- `layout.maxWidth.content`: `1440`
- `layout.margin.desktop`: `64`
- `layout.margin.tablet`: `40`
- `layout.margin.mobile`: `20`
- `layout.gutter.default`: `24`

### Layout Rules

- content should sit inside a clear frame
- large sections should breathe
- cards should not feel randomly placed
- spacing should communicate hierarchy before decoration does

## Radius Foundations

The system uses moderate rounding, not hard-edged drafting and not soft consumer-app bubbles.

### Radius Scale

- `radius.none`: `0`
- `radius.sm`: `8`
- `radius.md`: `12`
- `radius.lg`: `18`
- `radius.xl`: `24`
- `radius.full`: `999`

### Intended Usage

- `radius.sm`: minor chips, tags, tiny controls
- `radius.md`: smaller fields and compact elements
- `radius.lg`: default controls
- `radius.xl`: cards, auth surfaces, prominent containers

### Radius Rules

- controls should generally use `radius.lg`
- cards should generally use `radius.xl`
- do not mix many different radii inside one screen without a strong reason

## Border Foundations

Borders are a primary structural tool.

### Border Width

- `border.width.default`: `1`
- `border.width.strong`: `1`
- `border.width.focus`: `1`

### Border Rules

- default borders should be subtle
- borders should support grouping and control clarity
- do not rely on thick borders for hierarchy
- focus states may use color change before extra thickness

## Elevation Foundations

Depth should feel restrained and architectural.

### Shadow Tokens

- `shadow.none`: `none`
- `shadow.card`: `0 8 24 0 rgba(27, 28, 28, 0.06)`
- `shadow.float`: `0 20 40 0 rgba(27, 28, 28, 0.08)`

### Elevation Rules

- most cards should rely on border + surface contrast first
- shadows should be soft and ambient
- avoid heavy dark glows
- use stronger elevation only for floating or temporary surfaces

## Motion Foundations

Motion should reinforce structure and state, not advertise itself.

### Motion Tokens

- `motion.duration.fast`: `120ms`
- `motion.duration.base`: `180ms`
- `motion.duration.slow`: `240ms`

- `motion.easing.standard`: `ease-out`
- `motion.easing.emphasis`: `cubic-bezier(0.2, 0.8, 0.2, 1)`

### Motion Rules

- transitions should be subtle and quick
- use motion to confirm interaction, not decorate still content
- avoid bouncy or playful movement
- stagger and reveal only when it improves orientation

## Baseline Component Rules

These are the default component-level foundation decisions for `v1`.

### Buttons

- use cobalt for primary actions
- default to `radius.lg`
- default touch height should feel balanced-to-generous
- label weight should feel confident but not loud

### Inputs

- use `radius.lg`
- use subtle borders
- use mono for technical placeholders and small label accents
- focus should rely on cobalt, not dramatic animation

### Cards

- use `radius.xl`
- use light surfaces and subtle borders
- use shadows sparingly

### Labels and Metadata

- favor mono for system-like metadata
- keep labels small and restrained
- do not cover screens in mono accents

## Code Translation Targets

This Step 2 foundation should translate into:

- one token source in code
- semantic color aliases in the theme
- typography utilities for `Geist` and `JetBrains Mono`
- shared spacing and radius constants
- control and card defaults that reflect this document

Primary files that should eventually align with this spec:

- [shared/ui/primitives/gluestack-ui-provider/config.ts](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/shared/ui/primitives/gluestack-ui-provider/config.ts:1)
- [tailwind.config.js](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/tailwind.config.js:1)
- [app/_layout.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/app/_layout.tsx:1)

## Practical Outcome

Step 2 is complete when the team can answer:

- what tokens exist
- how they are named
- what their intended roles are
- how density, color, type, and radius should feel by default

After this, the next step is to build the first system layer in code and Figma using these foundations.
