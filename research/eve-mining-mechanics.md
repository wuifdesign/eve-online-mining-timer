# EVE Online Mining — Mechanics Reference

The current state of mining in EVE Online: how yield, cycle time, critical successes ("crits"), residue,
asteroid depletion and compression work, with the numbers needed to calculate them. This document describes
**the game**, not any tool built on it. It is the source of truth to check against whenever CCP changes mining.

- **Last verified:** 2026-10-20
- **Baseline:** Catalyst expansion (v23.02, 18 Nov 2025) plus patches up to v24.01 (June 2026)
- **No changes** to the core yield / crit / residue formulas were found in patch notes between Catalyst and the
  last verified date.

Status legend:

- ✅ **Confirmed** — stated in official CCP notes or read from current SDE/dogma data (EVE Ref).
- 🟡 **Derived** — follows from confirmed numbers, or from standard EVE dogma rules, but CCP has not spelled it out.
- ❓ **Unverified** — community claim or an open question that could not be confirmed from a primary source.

### Keeping this document current

When a patch or expansion touches mining:

1. Add a row to §1 with the date, release and change.
2. Update the affected section(s) in place, so the body always describes the **current** game. Old values
   only stay where they explain a change (e.g. "was 60 s pre-Catalyst").
3. Resolve or add entries in §9 (open questions).
4. Bump **Last verified** / **Baseline** above and add a line to §10 (document history).

---

## 1. Timeline: what changed and when

| Date        | Release                                       | Mining-relevant change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dec 2021    | Patch 19.11 ("From Extraction to Production") | **Residue** introduced (residue probability + residue volume multiplier on modules/crystals). Crystals reworked into Type A / B / C. All resources (belts, anoms, ice, moon chunks) **doubled** to compensate. ✅                                                                                                                                                                                                                                                                                                                                                                                       |
| 18 Nov 2025 | **Catalyst** expansion (v23.02)               | Mining lasers and strip miners cycle **4× faster**, gas harvesters **2× faster**, with yield/cap/crystal damage per cycle reduced to match (yield over time unchanged). **Critical successes** added. New skills **Mining Precision** and **Mining Exploitation**. **Mining Survey Chipset** gets crit/residue bonuses. New burst charge **Mining Laser Efficiency**. **Stochastic rounding** of ore units. Pioneer, Pioneer/Venture Consortium Issue, Outrider. Prismaticite and phased asteroid fields. Mining mutaplasmids. Built-in Mining Surveyor on all ORE ships and basic empire corvettes. ✅ |
| 2026-01-08  | patch                                         | Residue message no longer calls gas clouds "asteroids" (cosmetic). ✅                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-02-11  | patch                                         | **Crits removed when mining certain mission-specific ores**, so site ore once again matches mission requirements exactly. ✅                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| early 2026  | v23.02 follow-ups                             | Metaliminal Mining asteroids 3,500 → 5,000 units; Abyssal Artifact Recovery asteroids 24 → 30 units; unrefined-mineral reactions 3,600 s → 360 s; Mercoxit crystal volatility reduced to match other ores. ✅                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-06-09  | v24.01                                        | Strip Miner I and Ice Harvester I now 5 m³ volume like all variants. ✅                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-06-16  | v24.01                                        | New Grade-0 Pyroxeres (50% mineral yield) in the Exordium new-player region. ✅                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 2. Core concepts

### 2.1 Mining amount and cycle

Every mining module (laser, strip miner, ice harvester, gas harvester, drone) has:

- **Mining amount** — m³ extracted per cycle (ice: always exactly 1 unit = 1,000 m³ per cycle).
- **Activation time / duration** — cycle length.
- **Residue probability** and **residue volume multiplier**.
- (Ore lasers, strip miners, ice harvesters only, since Catalyst) **Critical success chance** and
  **critical success bonus yield**.

Units per cycle = `mining amount / unit volume of the ore`. Ore is deposited at the **end** of each cycle.

**Short-cycling:** stopping a module early still yields ore proportional to the time active
(formula `rate_per_min × seconds_active / 60`). ✅ (EVE Uni, _Mining yield_) Note: the wiki's worked
example states 100 × (7.5/60) = 50 m³, which is an arithmetic slip (it equals 12.5 m³).

