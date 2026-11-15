---
name: Pro Career Advisory System
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#42474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#737780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3a608d'
  primary: '#002546'
  on-primary: '#ffffff'
  primary-container: '#0d3b66'
  on-primary-container: '#81a6d7'
  inverse-primary: '#a4c9fc'
  secondary: '#006689'
  on-secondary: '#ffffff'
  secondary-container: '#44c5fd'
  on-secondary-container: '#004f6b'
  tertiary: '#002547'
  on-tertiary: '#ffffff'
  tertiary-container: '#003b6b'
  on-tertiary-container: '#6ea7ed'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a4c9fc'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#204874'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#77d1ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004d68'
  tertiary-fixed: '#d3e4ff'
  tertiary-fixed-dim: '#a2c9ff'
  on-tertiary-fixed: '#001c38'
  on-tertiary-fixed-variant: '#004881'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Manrope
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
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The brand personality for the design system is **Professional, Trustworthy, and Empowering**. As a labor advisory platform, the UI must balance corporate authority with the approachability of a personal mentor.

The design style is **Corporate / Modern** with a focus on **Tonal Layering**. It utilizes generous whitespace, soft rounded corners, and a structured hierarchy to make complex career information digestible. The visual mood is calm and efficient, designed to reduce user anxiety during the job search or transition process. We avoid unnecessary decorative elements, focusing instead on clarity, progress tracking, and clear calls to action.

## Colors

The palette is anchored in a professional blue spectrum to evoke stability and growth.

- **Primary (#0D3B66):** Deep Navy used for high-level branding, primary headings, and critical navigation elements. It provides the "anchor" of trust.
- **Secondary (#38BDF5):** Bright Blue used for primary actions, progress indicators, and interactive highlights. It represents "the plus" and future-forward energy.
- **Tertiary (#2566A8):** Corporate Blue used for sub-navigation, secondary buttons, and icons.
- **Neutral / Surface (#F7FAFC):** A very light cool grey for main page backgrounds to reduce eye strain.
- **Subtle Highlight (#E6F2FB):** A soft blue tint used for card backgrounds, input field fills, and hover states to maintain a cohesive blue-tinted atmosphere without being overwhelming.

## Typography

We use **Manrope** for the entire system due to its modern, geometric construction and exceptional legibility across digital interfaces.

- **Headlines:** Use Bold or Extra-Bold weights with tighter letter spacing for a confident, structured look.
- **Body Copy:** Use Regular weight with generous line height (1.5x) to ensure long advisory articles are easy to read.
- **Labels:** Use Semi-Bold and uppercase styling for small metadata or section labels to create clear visual distinction from body text.
- **Responsiveness:** Large headlines scale down for mobile to prevent awkward text wrapping, maintaining a minimum of 24px for top-level headers on small screens.

## Layout & Spacing

This design system uses a **Fluid Grid** model with a 12-column structure for desktop and a single-column stack for mobile.

- **Rhythm:** All spacing is based on an 8px baseline grid to ensure mathematical harmony.
- **Safe Areas:** Main content containers have a 1200px max-width to keep line lengths readable on ultra-wide monitors.
- **Module Spacing:** Use `stack-lg` (48px) between major sections and `stack-md` (24px) for spacing between cards or content blocks within a section.
- **Padding:** Internal card padding should be a consistent 24px (3 units of 8px) to provide a premium, airy feel.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Soft Ambient Shadows**.

- **Level 0 (Background):** Neutral Grey (#F7FAFC).
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(13, 59, 102, 0.05)). This subtle tint in the shadow prevents a "muddy" look.
- **Level 2 (Active/Hover):** When a module or card is interacted with, it lifts slightly (0px 8px 30px rgba(13, 59, 102, 0.10)).
- **Separators:** Use 1px borders in the Subtle Highlight color (#E6F2FB) instead of heavy lines to maintain a clean aesthetic.

## Shapes

The design system utilizes **Rounded** (Level 2) geometry to feel approachable and modern.

- **Small Components:** Checkboxes and small tags use `0.25rem` (4px).
- **Standard Components:** Buttons and input fields use `0.5rem` (8px).
- **Large Components:** Module cards and profile containers use `1rem` (16px) or `1.5rem` (24px) to emphasize their role as distinct functional areas.
- **Interactive Elements:** Buttons should always have rounded corners to match the friendly brand voice.

## Components

### Buttons
- **Primary:** Bright Blue (#38BDF5) background with white text. High-contrast, rounded corners.
- **Secondary:** Transparent background with Deep Navy (#0D3B66) border and text.
- **Ghost:** No border, Deep Navy text, subtle light blue (#E6F2FB) background on hover.

### Module Cards
- White background, 16px corner radius, and Level 1 elevation.
- Use a 4px left-accent border in Primary Navy for "Active" modules.
- Include a clear title, brief description, and a footer section for progress.

### Progress Bars
- **Track:** Soft Blue (#E6F2FB), 8px height, fully rounded.
- **Fill:** Bright Blue (#38BDF5) gradient to Corporate Blue (#2566A8).
- Include percentage text in `caption` style aligned to the right.

### Input Fields
- Subtle Highlight (#E6F2FB) fill with a 1px border that turns Primary Blue on focus.
- Labels are always visible above the field in `label-md` style.

### Profile States
- **Status Chips:** Use rounded pills. "Completo" (Green), "En Proceso" (Bright Blue), "Pendiente" (Light Navy).
- **Profile Header:** Large avatar (circular) with a background cover using a subtle geometric pattern based on the logo icon's horizontal lines.