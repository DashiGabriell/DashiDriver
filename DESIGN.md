---
name: DashiDrive
description: Gestão de frota para locadoras, apresentada como o quadro de chaves da própria locadora.
colors:
  board: "#ba8550"
  board-deep: "#a5733f"
  hole: "#2b1909"
  ink: "#1b1209"
  ink-soft: "#3d2914"
  steel: "#23272b"
  steel-2: "#2c3136"
  steel-ink: "#edeff1"
  steel-soft: "#aab2b9"
  paper: "#fbfaf6"
  tape: "#16171b"
  azul: "#2457d6"
  azul-deep: "#1a43ad"
  verde: "#1e9e5a"
  amarelo: "#f2b705"
  vermelho: "#d63a2a"
  tag-plano: "#f1efe9"
  tag-grafite: "#33393f"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 5.2vw, 4.5rem)"
    fontWeight: 860
    lineHeight: 0.94
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.95rem, 4.1vw, 3.6rem)"
    fontWeight: 860
    lineHeight: 0.94
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.28rem"
    fontWeight: 780
    fontVariation: "'wdth' 108"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 640
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 118"
  numeral:
    fontFamily: "Saira Condensed, Archivo Variable, sans-serif"
    fontWeight: 700
    fontFeature: "'tnum' 1"
rounded:
  plate: "4px"
  insert: "6px"
  panel: "8px"
  step: "10px"
  button: "12px"
  tag: "14px 14px 18px 18px"
spacing:
  hook-pitch: "32px"
  gutter-sm: "20px"
  gutter-md: "32px"
  section-sm: "96px"
  section-md: "128px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.azul}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.azul-deep}"
  button-quiet:
    backgroundColor: "rgba(255, 246, 232, 0.32)"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0 24px"
    height: "52px"
  button-steel:
    backgroundColor: "transparent"
    textColor: "{colors.steel-ink}"
    rounded: "{rounded.button}"
    padding: "0 24px"
    height: "52px"
  tape:
    backgroundColor: "{colors.tape}"
    textColor: "#f4f4f2"
    typography: "{typography.label}"
    padding: "0.4em 1em 0.36em"
  key-tag:
    backgroundColor: "{colors.azul}"
    textColor: "#ffffff"
    rounded: "{rounded.tag}"
    padding: "26px 8px 9px"
  tag-insert:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.tape}"
    rounded: "{rounded.insert}"
    padding: "6px 7px 7px"
  step-button:
    backgroundColor: "{colors.tape}"
    textColor: "#f4f4f2"
    rounded: "{rounded.step}"
    size: "44px"
---

# Design System: DashiDrive

Scope: this file describes the marketing world built for the `/` landing (`src/pages/Landing.tsx`, `src/components/landing/*`). The authenticated app (dashboard, mobile field app, marketplace, lojista) still runs on the older incumbent system in `src/index.css` and `tailwind.config.ts` (Inter, indigo primary, neumorphic shadows) and has not been migrated to this world. Do not apply these tokens to app screens until a migration is decided, and do not treat the app system as part of this document.

## Overview

**Creative North Star: "Quadro de Chaves"**

The rental company is its key board. A natural hardboard panel with a real perforation grid carries the page; every hook is a car, and every plastic tag's color says where that car is right now. Headings and navigation are embossed label-maker tape stuck onto the board; cabinet sections are brushed graphite steel; paper inserts and Mercosul-style plates carry the data. Everything on the page is a physical object from a locadora's back office, so the product reads as the owner's own operation rather than as a software brochure.

The world is tactile and slightly imperfect on purpose: tapes sit a fraction of a degree off level, tags hang from wire hooks and swing when they change, the comparison sheet is laid on the yellow section at a slight angle. Density is moderate; the board breathes, and type is set large and expanded so it reads like stencilled lettering on wood. All numbers are condensed and tabular, like plate stamping.

Interaction belongs to the objects: a tag cycles its status when tapped and swings on its hook; a fleet-size picker lights the plan tag that fits. Example data is always labeled as example.

