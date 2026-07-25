# Design System

Tessarion's visual language evokes a serious, calm, premium academic notebook. It strictly avoids colorful SaaS gradients, gamified aesthetics, and saturated status colors.

## Core Colors & Tokens

- **Canvas (Background):** Pale light yellow / cream (e.g., `#FDFBF7`)
- **Paper (Surfaces/Cards):** Warm off-white (e.g., `#FAFAF8`)
- **Raised Paper (Hover/Elevated):** Very light cream (e.g., `#FFFFFF` with subtle shadow)
- **Primary Charcoal (Main Text):** Pencil-writing charcoal, not absolute black (e.g., `#2B2B2A`)
- **Graphite (Secondary Text):** e.g., `#595957`
- **Muted Pencil (Tertiary/Borders):** e.g., `#8C8C8A`
- **Rule Line (Dividers):** Warm grey-beige (e.g., `#E6E4DD`)
- **Strong Rule (Active Borders):** Darker warm grey (e.g., `#D0CEC5`)

*Strict Rule:* No blue/navy remnants. Pure `#000000` and `#FFFFFF` are prohibited for large surfaces. Warnings, errors, and successes are represented in monochrome or highly muted tonal variations.

## Typography

- **Body:** Readable serif or humanist sans-serif (e.g., Inter, Lora, or system-ui).
- **Display:** Strong editorial display face for headings.
- **Brand/Wordmark:** Handwritten "Tessarion" wordmark used selectively.
- **Monospace:** Used strictly for traces, IDs, evidence blocks, code, and technical diagrams.

## Spacing, Scale, and Layout

- **Navbar Height:** Compact, fixed at 56px.
- **Top Padding:** Maximum 32px under navbar to primary content. No unexplained massive white space.
- **Section Spacing:** 48px maximum between major vertical sections.
- **Documentation Density:** High density, optimized for reading (max-width: 65ch for prose).
- **Grid:** 12-column flexible CSS Grid.
- **Radius:** Slight rounding (4px - 6px). No pill-shaped buttons.
- **Shadow:** Crisp, minimal drop shadows for elevation only (`0 2px 8px rgba(43, 43, 42, 0.08)`).

## Motion and Animation Rules

**Framer Motion / CSS Transitions:**
- **Respect `prefers-reduced-motion`:** All animations must immediately resolve or disable if the user requests reduced motion.
- **Allowed:** Subtle route-content reveals (150ms fade), panel expansion/collapse (layout transitions), tab underline slides.
- **Prohibited:** Scroll-jacking, parallax, delaying first-content-paint for animations, or continuous background movement.