**Last cycle on a rock:** 🟡 when an asteroid runs out mid-cycle, the module receives only what was left. The
time to empty a rock is therefore fractional in cycles, not rounded up to a whole cycle.

### 2.2 Stochastic rounding (Catalyst) ✅

Before Catalyst, the fractional remainder `mining amount / unit volume` was **rounded down and lost**.
Since Catalyst, each cycle has a chance to receive **one extra unit**, so long-run yield tends to the
exact theoretical value. 🟡 The natural implementation, consistent with CCP's wording:

```
exactUnits = cycleVolume / unitVolume
units      = floor(exactUnits) + (rand() < frac(exactUnits) ? 1 : 0)
E[units]   = exactUnits
```

This matters most for bulky ores (Mercoxit 40 m³, moon ores, Prismaticite) and small per-cycle yields
(4× shorter cycles mean smaller per-cycle volumes, so pre-Catalyst rounding would have lost much more).
Over many cycles, calculating in m³ gives the same result as counting units.

### 2.3 Critical successes (Catalyst) ✅

- Applies to: **ore mining lasers, strip miners, ice harvesters** (and ice mining lasers).
  **Not** gas harvesters/scoops, **not** mining drones. ✅ (patch notes; forum confirmation re: drones)
- Base: **1% chance**, bonus yield **200% of that cycle's standard yield**. ✅
- A crit gives **bonus ore that does NOT come out of the asteroid** ✅ — it is created on top of the
  normal yield. So a crit cycle delivers `Y × (1 + critBonus)` = 3× normal at base values, while the rock
  only loses `Y` (+ residue, if it also rolled).
- Rolled **independently every cycle** ("every cycle is another RNG roll"; stopping/restarting does not
  change odds). ✅ (forum explainer)
- 🟡 Each module cycles separately, so each module rolls its own crit (and residue). There is no
  "ship-wide" cycle roll. Several small modules therefore give a steadier yield than one big module with
  the same total amount.
- Since 2026-02-11, crits do **not** occur on certain mission-specific ores. ✅ CCP did not name them; the
  unique mission ores are listed in §7.1. ❓ Whether all of them are affected is unconfirmed.
- ❓ Interaction with stochastic rounding (is the bonus rounded separately?) and with the final cycle
  that exhausts an asteroid (is the bonus based on the full cycle or the truncated remainder?) is not
  documented.

### 2.4 Residue ✅

Introduced in 19.11. Residue does **not** reduce what you receive; it destroys **extra** units in the
asteroid (or ice/gas source).

