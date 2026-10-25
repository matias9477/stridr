---
name: Monochrome Cadence Light
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1c'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
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
    letterSpacing: 0em
  mono-tabular-lg:
    fontFamily: Space Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  mono-tabular-md:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  mono-code-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an uncompromising editorial aesthetic translated to daylight clarity: high-contrast, structured, and clinically refined. It merges the disciplined rigor of Swiss typography with contemporary technical brutalism. Designed for data-dense dashboards, financial terminals, executive analytics, and architectural tools, the visual signature prioritizes absolute legibility, geometric precision, and an absence of ornamental distraction.

The emotional tone is authoritative, intellectual, and surgical. By stripping away extraneous hues and soft organic forms, the interface draws total focus to information hierarchy, tabular precision, and micro-cadence layout grids. Tactile perception is achieved through razor-thin hairline borders, deep carbon ink contrasts, and tabular monospace data points that read like an avant-garde technical ledger.

## Colors

The palette operates within strict monochromatic parameters, utilizing absolute value contrasts to establish rhythm and structure.

- **Canvas & Backdrops:**
  - Base canvas: `#FFFFFF` (pure white for primary reading surfaces and card backgrounds).
  - Recessed / Canvas level 1: `#F8F8F8` (subtle off-white for app shells, sidebars, and inactive panels).
  - Recessed / Canvas level 2: `#F0F0F0` (table headers, secondary toolbars, and inactive track elements).

- **Ink & Typography:**
  - Primary text / accents: `#000000` (deep stark black for display headers, primary values, and dominant interactive elements).
  - Secondary text / structural icons: `#111111` (near-black for primary body text, ensuring high contrast without excessive visual vibration).
  - Supporting text / muted captions: `#737373` (neutral gray for micro-labels, metadata, and disabled indicators).

- **Hairline Dividers & Borders:**
  - Standard border: `#E5E5E5` (crisp 1px hair-width demarcation between distinct content blocks).
  - Strong structural border: `#D4D4D4` (used for active cell focus, deliberate grid boundaries, and primary card perimeters).

## Typography

The typographic hierarchy relies on a functional triad:
1. **Space Grotesk** commands display titles, section headings, and capitalized tracking labels. Its geometric, slightly mechanical grotesque curves provide an editorial punch.
2. **Geist** governs all long-form reading, general UI elements, and interactive text, delivering Swiss neutrality and high legibility at micro scales.
3. **Space Mono** serves as the mathematical backbone. All numerical figures, financial tallies, timestamps, statuses, and data cells must be rendered using Space Mono to guarantee tabular alignment and distinct technical character.

All uppercase labels utilize `label-caps` with explicit letter-spacing (`0.08em`) to balance ink weight. Tabular numbers must enforce tabular lining features where supported to avoid visual jitter across dynamic updates.

## Layout & Spacing

The layout philosophy follows a rigid, architectural grid rhythm where content modules dock directly against adjacent containers using shared hairline boundaries.

- **Grid Architecture:**
  - **Desktop (>= 1280px):** 12-column system, `margin-desktop` (3rem) edge offset, and `gutter-desktop` (1.5rem). Cards and panels may also utilize a zero-gutter collapsed-border grid for dense data dashboards.
  - **Tablet (768px - 1279px):** 8-column system, `margin-tablet` (2rem), and `gutter` (1rem).
  - **Mobile (< 768px):** 4-column system, `margin` (1rem), and `gutter` (1rem). Layouts collapse to a single vertical column with stackable hairline card modules.

All element gaps, card paddings, and alignment stems strictly adhere to the `space-*` scale. Component padding relies heavily on consistent mathematical pairing: horizontal padding is always one step wider than vertical padding (e.g., vertical `space-sm` with horizontal `space-md`).

## Elevation & Depth

This design system rejects conventional drop shadows and blurred depth illusions. Depth is communicated strictly through structural layering, background tone shifts, and hairline rules.

