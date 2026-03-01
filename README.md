# Underground (Atlanta Beta)

Underground is a mobile-first local music discovery app focused on **Atlanta** at launch.

It solves two core problems:

1. Teens and younger fans need a reliable way to find local, affordable, non-21+ shows.
2. Small bands (school, garage, early local acts) need better neighborhood-level visibility.

## What's implemented

- Real interactive map powered by MapLibre GL (pan, zoom, rotate, tilt).
- Atlanta-centered show discovery with neighborhood pins.
- Mobile app UX with bottom navigation, card rail, and bottom sheets.
- Filter system for radius, budget, genre, and age access.
- RSVP privacy flow:
  - neighborhood-level location shown publicly,
  - exact address hidden until host approval,
  - local RSVP status persisted in browser storage.
- Optional 3D building extrusion layer toggle when style source supports it.

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Stack

- HTML
- CSS
- Vanilla JavaScript
- MapLibre GL JS
