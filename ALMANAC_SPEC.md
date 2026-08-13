# Academic Planner — Week Tab Almanac

Handoff spec for Claude Code. Repo: `arlov-commits/x7k9m`. Target: `index.html` (single-file vanilla JS PWA), plus two new JS files and one new settings row.

**The astronomy is already written and verified. Do not reimplement it.** Your job is integration and UI.

---

## 1. What ships

Four cyclical layers, all derived from one number (the Sun's apparent ecliptic longitude) plus a separate lunar routine:

| Layer | Cadence | Source |
|---|---|---|
| 24 solar terms 節氣 | ~15.2 days | λ☉ crosses a multiple of 15° |
| 72 hou 候 | ~5.1 days | λ☉ crosses a multiple of 5° |
| Tropical zodiac sign | ~30.4 days | λ☉ crosses a multiple of 30° |
| Moon quarters | ~7.4 days | Meeus ch.49 |

The zodiac is free: sign boundaries coincide **exactly** with the twelve 中氣 (Aries begins at 春分, Taurus at 穀雨, and so on). No separate computation, and `almanac-data.js` records the pairing.

Deliberately **out of scope**: Earthly Branch month, sexagenary day, lunar mansions, planets, illumination percentage.

---

## 2. Files

Add to repo root, load in this order before your app script:

```html
<script src="almanac-data.js"></script>
<script src="almanac.js"></script>
```

- **`almanac.js`** — engine. Pure functions on `window.Almanac`, no DOM, no dependencies, ~9 KB.
- **`almanac-data.js`** — name tables on `window.AlmanacData`. Data only.

**Add both to the `sw.js` precache list and bump the cache version constant**, or returning users will run the new `index.html` against a stale cache and the almanac strip will silently render empty.

### API

```js
Almanac.jdFromDate(date)                        // JS Date -> Julian Day (UT)
Almanac.dateFromJD(jd)                          // inverse
Almanac.solarLongitude(jdUT)                    // apparent geocentric λ☉ in degrees
Almanac.longitudeCrossings(jd0, jd1, stepDeg)   // -> [{deg, jd}] ascending
Almanac.moonQuartersInRange(jd0, jd1)           // -> [{jd, phase}] phase 0=new 1=FQ 2=full 3=LQ
Almanac.localDateKey(jd, tz)                    // -> 'YYYY-MM-DD' in an IANA zone
Almanac.localNoonJD('YYYY-MM-DD', tz)           // -> JD of local noon, DST-correct
```

```js
AlmanacData.TERMS   // 24 × {deg, tc, en}
AlmanacData.HOU     // 72 × {tc, en}
AlmanacData.ZODIAC  // 12 × {name, glyph, term}
AlmanacData.MOON    //  4 × {key, en, tc, svg}
```

### Index math

Both tables start at 立春 (λ=315°) and run forward:

```js
const wrap = l => (((l - 315) % 360) + 360) % 360;
const termIndex = l => Math.floor(wrap(l) / 15);   // -> AlmanacData.TERMS
const houIndex  = l => Math.floor(wrap(l) / 5);    // -> AlmanacData.HOU
const zodIndex  = l => Math.floor((((l % 360) + 360) % 360) / 30);
```

`houIndex % 3 === 0` means that hou is the **first** of its term, i.e. the crossing is also a solar-term flip. Use that to decide whether a day marker shows the 節氣 name as well as the 候 name — don't run a second crossing pass at 15°.

---

## 3. Timezone setting

One new setting: `almanacTz`, default `'America/Los_Angeles'`.

- Render as a `<select>` populated from `Intl.supportedValuesOf('timeZone')`, grouped by region prefix, with a text filter input. If `Intl.supportedValuesOf` is unavailable, fall back to a short hardcoded list and log a warning.
- DST is handled by `Intl` — do not store or compute UTC offsets yourself.
- Scope is **the almanac only**. Do not touch existing date handling for tasks, events, countdowns, or week boundaries. Those keep using local browser time exactly as they do now.
- Persist through the existing settings object so it rides the localStorage + Supabase sync path. **Default the key when absent** — synced state from before this change won't contain it, and an `undefined` timezone throws inside `Intl.DateTimeFormat`.

Add a second setting `almanacLayers`, an object of four booleans (`terms`, `hou`, `moon`, `zodiac`), all `true` by default, so layers can be turned off individually.

---

## 4. UI

Read the existing Week tab markup and the v8.1 design tokens **before** writing any CSS. Match the established type scale, radii, and engraved SVG icon family. Do not introduce new one-off button or badge classes.

House rules that apply here: **no emoji anywhere** — moon glyphs come from `AlmanacData.MOON[i].svg` as inline SVG using `currentColor`, and the zodiac glyphs already carry U+FE0E to force text presentation. Keyboard hints use Ctrl, never ⌘.

### 4a. Day-cell footer — transitions only

A thin band at the bottom of each day cell, below existing content. It renders **only on days where something flips**, so most cells stay blank. Never reserve empty vertical space for it.

Per day, in this order:

1. **Solar term** — when `houIndex % 3 === 0`. TC then English, e.g. 立秋 · Beginning of Autumn. Give this the strongest weight of the three.
2. **Hou** — TC then English, e.g. 白露降 · White dew descends. One step down in weight.
3. **Moon quarter** — inline SVG plus name, e.g. Full Moon.

Two markers on one day is common (a term flip is always also a hou flip; the sample week of 2026‑08‑10 has a new moon and a hou flip both landing on the 12th). Three is possible. Stack them; don't truncate.

`天氣上升地氣下降` is eight characters and its English gloss is long. Let the band wrap rather than ellipsize — clipping a hou name is worse than an uneven cell.

### 4b. Right rail — ambient state

A narrow vertical strip along the right edge of the week grid, showing what the week *sits inside* rather than what changes.

Segment it proportionally to the seven days. If the term or sign changes mid-week, the rail splits at that day so the boundary is visible. Contents, outermost to innermost: zodiac sign → solar term → current hou.

Set text vertically with `writing-mode: vertical-rl`. Latin text reads bottom-to-top in that mode, so use `text-orientation: mixed` for the English and let the TC characters stack upright naturally — that's the one place where CJK and Latin want different treatment.

### 4c. Mobile

Below roughly 640px the rail becomes clutter. Collapse it to a single horizontal summary line above the week grid — sign · term · hou, TC only, English on tap. The day-cell footers stay as they are but drop to TC-only with English available on tap. Verify on a Pixel-width viewport; the Chromebook layout is the easy case.

---

## 5. Computing a week

```js
const tz = settings.almanacTz;
const jd0 = Almanac.localNoonJD(mondayKey, tz) - 0.5;   // local midnight Monday
const jd1 = Almanac.localNoonJD(sundayKey, tz) + 0.5;   // local midnight Monday next

const markers = {};                                      // dateKey -> array
for (const c of Almanac.longitudeCrossings(jd0, jd1, 5)) {
  const key = Almanac.localDateKey(c.jd, tz);
  const i = houIndex(c.deg + 1e-6);                      // epsilon guards the boundary
  (markers[key] ||= []).push({ kind: i % 3 === 0 ? 'term' : 'hou', index: i });
}
for (const m of Almanac.moonQuartersInRange(jd0, jd1)) {
  const key = Almanac.localDateKey(m.jd, tz);
  (markers[key] ||= []).push({ kind: 'moon', index: m.phase });
}
```

The `+ 1e-6` epsilon matters: a crossing instant returns λ equal to the boundary to within floating-point noise, and without it `Math.floor` can land one index low.

For the rail's ambient state, evaluate `Almanac.solarLongitude(Almanac.localNoonJD(dayKey, tz))` at **local noon** of each day, not midnight. Noon is unambiguous under DST transitions; midnight is not.

Recompute on week navigation and on timezone change. A full week is roughly 20 solves at ~0.16 ms each — about 3 ms, so no caching layer, no precomputed tables, no memoisation. Don't add one.

---

## 6. Verification — required before you call this done

The standing rule applies: **do not skip verification.** `almanac-fixtures.json` holds independently generated ground truth — 144 solar terms (2026–2031), 72 hou across a full year, and 152 moon quarters (2026–2028), produced with pyephem's VSOP87/ELP2000, with local dates in `America/Los_Angeles`.

Write `test-almanac.html` — a standalone page, not part of the app — that loads both scripts and asserts:

1. Every fixture solar term matches on `deg`, on local date key, and within 5 minutes UTC.
2. Same for all 72 hou.
3. Every moon quarter matches on phase code, local date key, and within 5 minutes UTC.
4. `AlmanacData.HOU.length === 72` and `TERMS.length === 24`.
5. For each `i` in 0..23, `houIndex(TERMS[i].deg + 1e-6) === i * 3`.
6. For each `z` in 0..11, `TERMS[termIndex(z * 30 + 1e-6)].tc === ZODIAC[z].term`.
7. A DST-boundary case: `localNoonJD` returns a correct instant on 2026‑03‑08 and 2026‑11‑01 in `America/Los_Angeles`.

Expected result is **zero mismatches** — that's what the engine produces now, so any failure is an integration bug on your side, not a tolerance to loosen. Report the worst delta in each category; it should land near 1 minute.

Then check the rendering by hand: navigate to the week of 2026‑08‑10 and confirm the 12th shows both a New Moon marker and 候 白露降, and that the rail reads Leo / 立秋 / 涼風至 at the start of the week.

---

## 7. Provenance

Read this before touching the data tables.

**Engine.** Solar longitude uses truncated VSOP87D for Earth's heliocentric longitude, converted to apparent geocentric with FK5 correction, nutation, and aberration. Moon quarters use Meeus *Astronomical Algorithms* 2nd ed. ch.49 with the full periodic and planetary correction sets. Term instants are found by Newton iteration on λ☉, which converges in three or four steps.

Two simpler solar methods were built and raced against the same fixtures before this one was chosen:

| Method | Worst error | Mean | 200 solves |
|---|---|---|---|
| Meeus ch.25 low-precision | 13.9 min | 4.6 min | 6.3 ms |
| ch.25 + Venus/Jupiter/Moon perturbations | 3.8 min | 1.6 min | 2.0 ms |
| **VSOP87 truncated (shipped)** | **1.1 min** | **0.11 min** | **32 ms** |

The low-precision version put one term on the wrong local date within a six-year window; the shipped version puts none. At 0.16 ms per solve the extra cost is invisible, so accuracy won outright.

**Cross-checked against a published almanac**, not just against itself: all 24 solar terms and all 12 new moons of 2026 match the Hong Kong Observatory's Gregorian–Lunar Conversion Table exactly at day level in Hong Kong Time, with times agreeing to the minute. HKO derives its figures from HM Nautical Almanac Office and the US Naval Observatory, so this is genuinely independent of both the engine and the pyephem fixtures.

**Chinese list, not Japanese.** Japan rewrote the 72 候 in 1685 (Shibukawa Shunkai) for its own
climate, and that revised list is what most English-language pages show. They diverge at 立秋:
the Chinese list runs 涼風至 (135°) / 白露降 (140°) / 寒蟬鳴 (145°), the Japanese 涼風至 / 寒蝉鳴 /
蒙霧升降. So in this app 白露降 "white dew descends" falls in mid-August as the second hou of
立秋, and has nothing to do with the solar term 白露 at 165° about 25 days later, which opens
with 鴻雁來. Japanese-list sources show 草露白 at 白露 and contain no 白露降 at all. Verified
against zh.wikipedia's 七十二候 table (which gives the same degrees) and ja.wikipedia's, which
prints the Japanese and original Chinese columns side by side. Do not "fix" this to match a
Japanese table.

**Two 72 候 lists ship, and the LOCAL one is the default.** `HOU` is the classical Chinese table
described above and remains what the fixtures verify. `HOU_UKIAH` is 優凱谷七十二候 v3.0 — a
phenological calendar written for the Ukiah Valley / City of Ten Thousand Buddhas (95482), and the
list the app shows unless Settings → Almanac → 72 候 list says otherwise.

This is **not a translation**. Ukiah is close to the inverse of the North China climate the
classical list describes, and the local list states that inversion rather than smoothing it:

| | North China | Ukiah Valley |
|---|---|---|
| Green | spring–summer | November–May |
| Gold / dead | autumn | June–October |
| Dormancy | winter | **summer** |
| Deep flowering | 春分–立夏 | **冬至–大寒** |

So 夏至 (90°) is 草化黃金, the grasses turning to gold, where the Chinese year is at its fullest;
立冬 (225°) is 秋草反青, the hills greening, where the Chinese list has 水始冰. A few entries are
kept **verbatim in the same slot** where the phenomenon genuinely lands there — 玄鳥至 (0°),
白露降 (140°), 玄鳥歸 (170°) — and a few deliberately reuse classical wording half a year out of
place, notably 蚯蚓出 at 280° and 鹿角解 at 315°. The test group `Ukiah 72 hou (local list)`
asserts the table is a well-formed drop-in for the classical one — 72 entries, no repeated name,
every entry glossed, and the three verbatim slots intact — because anything else would silently
move a name onto the wrong five days when the setting is flipped.

Every entry carries a `desc`, shown on hovering or tapping its pill in the Season tab's 候 lane.
The source flags its own confidence: 蜩始鳴 / 蜩鳴日中 / 蜩聲忽止 (cicada onset and cutoff),
地鼠夏蟄, 連雀降實, 雁引雛行, 膠菊乃香 and 丹蒿出土 want a season of local observation before the
placement is trusted. Several plant and animal names are **coinages**, flagged as such in the
source rather than passed off as established: 七葉 (buckeye), 莓樹 (madrone), 石龍 (fence lizard,
knowingly borrowed from 石龍子, which is a skink), 地蛛 (tarantula), 朱蝽 (boxelder bug),
貫葉菜 (miner's lettuce), 膠菊 (tarweed), 丹蒿 (Indian warrior), 白橡 (valley oak), 地鼠 (ground
squirrel), 冠雀 (crowned sparrows), 連雀 (cedar waxwing). Do not "correct" these to standard
Chinese names without reading the source's naming notes first.

The honest way to run the local list is the way the original was run: fix the astronomical
position, write down what you actually see, and move the entry when three years disagree with it.

**Hou names** follow 吳澄《月令七十二候集解》, verified against 中國氣象局, the 中國農業博物館 summary of《逸周書·時訓解》, and 百度百科's transcription of the 集解. Three corrections were made against the draft list this project started from, and you should not silently revert them:

- Hou 5 is **候雁北** "Wild geese fly north", not 鴻雁來. The draft duplicated 鴻雁來 at both hou 5 and hou 43; 集解 gives 候雁北 for 雨水二候 and notes 鴻雁北 as the《月令》/《漢書》variant. Hou 43 (白露初候) genuinely is 鴻雁來.
- Hou 55 is **水始冰**. 百度百科's 集解 text reads 水始凍; 逸周書 and the 中國氣象局 line both give 水始冰, which is the standard modern form.
- Hou 69 is **雉始雊**; some sources shorten to 雉雊 or print 雉始鴝.

Other live variants, left as-is: 荔挺出 / 荔挺生 (hou 63), 天氣上升地氣下降 / 天氣上騰地氣下降 (hou 59), 戴勝降于桑 / 戴任降于桑 (hou 18).

Two hou describe premodern transformation beliefs rather than observed biology — 鷹化為鳩 hawks turning into doves, 雀入大水為蛤 sparrows becoming clams. The English glosses render them literally on purpose. Don't "fix" them into naturalistic paraphrase.

**Range.** The VSOP87 truncation and the ΔT model are good well beyond the 2–5 year horizon this was scoped for; the fixtures cover 2026–2031. Nothing expires, and there is no table to regenerate.
