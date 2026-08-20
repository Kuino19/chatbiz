---
name: distinctive-ui-design
description: Use this skill whenever designing or building new UI, onboarding flows, marketing pages, or app screens — anything a real user will look at and judge. Triggers include requests to "design a screen", "build the onboarding flow", "make this look better/more premium/less generic", or any frontend/UI task with no explicit visual direction given. Also use when the work is starting to look like a default AI-generated template (predictable card grids, generic icon sets, stock-photo placeholders, cookie-cutter color schemes). Actively invoke image generation (Nano Banana) when the screen needs a mockup to validate direction before coding, or needs custom icons/illustrations/photography instead of generic stock or default icon-font assets. Not for backend logic, pure data work, or copy-only tasks with no visual component.
---

# Distinctive UI Design (Antigravity)

## Why this exists

The default output of an agentic coding tool, left to its own judgment, converges on a
small set of recognizable looks: predictable card grids, a stock icon library used exactly
as shipped, a color palette from the top of whatever CSS framework is in use, and stock
photography that could belong to any SaaS product on earth. This is what "vibecoded" looks
like to a real user — not broken, just anonymous. This skill exists to force a deliberate
design choice instead of the default one, for every screen a real person (a Nigerian SME
vendor, a Tech VBS student, an FGCN staff member, an investor) will actually judge.

## Before writing any UI code

1. **Name the actual product and audience out loud, not a generic placeholder.** "A
   pricing page" is not a brief. "ChatBiz's pricing page, for a Lagos WhatsApp vendor
   comparing us to Bumpa and Catlog on their phone" is. Ground every visual decision in who
   is actually looking at this and what they already know/expect (WhatsApp's own visual
   language, Nigerian fintech conventions, what a market vendor vs. an investor each expect
   to see).
2. **State the single memorable thing this screen will be known for** before building —
   one signature element (a distinctive interaction, an illustration style, a layout idea
   specific to this brief) rather than spreading effort evenly across a page that ends up
   looking like every other page.
3. **Actively rule out the default AI look before starting**: a warm cream background with
   a terracotta accent, a near-black background with one acid-green highlight, or a
   hairline-rule broadsheet layout with zero border-radius. These are the three patterns
   AI-generated design clusters around regardless of subject. If the brief doesn't
   explicitly call for one of these, don't default into it — pick a palette and layout that
   comes from the product's own world instead (WhatsApp's own green plus what Nigerian
   fintech/commerce apps actually look like, for ChatBiz; a classroom/circuit-board energy
   for Tech VBS; whatever the specific brief implies).

## When to invoke Nano Banana

Antigravity's agent has native access to Nano Banana (Gemini image generation) and decides
automatically when to use it — but push it toward these moments explicitly rather than
waiting for it to default to generic icon-font/stock assets:

- **Mockup validation before code.** Generate a visual mockup of a new screen first, get
  it approved/adjusted, then implement — this is materially faster than writing CSS,
  looking at it, and redoing it three times.
- **Custom icons and illustrations instead of default icon libraries.** A default
  Heroicons/FontAwesome set is a strong "generic app" tell. Where an icon is load-bearing
  for the product's identity (not just a utility glyph like a chevron), generate one that
  fits the product's specific visual language instead.
- **Real product/context imagery instead of stock photography.** For ChatBiz specifically,
  generate scenes that look like the actual context (a Lagos market stall, a phone screen
  mid-WhatsApp-conversation) rather than generic "smiling businessperson at laptop" stock
  photography that signals template.
- **Diagrams and architecture visuals** when explaining a flow (e.g. the ChatBiz order flow,
  the Tech VBS curriculum structure) — a generated diagram beats a wall of text or a
  default flowchart library look.
- **Iterate, don't accept the first result.** Treat the first Nano Banana output as a draft
  to critique against the brief (does this look like *this* product, or could it belong to
  any product?), not a final asset.

## Design execution checklist

- **Typography carries identity.** Don't default to the framework's default font pairing.
  Choose a display face and body face deliberately, and use them with restraint.
- **Structure should mean something.** Numbered steps only if the content is genuinely
  sequential (e.g. the "Step 1 of 2" onboarding progress is legitimate because it's a real
  sequence). Don't add numbering, badges, or dividers as decoration.
- **One bold move, quiet everywhere else.** Spend the design's "risk budget" on the single
  signature element named at the start; keep spacing, color, and secondary elements
  disciplined around it.
- **Match visual weight to actual priority.** A primary CTA and a secondary/fallback link
  should never share the same color and weight — this was a real issue caught in the
  ChatBiz onboarding review (the "don't have a number yet" link matching the main button's
  green).
- **Respect the real device/context.** Design for the actual target device (often a
  budget Android phone on WhatsApp, not a designer's 27" monitor) — check emoji vs. icon
  font rendering, touch target sizes, and load time for any generated imagery.
- **Copy is part of the design, not filler.** Write from the user's side of the screen —
  name things the way a Nigerian SME vendor would say them, not the way the backend models
  them. Errors and empty states should say what happened and what to do next, in the
  product's own voice.

## Self-critique before shipping a screen

Ask, explicitly, before presenting any finished screen: if this exact prompt were given to
any other AI coding tool with no brand context, would it produce something close to this?
If yes, revise — the screen hasn't earned its place as *this* product's design yet. Take a
screenshot if the environment supports it and look at it the way a first-time Lagos vendor
opening this on their phone for the first time actually would, not the way a developer
looking at their own code does.