**Key Characteristics:**
- Three materials carry every section: perforated hardboard, graphite steel, and safety yellow.
- Status colors (azul, verde, amarelo, vermelho) are semantic first and decorative never.
- Label-maker tape replaces chips, nav pills, and small badges.
- Expanded heavy Archivo for display, Saira Condensed for every number and plate.
- Depth comes from soft, warm, brown-tinted shadows of objects resting on wood.

## Colors

A warm workshop palette: tan hardboard and dark graphite as grounds, with four saturated status colors borrowed from plastic key tags.

### Primary
- **Etiqueta Azul** (`azul`): the "alugado" tag color and the only call-to-action fill. Primary buttons, the inline tape behind the hero's key word, the brand tape, and the range-input fill. Deepens to **Azul Fundo** (`azul-deep`) on button hover.

### Secondary
- **Etiqueta Verde** (`verde`): "disponível / no pátio" tag and legend tape. Status only.
- **Amarelo Oficina** (`amarelo`): "oficina" tag, the safety-yellow section ground, text selection, and the focus outline. Text on it is always `tape`.
- **Vermelho Atraso** (`vermelho`): "atrasado" tag, flagged damage in the inspection sheet, and the "Cabe na sua frota" callout tape.

### Neutral
- **Eucatex** (`board`): the perforated hardboard ground for the hero and pricing. Carries an SVG fractal-noise grain and a 32px hole grid; `board-deep` fills the punched hole in each tag and `hole` is the shadowed inside of a perforation.
- **Tinta de Madeira** (`ink`, `ink-soft`): body and heading text on the board. Warm near-black, never pure black.
- **Grafite** (`steel`, `steel-2`): brushed cabinet steel for the anatomy section, closing section, scrolled header, and readout panels. Text on steel is `steel-ink`; secondary text is `steel-soft`.
- **Papel** (`paper`): tag inserts and the inspection comparison sheet.
- **Fita** (`tape`): label-maker tape, step buttons, and ink on yellow and paper.
- **Plano** (`tag-plano`) and **Grafite Etiqueta** (`tag-grafite`): the two non-status tag colors, used only for plan tags in pricing.

### Named Rules
**The Status Is Semantic Rule.** Azul, verde, amarelo, and vermelho mean alugado, disponível, oficina, and atrasado. Never use one of them decoratively where it could be read as a car's status; azul doubles as the CTA color because "alugado" is the outcome the owner is buying.

**The Three Grounds Rule.** A section's ground is board, steel, or yellow, with its grain. No flat white or gray sections, no gradients as backgrounds.

## Typography

**Display Font:** Archivo Variable (width axis), with ui-sans-serif, system-ui fallback
**Body Font:** Archivo Variable
**Label/Mono Font:** Saira Condensed 600/700 for numerals and plates

**Character:** One variable family stretched across roles: very wide and very heavy for headings so they read like stencilled board lettering, normal width for reading. Saira Condensed gives every figure the narrow, stamped look of a license plate.

### Hierarchy
- **Display** (860, `clamp(2.35rem, 5.2vw, 4.5rem)`, 0.94, width 125%): the hero headline only. Balanced wrapping.
- **Headline** (860, `clamp(1.95rem, 4.1vw, 3.6rem)`, 0.94, width 125%): section headings; the closing heading scales up toward display size.
- **Title** (780, 1.28rem, width 108%): module names in the tag anatomy list; plan names step up to 820 at 1.5rem, width 120%.
- **Body** (400–480, 1.1rem, 1.625): section copy, kept to 32–40rem measures.
- **Label** (640, 0.78rem, 0.14em, uppercase, width 118%): tape text. Field labels on inserts and readouts use the same uppercase tracked voice at 0.74–0.82rem, weight 600–700, width 112–115%.
- **Numeral** (Saira Condensed 600–700, tabular): prices, weekly charges, counts, step numbers, plates, dates.

