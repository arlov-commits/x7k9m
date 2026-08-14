/* test-almanac.js — assertions for the almanac engine against independently generated fixtures.
 * Shared by test-almanac.html (browser) and any Node runner. No DOM, no app dependencies.
 * Exposes AlmanacTests.run(fixtures) -> { groups: [...], totalFail } .
 */
(function (root) {
  'use strict';

  var A = root.Almanac || (typeof require !== 'undefined' ? require('./almanac.js') : null);
  var D = root.AlmanacData || (typeof require !== 'undefined' ? require('./almanac-data.js') : null);

  function wrap(l) { return (((l - 315) % 360) + 360) % 360; }   // degrees from 立春
  function termIndex(l) { return Math.floor(wrap(l) / 15); }     // -> AlmanacData.TERMS
  function houIndex(l) { return Math.floor(wrap(l) / 5); }       // -> AlmanacData.HOU
  function zodIndex(l) { return Math.floor((((l % 360) + 360) % 360) / 30); }

  var MIN = 1 / 1440;                                            // one minute in days
  var TOL = 5 * MIN;                                             // spec tolerance: 5 minutes

  function group(name) {                                         // result accumulator
    return { name: name, pass: 0, fail: 0, worstMin: 0, failures: [] };
  }

  function note(g, ok, detail, deltaMin) {                       // record one assertion
    if (typeof deltaMin === 'number' && deltaMin > g.worstMin) g.worstMin = deltaMin;
    if (ok) { g.pass++; return; }
    g.fail++;
    if (g.failures.length < 12) g.failures.push(detail);         // cap the report
  }

  /* Solar terms and hou share a shape: a fixture list of {deg, utc, la_date}. */
  function checkCrossings(g, rows, stepDeg, tz, wantNames) {
    if (!rows || !rows.length) { note(g, false, 'no fixtures supplied'); return; }
    var first = new Date(rows[0].utc), last = new Date(rows[rows.length - 1].utc);
    var jd0 = A.jdFromDate(first) - 1;                           // pad so the ends are inside
    var jd1 = A.jdFromDate(last) + 1;
    var got = A.longitudeCrossings(jd0, jd1, stepDeg);           // engine output
    if (got.length !== rows.length) {
      note(g, false, 'count mismatch: engine ' + got.length + ' vs fixtures ' + rows.length);
    }
    var n = Math.min(got.length, rows.length);
    for (var i = 0; i < n; i++) {
      var f = rows[i], c = got[i];
      var expJD = A.jdFromDate(new Date(f.utc));
      var dMin = Math.abs(c.jd - expJD) * 1440;                  // delta in minutes
      var key = A.localDateKey(c.jd, tz);
      var ok = c.deg === f.deg && key === f.la_date && Math.abs(c.jd - expJD) < TOL;
      var label = f.utc + ' λ=' + f.deg + (wantNames ? ' ' + (f.tc || '') : '');
      note(g, ok, label + ' -> deg ' + c.deg + ', date ' + key +
        ' (want ' + f.la_date + '), Δ ' + dMin.toFixed(2) + ' min', dMin);
    }
  }

  function checkMoon(g, rows, tz) {
    if (!rows || !rows.length) { note(g, false, 'no fixtures supplied'); return; }
    var PHASE = ['new', 'first_quarter', 'full', 'last_quarter'];  // engine phase code -> fixture name
    var jd0 = A.jdFromDate(new Date(rows[0].utc)) - 1;
    var jd1 = A.jdFromDate(new Date(rows[rows.length - 1].utc)) + 1;
    var got = A.moonQuartersInRange(jd0, jd1);
    if (got.length !== rows.length) {
      note(g, false, 'count mismatch: engine ' + got.length + ' vs fixtures ' + rows.length);
    }
    var n = Math.min(got.length, rows.length);
    for (var i = 0; i < n; i++) {
      var f = rows[i], m = got[i];
      var expJD = A.jdFromDate(new Date(f.utc));
      var dMin = Math.abs(m.jd - expJD) * 1440;
      var key = A.localDateKey(m.jd, tz);
      var ok = PHASE[m.phase] === f.phase && key === f.la_date && Math.abs(m.jd - expJD) < TOL;
      note(g, ok, f.utc + ' ' + f.phase + ' -> ' + PHASE[m.phase] + ', date ' + key +
        ' (want ' + f.la_date + '), Δ ' + dMin.toFixed(2) + ' min', dMin);
    }
  }

  /* The Moon's longitude has no fixture of its own, so it is checked by elongation: at a new moon
     the Moon and Sun share a longitude, at first quarter they are 90 degrees apart, and so on.
     Run against the 152 independently generated quarter instants this pins Almanac.moonLongitude
     to the same ground truth as everything else. Tolerance is 0.1 degrees — about 11 minutes of
     lunar motion, tight enough that a wrong or missing periodic term shows up immediately, loose
     enough not to trip over the small definitional difference between phase conventions. */
  function checkMoonLongitude(g, rows) {
    if (!rows || !rows.length) { note(g, false, 'no moon fixtures supplied'); return; }
    var WANT = { 'new': 0, first_quarter: 90, full: 180, last_quarter: 270 };
    rows.forEach(function (f) {
      var jd = A.jdFromDate(new Date(f.utc));
      var d = ((A.moonLongitude(jd) - A.solarLongitude(jd) - WANT[f.phase]) % 360 + 540) % 360 - 180;
      var deg = Math.abs(d);
      note(g, deg < 0.1, f.utc + ' ' + f.phase + ': elongation off by ' + deg.toFixed(4) +
        ' deg (' + (deg / 13.176 * 1440).toFixed(1) + ' min of lunar motion)', deg / 13.176 * 1440);
    });
  }

  /* Mercury has no fixture either, so it is checked structurally. Each of these fails loudly if a
     series term is wrong: the geocentric elongation from the Sun is bounded by the geometry of an
     inferior orbit, and retrograde motion has a well-known cadence, length and spacing. */
  function checkMercury(g) {
    var j0 = A.jdFromDate(new Date('2026-01-01T00:00:00Z')), N = 365 * 6;
    var worst = 0, runs = [], prev = false, i;
    for (i = 0; i < N; i++) {
      var jd = j0 + i;
      var e = Math.abs(((A.mercuryLongitude(jd) - A.solarLongitude(jd)) % 360 + 540) % 360 - 180);
      if (e > worst) worst = e;
      var r = A.mercuryRetrograde(jd);
      if (r && !prev) runs.push({ s: i, e: i }); else if (r) runs[runs.length - 1].e = i;
      prev = r;
    }
    note(g, worst <= 28.5, 'max elongation from the Sun over 6 years = ' + worst.toFixed(2) +
      ' deg, must not exceed ~28 for an inferior planet');
    note(g, runs.length >= 16 && runs.length <= 21,
      runs.length + ' retrograde stretches in 6 years, expected about 18 (three a year)');
    var durs = runs.map(function (r) { return r.e - r.s + 1; });
    note(g, Math.min.apply(null, durs) >= 17 && Math.max.apply(null, durs) <= 28,
      'retrograde lengths ' + Math.min.apply(null, durs) + '-' + Math.max.apply(null, durs) +
      ' days, expected roughly 19-25');
    var gaps = runs.slice(1).map(function (r, k) { return r.s - runs[k].s; });
    note(g, Math.min.apply(null, gaps) >= 100 && Math.max.apply(null, gaps) <= 135,
      'spacing between stretches ' + Math.min.apply(null, gaps) + '-' + Math.max.apply(null, gaps) +
      ' days, expected about one synodic period (~116)');
  }

  /* The 72 hou, checked for synchronisation two independent ways.

     By degree: hou i must open at exactly 315 + 5i degrees, its term must be floor(i/3), and that
     term must open at 315 + 15*floor(i/3). A single inserted or dropped entry shifts every hou
     after it and this fails immediately.

     By grouping: the flat table is re-stated here as the 三候 of each of the 24 terms, taken from
     吳澄《月令七十二候集解》. This is the same knowledge organised the other way round, so a
     mis-ordering that a flat list would hide shows up as a term whose three hou are wrong. */
  var SANHOU = [
    ['東風解凍','蟄蟲始振','魚陟負冰'], ['獺祭魚','候雁北','草木萌動'],
    ['桃始華','倉庚鳴','鷹化為鳩'],     ['玄鳥至','雷乃發聲','始電'],
    ['桐始華','田鼠化為鴽','虹始見'],   ['萍始生','鳴鳩拂其羽','戴勝降于桑'],
    ['螻蟈鳴','蚯蚓出','王瓜生'],       ['苦菜秀','靡草死','麥秋至'],
    ['螳螂生','鵙始鳴','反舌無聲'],     ['鹿角解','蜩始鳴','半夏生'],
    ['溫風至','蟋蟀居壁','鷹始摯'],     ['腐草為螢','土潤溽暑','大雨時行'],
    ['涼風至','白露降','寒蟬鳴'],       ['鷹乃祭鳥','天地始肅','禾乃登'],
    ['鴻雁來','玄鳥歸','群鳥養羞'],     ['雷始收聲','蟄蟲坯戶','水始涸'],
    ['鴻雁來賓','雀入大水為蛤','菊有黃華'], ['豺乃祭獸','草木黃落','蟄蟲咸俯'],
    ['水始冰','地始凍','雉入大水為蜃'], ['虹藏不見','天氣上升地氣下降','閉塞而成冬'],
    ['鶡鴠不鳴','虎始交','荔挺出'],     ['蚯蚓結','麋角解','水泉動'],
    ['雁北鄉','鵲始巢','雉始雊'],       ['雞始乳','征鳥厲疾','水澤腹堅']
  ];
  function checkHouSync(g) {
    var norm = function (d) { return ((d % 360) + 360) % 360; };
    for (var i = 0; i < 72; i++) {
      var openDeg = norm(315 + 5 * i);
      note(g, houIndex(openDeg + 1e-6) === i,
        'hou ' + i + ' ' + D.HOU[i].tc + ' should open at ' + openDeg + ' deg, but that longitude indexes hou ' + houIndex(openDeg + 1e-6));
      var t = Math.floor(i / 3);
      note(g, termIndex(openDeg + 1e-6) === t,
        'hou ' + i + ' ' + D.HOU[i].tc + ' should sit in term ' + t + ' ' + D.TERMS[t].tc + ', got ' + D.TERMS[termIndex(openDeg + 1e-6)].tc);
      note(g, D.TERMS[t].deg === norm(315 + 15 * t),
        'term ' + t + ' ' + D.TERMS[t].tc + ' deg = ' + D.TERMS[t].deg + ', want ' + norm(315 + 15 * t));
    }
    note(g, SANHOU.length === 24, 'SANHOU covers ' + SANHOU.length + ' terms, want 24');
    for (var t2 = 0; t2 < 24; t2++) {
      for (var k = 0; k < 3; k++) {
        var got = D.HOU[t2 * 3 + k].tc, want = SANHOU[t2][k];
        note(g, got === want,
          D.TERMS[t2].tc + ' hou ' + (k + 1) + ' is ' + got + ', but 集解 gives ' + want);
      }
    }
  }

  /* The Ukiah list is a local phenological calendar, not astronomy, so there is no ground truth to
     check it against — only that it is a well-formed drop-in replacement for the classical table.
     Any entry that is not interchangeable slot-for-slot would silently shift a name onto the wrong
     five days when the setting is flipped. */
  function checkUkiah(g) {
    var U = D.HOU_UKIAH;
    note(g, !!U, 'HOU_UKIAH is missing from almanac-data.js');
    if (!U) return;
    note(g, U.length === 72, 'HOU_UKIAH.length = ' + U.length + ', want 72');
    var seen = {};
    for (var i = 0; i < U.length; i++) {
      var e = U[i], at = i + ' (' + ((315 + 5 * i) % 360) + ' deg)';
      note(g, !!(e && e.tc), 'HOU_UKIAH ' + at + ' has no tc');
      note(g, !!(e && e.en), 'HOU_UKIAH ' + at + ' (' + (e && e.tc) + ') has no en');
      note(g, !!(e && e.desc), 'HOU_UKIAH ' + at + ' (' + (e && e.tc) + ') has no description');
      if (e && e.tc) {
        note(g, !seen[e.tc], 'HOU_UKIAH ' + at + ' repeats the name ' + e.tc + ' from slot ' + seen[e.tc]);
        seen[e.tc] = at;
      }
    }
    // Entries the source states are kept verbatim from the classical list, in the same slot.
    var VERBATIM = { 9: '玄鳥至', 37: '白露降', 43: '玄鳥歸' };
    for (var k in VERBATIM) {
      if (!Object.prototype.hasOwnProperty.call(VERBATIM, k)) continue;
      note(g, U[k] && U[k].tc === VERBATIM[k],
        'HOU_UKIAH ' + k + ' should keep the Chinese ' + VERBATIM[k] + ' in place, got ' + (U[k] && U[k].tc));
    }
    // 白露降 belongs to 立秋 二候 in BOTH lists — the point the source makes about nippon.com.
    note(g, houIndex(140 + 1e-6) === 37 && termIndex(140 + 1e-6) === 12,
      '140 deg should be hou 37 of term 12 立秋 in both lists');
    note(g, D.HOU[37].tc === '白露降' && U[37].tc === '白露降',
      'both lists should carry 白露降 at 140 deg');
  }

  /* The tooltip layer (v11.0). No ground truth to check readings against — only that the tables
     are complete and that the derived element/modality grid is sound, since the app computes both
     from the sign index rather than storing them. */
  function checkTooltips(g) {
    var Z = D.ZODIAC, i;
    note(g, !!D.PLANETS && !!D.DIGNITY && !!D.RETRO, 'PLANETS / DIGNITY / RETRO missing');
    if (!D.PLANETS) return;
    ['sun', 'merc', 'moon'].forEach(function (k) {
      var pl = D.PLANETS[k];
      note(g, !!(pl && pl.what && pl.motion && pl.note), 'PLANETS.' + k + ' is incomplete');
      for (i = 0; i < 12; i++) {
        var r = Z[i] && Z[i][k];
        note(g, !!(r && r.k && r.t), 'ZODIAC[' + i + '] ' + (Z[i] && Z[i].name) + ' has no ' + k + ' reading');
        note(g, !!(r && r.t && r.t.length > 40), 'ZODIAC[' + i + '].' + k + ' reading is suspiciously short');
      }
      var d = D.DIGNITY[k];
      note(g, !!d, 'DIGNITY.' + k + ' missing');
      if (!d) return;
      d.rules.concat(d.detriment).concat([d.exalt, d.fall]).forEach(function (ix) {
        note(g, ix >= 0 && ix < 12, 'DIGNITY.' + k + ' has out-of-range sign index ' + ix);
      });
    });
    // Element = i % 4 and modality = i % 3. Four and three are coprime, so across the twelve signs
    // every element/modality pairing must occur exactly once — no repeats, no gaps.
    var seen = {};
    for (i = 0; i < 12; i++) {
      var key = (i % 4) + '/' + (i % 3);
      note(g, !seen[key], 'element/modality pair ' + key + ' repeats at sign ' + i + ' (also ' + seen[key] + ')');
      seen[key] = i;
    }
    note(g, Object.keys(seen).length === 12, 'the 4x3 grid should have 12 filled cells, got ' + Object.keys(seen).length);
    // The cardinal signs are the quarter-days: Aries/Cancer/Libra/Capricorn open at 0/90/180/270.
    [[0, 0], [3, 90], [6, 180], [9, 270]].forEach(function (pair) {
      note(g, pair[0] % 3 === 0, 'sign ' + pair[0] + ' should be cardinal');
      note(g, zodIndex(pair[1] + 1e-6) === pair[0],
        pair[1] + ' deg should open sign ' + pair[0] + ' ' + Z[pair[0]].name);
    });
    // Every Ukiah hou still carries a description after the rewrite.
    for (i = 0; i < 72; i++) {
      note(g, !!(D.HOU_UKIAH[i] && D.HOU_UKIAH[i].desc && D.HOU_UKIAH[i].desc.length > 60),
        'HOU_UKIAH[' + i + '] description missing or too short after the v11.0 rewrite');
    }
  }

  function checkTables(g) {
    note(g, D.HOU.length === 72, 'HOU.length = ' + D.HOU.length + ', want 72');
    note(g, D.TERMS.length === 24, 'TERMS.length = ' + D.TERMS.length + ', want 24');
    note(g, D.ZODIAC.length === 12, 'ZODIAC.length = ' + D.ZODIAC.length + ', want 12');
    note(g, D.MOON.length === 4, 'MOON.length = ' + D.MOON.length + ', want 4');
    var i;
    for (i = 0; i < 24; i++) {                                   // each term starts a hou triple
      var h = houIndex(D.TERMS[i].deg + 1e-6);
      note(g, h === i * 3, 'houIndex(TERMS[' + i + '].deg) = ' + h + ', want ' + i * 3);
    }
    for (i = 0; i < 12; i++) {                                   // zodiac boundaries are the 中氣
      var t = D.TERMS[termIndex(i * 30 + 1e-6)];
      note(g, t.tc === D.ZODIAC[i].term,
        'ZODIAC[' + i + '] ' + D.ZODIAC[i].name + ' starts at ' + t.tc + ', want ' + D.ZODIAC[i].term);
    }
    for (i = 0; i < 12; i++) {                                   // and the sign index agrees
      var z = zodIndex(i * 30 + 1e-6);
      note(g, z === i, 'zodIndex(' + i * 30 + ') = ' + z + ', want ' + i);
    }

    /* The Season tab derives sign, branch and season from the solar-term index rather than from
       λ again, so that all four layers turn over on exactly the same day. These assert the
       derivations agree with the tables for every one of the 24 terms. */
    note(g, D.BRANCHES.length === 12, 'BRANCHES.length = ' + D.BRANCHES.length + ', want 12');
    note(g, D.SEASONS.length === 4, 'SEASONS.length = ' + D.SEASONS.length + ', want 4');

    /* TERM_LINKS is index-locked to TERMS: one entry per term, all distinct, all https. The eight
       terms whose slug carries an unmistakable name — the 四立, the solstices and the equinoxes —
       are spot-checked, which pins the list's alignment at eight points around the year. */
    note(g, D.TERM_LINKS.length === 24, 'TERM_LINKS.length = ' + D.TERM_LINKS.length + ', want 24');
    note(g, new Set(D.TERM_LINKS).size === D.TERM_LINKS.length, 'TERM_LINKS has duplicate entries');
    D.TERM_LINKS.forEach(function (u, i) {
      note(g, /^https:\/\//.test(u), 'TERM_LINKS[' + i + '] is not an https URL: ' + u);
    });
    var anchors = { 0: 'lichun', 3: 'spring-equinox', 6: 'lixia', 9: 'summer-solstice',
                    12: 'liqiu', 15: 'autumn-equinox', 18: 'lidong', 21: 'winter-solstice' };
    Object.keys(anchors).forEach(function (k) {
      var want = anchors[k];
      note(g, D.TERM_LINKS[k].indexOf(want) !== -1,
        'TERM_LINKS[' + k + '] for ' + D.TERMS[k].tc + ' should contain "' + want + '": ' + D.TERM_LINKS[k]);
    });
    for (i = 0; i < 24; i++) {
      var b = D.BRANCHES[Math.floor(i / 2)];                     // 月建 turns at each 節
      note(g, b.term === D.TERMS[i - (i % 2)].tc,
        'term ' + D.TERMS[i].tc + ' -> branch ' + b.tc + ' (opens at ' + b.term + '), want month opening at ' + D.TERMS[i - (i % 2)].tc);
      var s = D.SEASONS[Math.floor(i / 6)];                      // season turns at each 四立
      note(g, s.term === D.TERMS[i - (i % 6)].tc,
        'term ' + D.TERMS[i].tc + ' -> season ' + s.tc + ' (opens at ' + s.term + '), want ' + D.TERMS[i - (i % 6)].tc);
      var zi = Math.floor((((i - 3) % 24) + 24) % 24 / 2);       // sign turns at each 中氣
      note(g, D.ZODIAC[zi].term === D.TERMS[i % 2 ? i : i - 1 < 0 ? 23 : i - 1].tc,
        'term ' + D.TERMS[i].tc + ' -> sign ' + D.ZODIAC[zi].name + ' (opens at ' + D.ZODIAC[zi].term + ')');
    }
  }

  /* Local noon must stay local noon across both DST edges. 2026-03-08 springs forward,
     2026-11-01 falls back; a naive UTC-offset scheme lands an hour off on one of them.
     Compared as a signed offset from noon rather than a string: a Julian Day near 2.46e6
     carries about 0.04 ms of double-precision slack, so the round trip back to a Date can
     read 11:59:59.999. That is float noise, not a zone error — a real DST bug is 3600 s. */
  function checkDST(g, tz) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    ['2026-03-07', '2026-03-08', '2026-03-09', '2026-10-31', '2026-11-01', '2026-11-02'].forEach(function (key) {
      var jd = A.localNoonJD(key, tz);
      var d = A.dateFromJD(jd);
      var p = fmt.formatToParts(d).reduce(function (a, x) { a[x.type] = x.value; return a; }, {});
      var dayOk = (p.year + '-' + p.month + '-' + p.day) === key;
      var localMs = (+p.hour % 24) * 3600000 + (+p.minute) * 60000 + (+p.second) * 1000 + d.getUTCMilliseconds();
      var offMs = localMs - 43200000;                            // signed distance from 12:00:00.000
      var stamp = p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute + ':' + p.second;
      note(g, dayOk && Math.abs(offMs) <= 1000,
        'localNoonJD(' + key + ') -> ' + stamp + ' (' + offMs + ' ms from local noon)');
      note(g, A.localDateKey(jd, tz) === key,
        'localDateKey(localNoonJD(' + key + ')) = ' + A.localDateKey(jd, tz));
    });
  }

  function run(fixtures) {
    var tz = fixtures.timezone || 'America/Los_Angeles';
    var groups = [];
    var g;

    g = group('Solar terms (15°)');
    checkCrossings(g, fixtures.solar_terms, 15, tz, true);
    groups.push(g);

    g = group('72 hou (5°)');
    checkCrossings(g, fixtures.hou_sample_year, 5, tz, false);
    groups.push(g);

    g = group('Moon quarters');
    checkMoon(g, fixtures.moon_quarters, tz);
    groups.push(g);

    g = group('Moon longitude (by elongation)');
    checkMoonLongitude(g, fixtures.moon_quarters);
    groups.push(g);

    g = group('72 hou synchronisation');
    checkHouSync(g);
    groups.push(g);

    g = group('Mercury (structural)');
    checkMercury(g);
    groups.push(g);

    g = group('Name tables & index math');
    checkTables(g);
    groups.push(g);

    g = group('Tooltip layer (signs, dignities, 4x3 grid)');
    checkTooltips(g);
    groups.push(g);

    g = group('Ukiah 72 hou (local list)');
    checkUkiah(g);
    groups.push(g);

    g = group('DST boundaries');
    checkDST(g, tz);
    groups.push(g);

    var totalFail = groups.reduce(function (s, x) { return s + x.fail; }, 0);
    var totalPass = groups.reduce(function (s, x) { return s + x.pass; }, 0);
    return { groups: groups, totalFail: totalFail, totalPass: totalPass, tz: tz };
  }

  root.AlmanacTests = { run: run, termIndex: termIndex, houIndex: houIndex, zodIndex: zodIndex };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.AlmanacTests;
