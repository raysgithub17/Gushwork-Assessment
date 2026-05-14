# Gushwork Web Developer Assessment

Responsive landing page built with **vanilla HTML, CSS, and JavaScript** (no frameworks or libraries) for the Gushwork web developer assessment.

**Live demo (Netlify):** [https://rayhan-gushwork-assessment.netlify.app/](https://rayhan-gushwork-assessment.netlify.app/)

**Integrations used for this submission**

- **Hygraph (headless CMS)** — raster and UI images are delivered from the CMS asset CDN (`graphassets.com` URLs in `index.html`), so media can be updated in the CMS without changing markup structure.
- **HubSpot** — lead capture uses the **HubSpot Forms API** (`api.hsforms.com` submissions v3) from `script.js`, with portal ID and form GUID configured for the assessment form.

---

## Design reference

- **Figma:** [Gushwork Assignment](https://www.figma.com/design/DOv07H7C2tA5UrVLhmfwfW/Gushwork-Assignment?node-id=490-8785&t=Z0PPuWCdxPbNLcSw-1)
- Pixel-accurate layout relative to the provided frames, with full responsiveness across **desktop**, **tablet**, and **mobile**.

---

## Assignment requirements (implemented scope)

### 1. Design specifications

- Follow the Figma file linked above.
- **Responsive** behavior across breakpoints.
- Visual alignment with the design system from the file.

### 2. Technical requirements

**Sticky header**

- Sticky header appears after scrolling past the first fold.
- Positions above the main navigation bar when active.
- Hides when scrolling back up.
- Smooth transitions/animations.

**Image carousel with zoom**

- Interactive carousel per design.
- **Hover** on a carousel image shows a zoomed preview (per Figma).
- Smooth hover transitions.

### 3. Code quality

- Semantic **HTML5** structure.
- Modern **CSS** (Flexbox/Grid where appropriate).
- Organized, readable **JavaScript** with comments on key behavior.
- Sensible defaults for **accessibility** and **performance** (semantic landmarks, focus-friendly controls where applicable, optimized assets).

---

## Project files

| File         | Role                                      |
| ------------ | ----------------------------------------- |
| `index.html` | Main markup, semantic structure           |
| `styles.css` | Layout, responsive styles, animations     |
| `script.js`  | Sticky header, carousel, zoom interactions |

Submit any **additional assets** (images, fonts, icons) together with these files per the brief.

---

## Submission notes (from brief)

- **Timeline:** complete within **2 days** of receiving the assignment email.
- **Delivery:** reply with attachments **or** share a **GitHub** repository link.
- **Naming:** clear, descriptive file names.

---

## Evaluation criteria (summary)

- Figma accuracy and responsiveness.
- HTML/CSS/JS quality and organization.
- Sticky header behavior (show/hide, placement, motion).
- Carousel + hover zoom behavior.
- Readability and front-end best practices.

---

## Local preview

Open `index.html` in a browser, or serve the folder with any static server (e.g. `npx serve .`) if you need to avoid file-protocol restrictions for certain embeds.