### Named Rules
**The Stamped Numbers Rule.** Every money value, count, km reading, date range, and plate is set in Saira Condensed with tabular figures. Never set a figure in Archivo.

**The Wide Means Heading Rule.** Width above 118% is reserved for headings and tape. Body copy stays at the normal width.

## Layout

A 1240px container with 20px gutters (32px from `md`) on a 12-column grid at `lg`. Sections run 96px top and bottom, 128px from `md`. Hero and pricing split 5/7 and 6/6.

The hardboard's 32px perforation grid is the layout grid for hanging objects: the hero's hook grid is aligned at runtime so the first hook lands exactly on a hole, and tags hang in fixed-width columns (3 × 102px on phones, 4 × 144px from `sm`, 4 × 112px at `lg`, back to 144px at `xl`) with 160px rows. On phones the board shows 9 tags instead of 16. Where text sits on the board, a soft-edged patch of plain grain (no holes) sits behind it so the perforations never cross copy.

Pricing hangs three plan tags from one steel rail; each plan hangs on a different wire length so the row reads as hand-hung, not as a card grid.

## Elevation & Depth

Depth is physical: objects rest on or hang in front of wood and steel, lit from above. Shadows are soft, offset downward, and tinted warm brown (`rgba(40–70, 20–45, 0–6, …)`), never neutral gray and never hard-edged. Small sheen gradients (white at 16–30% fading by 42–45%) give plastic tags and buttons a molded surface. Metal parts (hook heads, slider thumbs, the rail) use radial or linear chrome gradients.

### Shadow Vocabulary
- **Tag hang** (`box-shadow: 0 7px 10px -3px rgba(45,22,6,.5), 0 18px 26px -14px rgba(45,22,6,.6)`): plastic key tags.
- **Primary lift** (`box-shadow: 0 8px 16px -6px rgba(26,40,110,.55), 0 2px 4px rgba(20,10,0,.25)`): primary button at rest; grows to `0 14px 22px -8px` on hover.
- **Tape stick** (`filter: drop-shadow(0 2px 2px rgba(40,20,5,.4))`): label-maker tape, deepening to `0 5px 4px` on hover.
- **Paper sheet** (`box-shadow: 0 18px 40px -18px rgba(70,45,0,.65), 0 3px 6px rgba(70,45,0,.2)`): the inspection comparison sheet.
- **Steel panel** (`box-shadow: 0 10px 20px -12px rgba(40,20,5,.7)` to `0 14px 30px -14px rgba(40,20,5,.75)`): readout and picker panels resting on the board.
- **Insert recess** (`box-shadow: inset 0 0 0 1px rgba(0,0,0,.1), inset 0 2px 3px rgba(0,0,0,.08)`): paper slid into a tag window.

### Named Rules
**The Warm Light Rule.** Every shadow is tinted toward the wood. A gray or black-only shadow is wrong in this world.

## Shapes

Molded and stamped rather than geometric. Key tags have softly rounded tops and fuller bottoms (14/14/18/18px; larger tags scale to 22/22/28/28 and 18/18/34/34), a punched hole and a steel split ring at the top center. Paper inserts are gently rounded (6px, 10px on large tags). Plates are near-square (4px) with a 1.5px black border and a blue BRASIL band. Buttons are 12px; step buttons 10px.

Tape is the one cut shape: a slanted parallelogram (`clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)`), tilted −0.6° (alternating +0.5°). Dashed leader lines (1.5px, 40% opacity) connect labels to values like a ledger.

## Components

