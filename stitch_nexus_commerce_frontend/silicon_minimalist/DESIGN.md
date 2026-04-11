# Design System: Editorial Precision for Nexus Commerce

## 1. Overview & Creative North Star
The creative North Star for this design system is **"The Silicon Gallery."** 

We are moving away from the cluttered, spec-heavy world of typical hardware retail. Instead, we treat high-performance GPUs as works of industrial art. The system prioritizes breathing room, high-contrast typography, and a "physical" layering approach inspired by Apple’s high-end editorial layouts. 

To break the "standard template" feel, this design system utilizes **intentional asymmetry**. Product imagery should often bleed off-edge or overlap container boundaries, while typography scales are pushed to extremes—pairing massive, tight-tracked display headers with delicate, airy body copy. This is not just a store; it is a curated exhibition of power.

---

## 2. Colors & Tonal Philosophy

The palette is rooted in iOS-standard neutrals but elevated through a strict application of depth.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders (`#DDDDDD` or similar) are strictly prohibited for sectioning. Structural boundaries must be defined solely through background color shifts. 
- A product specification block (`surface-container-low`) should sit on the main `surface` without a stroke. 
- Use the transition from `#FFFFFF` (Primary) to `#F2F2F7` (Secondary/Grouped) to signal content shifts.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked premium materials:
- **Base Layer (`surface`):** The canvas. Pure white or deep black.
- **Mid Layer (`surface-container-low`):** Used for large content blocks or grouped list sections.
- **Top Layer (`surface-container-lowest`):** Used for interactive cards that need to "pop" against a secondary background.

### The Glass & Gradient Rule
To move beyond "flat" design, utilize **Glassmorphism** for persistent elements (Navigation bars, floating carts).
- **Token:** `rgba(255, 255, 255, 0.72)` with a `20px` backdrop-blur.
- **CTAs:** For main "Buy" actions, use a subtle gradient from `primary` (#0058BC) to `primary-container` (#0070EB) at a 135-degree angle. This adds "soul" and a tactile, backlit quality to the hardware-centric experience.

---

## 3. Typography: The Editorial Voice

We use **SF Pro** as a structural pillar. The hierarchy is designed to feel like a high-end tech magazine.

| Level | Token | Font | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | SF Pro Display | 3.5rem | 700 | -0.05em |
| **Headline**| `headline-lg` | SF Pro Display | 2.0rem | 700 | -0.02em |
| **Title**   | `title-lg` | SF Pro Display | 1.375rem| 600 | Standard |
| **Body**    | `body-lg` | SF Pro Text | 1.0rem | 400 | Standard |
| **Label**   | `label-md` | SF Pro Text | 0.75rem | 500 | +0.02em |

**Typography Intent:**
- **Display/Headlines:** Always use -0.5px letter spacing. This creates a "tight," authoritative look common in premium branding.
- **Body:** SF Pro Text is optimized for legibility at smaller scales, ensuring technical GPU specs remain readable.

---

## 4. Elevation & Depth

### The Layering Principle
Hierarchy is achieved through **Tonal Layering**. Instead of using shadows to lift every card, stack your surfaces:
- Place a `surface-container-lowest` (#FFFFFF) card on a `surface-container-low` (#F2F2F7) background. The 3% difference in luminance provides a sophisticated, natural lift.

### Ambient Shadows
When an element must float (e.g., a "Compare" modal), use the **Ambient Shadow**:
- `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);`
- The shadow should never be pure black; it should feel like a soft glow of light being blocked by a premium object.

### The "Ghost Border" Fallback
If accessibility requires a container edge in Dark Mode, use a **Ghost Border**:
- `outline-variant` (#C1C6D7) at **15% opacity**. This provides a hint of an edge without introducing visual "noise."

---

## 5. Component Guidelines

### Buttons (The "Touch" Targets)
- **Primary:** Gradient-filled (iOS Blue), `xl` (1.5rem) radius. High-gloss finish.
- **Secondary:** `surface-container-high` background with `on-surface` text. No border.
- **Tertiary:** Ghost style; text only with `primary` color.

### Spec-Cards (GPU Details)
- **Forbid Dividers:** Do not use horizontal lines between "Memory," "Clock Speed," and "TDP." Instead, use `24px` vertical spacing to separate groups.
- **Layout:** Use a 2-column asymmetric grid. Image on the left (bleeding out), specs on the right.

### Input Fields
- **State:** `surface-container-highest` background.
- **Focus:** No heavy outline; use a 2px `primary` glow with a soft `4px` spread.

### Visual "Hardware" Chips
Used for specs like "Ray Tracing" or "8GB VRAM." These should use the `Glassmorphism` rule to mimic the transparency of modern PC case side panels.

---

## 6. Do’s and Don'ts

### Do:
- **Use "White Space" as a functional element.** If a section feels crowded, double the padding rather than adding a divider.
- **Leverage Asymmetry.** Place a GPU image slightly off-center to create a sense of motion and high-end photography.
- **Respect the iOS Radius Scale.** Use `20px` for large cards and `8px` for small interior elements (like chips).

### Don't:
- **Never use 100% black shadows.** They look "cheap" and digital.
- **Avoid "Default" Grids.** Do not align everything to a rigid center. Align typography to the left and allow imagery to define the right-side rhythm.
- **No Dividers.** If you feel the need to add a line, try changing the background color of the next section by 2% instead.

### Accessibility Note:
While we use tonal shifts, ensure the contrast ratio between `on-surface` and `surface` always meets WCAG AA standards. In Dark Mode, the "Ghost Border" becomes mandatory for interactive elements to ensure they don't disappear into the `primary-black` background.