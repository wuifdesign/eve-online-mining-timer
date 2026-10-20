# EVE Online - Mining Timer

## Status

[![status](https://img.shields.io/badge/status-Live-success.svg)](https://wuifdesign.github.io/eve-online-mining-timer)

Track your mining lasers, strip miners and ice harvesters so no cycle runs on an empty asteroid.

- Paste survey scanner results to get one row per asteroid.
- Each asteroid counts down while you mine it, with the time left and a likely range based on your crit and residue
  chances.
- A cargo hold tracker fills as you mine, with an alert sound when the hold is almost full and an alert when an
  asteroid is depleted.
- Compress the tracked cargo when a fleet Porpoise, Orca or Rorqual compresses your hold (ore to 1%, ice to 10%).
- Running timers survive a page reload. Gaps of up to 15 minutes are caught up, after longer breaks the timers pause.
- Deleted or cleared rows can be brought back with undo.

## How to Use

1. Select rows in the survey scanner, copy them and paste them into the app to create one row per asteroid.
2. Set the ship values: yield per turret, cycle duration, turrets, cargo hold, residue chance, residue volume, critical
   chance and crit bonus yield. Enter the **current per-cycle values from Show Info on the fitted module**, with all
   skills, modules, implants and boosts applied. Since Catalyst, cycles are 4× shorter with a quarter of the yield per
   cycle, so values from older guides or the previous version of this tool are too high.
3. Press start on the asteroid you lock to count it down, and pause it when you switch rocks.

Example scanner input:

```
Omber	30,000	18,000 m3	6,310,000.00 ISK	39 km
Omber II-Grade	30,000	18,000 m3	3,920,000.00 ISK	12 km
```

Supported ores: standard asteroid ores including Mercoxit, empire border (A0) ores, Triglavian ores, nullsec
prospecting ores, Prismaticite, moon ores, ice and mission ores. Graded variants (e.g. "II-Grade") map to their base
ore. An ore the app doesn't know yet still works when the paste includes the m³ column, its unit volume is taken from
there.

## How the numbers are calculated

Since the Catalyst expansion (Nov 2025):

- Mining lasers and strip miners cycle 4× faster with a quarter of the yield per cycle. Ice harvesters keep their cycle
  time.
- A **critical success** adds bonus ore to your cargo without taking it from the asteroid. Base chance 1%, base bonus
  200% of the cycle yield. Only lasers, strip miners and ice harvesters can crit, mining drones and gas harvesters
  can't.
- **Residue** destroys extra ore in the asteroid without reducing your cargo, so rocks empty faster than your hold
  fills.
- Every turret rolls crit and residue on its own, every cycle.

Per turret and cycle, with `Y` as the yield per cycle:

```
cargo per cycle     = Y × (1 + crit chance × crit bonus yield)
asteroid depletion  = Y × (1 + residue chance × residue volume)
```

"Asteroid empty" uses the depletion, "cargo full" uses the cargo. The low and high values next to each result are the
mean ± 1σ of a simulation that rolls crit and residue for every turret and cycle.

More detail and sources: [research/eve-mining-mechanics.md](research/eve-mining-mechanics.md),
the [Catalyst expansion notes](https://www.eveonline.com/news/view/catalyst-expansion-notes),
[Mining in Focus: New Ore & More](https://www.eveonline.com/news/view/mining-in-focus-new-ore-and-more) and the
[EVE University Wiki](https://wiki.eveuniversity.org/Mining).

## Tech stack

- [Preact](https://preactjs.com/) + TypeScript, built with [Vite](https://vite.dev/) (`@preact/preset-vite`)
- [Tailwind CSS](https://tailwindcss.com/) v4 with custom UI components in `src/components/ui/`
- `preact/compat` is aliased for the React-based dependency (zustand)
- Icons are local SVG files in `src/assets/icons/`, rendered with `src/components/ui/icon.tsx`: [Tabler Icons](https://tabler.io/icons) (MIT) and the GitHub mark from [Font Awesome](https://fontawesome.com/) (CC BY 4.0)
