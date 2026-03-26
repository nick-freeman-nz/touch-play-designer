# CPH Touch Play Designer — Project Notes

## Stack
React 19 + Vite 8 + Tailwind CSS 4. Canvas-based touch rugby play designer. Supabase for optional cloud storage (falls back to localStorage).

## Repos & Hosting
- **GitHub:** `nick-freeman-nz/touch-play-designer` (master branch)
- **Netlify:** auto-deploys on push to master
- **Netlify site name:** (check Netlify dashboard)

## Workflow Rules
- **Always push to GitHub** after making changes. Every change should be committed and pushed — don't wait for the user to ask.

## Features (v2.2)
- Drag players (attack/defense) and a rugby ball on a touch field
- Draw routes for players and ball (waypoints)
- Animate plays with variable speed (0.25x–3x)
- Undo waypoints (Ctrl+Z), mirror play, clear routes, reset
- Export animation as .webm video
- Save/load plays with name + description (localStorage or Supabase)
- Keyboard shortcuts: Space (play/stop), Esc (deselect), Del (remove player)

## Design
- Dark green CPH Touch branded theme
- SVG icon set (no emojis)
- Rugby ball rendered as tilted ellipse with seam + stitches
- Toolbar uses grouped sections filling full width
- Sidebar with play save (name + description) and play list

## Key Files
- `src/App.jsx` — main state management, keyboard shortcuts
- `src/components/FieldCanvas.jsx` — canvas rendering + mouse interaction
- `src/components/Toolbar.jsx` — mode toggle, playback, tools
- `src/components/PlayList.jsx` — save/load plays sidebar
- `src/components/Icons.jsx` — SVG icon components
- `src/utils/constants.js` — field dimensions, player/ball defaults
- `src/utils/fieldRenderer.js` — grass, lines, try zones
- `src/utils/playerRenderer.js` — players, rugby ball, routes
- `src/utils/animation.js` — route interpolation
- `src/utils/videoExport.js` — .webm recording
- `src/lib/storage.js` — Supabase + localStorage fallback

## Domain (not yet configured)
No custom domain assigned yet. Currently accessible via Netlify subdomain only.
