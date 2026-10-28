# Portfolio: Angel Arreguín

Static multi-page portfolio for Angel Arreguín (product designer, Ecatepec, Mexico). Hosted on GitHub Pages: https://angeldes.github.io/portfolioUpdate/index.html (repo AngelDes/portfolioUpdate, branch `master`). No build step: plain HTML, one stylesheet, one small script.

Goal: a portfolio that sells. Minimal, modern, with personality. Written for hiring managers.

## Files

- `index.html`: homepage (hero, Now at JumpCloud, Selected work, More work, Resume, contact band).
- `jumpcloud.html`: JumpCloud case study. Currently all `[placeholders]`, waiting on real content.
- `lynit.html`, `polistat.html`, `conocimiento230.html`, `mapeodecisiones.html`, `befective.html`, `banortetrading.html`, `design-systems.html`: case studies.
- `site.css`: the single stylesheet for every page. This is the source of truth.
- `art.js`: builds the generated outlined-shape art (SVG) inside every `.art` element.
- `style.css`: legacy, no page links to it. Do not use. Safe to delete once the user agrees.
- `assets/{project}/x.png`: where real images go (`assets/jc`, `assets/polistat`, `assets/befective`, ...). `assets/if` has an unknown purpose; ask before touching it.

## Brand and voice

- Brand is **"Angel Arreguín"** everywhere (logo, titles, footer). Never "Luis Angel".
- Sentence-case headings. No all-caps labels, no mono labels, no arrows on links.
- Numbers only for real sequences (process steps).
- Keep copy exactly as written unless the user asks to change it. Do not invent facts, metrics or claims.

## JumpCloud page: content rules

- Never name competitors or write comparisons with other products. Describe the feature on its own terms.
- The design system names Stratus (second era) and Circuit (current, AI-enabled) are approved for the JumpCloud use case. Do not use other internal names, internal tools or anything confidential unless the user says it is public; use descriptions instead.
- Screens must be redacted or representative. Check with the user before adding live prototypes or design system screens.
- Story so far (from the user, to be confirmed): the feature is Active Directory Integrations, an admin connects Active Directory to JumpCloud and chooses the source of truth per user (Active Directory, JumpCloud, or both). About three years of work in three chapters, one per design system era: the bridge (legacy design system), delegated authority (Stratus), cloud setup and attribute mapping (Circuit, with AI tooling). Handoff became shared ownership: the user shares a branch, frontend integrates it into production code behind feature flags in staging, and the user does acceptance testing. The user also introduced Cursor and Storybook to the team.

## Design system (in `site.css`)

Tokens: `--chalk #ECEEF4`, `--chalk-deep #E0E3EE`, `--ink #12141F`, `--cobalt #2447D6`, `--marigold #F2B01E`, `--slate #5B6178`, `--plum #3A1F3D`, `--line rgba(18,20,31,.16)`.

- Cobalt is the accent for text and links. Marigold is for fills only, always with ink text. Plum is for the dark contact band.
- Fonts: Gloock (display, `--font-display`) and Sora (body), loaded from Google Fonts. Instrument Serif is the fallback candidate; swapping is a one-line change to `--font-display`.
- Layout: `--measure 40rem`, `--wide 68rem`, `--gutter clamp(1.25rem, 5vw, 3rem)`.
- The serif display type is the one memorable element. Fewer boxes, more space.
- One load animation only (art fades in, then the hit cell fills). Respect `prefers-reduced-motion`.
- Contrast was checked: cobalt on chalk about 6.1:1, slate about 5.3:1, ink on marigold about 9.6:1, chalk on plum about 12.5:1. Re-check if colors change.

## Generated art

`<div class="art" data-cols="6" data-rows="5" data-hit="3,2" data-seed="11"></div>`

- `data-hit` is `column,row` (zero-based) of the one filled cell. `data-animate` plays the load animation. `data-align="end"` pins right.
- `.art--cobalt` makes the hit cell cobalt instead of marigold.
- Art doubles as an image placeholder. Each placeholder has an HTML comment with the exact `<img src="assets/{project}/...">` tag to swap in.

## CSS gotchas

- Specificity: `.art svg` appears later in the file and overrides `.hero-art svg`. Hero rules use `.hero .hero-art svg` for that reason.
- Mobile: header uses `white-space: nowrap`; the Resume link is hidden at 480px and below.

## Workflow

- Work one section at a time on the homepage, then one case study at a time.
- Verify layout with a real browser at 1440 wide and about 390 wide. Check there is no horizontal overflow.
- Commit with clear messages. Do not merge old versions back in: the redesign is the source of truth.
- `.DS_Store` files are junk. Consider adding a `.gitignore`.

## Open items (unverified or undecided)

- Years of experience: homepage says 14 in two places; the handoff mentioned 12. Confirm.
- Polistat dates ("2018 to 2019") are a placeholder guess.
- Lynit: "measurement framework the team still uses today" and the +40% / -25% / -35% / "~40%" figures are unverified.
- Four case studies show "Duration: Not specified".
- Befective has a step titled "Ideación" (Spanish). Decide whether to translate.
- Mobile hero order (art sits between headline and intro) may be worth revisiting.
- Hero headline line breaks with the real Gloock font need checking on the live site; if it wraps to 2 or 4 lines, adjust the `5.5rem` cap in `.hero h1`.
- JumpCloud page needs: real feature name, problem, what was done, outcome, one metric, screenshots (representative only; detail is confidential).

## Planned order

1. Global pass: typeface (Gloock vs Instrument Serif), heading sizes, spacing.
2. Homepage sections: Hero (done), Now at JumpCloud, Selected work, More work, Resume, Contact.
3. Case studies: JumpCloud, Lynit, Polistat, then Conocimiento 230, Mapeo de decisiones, Befective, Banorte Trading.
