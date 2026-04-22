---
name: Incheon WYD 2027 Assistant
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414751'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#717783'
  outline-variant: '#c1c7d3'
  surface-tint: '#0060ac'
  primary: '#005da7'
  on-primary: '#ffffff'
  primary-container: '#2976c7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#ab3236'
  on-secondary: '#ffffff'
  secondary-container: '#ff706f'
  on-secondary-container: '#710212'
  tertiary: '#5d5c55'
  on-tertiary: '#ffffff'
  tertiary-container: '#76746d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#8a1921'
  tertiary-fixed: '#e6e2d9'
  tertiary-fixed-dim: '#c9c6be'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484741'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  chat-bubble:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

This design system is built upon the emotional metaphor of a "daughter explaining things to her father." It prioritizes patience, clarity, and warmth over technical efficiency or industrial coldness. The brand personality is hospitable and guiding, ensuring that every interaction feels like a supportive conversation rather than a transactional data exchange.

The visual style blends **Soft Minimalism** with **Tactile UI** elements. It utilizes ample whitespace to prevent cognitive overload, while subtle shadows and organic shapes provide a sense of physical presence and comfort. The overall aesthetic is designed to evoke a sense of peace and "home," mirroring the welcoming nature of the Incheon Diocese.

## Colors

The palette is anchored by a gentle **Sky Blue** (Primary), symbolizing peace and the coastal identity of Incheon, and a **Soft Rose** (Secondary), representing the sacrificial love and energy of the Catholic youth. 

The background is never a pure, sterile white; instead, the design system employs a **Warm Cream** (`#FDF9F0`) to reduce eye strain and create a paper-like, tactile feel. Gradients should be used sparingly and should only consist of very subtle transitions between the primary blue and a lighter tint to suggest a soft glow. Text should be rendered in a deep, warm gray rather than pure black to maintain the approachable tone.

## Typography

The design system uses **Plus Jakarta Sans** for all levels of hierarchy. This typeface was chosen for its modern, rounded apertures and friendly, optimistic geometry, which aligns perfectly with the youthful yet respectful "daughter" persona.

To ensure comfort for all ages, the base font size is slightly elevated to **18px** for primary body text. Line heights are generous (1.5–1.6x) to allow the text to "breathe," ensuring that instructions are never intimidating or dense. Use heavier weights (600+) for headlines to provide a clear sense of structure and guidance.

## Layout & Spacing

The layout follows a **Fluid Grid** model focused on a central conversational column. The maximum width for content is kept narrow (typically 600px–800px) to simulate the focused nature of a one-on-one conversation.

Margins and paddings are generous to reinforce the feeling of a calm, unhurried space. Vertical rhythm is established using a base-8 unit, with a preference for larger gaps (`24px` and `40px`) between different message groups to clearly distinguish between topics. The layout should always prioritize the "Safe Area" at the bottom of the screen to ensure the chat input is easily reachable and prominent.

## Elevation & Depth

Hierarchy is conveyed through **Ambient Shadows** and **Tonal Layering** rather than harsh lines. Surfaces should feel soft and slightly "puffy." 

Shadows are never gray; they are tinted with the primary blue color at a very low opacity (e.g., `rgba(74, 144, 226, 0.08)`). This "colored shadow" technique creates a warm, luminous effect. Chat bubbles for the assistant should use a subtle elevation to appear as if they are floating gently toward the user, while user inputs are represented with a low-contrast inset or a flat, colored background to feel "grounded."

## Shapes

The shape language is defined by high-radius, organic curves. This design system avoids sharp corners entirely to maintain its non-intimidating profile. 

Standard components use a **0.5rem (8px)** radius, but chat bubbles and primary buttons use much larger radii **(1.5rem / 24px)** or full "pill" shapes. This extreme roundness mimics the softness of a friendly gesture and makes the interface feel more like an organic entity and less like a computer program.

## Components

### Chat Bubbles
The core of the interface. The assistant’s bubbles should have a cream background with a soft blue shadow. The user’s bubbles should use the primary blue with white text. Bubble corners should be asymmetrical: the corner closest to the sender's side should have a smaller radius than the others, creating a "tail" effect that feels hand-drawn.

### Buttons
Primary actions are pill-shaped and use the primary blue. Secondary actions (like "Ask something else") use an outlined style with a thicker 2px stroke and the secondary red color. All buttons should have a subtle "squish" animation on press to provide tactile feedback.

### Chips (Quick Replies)
Used for suggested questions. These should be light, translucent versions of the primary blue with a 1px border. They act as "gentle nudges" for the user.

### Cards
Cards are used to display event details or venue information. They feature a white background, a soft blue shadow, and a 16px corner radius. Images within cards should always have rounded corners to match the container.

### Input Fields
The message input should be a large, pill-shaped field that spans the width of the screen, featuring a "Send" icon that is illustrative and soft—avoiding sharp "paper plane" icons in favor of a rounded arrow or a friendly "send" label.

### Icons
Icons must be simple, monoline, and illustrative. End-caps on all lines should be rounded. Avoid technical or abstract symbols; use literal metaphors that a father would easily understand.