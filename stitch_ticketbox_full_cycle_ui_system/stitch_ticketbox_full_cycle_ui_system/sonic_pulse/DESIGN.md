---
name: Sonic Pulse
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#41485e'
  on-tertiary: '#ffffff'
  tertiary-container: '#586076'
  on-tertiary-container: '#d4dbf5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is built for a high-energy, premium concert ticketing experience. It targets a tech-savvy audience that values speed, reliability, and the emotional rush of live events. The aesthetic is **Corporate Modern** with a **High-Contrast** edge, blending the precision of an enterprise SaaS platform with the vibrant energy of a music festival.

The visual language communicates authority and excitement. It utilizes heavy whitespace to maintain clarity during high-traffic on-sales, while using "Electric Violet" accents to guide users toward conversion. The overall feel is "Tech-Forward Luxury"—clean enough to be functional, yet bold enough to feel like an extension of the event experience itself.

## Colors
The palette is dominated by **Deep Indigo** (Primary) for structural elements and **Electric Violet** (Secondary) for primary actions and interactive highlights. 

- **Primary & Secondary:** Used for branding, primary buttons, and active navigation states.
- **Surface & Neutrals:** A range of cool grays (`#F8FAFC` to `#0F172A`) ensures a crisp, clean environment.
- **Tier System:** Rigid adherence to color coding for ticket tiers is required to ensure user clarity during the fast-paced selection process. Gold and Purple denote premium tiers, while Teal and Blue denote standard tiers.
- **Seat Mapping:** Use low-saturation grays for unavailable states to ensure the "Selected" Violet pops significantly on the seat map.

## Typography
The system uses a dual-font strategy to balance character with utility. 

- **Montserrat** is reserved for headings and display text, providing a geometric, bold, and modern feel that resonates with concert branding.
- **Inter** is used for all functional UI elements, body text, and data-heavy tables. Its high x-height ensures maximum readability for ticket details and pricing information.
- **Scalability:** Display sizes must drop by approximately 30% on mobile to maintain the "above-the-fold" visibility of ticket purchase buttons.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** All spacing follows a 4px base unit. 
- **Layout Model:** Use a fixed-width container (`1280px`) for seat selection and checkout pages to prevent eye-strain on ultra-wide monitors. Marketing and landing pages may use a fluid layout with 40px side margins.
- **Seat Map Specifics:** The seat map interface should occupy a dedicated viewport-locked container with its own internal scrolling and zooming mechanics, independent of the page's global scroll.

## Elevation & Depth
Depth is achieved through **Ambient Shadows** and **Tonal Layering**. 

- **Base Level:** The background is the lowest level (`#F8FAFC`).
- **Mid Level (Cards/Modals):** Elements are elevated using a soft, diffused shadow: `0px 4px 20px rgba(15, 23, 42, 0.08)`.
- **Top Level (High-Priority):** Critical items like the "Purchase Summary" drawer use a more aggressive shadow and a 1px Indigo border to signify importance.
- **Interactive States:** On hover, cards should lift slightly (y-axis shift) with an increased shadow spread to provide tactile feedback.

## Shapes
The shape language is "Friendly Professional." 

- **Corner Radius:** A standard `12px` (`0.75rem`) radius is applied to cards, input fields, and containers. 
- **Buttons:** Use a `rounded-lg` (`1rem`) or full-pill shape for primary call-to-actions to make them feel approachable and distinct from informational containers.
- **Icons:** Icons should feature slightly rounded terminals to match the typography's softness.

## Components

### Buttons
- **Primary:** Solid Electric Violet with white text. High-energy, high-contrast.
- **Secondary:** Ghost style with an Indigo outline.
- **States:** Hover states should darken the background color by 10%. Active (click) states should scale the button down to 98% for a tactile "press" feel.

### Input Fields & Selectors
- Standardized `12px` corners.
- Focus state: 2px solid Electric Violet border with a soft glow (3px spread).
- Labels are always external and positioned above the field using the `label-sm` style.

### Status Indicators
- **Queuing:** A pulsing Indigo dot.
- **Syncing:** A rotating linear shimmer effect (Skeleton-style).
- **Error:** High-visibility Red (`#EF4444`) with a soft red background tint for the container.

### Seat Map & Legend
- Seats are represented by small circles or squares with a `4px` radius.
- Standard tooltips appear on hover showing Section, Row, and Price.
- Legend items must always be visible in a sticky footer or sidebar during the selection process.

### Loading States
- Use **Shimmer / Skeleton screens** rather than spinners for page transitions.
- Shimmer direction: Left-to-right, 2-second duration, subtle gray-to-white gradient.