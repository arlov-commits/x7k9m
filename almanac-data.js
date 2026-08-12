/* almanac-data.js — name tables for solar terms, 72 hou, tropical zodiac, moon phases.
 * v1.2 — data only, no logic. Traditional Chinese throughout.
 * v1.1 adds BRANCHES (地支 solar months) and SEASONS, both keyed off the solar-term index.
 * v1.2 adds TERM_LINKS — further reading per solar term, same index as TERMS.
 * 72 hou follow the CHINESE list of 吳澄《月令七十二候集解》; variants noted in ALMANAC_SPEC.md.
 * NOT the Japanese 七十二候, which is a different list — Japan rewrote it in 1685 for its own
 * climate. The clearest tell is 立秋: Chinese 涼風至 / 白露降 / 寒蟬鳴, Japanese 涼風至 / 寒蝉鳴 /
 * 蒙霧升降. So 白露降 "white dew descends" is the SECOND hou of 立秋 at 140 deg, and is unrelated
 * to the solar term 白露 at 165 deg some 25 days later, which opens with 鴻雁來. Japanese-list
 * sources (nippon.com among them) put 草露白 at 白露 instead and have no 白露降 at all.
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

  /* Further reading per solar term, same index as TERMS (0 = 立春). Opened from the term pill in
     the Season tab. External editorial content, not part of the astronomy. */
  var TERM_LINKS = [
    'https://sinocultural.com/blogs/china-24-solar-terms/lichun-%E7%AB%8B%E6%98%A5-the-beginning-of-spring-in-the-chinese-solar-terms',
    'https://sinocultural.com/blogs/china-24-solar-terms/the-rhythm-of-rain-celebrating-china-s-rain-water-solar-term',
    'https://sinocultural.com/blogs/china-24-solar-terms/jingzhe-the-awakening-of-spring-s-energy',
    'https://sinocultural.com/blogs/china-24-solar-terms/spring-equinox-%E6%98%A5%E5%88%86-the-balance-of-light-and-darkness',
    'https://sinocultural.com/blogs/china-24-solar-terms/qingming-festival-2025-traditional-customs-and-modern-significance',
    'https://sinocultural.com/blogs/china-24-solar-terms/grain-rain-guyu-a-beautiful-chapter-in-china-24-solar-terms',
    'https://sinocultural.com/blogs/china-24-solar-terms/embracing-the-beginning-of-summer-a-guide-to-lixia%E7%AB%8B%E5%A4%8F',
    'https://sinocultural.com/blogs/china-24-solar-terms/xiaoman%E5%B0%8F%E6%BB%A1-the-art-of-small-fullness-in-nature-s-cycle',
    'https://sinocultural.com/blogs/china-24-solar-terms/grain-in-earmangzhong-unveiling-the-9th-solar-term-of-ancient-chinese-wisdom',
    'https://sinocultural.com/blogs/china-24-solar-terms/summer-solsticexiazhi-%E5%A4%8F%E8%87%B3-where-ancient-wisdom-meets-the-longest-day',
    'https://sinocultural.com/blogs/china-24-solar-terms/lesser-heat-xiaoshu%E5%B0%8F%E6%9A%91-understanding-the-summer-solstice-and-its-impact',
    'https://sinocultural.com/blogs/china-24-solar-terms/great-heat-dashu-%E5%A4%A7%E6%9A%91-celebrate-the-peak-of-summer-with-chinese-traditions',
    'https://sinocultural.com/blogs/china-24-solar-terms/a-fun-guide-to-the-beginning-of-autumnliqiu-%E7%AB%8B%E7%A7%8B-from-autumn-fat-to-crisp-breezes',
    'https://sinocultural.com/blogs/china-24-solar-terms/end-of-heatchushu-%E5%A4%84%E6%9A%91-welcoming-autumn-with-ancient-chinese-traditions',
    'https://sinocultural.com/blogs/china-24-solar-terms/white-dew-bailu-%E7%99%BD%E9%9C%B2-the-autumn-elegance-of-china-s-24-solar-terms',
    'https://sinocultural.com/blogs/china-24-solar-terms/autumn-equinox-qiufen-%E7%A7%8B%E5%88%86-the-golden-balance-of-china-s-24-solar-terms',
    'https://sinocultural.com/blogs/china-24-solar-terms/cold-dew-hanlu-%E5%AF%92%E9%9C%B2-2025-welcoming-autumn-s-chill-with-warm-traditions',
    'https://sinocultural.com/blogs/china-24-solar-terms/frost-s-descent-%E9%9C%9C%E9%99%8D-shuangjiang-2025-opening-the-curtain-to-winter-s-serenity',
    'https://sinocultural.com/blogs/china-24-solar-terms/the-start-of-winter-lidong-%E7%AB%8B%E5%86%AC-embracing-warmth-and-balance-as-winter-begins',
    'https://sinocultural.com/blogs/china-24-solar-terms/lesser-snow-xiaoxue-embracing-winters-gentle-descent',
    'https://sinocultural.com/blogs/china-24-solar-terms/greater-snow-daxue-%E5%A4%A7%E9%9B%AA-welcoming-winter-s-deepest-elegance',
    'https://sinocultural.com/blogs/china-24-solar-terms/winter-solstice-dongzhi-embracing-renewal-and-warmth-at-the-heart-of-winter',
    'https://sinocultural.com/blogs/china-24-solar-terms/minor-cold-xiaohan-%E5%B0%8F%E5%AF%92-the-quiet-deepening-of-winter-in-china-s-24-solar-terms',
    'https://sinocultural.com/blogs/china-24-solar-terms/great-cold-dahan-%E5%A4%A7%E5%AF%92-reflecting-on-the-year-and-welcoming-the-chinese-new-year'
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

  /* 12 earthly branches 地支 as SOLAR months 月建 — index = floor(termIndex / 2), so the month
     turns at each 節 (the even-indexed solar terms counting from 立春) and the 中氣 falls mid-month.
     寅 opens at 立春, which is why this table starts there rather than at 子.
     `en` is the branch's zodiac animal, the name it is usually recognised by in English. */
  var BRANCHES = [
    { tc: '寅', en: 'Tiger', term: '立春' }, { tc: '卯', en: 'Rabbit', term: '驚蟄' },
    { tc: '辰', en: 'Dragon', term: '清明' }, { tc: '巳', en: 'Snake', term: '立夏' },
    { tc: '午', en: 'Horse', term: '芒種' }, { tc: '未', en: 'Goat', term: '小暑' },
    { tc: '申', en: 'Monkey', term: '立秋' }, { tc: '酉', en: 'Rooster', term: '白露' },
    { tc: '戌', en: 'Dog', term: '寒露' }, { tc: '亥', en: 'Pig', term: '立冬' },
    { tc: '子', en: 'Rat', term: '大雪' }, { tc: '丑', en: 'Ox', term: '小寒' }
  ];

  /* Four seasons — index = floor(termIndex / 6). Each opens on one of the 四立. */
  var SEASONS = [
    { tc: '春', en: 'Spring', term: '立春' }, { tc: '夏', en: 'Summer', term: '立夏' },
    { tc: '秋', en: 'Autumn', term: '立秋' }, { tc: '冬', en: 'Winter', term: '立冬' }
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

  root.AlmanacData = { TERMS: TERMS, HOU: HOU, ZODIAC: ZODIAC, MOON: MOON,
                       BRANCHES: BRANCHES, SEASONS: SEASONS, TERM_LINKS: TERM_LINKS };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.AlmanacData;
