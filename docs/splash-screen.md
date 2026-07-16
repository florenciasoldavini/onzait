# Splash Screen

Purpose: document the tracked Onzait splash implementation and asset update workflow
Source of truth for: splash artwork, timing, platform behavior, and export requirements
Update when: splash artwork, animation timing, native configuration, or supported appearance changes
Last reviewed: 2026-07-16

## Implementation

- `components/splash/animated-splash.tsx` is the branded launch presentation shared by web, iOS, and Android.
- `components/splash/splash-state.ts` owns the sequence, completed-tagline hold, and fade timings.
- `app.json` configures the reproducible native launch handoff through `expo-splash-screen`.
- Native launch screens use the Onzait navy background and `assets/images/splash-placeholder.png`, a transparent 1 x 1 PNG. This avoids a static logo appearing before the animated React view is ready.
- `assets/images/splash-icon.png` is the 1024 x 1024 transparent raster reference for the current Onzait mark. The animated mark uses the matching vector paths embedded in `animated-splash.tsx` so it stays sharp at every screen size.

The current treatment is intentionally the same in light and dark appearance. The navy background, white wordmark, and blue accents are part of the approved Onzait brand treatment.

## Updating the artwork

1. Start from the approved Onzait vector logo; do not trace or rescale a small raster export.
2. Export the raster reference as a 1024 x 1024 RGBA PNG with a transparent background and replace `assets/images/splash-icon.png`.
3. Update both vector paths in `components/splash/animated-splash.tsx` from the same approved vector source.
4. Keep the artwork centered within its view box with enough transparent safe area to avoid clipping on narrow phones and tablets.
5. Keep `assets/images/splash-placeholder.png` fully transparent and 1 x 1 unless the native handoff design intentionally changes.
6. Run `npx expo prebuild --clean` locally to inspect generated iOS and Android resources, but do not commit the generated `ios/` or `android/` directories.
7. Uninstall the iOS app before the first verification build after changing launch assets because iOS caches launch screens.

## Verification

After changing the splash, verify:

- iOS and Android cold launches on a representative phone size;
- mobile and desktop web layouts;
- no static-logo flash between the native handoff and animated view;
- the complete `BUILT FOR THE SITE` tagline remains visible before navigation;
- reduced-motion behavior skips the decorative animation and does not delay access;
- `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Ownership

The logo and splash artwork are Onzait project brand assets and are covered by the repository's proprietary license. No third-party splash artwork is included.
