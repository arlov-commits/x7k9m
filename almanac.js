/* almanac.js — astronomical engine for solar terms, 72 hou, moon quarters, tropical zodiac.
 * v1.3 — pure functions, no DOM, no dependencies. Works in browser and Node.
 * Algorithms: Meeus, Astronomical Algorithms 2nd ed. — ch.25 (solar position), ch.49 (moon phases).
 */
(function (root) {
  'use strict';

  var D2R = Math.PI / 180;                                   // degrees to radians
  var J2000 = 2451545.0;                                     // JD of 2000-01-01 12:00 TT

  function sin(d) { return Math.sin(d * D2R); }              // sine of degrees
  function cos(d) { return Math.cos(d * D2R); }              // cosine of degrees
  function norm360(d) { return ((d % 360) + 360) % 360; }    // wrap to [0,360)

  /* ---------- time ---------- */

  function jdFromDate(date) {                                // JS Date -> Julian Day (UT)
    return date.getTime() / 86400000 + 2440587.5;            // ms epoch -> JD
  }

  function dateFromJD(jd) {                                  // Julian Day (UT) -> JS Date
    return new Date((jd - 2440587.5) * 86400000);            // JD -> ms epoch
  }

  function deltaT(jd) {                                      // TT - UT in days (Espenak/Meeus 2005-2050)
    var y = 2000 + (jd - J2000) / 365.25;                    // approximate decimal year
    var t = y - 2000;                                        // years from 2000
    var secs = 62.92 + 0.32217 * t + 0.005589 * t * t;       // seconds
    return secs / 86400;                                     // to days
  }

  /* ---------- sun ---------- */

  var L0=[[175347046,0,0],[3341656,4.6692568,6283.07585],[34894,4.6261,12566.1517],
[3497,2.7441,5753.3849],[3418,2.8289,3.5231],[3136,3.6277,77713.7715],[2676,4.4181,7860.4194],
[2343,6.1352,3930.2097],[1324,0.7425,11506.7698],[1273,2.0371,529.691],[1199,1.1096,1577.3435],
[990,5.233,5884.927],[902,2.045,26.298],[857,3.508,398.149],[780,1.179,5223.694],
[753,2.533,5507.553],[505,4.583,18849.228],[492,4.205,775.523],[357,2.92,0.067],
[317,5.849,11790.629],[284,1.899,796.298],[271,0.315,10977.079],[243,0.345,5486.778],
[206,4.806,2544.314],[205,1.869,5573.143],[202,2.458,6069.777],[156,0.833,213.299],
[132,3.411,2942.463],[126,1.083,20.775],[115,0.645,0.98],[103,0.636,4694.003],
[102,0.976,15720.839],[102,4.267,7.114],[99,6.21,2146.17],[98,0.68,155.42],
[86,5.98,161000.69],[85,1.3,6275.96],[85,3.67,71430.7],[80,1.81,17260.15],[79,3.04,12036.46],
[75,1.76,5088.63],[74,3.5,3154.69],[74,4.68,801.82],[70,0.83,9437.76],[62,3.98,8827.39],
[61,1.82,7084.9],[57,2.78,6286.6],[56,4.39,14143.5],[56,3.47,6279.55],[52,0.19,12139.55],
[52,1.33,1748.02],[51,0.28,5856.48],[49,0.49,1194.45],[41,5.37,8429.24],[41,2.4,19651.05],
[39,6.17,10447.39],[37,6.04,10213.29],[37,2.57,1059.38],[36,1.71,2352.87],[36,1.78,6812.77],
[33,0.59,17789.85],[30,0.44,83996.85],[30,2.74,1349.87],[25,3.16,4690.48]];
  var L1=[[628331966747,0,0],[206059,2.678235,6283.07585],[4303,2.6351,12566.1517],
[425,1.59,3.523],[119,5.796,26.298],[109,2.966,1577.344],[93,2.59,18849.23],[72,1.14,529.69],
[68,1.87,398.15],[67,4.41,5507.55],[59,2.89,5223.69],[56,2.17,155.42],[45,0.4,796.3],
[36,0.47,775.52],[29,2.65,7.11],[21,5.34,0.98],[19,1.85,5486.78],[19,4.97,213.3],
[17,2.99,6275.96],[16,0.03,2544.31],[16,1.43,2146.17],[15,1.21,10977.08],[12,2.83,1748.02],
[12,3.26,5088.63],[12,5.27,1194.45],[12,2.08,4694],[11,0.77,553.57],[10,1.3,6286.6],
[10,4.24,1349.87],[9,2.7,242.73],[9,5.64,951.72],[8,5.3,2352.87],[6,2.65,9437.76],[6,4.67,4690.48]];
  var L2=[[52919,0,0],[8720,1.0721,6283.0758],[309,0.867,12566.152],[27,0.05,3.52],
[16,5.19,26.3],[16,3.68,155.42],[10,0.76,18849.23],[9,2.06,77713.77],[7,0.83,775.52],
[5,4.66,1577.34],[4,1.03,7.11],[4,3.44,5573.14],[3,5.14,796.3],[3,6.05,5507.55],
[3,1.19,242.73],[3,6.12,529.69],[3,0.31,398.15],[3,2.28,553.57],[2,4.38,5223.69],[2,3.75,0.98]];
  var L3=[[289,5.844,6283.076],[35,0,0],[17,5.49,12566.15],[3,5.2,155.42],[1,4.72,3.52],
[1,5.3,18849.23],[1,5.97,242.73]];
  var L4=[[114,3.142,0],[8,4.13,6283.08],[1,3.84,12566.15]];
  var R0=[[100013989,0,0],[1670700,3.0984635,6283.07585],[13956,3.05525,12566.1517],
[3084,5.1985,77713.7715],[1628,1.1739,5753.3849],[1576,2.8469,7860.4194],[925,5.453,11506.77],
[542,4.564,3930.21],[472,3.661,5884.927],[346,0.964,5507.553],[329,5.9,5223.694],
[307,0.299,5573.143],[243,4.273,11790.629],[212,5.847,1577.344],[186,5.022,10977.079],
[175,3.012,18849.228],[110,5.055,5486.778],[98,0.89,6069.78],[86,5.69,15720.84],
[86,1.27,161000.69],[65,0.27,17260.15],[63,0.92,529.69],[57,2.01,83996.85],[56,5.24,71430.7],
[49,3.25,2544.31],[47,2.58,775.52],[45,5.54,9437.76],[43,6.01,6275.96],[39,5.36,4694],
[38,2.39,8827.39],[37,0.83,19651.05],[37,4.9,12139.55],[36,1.67,12036.46]];
  var R1=[[103019,1.10749,6283.07585],[1721,1.0644,12566.1517],[702,3.142,0],
[32,1.02,18849.23],[31,2.84,5507.55],[25,1.32,5223.69],[18,1.42,1577.34],[10,5.91,10977.08],
[9,1.42,6275.96],[9,0.27,5486.78]];
  var R2=[[4359,5.7846,6283.0758],[124,5.579,12566.152],[12,3.14,0],[9,3.63,77713.77],
[6,1.87,5573.14],[3,5.47,18849.23]];
  function series(t,rows){let s=0;for(  var r of rows)s+=r[0]*Math.cos(r[1]+r[2]*t);return s;}

  function solarLongitude(jdTT) {                            // apparent geocentric ecliptic longitude, deg
    var tau = (jdTT - J2000) / 365250.0;                     // Julian millennia TT
    var L = (series(tau, L0) + series(tau, L1) * tau + series(tau, L2) * Math.pow(tau, 2)
           + series(tau, L3) * Math.pow(tau, 3) + series(tau, L4) * Math.pow(tau, 4)) / 1e8;
    var R = (series(tau, R0) + series(tau, R1) * tau + series(tau, R2) * Math.pow(tau, 2)) / 1e8;
    var lam = L * 180 / Math.PI + 180 - 0.09033 / 3600;       // heliocentric -> geocentric, VSOP->FK5
    var T = tau * 10;                                        // Julian centuries
    var Om = 125.04452 - 1934.136261 * T;                    // lunar ascending node
    var Ls = 280.4665 + 36000.7698 * T;                      // sun mean longitude
    var Lm = 218.3165 + 481267.8813 * T;                     // moon mean longitude
    var dpsi = (-17.20 * sin(Om) - 1.32 * sin(2 * Ls)        // nutation in longitude, arcsec
               - 0.23 * sin(2 * Lm) + 0.21 * sin(2 * Om)) / 3600;
    return norm360(lam + dpsi - 20.4898 / R / 3600);         // + aberration
  }

  function solarLongitudeUT(jdUT) {                          // convenience wrapper in UT
    return solarLongitude(jdUT + deltaT(jdUT));              // shift UT -> TT
  }

  function solveSolarLongitude(targetDeg, jdGuessUT) {       // Newton solve for apparent lambda == target
    var jd = jdGuessUT;                                      // working estimate
    for (var i = 0; i < 30; i++) {                           // converges in ~3
      var diff = ((solarLongitudeUT(jd) - targetDeg + 180) % 360 + 360) % 360 - 180; // signed error
      if (Math.abs(diff) < 1e-8) break;                      // done
      jd -= diff / 0.9856474;                                // sun moves ~0.9856 deg/day
    }
    return jd;                                               // JD in UT
  }

  function longitudeCrossings(jdStartUT, jdEndUT, stepDeg) { // all lambda == k*stepDeg instants in window
    var out = [];                                            // results
    var jd = jdStartUT;                                      // scan cursor
    var k = Math.ceil(solarLongitudeUT(jd) / stepDeg);        // next multiple index
    for (var guard = 0; guard < 5000; guard++) {              // hard stop
      var target = norm360(k * stepDeg);                     // target longitude
      var ahead = norm360(target - solarLongitudeUT(jd));    // degrees to go
      var j = solveSolarLongitude(target, jd + ahead / 0.9856474); // refine
      if (j > jdEndUT) break;                                // past window
      out.push({ deg: target, jd: j });                      // record
      jd = j + 1;                                            // step past root
      k += 1;                                                // next multiple
    }
    return out;                                              // ordered ascending
  }

  /* ---------- moon phases (Meeus ch.49) ---------- */

  var NEW_FULL = [                                           // shared coefficient shape [newC, fullC, args]
    [-0.40720, -0.40614, 0, 0, 1, 0], [0.17241, 0.17302, 1, 1, 0, 0],
    [0.01608, 0.01614, 0, 0, 2, 0], [0.01039, 0.01043, 0, 0, 0, 2],
    [0.00739, 0.00734, 1, -1, 1, 0], [-0.00514, -0.00515, 1, 1, 1, 0],
    [0.00208, 0.00209, 2, 2, 0, 0], [-0.00111, -0.00111, 0, 0, 1, -2],
    [-0.00057, -0.00057, 0, 0, 1, 2], [0.00056, 0.00056, 1, 1, 2, 0],
    [-0.00042, -0.00042, 0, 0, 3, 0], [0.00042, 0.00042, 1, 1, 0, 2],
    [0.00038, 0.00038, 1, 1, 0, -2], [-0.00024, -0.00024, 1, -1, 2, 0],
    [-0.00007, -0.00007, 0, 2, 1, 0], [0.00004, 0.00004, 0, 0, 2, -2],
    [0.00004, 0.00004, 0, 3, 0, 0], [0.00003, 0.00003, 0, 1, 1, -2],
    [0.00003, 0.00003, 0, 0, 2, 2], [-0.00003, -0.00003, 0, 1, 1, 2],
    [0.00003, 0.00003, 0, -1, 1, 2], [-0.00002, -0.00002, 0, -1, 1, -2],
    [-0.00002, -0.00002, 0, 1, 3, 0], [0.00002, 0.00002, 0, 0, 4, 0]
  ];

  var QUARTER = [                                            // [coeff, eOrder, Mmult, Mpmult, Fmult]
    [-0.62801, 0, 0, 1, 0], [0.17172, 1, 1, 0, 0], [-0.01183, 1, 1, 1, 0],
    [0.00862, 0, 0, 2, 0], [0.00804, 0, 0, 0, 2], [0.00454, 1, -1, 1, 0],
    [0.00204, 2, 2, 0, 0], [-0.00180, 0, 0, 1, -2], [-0.00070, 0, 0, 1, 2],
    [-0.00040, 0, 0, 3, 0], [-0.00034, 1, -1, 2, 0], [0.00032, 1, 1, 0, 2],
    [0.00032, 1, 1, 0, -2], [-0.00028, 2, 2, 1, 0], [0.00027, 1, 1, 2, 0],
    [-0.00005, 0, -1, 1, -2], [0.00004, 0, 0, 2, 2], [-0.00004, 0, 1, 1, 2],
    [0.00004, 0, -2, 1, 0], [0.00003, 0, 1, 1, -2], [0.00003, 0, 3, 0, 0],
    [0.00002, 0, 0, 2, -2], [0.00002, 0, -1, 1, 2], [-0.00002, 0, 1, 3, 0]
  ];

  var A_COEF = [0.000325, 0.000165, 0.000164, 0.000126, 0.000110, 0.000062, 0.000060,
                0.000056, 0.000047, 0.000042, 0.000040, 0.000037, 0.000035, 0.000023];

  function moonPhaseJD(k) {                                  // k: integer=new, +.25 FQ, +.5 full, +.75 LQ
    var T = k / 1236.85;                                     // time in Julian centuries
    var T2 = T * T, T3 = T2 * T, T4 = T3 * T;                // powers
    var jde = 2451550.09766 + 29.530588861 * k               // mean phase
            + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;
    var E = 1 - 0.002516 * T - 0.0000074 * T2;               // eccentricity correction
    var M = 2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3;              // sun mean anomaly
    var Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2                             // moon mean anomaly
           + 0.00001238 * T3 - 0.000000058 * T4;
    var F = 160.7108 + 390.67050284 * k - 0.0016118 * T2                              // argument of latitude
          - 0.00000227 * T3 + 0.000000011 * T4;
    var Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;            // ascending node

    var A = [                                                // planetary arguments A1..A14
      299.77 + 0.107408 * k - 0.009173 * T2, 251.88 + 0.016321 * k,
      251.83 + 26.651886 * k, 349.42 + 36.412478 * k, 84.66 + 18.206239 * k,
      141.74 + 53.303771 * k, 207.14 + 2.453732 * k, 154.84 + 7.306860 * k,
      34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k,
      161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k
    ];

    var phase = Math.round((k - Math.floor(k)) * 4) % 4;     // 0 new, 1 FQ, 2 full, 3 LQ
    var corr = 0;                                            // periodic correction, days

    if (phase === 0 || phase === 2) {                        // new or full
      for (var i = 0; i < NEW_FULL.length; i++) {            // shared table
        var r = NEW_FULL[i];                                 // row
        var c = (phase === 0) ? r[0] : r[1];                 // pick column
        var eOrd = Math.abs(r[2]);                           // E power
        var arg = r[3] * M + r[4] * Mp + r[5] * F;           // argument
        corr += c * Math.pow(E, eOrd) * sin(arg);            // accumulate
      }
      corr += -0.00017 * sin(Om);                            // node term
    } else {                                                 // first or last quarter
      for (var q = 0; q < QUARTER.length; q++) {             // quarter table
        var s = QUARTER[q];                                  // row
        var argq = s[2] * M + s[3] * Mp + s[4] * F;          // argument
        corr += s[0] * Math.pow(E, s[1]) * sin(argq);        // accumulate
      }
      corr += -0.00017 * sin(Om);                            // node term
      var W = 0.00306 - 0.00038 * E * cos(M) + 0.00026 * cos(Mp)        // quarter offset
            - 0.00002 * cos(Mp - M) + 0.00002 * cos(Mp + M) + 0.00002 * cos(2 * F);
      corr += (phase === 1) ? W : -W;                        // FQ adds, LQ subtracts
    }

    for (var a = 0; a < 14; a++) corr += A_COEF[a] * sin(A[a]); // additional corrections

    var jdTT = jde + corr;                                   // dynamical time
    return jdTT - deltaT(jdTT);                              // convert to UT
  }

  function moonQuartersInRange(jdStartUT, jdEndUT) {         // all quarter events in window
    var yStart = 2000 + (jdStartUT - J2000) / 365.25;        // decimal year
    var kBase = Math.floor((yStart - 2000) * 12.3685) - 2;   // safe lower k
    var out = [];                                            // results
    for (var k = kBase; k < kBase + (jdEndUT - jdStartUT) / 29.53 * 4 + 12; k += 0.25) {
      var jd = moonPhaseJD(k);                               // instant
      if (jd < jdStartUT || jd > jdEndUT) continue;          // outside window
      out.push({ jd: jd, phase: Math.round((k - Math.floor(k)) * 4) % 4 }); // 0N 1FQ 2F 3LQ
    }
    out.sort(function (a, b) { return a.jd - b.jd; });       // chronological
    return out;
  }

  /* ---------- moon position (Meeus ch.47) ----------
   * Added in v1.3 for the Moon-sign layer. Independent of the ch.49 phase routine above, which
   * is left untouched. Truncated Sigma-l: the terms kept are large enough that the residual is
   * far below the accuracy a day-granular sign assignment needs. Verified in test-almanac.js by
   * elongation: at every fixture new/first/full/last quarter the Moon's longitude minus the Sun's
   * must equal 0/90/180/270 degrees, which checks this against 152 independently generated
   * instants without needing a lunar-longitude fixture of its own. */

  var ML = [                                                 // D, M, M', F, coeff(1e-6 deg)
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
    [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
    [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
    [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
    [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
    [0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
    [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
    [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
    [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
    [1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
    [0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
  ];

  function moonLongitude(jdUT) {                             // apparent geocentric lambda, degrees
    var jde = jdUT + deltaT(jdUT);                           // UT -> TT
    var T = (jde - J2000) / 36525.0;                         // Julian centuries TT
    var T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
    var D  = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
    var M  = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
    var F  = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
    var E  = 1 - 0.002516 * T - 0.0000074 * T2;              // eccentricity of Earth's orbit
    var sum = 0;
    for (var i = 0; i < ML.length; i++) {
      var r = ML[i], mAbs = Math.abs(r[1]);
      var e = mAbs === 1 ? E : (mAbs === 2 ? E * E : 1);     // terms in M scale with E
      sum += r[4] * e * sin(r[0] * D + r[1] * M + r[2] * Mp + r[3] * F);
    }
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
    sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);   // additive corrections
    var Om = 125.04452 - 1934.136261 * T;                    // nutation in longitude, matching the
    var Ls = 280.4665 + 36000.7698 * T;                      // convention used for the Sun above
    var Lm = 218.3165 + 481267.8813 * T;
    var dpsi = (-17.20 * sin(Om) - 1.32 * sin(2 * Ls) - 0.23 * sin(2 * Lm) + 0.21 * sin(2 * Om)) / 3600;
    return norm360(Lp + sum / 1e6 + dpsi);
  }

  /* ---------- timezone helpers ---------- */

  var _fmtCache = {};                                        // memoized Intl formatters

  function _fmt(tz) {                                        // parts formatter for a zone
    if (!_fmtCache[tz]) {
      _fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false, era: 'short',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
    return _fmtCache[tz];
  }

  function tzOffsetMs(date, tz) {                            // zone offset at an instant, ms
    var p = _fmt(tz).formatToParts(date).reduce(function (a, x) { a[x.type] = x.value; return a; }, {});
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
    return asUTC - date.getTime() + (date.getMilliseconds());  // difference from true UTC
  }

  function localDateKey(jdUT, tz) {                          // JD -> 'YYYY-MM-DD' in zone
    var d = dateFromJD(jdUT);                                // to Date
    var p = _fmt(tz).formatToParts(d).reduce(function (a, x) { a[x.type] = x.value; return a; }, {});
    return p.year + '-' + p.month + '-' + p.day;             // ISO-ish key
  }

  function localNoonJD(dateKey, tz) {                        // 'YYYY-MM-DD' -> JD of local noon
    var parts = dateKey.split('-');                          // split key
    var guess = Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 12, 0, 0); // naive noon
    for (var i = 0; i < 2; i++) {                            // two passes settles DST
      var off = tzOffsetMs(new Date(guess), tz);             // offset at guess
      guess = Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 12, 0, 0) - off;
    }
    return jdFromDate(new Date(guess));                      // to JD
  }

  root.Almanac = {                                           // public surface
    jdFromDate: jdFromDate, dateFromJD: dateFromJD,
    solarLongitude: solarLongitudeUT, solveSolarLongitude: solveSolarLongitude,
    longitudeCrossings: longitudeCrossings,
    moonPhaseJD: moonPhaseJD, moonQuartersInRange: moonQuartersInRange,
    moonLongitude: moonLongitude,
    localDateKey: localDateKey, localNoonJD: localNoonJD, tzOffsetMs: tzOffsetMs,
    norm360: norm360
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.Almanac; // node
