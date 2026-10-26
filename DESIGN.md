---
name: Monochrome Cadence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#303031'
  secondary-container: '#464747'
  on-secondary-container: '#b6b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-stat:
    fontFamily: Space Mono
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 76px
    letterSpacing: -0.04em
  display-stat-mobile:
    fontFamily: Space Mono
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Mono
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-mono:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-micro:
    fontFamily: Space Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.16em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-tablet: 1rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an austere, distraction-free environment for pure physical metrics. Designed for focused walkers, runners, and digital minimalists, the visual tone strips away gamified badges, rings, and saturated celebration graphics. 

The aesthetic operates at the intersection of Swiss High-Contrast Minimalism and Brutalist Precision. High legibility, structural order, and intentional hierarchy turn functional tracking data into an elegant, meditative dashboard. Every screen prioritizes single-glance clarity through deep negative space, hairline grid discipline, and colossal numeric forms.

## Colors

The system uses a strictly achromatic spectrum with zero chromatic saturation. Contrast tiers govern visual hierarchy:

- **Surface Primary (`#000000`)**: Deep black base canvas to optimize OLED display efficiency and produce infinite contrast.
- **Surface Elevation 1 (`#0A0A0A`)**: Base container fill for functional metric cards.
- **Surface Elevation 2 (`#171717`)**: Tonal contrast for secondary panels, segment controls, and sheet surfaces.
- **Text Primary / Accent (`#FFFFFF`, `#FAFAFA`)**: Reserved for live step counts, primary metrics, active states, and dominant focal points.
- **Text Secondary (`#A3A3A3`)**: Standard body text, contextual descriptions, and comparison data.
- **Muted & Tertiary Labels (`#737373`)**: Structural uppercase micro-labels, axis legends, and inactive tab icons.
- **Hairline Borders (`#262626`, `#1F1F1F`)**: Strict 1px division rules for grid separation and card perimeters without visual weight.
- **Micro-Indicators (`#404040`)**: Inactive progress track marks, background grid ticks, and secondary data bars.

## Typography

Typography establishes balance by pairing fixed-pitch precision with clean geometric body text.

- **Numeric & Metric Display**: Space Mono provides tabular, monospaced figures. This keeps rolling step totals, pacing, and distance values aligned without horizontal layout shift.
- **Labels & Micro-Data**: Set in Space Mono uppercase with wide tracking (`0.12em` to `0.16em`). Used for stat subtitles, graph axes, timestamp indicators, and status tags.
- **Body & Editorial Copy**: Set in Geist for neutral, high-density legibility in history logs, settings, and personal targets.

## Layout & Spacing

The layout is built for quick reading on mobile screens:

- **Mobile Canvas**: A 4-column fluid layout bounded by `margin` (16px) and `gutter` (12px).
- **Hero Stacking**: The primary metric area spans the full grid width, bounded by 32px to 40px vertical gaps to preserve negative space around numeric totals.
- **Secondary Matrix**: Key performance indicators (distance, active time, caloric burn) sit in a strict 2-column or 3-column modular grid using `gutter` spacing.
- **Divider Hairlines**: Panels and sections are divided by explicit 1px lines (`#262626`) rather than heavy whitespace buffers.

## Elevation & Depth

This system avoids blurred drop shadows and colored glows. Spatial hierarchy relies entirely on tonal surface transitions and structural borders:

- **Level 0 (Floor)**: Canvas background `#000000`.
- **Level 1 (Cards & Data Panels)**: Surface fill `#0A0A0A` outlined with a uniform 1px solid border of `#262626`.
- **Level 2 (Modals, Overlays, Floating Menus)**: Surface fill `#171717` framed by a 1px solid border of `#404040`.
- **Inactive Backdrops**: Dimming behind modal sheets is an untextured 85% alpha `#000000` wash without blur filters.

## Shapes

The design uses tight, technical corners. A subtle radius softens the high-contrast grid while maintaining a crisp, instrument-grade look.

- Base elements (cards, segment controllers, input fields) use `0.25rem` (4px).
- Larger modal surfaces and summary blocks scale to `0.5rem` (8px).
- Micro data tags, metric badges, and interactive pill-buttons use full circular bounds (`rounded-full`) to contrast against rectangular cards.

## Components

### Buttons & Interactive Controls
- **Primary Action**: Solid `#FFFFFF` fill with `#000000` text (Space Mono Bold, uppercase). No borders, instant visual inversion on tap (`#E5E5E5`).
- **Secondary Action**: `#000000` fill with 1px border of `#404040` and `#FAFAFA` text. Tap state sets border to `#FFFFFF`.
- **Icon Buttons**: Naked 44x44px target bounds, `#FFFFFF` vector line icon (1.5px stroke weight), with an optional 1px hairline perimeter.

### Stat Cards & Metric Tiles
- Rectangular `#0A0A0A` containers with 1px `#262626` borders.
- Top section holds the metric name in `label-micro` (`#737373`), bottom holds tabular values in `Space Mono` (`#FFFFFF`) with secondary units (`#A3A3A3`).

### Step Histograms & Charts
- Pure monochrome vertical bars.
- Inactive or historical periods render as solid `#262626` bars. Current or target-exceeding intervals render in pure `#FFFFFF`.
- Baseline axis uses a 1px solid `#404040` hairline with monospaced hour/day labels underneath in `label-micro`.

### Lists & Activity Logs
- Flat single-row stack with zero internal card fills. Separated by single-pixel horizontal dividers (`#1F1F1F`).
- Left-aligned calendar/session timestamps in `body-sm` (`#A3A3A3`); right-aligned monospaced step counts in `#FFFFFF`.

### Checkboxes, Toggles & Radios
- **Checkboxes**: Crisp 16x16px squares with 1px `#404040` border. Active state renders solid `#FFFFFF` fill with a `#000000` check glyph.
- **Segmented Controllers**: `#000000` frame with 1px `#262626` border; active segment uses solid `#171717` fill and `#FFFFFF` text.

### Bottom Navigation Bar
- Grounded `#000000` surface with a continuous 1px top border of `#262626`.
- Minimal stroke icons (24px) rendered in `#737373` for inactive states and `#FFFFFF` for the active view, marked by an underlying 2x2px solid white square dot.
### Share Card
- `ShareCard` (`src/features/share-card/`) is a fixed **360×640pt** poster captured at 3× → 1080×1920 PNG (Instagram Story); spec in `docs/spec-share-card.md`. Its canvas size, the preview's fit-scale and `BrandMark`'s icon-derived geometry are the allowed raw-number exceptions — everything else is tokens.
- Follows the theme. Every text sets `allowFontScaling={false}` so the PNG is identical on every device; the hero uses the `poster` role (76px), dropping to `display` past 6 characters.
- 96pt top/bottom padding keeps content out of the bands Instagram covers with its UI.
- `BrandMark` / `BrandLockup`: the app icon's seven pill bars, baseline and dot rebuilt from Views (tones = opacity steps of accent-fg, so light mode inverts the ramp) + lowercase "stridr" in Space Mono Bold. Use it for any branded surface instead of the PNG.