- Each cycle, with probability **residue probability**, the source additionally loses
  `mining amount × residue volume multiplier`. ✅ (EVE Ref attribute description: "applied to the Mining
  Volume … to calculate the potential wasted volume per cycle")
- Example (EVE Uni): node has 100 units, you mine 10 with 10 residue → node now has 80 units.
- Module residue probability and crystal residue probability are **added**. ✅ (19.11 notes)
- Residue can be reduced by the Mining Survey Chipset and the Mining Laser Efficiency burst (Catalyst). ✅
- Residue also exists on gas harvesters and mining drones (drones: up to 60% on Excavators). ✅

---

## 3. Module base stats (post-Catalyst, from EVE Ref SDE data)

### 3.1 Ore lasers & strip miners ✅

| Module                             | Mining amount | Cycle | Range | Residue prob. | Residue mult. | Crit chance | Crit bonus |
| ---------------------------------- | ------------- | ----- | ----- | ------------- | ------------- | ----------- | ---------- |
| Miner I                            | 10 m³         | 15 s  | 10 km | 0%            | 0×            | 1%          | 200%       |
| Miner II                           | 15 m³         | 15 s  | 12 km | 34%           | 1×            | 1%          | 200%       |
| Deep Core Mining Laser I           | 10 m³         | 15 s  | 5 km  | 0%            | 0×            | 1%          | 200%       |
| Strip Miner I                      | 150 m³        | 45 s  | 15 km | 0%            | 0×            | 1%          | 200%       |
| Modulated Strip Miner II           | 120 m³        | 45 s  | 15 km | 34%           | 1×            | 1%          | 200%       |
| Modulated Deep Core Strip Miner II | 80 m³         | 45 s  | 15 km | 34%           | 1×            | 1%          | 200%       |

Pre-Catalyst, laser/strip cycles were 4× longer (e.g. lasers 60 s, strip miners 180 s) with 4× the
amount (Mod. Strip Miner II: 480 m³/180 s → now 120 m³/45 s). Any older calculator or spreadsheet
(e.g. Wilm0rien/EveOnlineMiningYield, 19.11-era) must be divided by 4 on both amount and duration for
lasers/strips. 🟡

EVE Uni (_Mining_) currently lists base cycles as: mining lasers 15 s, strip miners 45 s, mining drones 60 s.

### 3.2 Ice ✅

| Module           | Amount            | Cycle | Residue  | Crit      |
| ---------------- | ----------------- | ----- | -------- | --------- |
| Ice Harvester I  | 1,000 m³ (1 unit) | 240 s | —        | 1% / 200% |
| Ice Harvester II | 1,000 m³ (1 unit) | 200 s | 34% / 1× | 1% / 200% |

Ice harvesters were **not** sped up by Catalyst, but **did** gain crits. Ice efficiency only comes from
shorter cycles (Ice Harvesting skill −5%/lvl, ship bonuses, Ice Harvester Upgrades, rigs, Yeti implants,
Mining Laser Optimization burst). A crit on ice yields extra ice blocks (🟡 1,000 m³ × 2 = 2 extra units at
base) without depleting the ice asteroid.

### 3.3 Gas ✅

| Module                 | Amount | Cycle                         |
| ---------------------- | ------ | ----------------------------- |
| Gas Cloud Harvester II | 100 m³ | 80 s (was 160 s pre-Catalyst) |

Gas: 2× faster cycles, **no crits**, has residue (chipset reduces gas residue).

### 3.4 Mining drones ✅

| Drone                    | Amount | Cycle | Residue  |
| ------------------------ | ------ | ----- | -------- |
| Mining Drone II          | 33 m³  | 60 s  | 34% / 1× |
| 'Excavator' Mining Drone | 80 m³  | 60 s  | 60% / 1× |

Drones were not sped up and have **no crits**.

---

## 4. Crystals ✅

Usable only in **modulated** lasers/strip miners and the ORE/modulated deep-core modules. One crystal set
per ore tier (Simple, Coherent, Variegated, Complex, Mercoxit, Abyssal, and moon tiers).

| Crystal   | Yield × | Residue prob. (added) | Residue mult. (added)   | Cycle × | Volatility (per cycle, post-Catalyst) |
| --------- | ------- | --------------------- | ----------------------- | ------- | ------------------------------------- |
| Type A I  | 1.5     | +0%                   | 0                       | 1.0     | 2.5%                                  |
| Type A II | 1.8     | +3.6%                 | 0                       | 1.0     | 3%                                    |
| Type B I  | 1.5     | +20%                  | 0                       | 0.9     | 2.5%                                  |
| Type B II | 1.8     | +30%                  | 0                       | 0.8     | 5%                                    |
| Type C I  | 0.25    | +40%                  | +18 (wiki shows "+18%") | 1.0     | 2.5%                                  |
| Type C II | 0.2     | +59%                  | +28 (wiki shows "+28%") | 1.0     | 7.5%                                  |

- Volatility per cycle was quartered at Catalyst (old values 10/12/15/19.6/24/30%) to keep crystal life
  per hour unchanged. 🟡 (the new numbers are exactly the old ones / 4)
- Type B's "extra yield" comes from the **cycle-time multiplier**, at the cost of high residue.
- Type C is for deliberately depleting fields (denial/"offensive" mining).
- ❓ Whether Type C's residue multiplier is added (1 + 18 → 19×) or a percentage (1 × 1.18) is ambiguous
  between sources; the wiki and EVE Ref render it as "+18%"/"+28%". Irrelevant for normal mining.

Example — Mod. Strip Miner II + Type B II: residue probability = 34% + 30% = **64%** (before reductions),
cycle = 45 s × 0.8 = 36 s base.

---

## 5. Sources of bonuses

### 5.1 Skills ✅

| Skill                   | Rank | Effect / level                                                                 |
| ----------------------- | ---- | ------------------------------------------------------------------------------ |
| Mining                  | 1    | +5% mining turret yield                                                        |
| Astrogeology            | 3    | +5% mining turret yield (req. Mining IV)                                       |
| Mining Upgrades         | 4    | −5% CPU penalty of mining upgrades                                             |
| Ice Harvesting          | 1    | −5% ice harvester cycle time                                                   |
| Deep Core Mining        | 6    | −20%/lvl chance of Mercoxit damage cloud                                       |
| Gas Cloud Harvesting    | 1    | +1 gas harvester fitted per level                                              |
| **Mining Precision**    | 2    | **+10% crit chance** (lasers & ice harvesters); Alpha max III                  |
| **Mining Exploitation** | 6    | **+5% crit bonus yield**; req. Mining V, Astrogeology III, Mining Precision IV |
| Mining Foreman          | —    | burst duration                                                                 |
| Mining Director         | —    | +10%/lvl burst strength                                                        |

Hull skills (Mining Frigate, Expedition Frigates, Mining Destroyer, Mining Barge, Exhumers, Industrial
Command Ships, Capital Industrial Ships) give the per-level ship bonuses below.

### 5.2 Ships (selection) ✅

| Ship                                                             | Per-level bonuses                                                                                                                      | Role bonuses                                                  | Ore hold               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------- |
| Venture                                                          | Mining Frigate: +5% mining yield, −5% gas duration                                                                                     | +100% mining & gas yield, +2 WCS                              | 5,000 m³               |
| Venture Consortium Issue                                         | +5% yield, −5% gas duration, +10% shield booster                                                                                       | +100% mining & gas yield, **+50% mining crit chance**, +2 WCS | 6,250 m³               |
| Pioneer (mining destroyer, Alpha-flyable to Mining Destroyer II) | Mining Destroyer: +10% yield, +20% range, −5% gas scoop duration                                                                       | +50% yield, −25% gas scoop duration                           | 8,000 m³, 3 turrets    |
| Pioneer Consortium Issue                                         | +10% yield, +20% range, +10% shield booster, −5% gas                                                                                   | +50% yield, **+50% mining crit chance**, −25% gas             | 10,000 m³ (forum)      |
| Covetor                                                          | Mining Barge: +3% Strip Miner yield, +6% strip/ice range, −3% gas duration                                                             | −25% strip miner duration & cap, −30% gas duration            | 9,000 m³               |
| Hulk                                                             | Mining Barge: +6% strip/ice range, −3% ice duration, −3% gas duration; Exhumers: +6% strip yield, +4% shield resists, −3% gas duration | −15% strip miner duration, −25% strip cap, −30% gas duration  | 11,500 m³              |
| Outrider (ORE command destroyer)                                 | +15% yield, burst strength/duration +2%/lvl                                                                                            | —                                                             | (~20,000 m³ per forum) |

Community "effective laser" counts at max skills (forum, Catalyst): Venture 5, Pioneer 6.75, Outrider
5.25, Prospect 6.25, Procurer 6.9. Pioneer ≈ 1.35× a Venture. Venture ≈ 250 m³/min average-skilled,
Hulk ≈ 1,600 m³/min highly skilled (EVE Uni).

### 5.3 Modules ✅

**Mining Laser Upgrade II**: +9% mining amount, +12.5% CPU penalty (I/meta variants 5–9%). Mining yield
and mining cycle duration bonuses are **not stacking-penalized** ✅ (EVE Uni, _Stacking penalties_).

**Mining Survey Chipset** (passive mid-slot, **max 1 fitted**):

| Variant                              | Crit chance | Crit bonus yield | Residue prob. | CPU                 |
| ------------------------------------ | ----------- | ---------------- | ------------- | ------------------- |
| Basic Mining Survey Chipset          | +4%         | +4%              | −4%           | 6 tf                |
| Mining Survey Chipset I              | +12%        | +12%             | −12%          | 8 tf                |
| ML-3 Compact Mining Survey Chipset   | +16%        | +16%             | −16%          | 6 tf                |
| Mining Survey Chipset II             | +20%        | +20%             | −20%          | 12 tf (CPU Mgmt II) |
| Republic Fleet Mining Survey Chipset | +21%        | +21%             | −21%          | 10 tf               |

(Crit bonuses apply to lasers & ice harvesters; residue reduction applies to lasers, ice harvesters and
gas harvesters.) The chipset also shows exact ore units per rock and a residue (red) vs output (green) gauge.

### 5.4 Implants ✅

- Michi's Excavation Augmentor: +5% ore yield.
- Inherent Implants 'Highwall' Mining (MX-1001…1005): +1…5% yield.
- 'Yeti' Ice Harvesting (IH-100x): −1…5% ice cycle.
- Eifyr 'Alchemist' Gas Harvesting: −1…5% gas cycle.
- Low-Grade Harvest set: up to +33% mining range.
- Mining Foreman / ORE Mining Director mindlinks: +25% burst strength and duration.

### 5.5 Mining Foreman bursts ✅

| Charge                                      | Base                                           | Max (per EVE Uni)  |
| ------------------------------------------- | ---------------------------------------------- | ------------------ |
| Mining Laser Optimization                   | −15% duration & cap of mining modules          | −61.52%            |
| Mining Laser Field Enhancement              | +40% mining/survey range                       | +164.06%           |
| Mining Equipment Preservation               | −15% crystal volatility                        | −61.52%            |
| **Mining Laser Efficiency** (new, Catalyst) | **+50% crit chance, −15% residue probability** | +205.08% / −61.52% |

Strength formula (EVE Uni, _Command Bursts_):

```
strength = baseCharge × (1 + specialization/100) × (1 + module/100) × (1 + ship/100)
                      × (1 + mindlink/100) × (1 + industrialCore/100)
```

- T2 burst module: +25% vs T1. Mining Director: +10%/lvl. Mindlink: +25%.
- Hull: Rorqual +5%/lvl, Orca +3%/lvl, Porpoise +2%/lvl (each up to +50%... per wiki); Outrider bursts ≈
  uncored Porpoise.
- Industrial cores (burst strength): Porpoise 5% / 7.5%, Orca 10% / 15%, Rorqual 30% / 40% (I / II).
- Bursts are **stacking-penalized together with modules/rigs affecting the same attribute** ✅ (EVE Uni).
  Since the Optimization burst affects cycle **duration** of mining modules, and mining cycle duration is
  listed as _not_ penalized for modules, the burst/module interaction for duration is 🟡 likely unpenalized;
  for crit chance and residue (chipset + burst on the same attribute) 🟡 a stacking penalty probably
  applies (2nd effect ≈ 86.9%).

Stacking penalty formula: n-th strongest modifier × `exp(-((n-1)/2.67)^2)` → 100%, 86.9%, 57.1%, 28.3%, …

### 5.6 Mutaplasmids (Catalyst) ✅

Mining lasers, strip miners, ice mining lasers, ice harvesters, gas scoops/harvesters, mining drones and
ice harvesting drones can be mutated (Decayed / Gravid / Unstable tiers; drops from Abyssal Deadspace and
CONCORD beacon sites). Rolled stats include mining amount, duration, residue, crit bonus, range, CPU.
Community guidance: prioritise **cycle time > mining amount > CPU > range > residue**; max Unstable rolls
"can theoretically add 59% extra yield through cycle time, yield and crits" (forum). ❓ Exact roll ranges
per tier were not found in a primary source.

---

## 6. The calculation, end to end

All per **module**, per **cycle**. Multiply by module count for ship totals (but roll RNG per module).

### 6.1 Yield per cycle (m³)

```
Y = baseAmount
    × crystalYield                       (1.0 if none; 1.5 / 1.8 / 0.25 / 0.2)
    × (1 + 0.05 × Mining)
    × (1 + 0.05 × Astrogeology)
    × Π(1 + shipBonus_i)                 (per-level hull bonuses × levels, role bonuses)
    × Π(1 + upgrade_j)                   (Mining Laser Upgrades — not stacking penalized)
    × Π(1 + implant_k)
    × Π(1 + rig_l)
```

### 6.2 Cycle time (s)

```
T = baseDuration
    × crystalCycle                       (Type B: 0.9 / 0.8)
    × Π(1 − shipDurationBonus_i)
    × (1 − burstOptimization)            (e.g. 0.15 base … 0.6152 max)
    × Π(1 − other cycle bonuses)         (ice: Ice Harvesting skill, upgrades, rigs, Yeti)
```

### 6.3 Critical success

```
p_crit = 0.01
         × (1 + 0.10 × MiningPrecision)
         × (1 + shipCritRole)            (0.5 on Venture/Pioneer Consortium Issue)
         × (1 + chipsetCrit)             (0.04 … 0.21)
         × (1 + burstCrit × stackingFactor)

b_crit = 2.00
         × (1 + 0.05 × MiningExploitation)
         × (1 + chipsetCritYield)
```

🟡 Multiplicative combination is how EVE dogma applies percentage modifiers and matches community
numbers: Precision V → 1.5%, Exploitation V → 250%; + Chipset II → 1.8% / 300%. ✅ (forum explainer)

### 6.4 Residue

```
p_res  = (moduleResidueProb + crystalResidueProb)
         × (1 − chipsetResidue)
         × (1 − burstResidue × stackingFactor)
m_res  = moduleResidueMult (+ crystal residue mult for Type C)
R      = Y × m_res        (destroyed in the asteroid when residue rolls)
```

### 6.5 Expected values

```
E[cargo per cycle]      = Y × (1 + p_crit × b_crit)          (crits add, never deplete)
E[depletion per cycle]  = Y × (1 + p_res × m_res)            (crit bonus is NOT depleted)
cargo rate              = E[cargo]/T
depletion rate          = E[depletion]/T
units per cycle         = Y / unitVolume, stochastically rounded (§2.2)
time to empty a rock    ≈ rockUnits × unitVolume / (N_modules × E[depletion]/T)
time to fill ore hold   ≈ holdVolume / (N_modules × E[cargo]/T)
```

"Rock empty" is driven by **depletion**, "hold full" by **cargo**. The two differ whenever crits or residue
are in play.

Per-cycle outcome distribution for one module (independent rolls 🟡):

| Event        | Prob.          | Cargo  | Rock loses |
| ------------ | -------------- | ------ | ---------- |
| nothing      | (1−p_c)(1−p_r) | Y      | Y          |
| crit only    | p_c(1−p_r)     | Y(1+b) | Y          |
| residue only | (1−p_c)p_r     | Y      | Y(1+m)     |
| both         | p_c·p_r        | Y(1+b) | Y(1+m)     |

### 6.6 Worked example — max-skill Venture, 2 × Miner I

- Y = 10 × 1.25 (Mining V) × 1.25 (Astrogeology V) × 1.25 (Mining Frigate V) × 2.0 (role) = **39.06 m³** per laser per 15 s.
- Ship: 78.1 m³ / 15 s = **312.5 m³/min** before crits.
- Residue: Miner I = 0% → rock depletion = yield.
- Crits, no chipset: p = 1.5%, b = 250% → expected +3.75% → ~324.2 m³/min.
- With Mining Survey Chipset II: p = 1.8%, b = 300% → +5.4% → ~329.4 m³/min.
- Hold (5,000 m³) fill ≈ 16 min without crits, ≈ 15.2 min with Chipset II.

Venture Consortium Issue (+50% crit role) with Precision V + Chipset II: p = 1% × 1.5 × 1.5 × 1.2 = 2.7%,
b = 300% → +8.1% expected bonus. Players report in-game values around 1.8–1.94% for partially skilled CI
hulls (consistent with lower Precision levels).

### 6.7 Worked example — residue on Miner II + Chipset II

p_res = 34% × (1 − 0.20) = **27.2%**; expected rock depletion = Y × 1.272 per cycle, so a field lasts
~21% less time (1/1.272) compared to a residue-free module with the same yield, while cargo gain from crits
is unaffected.

---

## 7. Ores

### 7.1 Unit volumes ✅ (EVE Ref / EVE Uni)

| Group                                            | Ore: m³ per unit                                                                                                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard                                         | Veldspar 0.1, Scordite 0.15, Pyroxeres 0.3, Plagioclase 0.35, Omber 0.6, Kernite 1.2, Jaspet 2, Hemorphite 3, Hedbergite 3, Gneiss 5, Dark Ochre 8, Arkonor / Bistot / Crokite / Spodumain 16, Mercoxit 40 |
| A0 "border" ores                                 | Mordunium 0.1, Ytirium 0.6, Eifyrium 16, Ducinium 16                                                                                                                                                       |
| Triglavian (abyssal / Pochven)                   | Bezdnacine 16, Rakovene 16, Talassonite 16                                                                                                                                                                 |
| Nullsec prospecting (YC126)                      | Griemeer 0.8, Nocxite 4, Hezorime 5, Ueganite 5                                                                                                                                                            |
| Erratic (Catalyst)                               | Prismaticite 40                                                                                                                                                                                            |
| Other                                            | Kylixium 1.2                                                                                                                                                                                               |
| New-player (v24.01)                              | Pyroxeres 0-Grade 0.3 (50% mineral yield)                                                                                                                                                                  |
| Moon (all R4–R64)                                | 10                                                                                                                                                                                                         |
| Ice (all types)                                  | 1,000                                                                                                                                                                                                      |
| Unique mission ores (EVE Uni, _Mining missions_) | Banidine 0.1, Augumene 0.3, Mercium 0.6, Lyavite 1.2, Pithix 2, Green Arisite 5, Oeryl 8, Geodite 16, Polygypsum 16                                                                                        |

Ore grades (e.g. +5% / +10% / +15% variants, Grade II–IV) share the base ore's volume.

### 7.2 Compression ✅

- Ore of every kind (standard, moon, Mercoxit, A0, Triglavian, prospecting, Prismaticite) compresses to
  **1%** of its volume. Example: Compressed Prismaticite 0.4 m³.
- Ice and gas compress to **10%**. Example: Compressed Blue Ice 100 m³.
- Pyroxeres 0-Grade currently has **no compressed form** in-game (reported as a bug). ❓ Whether it will get
  one, and at what ratio, is open.

### 7.3 Where ore spawns (EVE Uni)

- Highsec: simple ores (Veldspar, Scordite, Pyroxeres, Plagioclase); Omber & Kernite anomalies restored to
  0.5–0.8 systems at Catalyst (+10% mining speed in Empire FW War HQ systems).
- Lowsec: coherent ores. Nullsec: complex ores + Mercoxit, prospecting ores. Also wormholes, Triglavian
  abyssal ores, and A0 "border" ores (Mordunium, Ytirium, Eifyrium, Ducinium).
- Ice belts respawn 6 h after depletion (always present after downtime).

---

## 8. Other mechanics

- **Mercoxit**: deep-core modules only; mining randomly releases a damaging gas cloud within 5 km (Deep Core
  Mining skill reduces chance).
- **Prismaticite** (Catalyst): "erratic" ore in migrating phased asteroid fields (low/null only, four phased
  rocks per field, ~40 h). Minable at **10% efficiency** until a **Mobile Phase Anchor** (~5M ISK, 10 uses)
  within 50 km is powered by industrial command ships (1 Rorqual / 2 Orcas / 3 Porpoises); then 100% for
  several minutes after a 60 s charge. Refines into random minerals; Unrefined Mineral Reactions give
  control over output.
- **Mining Surveyor**: built into all ORE mining ships and basic empire corvettes; 250 km range, 10 s pulse,
  colour-coded value overlay with estimated ISK.
- **Mission ore**: crit excess used to overflow mission requirements; patched 2026-02-11 to disable crits on
  certain (unnamed) mission ores.
- **Economy**: CCP's Jan 2026 MER notes mining activity increased after Catalyst; later 2026 reports show
  mining value declining in September 2026 with slight increases in highsec and wormholes.

---

## 9. Open questions (could not confirm from primary sources)

- Which mission ores lost crits on 2026-02-11 (all unique mission ores, or a subset).
- Exact stacking-penalty behaviour between Mining Survey Chipset and Mining Laser Efficiency burst on crit
  chance / residue probability.
- Whether the crit bonus is computed before or after stochastic rounding, and how it behaves on the final,
  truncated cycle that empties a rock.
- Type C crystal residue multiplier semantics (additive "+18" vs "+18%").
- Mutaplasmid roll ranges per tier for mining modules post-Catalyst.
- Precise burst max values: EVE Uni lists +205.08% crit / −61.52% residue; reproducing these exactly from the
  published strength formula wasn't possible with the listed factors (factor 4.1016 ≈ 1.25 × 1.5 × 1.75 × 1.25).
- Compressed form for Pyroxeres 0-Grade.

---

## 10. Document history

| Date       | Change                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-10-20 | Initial research; baseline Catalyst + patches to v24.01. Restructured as a game-only reference. |

---

## Sources

Official (CCP)

- [Catalyst: Expansion Notes](https://www.eveonline.com/news/view/catalyst-expansion-notes)
- [Patch Notes – Version 23.02](https://www.eveonline.com/news/view/patch-notes-version-23-02)
- [Patch Notes – Version 24.01](https://www.eveonline.com/news/view/patch-notes-version-24-01)
- [Patch Notes – Version 19.11](https://www.eveonline.com/news/view/patch-notes-version-19-11)
- [Mining in Focus: New Ore & More](https://www.eveonline.com/news/view/mining-in-focus-new-ore-and-more)
- [From Extraction to Production](https://www.eveonline.com/news/view/from-extraction-to-production)
- [Monthly Economic Report – January 2026](https://www.eveonline.com/news/view/monthly-economic-report-january-2026)

EVE University Wiki

- [Mining](https://wiki.eveuniversity.org/Mining)
- [Mining yield](https://wiki.eveuniversity.org/Mining_yield)
- [Mining crystals](https://wiki.eveuniversity.org/Mining_crystals)
- [Command Bursts](https://wiki.eveuniversity.org/Command_Bursts)
- [Stacking penalties](https://wiki.eveuniversity.org/Stacking_penalties)
- [Ice harvesting](https://wiki.eveuniversity.org/Ice_harvesting)
- [Skills: Resource Processing](https://wiki.eveuniversity.org/Skills:Resource_Processing)
- [Catalyst Expansion Notes (wiki copy)](https://wiki.eveuniversity.org/UniWiki:Patch_Notes/Catalyst_Expansion_Notes)
- [Pioneer](https://wiki.eveuniversity.org/Pioneer)

EVE Ref (SDE data)

- [Miner I](https://everef.net/types/483), [Miner II](https://everef.net/types/482), [Strip Miner I](https://everef.net/types/17482), [Modulated Strip Miner II](https://everef.net/types/17912), [Modulated Deep Core Strip Miner II](https://everef.net/types/24305), [Deep Core Mining Laser I](https://everef.net/types/12108), [Ice Harvester II](https://everef.net/types/22229), [Gas Cloud Harvester II](https://everef.net/types/60314)
- [Mining Survey Chipset group](https://everef.net/groups/49): [Basic](https://everef.net/types/6571), [I](https://everef.net/types/444), [ML-3 Compact](https://everef.net/types/6569), [II](https://everef.net/types/2333), [Republic Fleet](https://everef.net/types/94065)
- [Residue Volume Multiplier attribute](https://everef.net/dogma-attributes/3153)
- [Simple Asteroid Mining Crystal Type C II](https://everef.net/types/60284)
- [Mining Drone II](https://everef.net/types/10250), ['Excavator' Mining Drone](https://everef.net/types/41030)
- [Hulk](https://everef.net/types/22544), [Covetor](https://everef.net/types/17476), [Venture](https://everef.net/types/32880), [Venture Consortium Issue](https://everef.net/types/89648), [Pioneer](https://everef.net/types/89240)

Community

- [Mining Critical Hits Explained (forum)](https://forums.eveonline.com/t/mining-critical-hits-explained/499670)
- [Yield comparison of the new mining ships (forum)](https://forums.eveonline.com/t/yield-comparison-of-the-new-mining-ships/499595)
- [New ORE ships fits/speed/crits compare (forum)](https://forums.eveonline.com/t/new-ore-ships-fits-speed-crits-compare-frigs-destroyer-exhumers-sharing-info-thread/501404)
- [A Brief Guide: Abyssal Mining Module Shopping (forum)](https://forums.eveonline.com/t/a-brief-guide-abyssal-mining-module-shopping/501200)
- [Wilm0rien/EveOnlineMiningYield (pre-Catalyst formulas)](https://github.com/Wilm0rien/EveOnlineMiningYield)
- [Kekbur – Catalyst expansion overview](https://kekbur.net/eve-online/catalyst-expansion-overview/)
- [TAGN – Catalyst mining through the eyes of a casual miner (2026-01-15)](https://tagn.wordpress.com/2026/01/15/the-catalyst-expansion-mining-changes-through-the-eyes-of-a-casual-miner/)
