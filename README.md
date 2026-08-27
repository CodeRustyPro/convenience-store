# Convenience Store

A short narrative game built with Svelte 5 + Vite. You shop for a sick mother
with ₹500 while a predatory "convenience" store nickel-and-dimes you one
reasonable-sounding compromise at a time. The branching story is written in
[Ink](https://www.inklestudios.com/ink/) and compiled at runtime with
[inkjs](https://github.com/y-lohse/inkjs).

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Tech

- **Svelte 5** (runes) + **Vite**
- **inkjs** — narrative engine (`src/story/source.ink.js`)
- **GSAP**, **Rough.js** — hand-drawn UI / animation

## Playtest logging

Every choice and every finished run can be appended to a Google Sheet
(downloadable as Excel) so you can see what people actually pick. Off unless
`VITE_ANALYTICS_URL` is set — setup and the list of columns are in
[`analytics/README.md`](analytics/README.md).

## Deploy

The site is fully static. It auto-deploys to **Vercel** on every push to `main`
(framework preset: Vite, build `npm run build`, output `dist`).
