---
name: TicketBox
colors:
  surface: '#faf8ff'
  surface-dim: '#d8d9e6'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#ecedfa'
  surface-container-high: '#e7e7f4'
  surface-container-highest: '#e1e1ee'
  on-surface: '#191b24'
  on-surface-variant: '#424656'
  inverse-surface: '#2e303a'
  inverse-on-surface: '#eff0fd'
  outline: '#737687'
  outline-variant: '#c3c6d8'
  surface-tint: '#0052dd'
  primary: '#004ccd'
  on-primary: '#ffffff'
  primary-container: '#0f62fe'
  on-primary-container: '#f3f3ff'
  inverse-primary: '#b4c5ff'
  secondary: '#a7391e'
  on-secondary: '#ffffff'
  secondary-container: '#fd7958'
  on-secondary-container: '#6e1500'
  tertiary: '#9e3100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c84000'
  on-tertiary-container: '#fff1ed'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#003da9'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a2'
  on-secondary-fixed: '#3c0700'
  on-secondary-fixed-variant: '#862208'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#191b24'
  surface-variant: '#e1e1ee'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

## Brand & Style

The design system is engineered for **TicketBox**, an authentication UI ecosystem where security, efficiency, and clarity are paramount. The brand personality is authoritative yet accessible, embodying the "blue-chip" reliability of enterprise-grade software while maintaining the agility of a modern startup.

The design style is **Corporate / Modern**, heavily influenced by IBM’s design ethos. It prioritizes functional aesthetics through systematic spacing, a rigorous grid, and a focus on high-legibility typography. The visual language utilizes a "utility-first" approach, where every element serves a clear purpose in the user's journey toward secure access. It avoids unnecessary flourishes, opting instead for a crisp, structured interface that evokes confidence and professional trust.

## Colors

The color palette is anchored by **IBM Blue (#0f62fe)**, used to denote primary actions and the brand's core identity. An energetic **Orange (#ff7a59)** serves as a strategic accent to draw attention to secondary highlights or marketing-driven conversion points within the auth flow.

A comprehensive neutral scale ranging from **#f9fafb** (Slate 50) to **#111827** (Slate 950) provides the structural foundation. Semantic colors for Success, Danger, and Warning follow industry standards to ensure immediate cognitive recognition of system states. 

**Color Application:**
- **Primary:** Buttons, active states, and focus indicators.
- **Surface:** Use #f9fafb for background canvases and white (#ffffff) for card surfaces to create subtle contrast.
- **Text:** Use #111827 for high-emphasis text and #4b5563 (Slate 600) for secondary metadata.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian look that excels in digital interfaces. The typographic scale is tightly controlled between 12px and 32px to maintain a compact, professional feel suitable for data-heavy authentication dashboards.

- **Headlines:** Use Semi-Bold (600) weights with slight negative letter-spacing to create a "locked-in" professional appearance.
- **Body:** Regular (400) weight is the default for readability.
- **Labels:** Medium (500) and Semi-Bold (600) weights are used for form headers and small UI hints to ensure they aren't lost in the layout.
- **Mobile Adaptation:** Large display titles scale down to 24px on mobile devices to prevent excessive line wrapping in narrow containers.

## Layout & Spacing

The layout is built on a **4px base unit**, following a geometric progression for spacing (4, 8, 16, 24, 32, 48, 64). This ensures a predictable rhythm across all components and page layouts.

**Grid Philosophy:**
- **Fluid Grid:** The system uses a 12-column fluid grid for desktop layouts with a maximum content width of 1280px.
- **Gutters:** Standardized at 16px to maintain a compact, "tight" enterprise feel.
- **Breakpoints:**
  - **Mobile (<640px):** 4-column grid, 16px side margins.
  - **Tablet (640px - 1024px):** 8-column grid, 24px side margins.
  - **Desktop (>1024px):** 12-column grid, 24px side margins.

For authentication screens (Login/Signup), content is typically centered in a fixed-width container (400px - 480px) to maintain focus and reduce eye-strain.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The design avoids heavy, muddy shadows in favor of crisp, multi-layered elevation that mimics physical light.

- **Surface (Level 0):** Used for the main background (#f9fafb).
- **Layer 1 (Subtle):** Used for standard cards and inputs. Shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`.
- **Layer 2 (Medium):** Used for dropdowns and hover states. Shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`.
- **Layer 3 (Large):** Reserved for modals and critical pop-overs. Shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`.

All elevated elements should have a subtle 1px border (#e5e7eb) to maintain definition against the background, even when shadows are present.

## Shapes

The shape language is structured and professional. While following a "Rounded" (Level 2) logic, the system applies specific radii to different component classes to create a hierarchical softening effect.

- **Inputs & Buttons:** 8px radius provides a modern yet stable appearance.
- **Cards & Containers:** 12px radius softens the larger layout blocks.
- **Modals & Overlays:** 16px radius distinguishes top-level floating elements from the underlying interface.

This variation in corner radius helps users subconsciously categorize elements: smaller radii for interaction-heavy components, larger radii for structural containment.

## Components

### Buttons
Primary buttons use the #0f62fe background with white text. They feature an 8px radius and a subtle hover transition that darkens the fill. Secondary buttons use a transparent background with a 1px border (#d1d5db) and Slate 900 text.

### Input Fields
Inputs are 44px in height for optimal touch and click targets. They use a white background, an 8px radius, and a 1px border (#d1d5db). On focus, the border changes to #0f62fe with a 2px offset ring for accessibility.

### Cards
Cards utilize a white background, a 12px corner radius, and the "Subtle" elevation shadow. A 1px border (#f3f4f6) ensures they remain distinct on off-white backgrounds.

### Chips / Badges
Chips are used for status indicators. They feature a 4px (Soft) radius rather than a full pill shape to maintain the professional aesthetic. They use low-opacity versions of semantic colors (e.g., Success green at 10% opacity) with high-contrast text.

### Modals
Modals are centered horizontally and vertically. They use the "Large" elevation shadow and a 16px corner radius. The header section is separated by a subtle 1px divider to keep actions clearly defined.

### Checkboxes & Radios
These follow a strict 8px (Small) size for the hit area but use the Primary #0f62fe for the checked state. Checkboxes have a 2px radius; radios are fully circular.