---
name: Onzait
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434656'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004dea'
  primary: '#0041c8'
  on-primary: '#ffffff'
  primary-container: '#0055ff'
  on-primary-container: '#e3e6ff'
  inverse-primary: '#b6c4ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#4e504f'
  on-tertiary: '#ffffff'
  tertiary-container: '#666867'
  on-tertiary-container: '#e7e7e5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e3e1'
  tertiary-fixed-dim: '#c6c7c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#454746'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '900'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.02em
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
  stack-xl: 96px
---

> Deprecated: this guide is no longer the source of truth. The active design system lives in `theme/tokens.js` and the atom primitives under `components/atoms/`.

## Brand & Style

The design system for Onzait is anchored in the precision of high-end architectural practice. It targets a professional audience that values structural integrity, technical excellence, and premium aesthetics. The UI evokes a sense of "digital blueprints" where every line has a purpose and every space is intentional.

The style is a hybrid of `Precision Minimalism` and `Technical Editorial`. It utilizes a rigorous geometric framework, razor-thin strokes, and a sophisticated interplay between stark surfaces and deep shadows. The atmosphere is future-forward and authoritative, balancing the coldness of technical software with the warmth of curated architectural photography.

## Colors

This design system utilizes a high-contrast palette to establish clear hierarchy and a premium feel.

- `Primary Action`: Cobalt Blue (`#0055ff`) is used exclusively for primary interactions, progress indicators, and active states. It provides a singular, high-energy focal point against the neutral base.
- `Surface Foundations`:
  - `Stark White` (`#ffffff`): The primary background for a clean, gallery-like feel.
  - `Deep Charcoal` (`#121212`): Used for sidebar navigation, footer regions, and high-impact "Dark Mode" sections within the light theme.
- `Warm Neutrals`: Subtle warm grays such as `#f7f7f5` and `#e5e5e0` are used for background layering and secondary containers to soften the technical edge and provide depth without using heavy shadows.
- `Functional Grays`: Mid-range grays are used for borders and secondary text to maintain legibility while respecting the `1px` stroke aesthetic.

## Typography

The typography strategy relies on extreme weight contrast. Headlines are set in `Geist Black`, creating a structural anchor on the page, while body text remains in `Regular` or `Medium` for maximum readability.

`JetBrains Mono` is introduced as a supporting technical accent font. It should be used sparingly for metadata, coordinates, architectural specs, and small labels to reinforce the SaaS and technical nature of the product. All typography should follow a strict baseline grid to ensure a rhythmic, engineered appearance.

## Layout & Spacing

The layout uses a `Fixed-Fluid Hybrid Grid`. Content is housed within a `12-column` grid with a maximum width of `1440px`, centered on the screen to maintain the editorial feel of a high-end monograph.

`Generous Whitespace`: Spacing is intentional and exaggerated. Large gaps (`stack-xl`) are used to separate major architectural sections, while tight, technical spacing (`unit * 2`) is used for data-dense tool panels.

Breakpoints:
- `Desktop (1440px+)`: `12` columns, `64px` margins
- `Tablet (768px - 1439px)`: `8` columns, `40px` margins
- `Mobile (Up to 767px)`: `4` columns, `20px` margins

## Elevation & Depth

This design system rejects heavy, muddy shadows in favor of `Light & Line` depth.

1. `Glassmorphism`: Navigation bars and floating panels use `backdrop-filter: blur(12px)` with an `80%` opaque white background.
2. `1px Borders`: The primary method of separation is a sharp `1px` border (`#e5e5e0`).
3. `Soft Shadows`: When depth is required, use `0px 20px 40px rgba(0, 0, 0, 0.05)`.
4. `Tonal Stacking`: Use the warm gray palette (`#f7f7f5`) to differentiate the background from surface containers.

## Shapes

The shape language is strictly `Geometric and Sharp`. A `0px` border radius is the default for all primary containers, buttons, and input fields. This mimics the hard edges of architectural drafting and structural beams.

In rare instances where a soft radius is needed for user comfort, a maximum of `2px` may be applied, but the overarching directive is `Sharp`.

## Components

- `Buttons`: Sharp `90-degree` corners. Primary buttons are solid Cobalt Blue (`#0055ff`) with white text. Secondary buttons use a `1px` Charcoal border with no fill.
- `Inputs`: `1px` borders on all four sides. On focus, the border color shifts to Cobalt Blue. Use JetBrains Mono for placeholder text to emphasize the technical entry.
- `Cards`: No shadows by default; use a `1px` border. On hover, the card may lift slightly using the soft shadow defined in Elevation.
- `Headers`: Always fixed with a `1px` bottom border and glassmorphism blur.
- `Data Accents`: Small mono labels should be placed in the top-right or bottom-left corners of images and containers to act as technical tags.
- `Progress Indicators`: Use thin, `2px` Cobalt Blue lines. Avoid thick or rounded loading bars.
- `Breadcrumbs`: Separated by a forward slash (`/`) in JetBrains Mono.
