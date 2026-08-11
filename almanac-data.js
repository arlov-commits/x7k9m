/* almanac-data.js — name tables for solar terms, 72 hou, tropical zodiac, moon phases.
 * v1.0 — data only, no logic. Traditional Chinese throughout.
 * 72 hou follow 吳澄《月令七十二候集解》; variants noted in ALMANAC_SPEC.md.
 * Index rule: both tables start at 立春 (λ=315°) and run forward in 15° / 5° steps.
 */
(function (root) {
  'use strict';

  /* 24 solar terms — index = floor((((lambda - 315) mod 360)) / 15) */
  var TERMS = [
    { deg: 315, tc: '立春', en: 'Beginning of Spring' },
    { deg: 330, tc: '雨水', en: 'Rain Water' },
    { deg: 345, tc: '驚蟄', en: 'Awakening of Insects' },
    { deg: 0,   tc: '春分', en: 'Spring Equinox' },
    { deg: 15,  tc: '清明', en: 'Pure Brightness' },
    { deg: 30,  tc: '穀雨', en: 'Grain Rain' },
    { deg: 45,  tc: '立夏', en: 'Beginning of Summer' },
    { deg: 60,  tc: '小滿', en: 'Grain Full' },
    { deg: 75,  tc: '芒種', en: 'Grain in Ear' },
    { deg: 90,  tc: '夏至', en: 'Summer Solstice' },
    { deg: 105, tc: '小暑', en: 'Minor Heat' },
    { deg: 120, tc: '大暑', en: 'Major Heat' },
    { deg: 135, tc: '立秋', en: 'Beginning of Autumn' },
    { deg: 150, tc: '處暑', en: 'End of Heat' },
    { deg: 165, tc: '白露', en: 'White Dew' },
    { deg: 180, tc: '秋分', en: 'Autumn Equinox' },
    { deg: 195, tc: '寒露', en: 'Cold Dew' },
    { deg: 210, tc: '霜降', en: 'Frost Descent' },
    { deg: 225, tc: '立冬', en: 'Beginning of Winter' },
    { deg: 240, tc: '小雪', en: 'Minor Snow' },
    { deg: 255, tc: '大雪', en: 'Major Snow' },
    { deg: 270, tc: '冬至', en: 'Winter Solstice' },
    { deg: 285, tc: '小寒', en: 'Minor Cold' },
    { deg: 300, tc: '大寒', en: 'Major Cold' }
  ];

  /* 72 hou — index = floor((((lambda - 315) mod 360)) / 5); term = floor(index / 3) */
  var HOU = [
    { tc: '東風解凍', en: 'East wind thaws the ice' },
    { tc: '蟄蟲始振', en: 'Hibernating insects begin to stir' },
    { tc: '魚陟負冰', en: 'Fish rise to the ice' },
    { tc: '獺祭魚', en: 'Otters offer up fish' },
    { tc: '候雁北', en: 'Wild geese fly north' },
    { tc: '草木萌動', en: 'Plants and trees begin to sprout' },
    { tc: '桃始華', en: 'Peach trees begin to blossom' },
    { tc: '倉庚鳴', en: 'Orioles begin to sing' },
    { tc: '鷹化為鳩', en: 'Hawks turn into doves' },
    { tc: '玄鳥至', en: 'Swallows arrive' },
    { tc: '雷乃發聲', en: 'Thunder begins to sound' },
    { tc: '始電', en: 'Lightning first appears' },
    { tc: '桐始華', en: 'Paulownias begin to bloom' },
    { tc: '田鼠化為鴽', en: 'Field mice turn into quails' },
    { tc: '虹始見', en: 'Rainbows first appear' },
    { tc: '萍始生', en: 'Duckweed begins to grow' },
    { tc: '鳴鳩拂其羽', en: 'Calling doves preen their wings' },
    { tc: '戴勝降于桑', en: 'Hoopoes descend on the mulberries' },
    { tc: '螻蟈鳴', en: 'Mole crickets call' },
    { tc: '蚯蚓出', en: 'Earthworms emerge' },
    { tc: '王瓜生', en: 'Snake gourds sprout' },
    { tc: '苦菜秀', en: 'Bitter herbs flourish' },
    { tc: '靡草死', en: 'Delicate grasses wither' },
    { tc: '麥秋至', en: 'The wheat harvest arrives' },
    { tc: '螳螂生', en: 'Mantises are born' },
    { tc: '鵙始鳴', en: 'Shrikes begin to call' },
    { tc: '反舌無聲', en: 'Mockingbirds fall silent' },
    { tc: '鹿角解', en: 'Deer shed their antlers' },
    { tc: '蜩始鳴', en: 'Cicadas begin to sing' },
    { tc: '半夏生', en: 'Pinellia begins to grow' },
    { tc: '溫風至', en: 'Warm winds arrive' },
    { tc: '蟋蟀居壁', en: 'Crickets dwell by the walls' },
    { tc: '鷹始摯', en: 'Hawks begin to seize prey' },
    { tc: '腐草為螢', en: 'Rotting grass becomes fireflies' },
    { tc: '土潤溽暑', en: 'The earth is damp with sultry heat' },
    { tc: '大雨時行', en: 'Great rains come from time to time' },
    { tc: '涼風至', en: 'Cool winds arrive' },
    { tc: '白露降', en: 'White dew descends' },
    { tc: '寒蟬鳴', en: 'Cold cicadas sing' },
    { tc: '鷹乃祭鳥', en: 'Hawks offer up birds' },
    { tc: '天地始肅', en: 'Heaven and earth turn austere' },
    { tc: '禾乃登', en: 'Grain ripens' },
    { tc: '鴻雁來', en: 'Wild geese arrive' },
    { tc: '玄鳥歸', en: 'Swallows depart' },
    { tc: '群鳥養羞', en: 'Flocking birds store provisions' },
    { tc: '雷始收聲', en: 'Thunder withdraws its voice' },
    { tc: '蟄蟲坯戶', en: 'Hibernating insects seal their burrows' },
    { tc: '水始涸', en: 'Waters begin to dry up' },
    { tc: '鴻雁來賓', en: 'Wild geese arrive as guests' },
    { tc: '雀入大水為蛤', en: 'Sparrows enter the sea and become clams' },
    { tc: '菊有黃華', en: 'Chrysanthemums show yellow blossoms' },
    { tc: '豺乃祭獸', en: 'Jackals offer up beasts' },
    { tc: '草木黃落', en: 'Plants yellow and leaves fall' },
    { tc: '蟄蟲咸俯', en: 'Hibernating insects all lie low' },
    { tc: '水始冰', en: 'Water begins to freeze' },
    { tc: '地始凍', en: 'The earth begins to freeze' },
    { tc: '雉入大水為蜃', en: 'Pheasants enter the sea and become great clams' },
    { tc: '虹藏不見', en: 'Rainbows hide and are not seen' },
    { tc: '天氣上升地氣下降', en: "Heaven's qi rises, earth's qi sinks" },
    { tc: '閉塞而成冬', en: 'All closes and seals, making winter' },
    { tc: '鶡鴠不鳴', en: 'The he-dan bird ceases to call' },
    { tc: '虎始交', en: 'Tigers begin to mate' },
    { tc: '荔挺出', en: 'Liting shoots emerge' },
    { tc: '蚯蚓結', en: 'Earthworms coil' },
    { tc: '麋角解', en: 'Mi-deer shed their antlers' },
    { tc: '水泉動', en: 'Springs begin to stir' },
    { tc: '雁北鄉', en: 'Geese turn homeward north' },
    { tc: '鵲始巢', en: 'Magpies begin to nest' },
    { tc: '雉始雊', en: 'Pheasants begin to call' },
    { tc: '雞始乳', en: 'Hens begin to brood' },
    { tc: '征鳥厲疾', en: 'Birds of prey turn fierce and swift' },
    { tc: '水澤腹堅', en: 'Waters and marshes freeze solid to the depths' }
  ];

  /* Tropical zodiac — index = floor(lambda / 30). Boundaries coincide exactly with the 12 中氣. */
  var ZODIAC = [
    { name: 'Aries', glyph: '\u2648\uFE0E', term: '春分' }, { name: 'Taurus', glyph: '\u2649\uFE0E', term: '穀雨' },
    { name: 'Gemini', glyph: '\u264A\uFE0E', term: '小滿' }, { name: 'Cancer', glyph: '\u264B\uFE0E', term: '夏至' },
    { name: 'Leo', glyph: '\u264C\uFE0E', term: '大暑' }, { name: 'Virgo', glyph: '\u264D\uFE0E', term: '處暑' },
    { name: 'Libra', glyph: '\u264E\uFE0E', term: '秋分' }, { name: 'Scorpio', glyph: '\u264F\uFE0E', term: '霜降' },
    { name: 'Sagittarius', glyph: '\u2650\uFE0E', term: '小雪' }, { name: 'Capricorn', glyph: '\u2651\uFE0E', term: '冬至' },
    { name: 'Aquarius', glyph: '\u2652\uFE0E', term: '大寒' }, { name: 'Pisces', glyph: '\u2653\uFE0E', term: '雨水' }
  ];

  /* Moon quarters — index matches Almanac.moonQuartersInRange phase codes.
     Icons are inline SVG (no emoji): 16x16 viewBox, currentColor. */
  var MOON = [
    { key: 'new', en: 'New Moon', tc: '朔',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>' },
    { key: 'first_quarter', en: 'First Quarter', tc: '上弦',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 1 8 14.5Z" fill="currentColor"/></svg>' },
    { key: 'full', en: 'Full Moon', tc: '望',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="currentColor"/></svg>' },
    { key: 'last_quarter', en: 'Last Quarter', tc: '下弦',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 0 8 14.5Z" fill="currentColor"/></svg>' }
  ];

  root.AlmanacData = { TERMS: TERMS, HOU: HOU, ZODIAC: ZODIAC, MOON: MOON };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.AlmanacData;
