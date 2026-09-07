# Colour Snap

A tiny mobile-first camera game. You're shown a target colour, you go find
something that colour in the real world, snap a photo of it with your
camera, and get scored. Five rounds, then a final score.

No backend, no login, no database — everything runs in the browser.

## Run it locally

```
npm install
npm run dev
```

This starts a local dev server (usually `http://localhost:5173`). Camera
access works on `localhost` without HTTPS, so this is fine for testing on
your laptop. To test on a phone, use one of the HTTPS deploy options below —
phone browsers require a secure connection for camera access except on
`localhost`.

## Deploy it to a public HTTPS URL

Camera access via `getUserMedia` only works over HTTPS (or `localhost`), so
you'll need to deploy it somewhere that serves HTTPS automatically. Any of
these work well for a small static app like this one:

### Option A — Netlify Drop (no account, fastest)

1. Run `npm install` then `npm run build`. This creates a `dist/` folder.
2. Go to https://app.netlify.com/drop in your browser.
3. Drag the `dist/` folder onto the page.
4. Netlify gives you a live HTTPS URL immediately.

### Option B — Vercel

1. Install the CLI: `npm i -g vercel`
2. From the project folder, run `vercel`
3. Follow the prompts. Vercel detects the Vite config automatically and
   gives you an HTTPS URL.

### Option C — GitHub Pages

1. Push this project to a GitHub repository.
2. Add `base: '/your-repo-name/'` to `vite.config.js`.
3. Build with `npm run build`, then deploy the `dist/` folder to a
   `gh-pages` branch (e.g. using the `gh-pages` npm package, or GitHub
   Actions).
4. Enable Pages in the repo settings — GitHub serves it over HTTPS by
   default.

## Notes

- On first launch, the browser will prompt for camera permission. If it's
  denied, the app shows a message explaining how to fix it.
- The app tries to use the rear-facing camera (`facingMode: environment`)
  where available, which is what most phones default to for this kind of
  game.
- Each captured photo is scored with a random number between 60–100% — this
  is a simple placeholder game mechanic, not real colour matching.
