---
name: Vibrant Pulse
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4a4455'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7b7486'
  outline-variant: '#ccc3d7'
  surface-tint: '#7331df'
  primary: '#5300b7'
  on-primary: '#ffffff'
  primary-container: '#6d28d9'
  on-primary-container: '#dac5ff'
  inverse-primary: '#d3bbff'
  secondary: '#b4136d'
  on-secondary: '#ffffff'
  secondary-container: '#fd56a7'
  on-secondary-container: '#600037'
  tertiary: '#6b3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f4200'
  on-tertiary-container: '#ffc19e'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebddff'
  primary-fixed-dim: '#d3bbff'
  on-primary-fixed: '#250059'
  on-primary-fixed-variant: '#5b00c5'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68b'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743400'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
  success: '#2DC275'
  warning: '#F59E0B'
  surface-bg: '#F9FAFB'
  border-subtle: '#E5E7EB'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for the high-energy ticketing sector, blending a professional "Corporate Modern" foundation with "Vibrant Bold" accents. It targets a young, tech-savvy Vietnamese demographic that values speed, reliability, and social status. 

The aesthetic is characterized by clean, card-based layouts that prioritize event imagery while maintaining a rigorous structural hierarchy. We utilize high-saturation brand colors to guide the user's eye through the "discovery-to-purchase" funnel. The interface should feel premium yet accessible, evoking the excitement of live events through subtle gradients and crisp, high-quality photography.

## Colors
The palette is dominated by **Vibrant Purple** for primary actions and brand presence, paired with **Accent Pink** for highlights and promotional banners. 

- **Primary (#6D28D9):** Used for main CTAs, selection states, and brand identifiers.
- **Secondary (#EC4899):** Used for price tags, "Selling Fast" badges, and secondary buttons.
- **Neutral (#212121):** Deep charcoal for text and heavy structural elements, ensuring high legibility against white backgrounds.
- **Surface & System:** We utilize a light-mode default with a very light gray background (#F9FAFB) to allow white cards to "pop" via elevation. Success green is inherited from industry standards to signal completed transactions.

## Typography
This design system utilizes **Inter** exclusively to ensure a systematic, utilitarian feel that remains highly readable at small sizes (essential for ticket details and seating charts). 

Hierarchy is established through aggressive weight scaling rather than just size. Display and headline levels use Bold or Extra Bold weights with slight negative letter spacing to create a compact, modern impact. Body text remains at Regular weight with generous line height for maximum accessibility. Labels for metadata (e.g., "Date," "Venue") use medium-weight uppercase styles for immediate scannability.

## Layout & Spacing
The design follows a **fixed grid model** for desktop (1440px max-width) and transitions to a fluid model for mobile.

- **Grid:** A 12-column grid is used for desktop discovery pages, while 1-column or 2-column layouts are used for checkout forms to minimize cognitive load.
- **Spacing Rhythm:** Based on an 8px scale. Use 16px (base * 2) for internal card padding and 32px (base * 4) for section vertical spacing.
- **Responsive Behavior:** On mobile, margins shrink to 16px, and multi-column grids reflow into a single vertical stack. Event cards transition from a horizontal layout to a vertical "poster-style" layout on smaller screens.

## Elevation & Depth
Visual hierarchy is achieved through a mix of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** #F9FAFB.
- **Level 1 (Cards/Base):** White (#FFFFFF) with a 1px border (#E5E7EB) and a very soft shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
- **Level 2 (Hover/Active):** Increased shadow depth (0px 10px 30px rgba(109, 40, 217, 0.1)) to indicate interactivity.
- **Level 3 (Modals/Overlays):** High-contrast shadows with a semi-transparent backdrop blur (8px) for checkout flows, ensuring the user remains focused on the transaction.

## Shapes
A **Rounded** shape language (8px to 12px) is used to soften the professional aesthetic and make the platform feel inviting.

- **Buttons & Inputs:** 8px (`rounded-md`) for a precise, functional look.
- **Event Cards:** 12px (`rounded-lg`) to match the container-based form style requested.
- **Chips & Badges:** Full pill-shaped (`rounded-full`) to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use the Vibrant Purple (#6D28D9) with white text. Success states for "Purchase Confirmed" use the Green (#2DC275). Disabled states use #E5E7EB with gray text.
- **Inputs:** 12px rounded corners with a 1px border. On focus, the border shifts to Primary Purple with a subtle outer glow. Error states utilize a red border and helper text.
- **Event Cards:** These are the core component. They feature a top-heavy image, 12px rounded corners, and a white background. Pricing is always displayed in the bottom right using the Secondary Pink (#EC4899) for visibility.
- **Chips:** Used for genre tags (e.g., "K-Pop", "Rock"). These should have a light purple background with dark purple text.
- **Status Indicators:** Success (Green), Warning (Amber), and Error (Red) indicators are used primarily in the checkout funnel to provide real-time feedback on seat availability and payment processing.
- **Loading:** Utilize a shimmering skeleton loader that mimics the card structure to reduce perceived wait times.