- **Zero-Shadow Philosophy:** Elements do not float in simulated 3D space; they exist as planar surfaces etched into the layout. Drop shadows (`box-shadow`) are prohibited, except for a high-precision, non-diffused 1px offset key-line for floating tooltips (`box-shadow: 2px 2px 0px #000000`).
- **Tonal Layers:**
  - Level 0 (Base background): `#F8F8F8`.
  - Level 1 (Panels, content cards, sidebars): `#FFFFFF`.
  - Level 2 (Selected states, table header strips, sub-modules): `#F0F0F0`.
- **Low-Contrast Outlines & Hairlines:**
  - Boundaries between sections are defined by 1px solid borders (`#E5E5E5`).
  - Active, focused, or elevated states do not produce a shadow; instead, they transition to a sharp 1px solid `#000000` boundary or invert foreground and background colors.

## Shapes

The geometric framework is strictly sharp (`roundedness: 0`). 

- Every corner across the system maintains a crisp 90-degree angle (0px border-radius). This applies universally to buttons, inputs, modal dialogs, chips, cards, banners, and dropdown menus.
- The rectangular discipline reinforces the print-journalism and technical blueprint aesthetic, allowing adjacent components to lock together along shared hairlines without visual gaps or curved intersections.

## Components

### Buttons
- **Primary:** Solid `#000000` background, `#FFFFFF` text (`Space Grotesk`, medium/semibold weight), 0px corner radius. On hover: inverts or brightens subtly to `#1A1A1A`. On active: 1px inset border of `#FFFFFF`.
- **Secondary / Outlined:** Transparent or `#FFFFFF` background, `#000000` text, 1px solid `#000000` border. On hover: inverts completely to solid `#000000` background with `#FFFFFF` text.
- **Ghost:** Transparent background, `#111111` text, 1px solid transparent border. On hover: `#F0F0F0` background with a 1px solid `#E5E5E5` border.

### Input Fields & Selects
- Background: `#FFFFFF`. Border: 1px solid `#E5E5E5`.
- Text: `#000000`, typed in `Geist`. Placeholder: `#737373`.
- Focus state: Border transitions instantly to 1px solid `#000000`. No outer glow or halo.
- Numerical / Data inputs: Text styled strictly with `Space Mono`.

### Checkboxes & Radio Buttons
- Square geometry (0px border radius) for both checkboxes and radio selectors to maintain the architectural language.
- Unchecked: `#FFFFFF` fill, 1px solid `#D4D4D4`.
- Checked: Solid `#000000` fill with a stark `#FFFFFF` inner square or geometric cross mark.

### Chips & Badges
- Height: 24px compact strip.
- Surface: `#F0F0F0` background with a 1px `#E5E5E5` hairline perimeter.
- Typography: `Space Mono` or uppercase `label-caps` in `#111111`.
- Active/Filter chip: `#000000` background with `#FFFFFF` text.

### Cards & Modular Panels
- Background: `#FFFFFF`.
- Border: 1px solid `#E5E5E5`.
- Internal dividers: 1px solid `#F0F0F0` to segregate header, body, and footer areas.
- Header pattern: Compact `#F8F8F8` background band containing uppercase tracking headers (`label-caps`) and monospaced item IDs.

### Data Tables (Terminal Cadence)
- Row height: Compact (36px to 44px).
- Header row: `#F8F8F8` background, 1px solid bottom border (`#000000`), typography set in `label-caps` (`#737373`).
- Data cells: Rendered in `Space Mono`, right-aligned for numeric metrics, separated by 1px horizontal hairlines (`#E5E5E5`). No vertical column dividers within the table interior.
- Hover row state: `#F8F8F8` continuous highlight.

### Status Indicators
- Statuses avoid saturated chromatic red/green/yellow indicators.
- Status is communicated via typographic tags (e.g., `[ LIVE ]`, `[ HALT ]`, `[ IDLE ]`) or geometric glyphs (filled square `■`, hollow square `□`, diagonal hatch) in high-contrast ink or muted gray.