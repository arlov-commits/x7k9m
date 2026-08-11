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

    g = group('Name tables & index math');
    checkTables(g);
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
