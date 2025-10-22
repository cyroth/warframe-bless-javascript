# Warframe blessing app

AI Experiment

Refactored from my python [blessing app](https://github.com/cyroth/warframe)


This is a small Cloudflare Workers app that generates Warframe relay blessing messages.

Current state
-------------

- Single-file Worker: the UI, CSS and theme toggle logic are contained in `index.js`. There are no external static assets required.
- Dark mode: the app defaults to Dark on first visit (when no saved preference). Use the select (System/Light/Dark) or the quick toggle in the header to change theme. The choice is stored in `localStorage` under the `theme` key.

Run locally
-----------

Use Wrangler to preview locally:

```powershell
npx wrangler dev --local --port 8787
```

The app will be available at <http://127.0.0.1:8787> (or a similar local URL). Open DevTools > Application > Local Storage to inspect or clear the `theme` key if you want to reset preferences during testing.

Notes
-----

- Refactored by gemini and copilot