### Buttons
Molded and confident; they press in rather than glow.
- **Shape:** gently rounded (12px), 52px minimum height, 24px horizontal padding, weight 700, width 108%.
- **Primary:** azul fill with a top-left sheen, white text, primary-lift shadow. Hover deepens to azul-deep and lifts 2px.
- **Quiet:** for use on the board. Translucent cream fill with a 1.5px inset ink ring; hover raises the fill opacity.
- **Steel:** for use on graphite. Transparent with a 1.5px inset light ring; hover adds an 8% light wash.
- **Active:** every button presses down 1px. Transitions are 260ms on `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Focus:** a 3px amarelo outline offset 3px, applied to every focusable element in the world.

### Label-Maker Tape
The world's chip, badge, nav link, and legend entry.
- **Style:** fita (default), azul, verde, amarelo (fita text), vermelho, branco (azul text) variants; uppercase label type; slanted clip and slight tilt.
- **Interactive:** as a link or button, hover lifts 2px, tilts to −1.2°, and deepens its drop shadow (220ms, same easing).
- **Inline tape:** a word inside a heading can be set on an azul tape strip with a sheen and a −1.2° tilt; used once, in the hero headline.

### Key Tag (signature)
A plastic tag hanging from a wire hook on the board, carrying one car.
- **Structure:** steel hook head and wire above; tag body in the status color with sheen; punched hole and split ring; a paper insert holding a plate, model, and driver or note; a footer with the status label and weekly charge in numerals.
- **Status:** set by a `data-status` attribute (alugado, disponivel, oficina, atrasado, plus plano and grafite for pricing). Background transitions in 140ms.
- **Motion:** on mount and whenever its status changes, the tag swings from the hook through a damped sequence (0°, 7°, −5°, 3°, −1.5°, 0.6°, 0°) over 1.6s with staggered delays; hover tilts 2.5°. Swing is disabled under reduced motion.
- **Interaction:** tapping a board tag cycles alugado → atrasado → oficina → disponível and updates the steel readout below the board.

### Plate
A Mercosul-style plate in two sizes: a blue band (BRASIL / BR) over the plate number in Saira Condensed 700. Used inside tag inserts and on the inspection sheet.

### Cards / Containers
There are no generic cards. Containers are objects:
- **Steel panel:** graphite with brushed grain, 8–12px radius, steel-panel shadow, 16–20px padding. Holds readouts and the fleet picker.
- **Paper sheet:** paper ground, 6px radius, tilted 0.6°, 2px fita rules top and bottom, 24–36px padding. Holds the inspection comparison.
- **Plan tag:** a large key tag hung from the rail, with an insert holding name, price, and a leader-line ledger of limits, and a full-width button at the foot.

### Inputs / Fields
- **Range:** a 10px track filled azul up to the value over a translucent ink remainder, with an inset shadow; the thumb is a 30px chrome knob.
- **Step buttons:** 44px fita squares (10px radius) with a light icon; hover lifts 1px; disabled drops to 35% opacity.
- **Output:** the current count is set large (3rem) in white numerals beside the stepper.

### Navigation
A fixed header: the brand as an azul tape, section links as fita tapes (hidden below `md`), and the enter action as a quiet button. After 24px of scroll the header gains a graphite ground and shadow, tightens its padding, and switches the button to the steel variant. The footer uses plain steel-soft text links that turn white and underline on hover.

## Do's and Don'ts

### Do:
- **Do** set every section on one of the three grounds (board, steel, yellow) with its grain.
- **Do** use status colors only to mean the status they name, and label demonstration data as example.
- **Do** set every figure, price, plate, and date in Saira Condensed with tabular numerals.
- **Do** express small labels, nav, and badges as label-maker tape with its slant and tilt.
- **Do** tint every shadow warm brown and keep it soft and downward.
- **Do** put a plain-grain patch behind text that sits on the perforated board.
- **Do** gate swing and transition motion behind `prefers-reduced-motion`.

### Don't:
- **Don't** use a split hero with a dashboard screenshot, a feature-card grid, or three floating pricing cards; information hangs as tags, ledgers, and sheets instead.
- **Don't** use a status color decoratively where it could be read as a car's state.
- **Don't** use gray or black-only shadows, hard offset shadows, or glows.
- **Don't** set body copy in the expanded heading widths.
- **Don't** bring the app's Inter, indigo, or neumorphic shadows into this world.
