# Gushwork Web Developer Assessment

Responsive landing page built with **vanilla HTML, CSS, and JavaScript** (no frameworks or libraries).

**Live demo:** [https://rayhan-gushwork-assessment.netlify.app/](https://rayhan-gushwork-assessment.netlify.app/) (Netlify)

## Stack & integrations

- **Hygraph (headless CMS)** — images served from the CMS asset CDN (`graphassets.com` URLs in `index.html`).
- **HubSpot** — lead capture via the **HubSpot Forms API** (submissions v3) in `script.js`.

## Design

- **Figma reference:** [Gushwork Assignment](https://www.figma.com/design/DOv07H7C2tA5UrVLhmfwfW/Gushwork-Assignment?node-id=490-8785&t=Z0PPuWCdxPbNLcSw-1)
- Layout implemented to match the provided frames, with responsive behavior across desktop, tablet, and mobile.

## Repository layout

| File         | Purpose                                  |
| ------------ | ---------------------------------------- |
| `index.html` | Semantic markup                          |
| `styles.css` | Styles, layout, responsive rules       |
| `script.js`  | Sticky header, carousel, zoom, forms    |

## Run locally

Open `index.html` in a browser, or use a static server (e.g. `npx serve .`) if you need to avoid file-protocol limits for embeds or APIs.
