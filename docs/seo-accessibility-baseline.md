# SEO And Accessibility Baseline

Purpose: practical standards for public-page SEO and product-wide accessibility
Source of truth for: what to optimize for, where SEO matters, and what accessibility expectations apply to shared components and MVP features
Update when: public page strategy, rendering strategy, routing, shared UI primitives, or accessibility expectations change
Last reviewed: 2026-05-12

## Scope

This baseline covers two different concerns:

- SEO for public, indexable web pages
- accessibility for all product surfaces, including web and native

For `onzait`, these should not be treated the same way:

- SEO matters mostly on public web pages
- accessibility matters everywhere

## Core principles

- Optimize SEO only for pages that are intentionally public and indexable.
- Do not spend SEO effort on authenticated app screens unless they are meant to rank publicly.
- Build accessibility into shared components and feature work from the start.
- Prefer clarity, semantics, and performance over decorative complexity.

## SEO baseline

### Where SEO matters

Primary SEO surface:

- homepage
- feature pages
- use-case or industry pages
- contact or demo pages
- future public case studies or public share pages

Low-priority SEO surface:

- authenticated dashboards
- internal CRUD screens
- private project/task views

### Public page requirements

Every public page should have:

- a unique page title
- a unique meta description
- one clear `h1`
- logical heading structure below the `h1`
- descriptive URL slugs
- indexable text content that exists in the HTML output
- good Open Graph metadata

### Content rules

- avoid thin pages with very little real content
- avoid duplicate titles and descriptions
- avoid vague headings like `Platform` or `Solutions` without clear context
- write copy for real search intent, not keyword stuffing
- ensure important content is not only embedded inside images

### Technical SEO expectations

- use clean, stable URLs
- avoid creating multiple public URLs for the same content without a canonical strategy
- keep public pages fast, especially on mobile
- make sure public pages render meaningful content without requiring private app state
- use descriptive link text instead of generic `click here`

### Social sharing

Public pages should also be good share targets:

- Open Graph title
- Open Graph description
- Open Graph image
- Twitter/X card metadata if you add it

### SEO non-goals for now

This baseline does not require:

- a large content marketing system
- blog infrastructure
- advanced schema markup on day one
- SEO optimization for private app routes

## Accessibility baseline

Accessibility applies to:

- public website content
- authenticated web app flows
- native iOS and Android screens

### Shared component expectations

All shared UI primitives should support:

- readable contrast
- visible focus states on web
- accessible labels for controls
- predictable disabled states
- touch-friendly target sizes
- keyboard operability where applicable
- screen-reader friendly names for icon-only actions

### Form requirements

Every form should have:

- a real label for each input
- placeholder text that is supplementary, not the only label
- one clear required-versus-optional convention when both appear in the same form; the current convention labels optional fields and leaves required fields unmarked
- clear validation messaging
- error indication that does not rely on color alone
- accessible submit/loading states
- disabled submit actions until all required inputs are complete
- correct keyboard type and autofill hints where applicable

### Web accessibility requirements

For web screens:

- use semantic headings in a logical order
- maintain keyboard navigation support
- ensure visible focus treatment
- ensure links and buttons are distinguishable
- avoid trapping keyboard users in overlays or modals
- announce important status changes where practical

### Native accessibility requirements

For native screens:

- use meaningful accessibility labels on icon-only controls
- ensure tap targets are comfortably usable
- avoid tiny or crowded controls
- ensure important status and action text remains readable

### Motion and perception

- do not rely on animation alone to communicate important state
- avoid excessive motion in critical flows
- keep feedback clear even if motion is reduced

### Data-dense screens

This will matter for upcoming project and task views.

Requirements:

- strong hierarchy
- consistent spacing
- scannable labels
- clear distinction between primary and secondary actions
- no overload of equal-weight controls

Dense operational screens are acceptable, but they still need to be quickly understandable.

## Feature-specific guidance

### Auth

- every input needs a real label
- password visibility toggles need accessible names
- OAuth buttons need explicit labels
- loading and error states need to be obvious

### Projects

- project lists should be easy to scan
- project cards or rows should expose clear names and statuses
- primary actions should be obvious without excessive visual noise

### Tasks

- task status should not rely on color alone
- assignment, due dates, and priority should remain readable at a glance
- inline actions should stay large enough to tap comfortably

### Uploads and photos

- upload controls need clear labels and error handling
- image previews should include alternative text or descriptive labels when meaningful on web
- file state should be understandable without relying only on icons

## Review checklist

Before shipping a public page, confirm:

- it is intentionally public
- it has a unique title and meta description
- the heading structure is clear
- important content exists as text
- the URL slug is descriptive
- the page loads reasonably well on mobile

Before shipping any feature screen, confirm:

- all controls have labels
- focus and keyboard behavior work on web
- tap targets are usable on mobile
- errors are understandable
- hierarchy is scannable
- color is not the only channel used to communicate meaning

## Non-goals for now

This baseline does not yet require:

- WCAG conformance documentation
- full screen-reader audits for every screen
- advanced structured data across the whole marketing surface
- enterprise-grade accessibility compliance process

Those may become relevant later. For now, the priority is shipping an MVP that is discoverable where it should be and usable for real people on web and mobile.
