/* almanac-data.js — name tables for solar terms, 72 hou, tropical zodiac, moon phases.
 * v1.5 — data only, no logic. Traditional Chinese throughout.
 * v1.1 adds BRANCHES (地支 solar months) and SEASONS, both keyed off the solar-term index.
 * v1.2 adds TERM_LINKS — further reading per solar term, same index as TERMS.
 * v1.3 adds MOON_MID — the four phases between the quarters, for the Season tab.
 * v1.5 rewrites every HOU_UKIAH description and adds the planetary tooltip layer: per-sign
 * readings for ☉/☿/☽ on ZODIAC, plus ELEMENTS, MODES, PLANETS, DIGNITY and RETRO.
 * Source for both: 'Almanac Tooltip Reference', kept in calendars/source.
 * v1.4 adds HOU_UKIAH — a local 72 候 for the Ukiah Valley, now the default list; HOU is kept
 * as the classical alternative, selectable in settings, and remains what the fixtures check.
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

  /* 72 hou, Ukiah Valley / City of Ten Thousand Buddhas (95482) — the DEFAULT list.
     Same frame as the Chinese table above: index = floor((((lambda - 315) mod 360)) / 5), so
     entry 0 opens at 315 deg with 立春 and the two tables are interchangeable slot for slot.

     This is a local phenological calendar, not a translation. Ukiah is close to the inverse of
     the North China climate the classical list describes — the hills are green from November to
     May and gold from June to October, deep flowering falls at 冬至–大寒, and dormancy is a
     SUMMER event — so the entries state that inversion rather than smoothing it. Several are kept
     verbatim from the Chinese where the phenomenon genuinely lands in the same slot (玄鳥至 at 0,
     白露降 at 140, 玄鳥歸 at 170), and several deliberately reuse classical wording half a year
     out of place (蚯蚓出 at 280, 鹿角解 at 315).

     `desc` is what you would actually see, and is shown on tapping or hovering the 候 pill.
     Source: 優凱谷七十二候 v3.0, 2026-08-13. Provenance and per-entry confidence in ALMANAC_SPEC.md.
     The classical Chinese list stays available under Settings -> Almanac -> 72 候 list. */
  var HOU_UKIAH = [
    /* 立春 */
    { tc: "鹿角解", en: "The buck lets go his antlers",
      desc: "Blacktail bucks drop their antlers in midwinter, usually both sides within a day of each other. The bucks go suddenly plain and stay that way until spring. For a few weeks the antlers lie on the ground where they fell, heavy and warm-colored, their edges gnawed by rodents taking the calcium." },
    { tc: "蛙聲徹夜", en: "Frog voice all night through",
      desc: "Treefrogs fill every ditch, seasonal pool and wet swale, calling from dusk until first light. Walk toward them and the entire chorus cuts out at once, then starts again behind you as you pass. It is the loudest the valley gets all year, at the coldest and wettest point of it." },
    { tc: "七葉先萌", en: "The buckeye leafs out first, alone",
      desc: "California buckeye breaks bud in February while every other deciduous tree is still bare wood. Pale apple-green fingers open at the branch tips, unmistakable across a hillside. It is the first tree to leaf and the first to quit — its entire year is compressed into the wet half." },
    /* 雨水 */
    { tc: "川壑皆盈", en: "Every ravine runs full",
      desc: "Drainages that were dry stone in September now run full and audible from a distance. Culverts roar, seasonal creeks reappear on ground that showed no sign of holding them, and the valley acquires a constant background sound it lacks for half the year." },
    { tc: "雁集水田", en: "The geese gather on the flooded field",
      desc: "Canada geese mass on standing water in winter pasture, along the river, at the lake margins — hundreds where there were dozens. They lift in ragged skeins at any disturbance, complaining loudly, and resettle forty yards off. Nothing else concentrates them the way flooded ground does." },
    { tc: "貫葉菜秀", en: "The pierced-leaf herb comes into its own",
      desc: "Miner's lettuce carpets shaded banks and the north sides of oaks: a round disc of leaf with the stem running clean through the middle and a small spray of white flowers standing out of the hole. Crisp, mild, faintly sour. The first thing of the year you can pick and eat." },
    /* 驚蟄 */
    { tc: "紫荊先花", en: "Redbud flowers ahead of its leaves",
      desc: "Western redbud goes magenta on completely bare wood, the flowers pressed directly to grey branches with no leaf anywhere on the plant. Visible from a long way off on dry slopes and roadcuts. The round blue-green leaves arrive weeks later, once the display is finished." },
    { tc: "孔雀開屏", en: "The peacock raises his screen",
      desc: "The peacocks begin to display and will not stop until high summer. The train comes up and fans, the quills shiver with a dry rattling hiss, and the bird turns slowly to keep the sun behind him. The screaming starts too, at all hours, carrying much further than seems reasonable." },
    { tc: "火雞曳翼", en: "The turkey drags his wings",
      desc: "Wild toms strut: tail fanned into a full wheel, primaries scraping the dirt, breast puffed, bare head flushed blue and red. They move stiff-legged in slow circles around hens who go on feeding without appearing to notice. Any loud noise — a door, a horn — draws a gobble in reply." },
    /* 春分 */
    { tc: "玄鳥至", en: "The swallows arrive",
      desc: "Barn and cliff swallows are overhead again after six months away, cutting low and fast over open ground and water. They arrive within about a week of the same date each year, having crossed a continent to do it, and they go straight back to the eaves they used last season." },
    { tc: "燕銜泥", en: "The swallow carries mud",
      desc: "Swallows work the edge of any puddle, gathering beakfuls of mud and carrying them up under eaves, bridge decks and overhangs. The gourd-shaped nests go up in roughly a week, built pellet by pellet, every one of them still visible in the finished wall." },
    { tc: "橡花垂穗", en: "The oaks hang out their tassels",
      desc: "The oaks put out catkins in long dangling strings, and then release. Pollen films every horizontal surface — windshields, standing water, laundry, the hood of a car — as a fine yellow-green dust that is back within hours of being washed off." },
    /* 清明 */
    { tc: "藍眼遍草", en: "Blue eyes scattered through the grass",
      desc: "Blue-eyed grass opens across grassy slopes: small six-petalled stars, violet-blue with a yellow center, on flat iris-like leaves. Singly they are easy to miss. In numbers a slope reads as a scatter of small open eyes and seems to be looking back at you." },
    { tc: "金燈懸莖", en: "Golden lanterns hang from the stem",
      desc: "Golden globe lilies hang in oak shade — translucent yellow globes on thin wiry stalks, nodding, closed at the mouth. With the sun behind them they light from the inside like paper lanterns. They last a short time and grow in loose scattered colonies rather than drifts." },
    { tc: "蜂蝶咸出", en: "Bees and butterflies, all of them at once",
      desc: "Within about a week the insect load goes from noticeable to total. Bees work every open flower, swallowtails and painted ladies cross the road at windshield height, and the air above any blooming shrub is continuously in motion. This is the densest exchange between flower and insect all year." },
    /* 穀雨 */
    { tc: "雁引雛行", en: "The geese lead their goslings in a line",
      desc: "Geese walk their goslings in single file, one adult in front and one behind, the yellow-grey young strung between them. The line crosses lawns, roads and parking lots at its own pace and cannot be hurried. Traffic stops for it. Everyone waits." },
    { tc: "石龍拜日", en: "The rock-dragon bows to the sun",
      desc: "Male fence lizards take a rock, post or step and do rapid push-ups, flashing an iridescent blue belly at rivals. The motion is abrupt, repeated and looks precisely like bowing. They hold territory this way through the spring, always in full sun on the warmest surface available." },
    { tc: "響尾出穴", en: "The rattle-tail leaves its hole",
      desc: "Rattlesnakes are out and moving. Watch trail edges, warm stone, the shade beneath a step at midday and the open path in late afternoon. They are not aggressive and would much rather not be found, which is exactly why they are easy to walk up on without noticing." },
    /* 立夏 */
    { tc: "七葉舉燭", en: "The buckeye lifts its candles",
      desc: "Buckeye raises white flower spikes eight inches or more, standing upright off the branches like candles set on a stand. Heavily scented at close range and covered in insects at all hours. This is the tree's entire visible output for the year, spent in about three weeks." },
    { tc: "鶉引雛", en: "The quail leads her chicks",
      desc: "Quail broods appear: a dozen chicks the size of bumblebees rolling across a path in a loose ball, changing direction all at once. The hen moves with them. The cock takes a fencepost or low branch above and sounds a single sharp note at anything that approaches." },
    { tc: "蛙聲乃寂", en: "And so the frog voice falls silent",
      desc: "The pools go down and the chorus stops. There is no long fade — a week of thinning voices, then nothing. You notice it several nights after it has happened, as an absence you cannot immediately name, and the valley stays quiet until the cicadas start." },
    /* 小滿 */
    { tc: "芒穗乃堅", en: "And so the awned heads harden",
      desc: "Foxtails turn from soft green to barbed, brittle and straw-colored. The seed heads break apart at a touch and the awns travel one direction only — into socks, cuffs, and dogs' ears and paws. The grass has stopped being food and become armament." },
    { tc: "鹿子初生", en: "Fawns are born",
      desc: "Spotted fawns, usually two, unsteady for the first several days. The doe leaves them folded in tall grass while she feeds elsewhere and returns only to nurse. A fawn lying alone in the grass has not been abandoned — it is exactly where it is supposed to be." },
    { tc: "蜩始鳴", en: "The cicada begins to call",
      desc: "The first cicadas: scattered dry buzzing from high in the oaks, one insect at a time, stopping as abruptly as it starts. Easy to mistake for a distant machine. Within a month it will be constant, and it will not let up until the end of August." },
    /* 芒種 */
    { tc: "燕雛滿簷", en: "The eaves are full of swallow chicks",
      desc: "The mud nests are full. Gaping heads crowd every opening, adults shuttle in and out without pause from first light to dusk, and the noise under a roofline runs all day. The ground beneath goes messy, which is the standing cost of the arrangement." },
    { tc: "乳草乃華", en: "And so the milkweed flowers",
      desc: "Narrowleaf milkweed opens dull pink-white umbels on upright stems in dry open ground. Monarchs come to it to lay, and within a few weeks the striped caterpillars are working the undersides of the leaves, eating the plant down to stems. It is the only thing they will eat." },
    { tc: "溪斷成潭", en: "The creek breaks into pools",
      desc: "Continuous flow fails. The creek becomes a chain of disconnected pools with dry stone between them, each pool warmer, greener and more crowded than the last. The sound goes first, then the connection. From this point the water only goes down." },
    /* 夏至 */
    { tc: "草化黃金", en: "The grasses turn to gold",
      desc: "Over roughly ten days the annual grasses finish and the whole valley changes color. It does not look like drying. It looks like the hills becoming a different substance — gold, dry-edged, uniform from ridge to floor. This is the visual signature of the place, and it holds until November." },
    { tc: "禿鷲乘熱", en: "The vulture rides the risen heat",
      desc: "Turkey vultures ride thermals above the gold hillsides, wings held in a shallow V, rocking side to side, almost never beating. They appear once the ground has heated and are absent when it hasn't. The heat itself is invisible; the birds are how you see it." },
    { tc: "蜩鳴日中", en: "The cicadas call at midday",
      desc: "Full cicada chorus, loudest in the hottest hour and pausing when a cloud crosses. The sound comes from everywhere and from no locatable point. It is effectively the sound of the temperature — you can estimate the afternoon by it without looking at anything." },
    /* 小暑 */
    { tc: "七葉先凋", en: "The buckeye withers first, alone",
      desc: "Buckeye leaves go brown and crisp and drop in July, sometimes with the flower spikes still on the tree and everything around it fully green. The tree is neither dying nor stressed. It finished early, and it stands bare through the rest of the summer." },
    { tc: "地鼠夏蟄", en: "The ground squirrels take their summer sleep",
      desc: "Ground squirrel activity falls off sharply. Burrow mouths stay open but the sentries are gone from the fence posts and culvert banks, and the adults go below and remain there through the worst of the heat. Here the retreat underground is from the sun, not the cold." },
    { tc: "莓樹褪皮", en: "The madrone sheds its skin",
      desc: "Madrone peels its outer bark in thin curling red-brown strips, leaving smooth cool green-tan underneath. The curls collect around the base of the trunk. The tree looks flayed and is in excellent condition — the fresh surface is the entire point of the operation." },
    /* 大暑 */
    { tc: "孔雀解翎", en: "The peacock sheds his train",
      desc: "The train comes out over a few weeks once breeding is done. The birds go abruptly plain, shorter and more awkward, and eye-feathers turn up everywhere — on paths, in flowerbeds, beneath roosting trees. The most conspicuous thing about the animal is simply set down and left behind." },
    { tc: "星薊獨榮", en: "The star-thistle alone flourishes",
      desc: "Yellow star-thistle stands in full spiny bloom across dead gold ground: rigid, grey-green, armed at every node, and the only thing flowering for acres in any direction. It is invasive and rightly disliked, and for six weeks it is also the only thing feeding bees." },
    { tc: "橡子乃見", en: "And so the acorns become visible",
      desc: "Green acorns appear in the oaks, small and hard and tight in their cups. They have been forming since the catkins released in spring; only now are they large enough to pick out from underneath the tree. From here they swell quickly." },
    /* 立秋 */
    { tc: "涼風夜至", en: "The cool wind comes by night",
      desc: "Ninety-five degrees at four in the afternoon and low fifties before dawn. The day has not turned at all and the night has turned completely. Sleeping takes a blanket for the first time since spring, and the air at first light has a distinct edge in it." },
    { tc: "白露降", en: "White dew descends",
      desc: "Dew is back on the grass at first light after two rainless months. It arrives suddenly, on the first morning still and clear enough for the ground to radiate its heat away, and it soaks shoes. The air has begun holding water again, though no rain has fallen." },
    { tc: "膠菊乃香", en: "And so the tarweed gives off its scent",
      desc: "Tarweed opens small yellow daisies in the dead grass and the whole field turns resinous — a sharp sticky smell, closer to turpentine or pitch than to any flower. It transfers to skin and clothing on contact and stays there. It is the one strong scent of the dry season." },
    /* 處暑 */
    { tc: "溪涸見石", en: "The creek dries, showing its stones",
      desc: "The pools are gone and the bed is bare rock, the stones bleached, the last damp gravel drying at the deepest bends. Where water ran in February you can now walk a mile of channel without wetting a boot. This is the low point of the water year." },
    { tc: "胡蜂爭食", en: "Yellowjackets contend for food",
      desc: "Colonies are at maximum and their natural forage is gone, so they come to whatever is being eaten outdoors and get bold about it. They work meat, sugar and the mouths of open drink containers with equal interest, and they do not leave when waved at." },
    { tc: "蜩聲忽止", en: "The cicadas abruptly stop",
      desc: "The cicadas stop. Not a fade — a few days of thinning, then an ending. What comes back is the sound underneath: wind moving through oak leaves, which has been there all summer and completely inaudible. The valley stays quiet now until the frogs start in January." },
    /* 白露 */
    { tc: "蛛網懸露", en: "Webs hang weighted with dew",
      desc: "Orb-weaver webs span paths, gateways and the gaps between fence posts, invisible until dew loads the strands. Then they are everywhere at once, silver and geometric in the first light — and you have already walked face-first into one on the way out the door." },
    { tc: "玄鳥歸", en: "The swallows go home",
      desc: "The swallows gather on wires for a few days, in numbers, restless and vocal. Then one morning the eaves are silent and the sky above the field is empty of them. They will be gone until the equinox. The mud nests stay exactly where they are." },
    { tc: "松鼠藏橡", en: "The squirrel hides acorns",
      desc: "Gray squirrels carry single acorns off and bury them one at a time, in a hundred separate places, pressing each one down with the nose. They will not find most of them again. This is how oak trees travel, and it only works because the squirrel forgets." },
    /* 秋分 */
    { tc: "橡實落地", en: "Acorns fall",
      desc: "Acorns come down hard on roofs, cars and paths, and roll. At night the sound is startling the first few times. Deer, jays, woodpeckers, squirrels and turkeys converge beneath the productive trees, and the competition is open, noisy and continuous." },
    { tc: "地蛛出穴", en: "The ground-spider leaves its burrow",
      desc: "Male tarantulas walk the open hills at dusk after the first rains, searching for burrows with females in them. They are large, slow, dark and entirely harmless. They are also on a one-way journey: having abandoned their own burrows for good, they will not survive the winter." },
    { tc: "啄木貯倉", en: "The woodpecker stocks his granary",
      desc: "Acorn woodpeckers hammer acorns one per hole into a granary snag drilled with thousands of holes over generations. The whole clan works it, defends it and argues about it loudly all day. An established granary tree is a communal bank and is treated exactly like one." },
    /* 寒露 */
    { tc: "初雨土香", en: "First rain, and the earth's scent",
      desc: "The smell that rises off dry ground in the first ten minutes of the first real rain of the season. After five rainless months it is overwhelming and very specific — dust, oil, mineral, and something almost sweet underneath. People stop what they are doing and mention it to each other." },
    { tc: "毒漆乃丹", en: "And so poison oak turns cinnabar",
      desc: "Poison oak turns scarlet and runs up the hillsides and into the lower oaks in sheets of red. It is the autumn color of this landscape, more vivid than anything else on offer, and it belongs entirely to the one plant you cannot walk into. The oil stays fully active in the fallen leaves." },
    { tc: "冠雀來賓", en: "The crowned sparrows come as guests",
      desc: "Golden-crowned and white-crowned sparrows arrive to winter, appearing in brush piles and hedgerows that held none the week before. The golden-crowned sings a thin descending three-note whistle, plaintive and unmistakable, and it will keep singing it all winter long." },
    /* 霜降 */
    { tc: "朱蝽附壁", en: "The vermilion bugs cling to the wall",
      desc: "Boxelder bugs — black with red lines, frequently coupled end to end and walking about in that position — mass on warm south and west-facing walls through the afternoon, dozens to hundreds at a time. They are gathering to overwinter, they will find the way indoors, and they are harmless." },
    { tc: "腐草生菌", en: "Rotted grass gives birth to mushrooms",
      desc: "The first flush of mushrooms comes up straight out of the dead thatch within days of the October rain — inky caps, small brown domes, whole rings appearing on lawns overnight. Grass that has been dead since June is suddenly producing the most conspicuous growth in the landscape." },
    { tc: "鹿始交", en: "The deer begin to mate",
      desc: "The rut. Bucks carry swollen necks and full antlers, follow does at a walk for hours, and cross roads at bad hours with none of their usual caution. Deer-vehicle collisions peak now. The antlers they are fighting with will be lying on the ground by February." },
    /* 立冬 */
    { tc: "秋草反青", en: "The autumn grasses turn green again",
      desc: "About two weeks after the first soaking rain, new grass comes up through the dead gold and the valley reverses color — green from below, gold on top, then green throughout. The growing season is beginning here, at the point in the year when the light is nearly at its shortest." },
    { tc: "白橡葉落", en: "The valley oak drops its leaves",
      desc: "The valley oaks let go, and the ground beneath them is turning green at the same time. Yellow-brown leaves come down over a fortnight into new grass. The two events are simultaneous and worth stopping for: the canopy shutting down as the floor opens up." },
    { tc: "蠑螈赴水", en: "The newts go down to the water",
      desc: "On rainy nights newts walk overland and downhill toward their breeding pools, slowly, in numbers, and completely undeterred. They are orange-bellied and unhurried, and they cross roads. Drive at walking pace on wet nights anywhere near standing water, or don't drive." },
    /* 小雪 */
    { tc: "熊果始華", en: "Manzanita begins to flower",
      desc: "Manzanita opens small waxy urns, white to pink, hanging in clusters against smooth red peeling bark. It starts flowering as everything else finishes and keeps going for three months. Hummingbirds and early bees are working it from the first day it opens." },
    { tc: "石楠子丹", en: "Toyon berries redden",
      desc: "Toyon carries heavy clusters of scarlet berries against dark evergreen leaves, on hillsides and along canyon edges. It is why the shrub is called Christmas berry. The fruit holds through the cold and will be stripped bare in a day once the winter flocks find it." },
    { tc: "連雀降實", en: "The waxwings descend on the fruit",
      desc: "A flock of cedar waxwings arrives without warning, silent except for a high thin trilling, strips a toyon or a pyracantha in a single day, and is gone. Sleek, crested, fawn-colored, black-masked, with small red wax droplets on the wingtips. They look almost manufactured." },
    /* 大雪 */
    { tc: "谷霧不開", en: "The valley fog does not lift",
      desc: "Fog settles on the valley floor and stays, sometimes for days. Visibility drops to a few hundred feet, the cold is penetrating and completely still, and every sound is muffled. Climb a few hundred feet up the slope and you come out into full sun with the fog lying white beneath you." },
    { tc: "菌乃遍林", en: "And so mushrooms fill the woods",
      desc: "Peak fungal season. Boletes, russulas, coral fungi, brackets on downed logs, and a great many things with no obvious name pushing up through duff and moss. The forest floor is doing more visible work now than at any point in the warmth of spring." },
    { tc: "蜂鳥墜空", en: "The hummingbird falls out of the sky",
      desc: "The male hummingbird climbs a hundred feet or more, hangs a moment, and drops nearly vertically, pulling out just above the ground with one loud explosive squeak produced by his tail feathers. He does it again, and again, oriented to the sun — in the middle of winter." },
    /* 冬至 */
    { tc: "蜂鳥營巢", en: "The hummingbird builds her nest",
      desc: "The female builds a nest the size of a walnut from plant down, bound with spider silk and shingled outside with lichen so that it vanishes against the branch. The silk lets it stretch as the young grow. She is doing this at the shortest days of the year, timed to the manzanita." },
    { tc: "白橡枝空", en: "The valley oak's branches stand empty",
      desc: "The valley oaks stand completely bare, and the architecture of the crown is legible for the only weeks in the year — every fork, taper and turn visible from trunk to outermost twig. Against fog or a low sun the whole tree reads as a single drawn line." },
    { tc: "蚯蚓出", en: "Earthworms come out",
      desc: "Earthworms come up through saturated ground onto paths, stone and pavement after rain, sometimes in numbers, often stranded by morning. The soil is at its most alive now. Underfoot, the wet season is doing what five months of summer heat made impossible." },
    /* 小寒 */
    { tc: "鴞乃相答", en: "And so the owls answer one another",
      desc: "Great horned owls call and answer at dusk and before first light — the male lower and slower, the female higher and more urgent, alternating across a distance. They are pairing up to nest in February, which makes this the earliest courtship in the valley." },
    { tc: "霜聚下田", en: "Frost gathers in the low fields",
      desc: "Cold air drains downhill overnight, so frost whitens the valley floor and the low fields while the slopes above them stay clear. The frost line has a visible upper edge. It burns off within an hour of the sun reaching it and returns the next night in exactly the same place." },
    { tc: "蛙始鳴", en: "The frogs begin to call",
      desc: "A few frog voices from wet ground and the edges of standing water — tentative, intermittent, cutting out when approached. One night there is a single caller; a week later there are ten. This is the beginning of the sound that will fill the whole valley by February." },
    /* 大寒 */
    { tc: "熊果花盛", en: "Manzanita in full flower",
      desc: "Manzanita at full bloom: entire shrubs hung with pink-white urns, audibly working with bees, hummingbirds moving through constantly. It is the largest concentration of flower and nectar anywhere in the landscape, and it happens in the coldest weeks of the year." },
    { tc: "丹蒿出土", en: "A scarlet spike breaks the leaf litter",
      desc: "Indian warrior pushes a dense crimson-purple flower head straight up out of oak duff, with fern-like reddish leaves low around its base. It appears without warning in bare leaf litter beneath oaks and looks like nothing else growing here — closer to a coral than to a flower." },
    { tc: "雙鷹盤空", en: "A pair of hawks turns in the sky",
      desc: "Red-tailed hawks in courtship flight: two birds circling together on a rising column of air, going higher and higher, calling. They may stoop at one another, or lock talons and tumble several hundred feet before separating. Watch for it on clear afternoons through late winter." },
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
    { name: "Aries", glyph: "♈︎", term: "春分",
      sun: { k: "Initiate",
            t: "Direct assertion. Beginning without preamble, acting before the picture is complete, meeting things head-on. Energy that is fresh, blunt and impatient with deliberation." },
      merc: { k: "Decide",
            t: "Fast, direct, and unhedged. Conclusions arrive early and get stated plainly. Good for cutting through; poor at holding a question open. Argument preferred to deliberation." },
      moon: { k: "Quicken",
            t: "Impatient and forward-leaning. Reactions are fast and short-lived; irritation flares and passes. Favors starting, acting alone, physical exertion. Poor for waiting." } },
    { name: "Taurus", glyph: "♉︎", term: "穀雨",
      sun: { k: "Consolidate",
            t: "Settling into what is already begun. Building substance, working at a steady unhurried pace, valuing what can be touched, tasted and kept. Resistance to being moved." },
      merc: { k: "Concretize",
            t: "Slow, literal and retentive. Wants the thing itself rather than a description of it. Reaches conclusions late and revises them reluctantly, but what is learned stays learned." },
      moon: { k: "Settle",
            t: "Slow, comfortable and physical. Appetite for food, warmth, rest and continuity. Favors steady work and anything sensory. Resists interruption and change of plan. The Moon's exaltation." } },
    { name: "Gemini", glyph: "♊︎", term: "小滿",
      sun: { k: "Circulate",
            t: "Variety, exchange, and moving between things. Attention drawn outward in several directions at once; a season of gathering rather than concluding." },
      merc: { k: "Exchange",
            t: "Quick, verbal, comparative and endlessly curious. Talks to think rather than thinking before talking. Excellent range, restless depth. One of Mercury's own signs." },
      moon: { k: "Scatter",
            t: "Light, talkative and easily diverted. Attention moves; several things get started. Favors errands, correspondence, conversation and reading. Poor for sustained single-tasking." } },
    { name: "Cancer", glyph: "♋︎", term: "夏至",
      sun: { k: "Shelter",
            t: "Turning toward what is one's own — family, house, origin, the people already inside the circle. Protective, retentive, and slow to open to what is unfamiliar." },
      merc: { k: "Recall",
            t: "Associative and memory-led. Ideas arrive attached to the circumstances in which they were first met, and reasoning runs through feeling rather than around it. Indirect, allusive, personal." },
      moon: { k: "Withdraw",
            t: "Inward, tender and domestic. Feeling runs close to the surface and memory is near at hand. Favors home, cooking, care, familiar company. The Moon's own sign — its strongest." } },
    { name: "Leo", glyph: "♌︎", term: "大暑",
      sun: { k: "Radiate",
            t: "Showing rather than withholding. Warmth, generosity, performance, play, and the wish to be seen doing the thing well. The Sun's own sign, and its most unguarded." },
      merc: { k: "Declare",
            t: "Expressive, confident and performed. Prefers the strong formulation to the careful one and the vivid example to the representative one. Persuasive; disinclined to be corrected." },
      moon: { k: "Warm",
            t: "Generous, expressive and sociable, with an appetite for enjoyment and play. Favors performance, hospitality and creative work done in company. Pride is nearer the surface than usual." } },
    { name: "Virgo", glyph: "♍︎", term: "處暑",
      sun: { k: "Refine",
            t: "Improving what exists. Attention to craft, detail, method and usefulness; separating good work from adequate work. Service rendered through competence." },
      merc: { k: "Analyze",
            t: "Precise, discriminating and procedural. Sorts, classifies, edits, checks and finds the error. Mercury's own sign and its exaltation — the clearest technical function available to it." },
      moon: { k: "Tidy",
            t: "Practical and detail-oriented, with a low tolerance for disorder. Favors cleaning, sorting, editing, repair, and health routines. The tendency to find fault runs high, including with oneself." } },
    { name: "Libra", glyph: "♎︎", term: "秋分",
      sun: { k: "Balance",
            t: "Weighing, relating, and adjusting toward proportion. Nothing considered in isolation — everything measured against its counterpart. Diplomatic, deferring, reluctant to force." },
      merc: { k: "Weigh",
            t: "Comparative and even-handed, holding two positions at once and reluctant to collapse them. Articulate about relationship and proportion. The cost is difficulty concluding." },
      moon: { k: "Accommodate",
            t: "Socially attuned, agreeable, and reluctant to disturb the peace. Favors company, aesthetics, negotiation and reconciliation. Decisions come hard; the wish to please can outrun judgment." } },
    { name: "Scorpio", glyph: "♏︎", term: "霜降",
      sun: { k: "Concentrate",
            t: "Intensity and depth over breadth. Interest in what lies beneath the surface, in what is withheld, and in whatever survives being taken apart. Sustained, private, uncompromising." },
      merc: { k: "Probe",
            t: "Investigative and suspicious of surfaces. Interested in motive, omission and what a statement is avoiding. Retentive, strategic, and disinclined to say everything it knows." },
      moon: { k: "Deepen",
            t: "Private, intense and unwilling to be superficial. Feeling runs deep and stays hidden. Favors solitary concentration, research and anything requiring nerve. Traditionally the Moon's fall." } },
    { name: "Sagittarius", glyph: "♐︎", term: "小雪",
      sun: { k: "Range",
            t: "Reaching past the known — travel, teaching, doctrine, the far end of the question. Interested in meaning and pattern more than in accuracy of detail. Expansive and frank." },
      merc: { k: "Interpret",
            t: "Synthesizing and large-scale. Generalizes readily, reaches for the principle behind the instance, and speaks bluntly. Strong on meaning, careless with particulars." },
      moon: { k: "Roam",
            t: "Restless, cheerful and appetitive for space. Confinement chafes and detail bores. Favors movement, outdoors, study for its own sake and plain speech. Prone to overcommitting." } },
    { name: "Capricorn", glyph: "♑︎", term: "冬至",
      sun: { k: "Build",
            t: "Structure, endurance, and the long horizon. Working within limits rather than against them, and accepting cost for the sake of what lasts. Sober, disciplined, unsentimental." },
      merc: { k: "Organize",
            t: "Structural, sequential and pragmatic. Builds arguments that hold weight, plans in order, and discards what cannot be used. Serious, economical, sometimes narrow." },
      moon: { k: "Contain",
            t: "Sober, reserved and duty-minded. Feeling is held rather than shown, and the mood runs cool. Favors discipline, administration and unglamorous work carried through to the end." } },
    { name: "Aquarius", glyph: "♒︎", term: "大寒",
      sun: { k: "Differentiate",
            t: "Standing apart in order to see clearly. Principle over custom, the group over the individual, and the reform of what everyone else takes as given. Cool and independent." },
      merc: { k: "Abstract",
            t: "Systemic and pattern-seeking, willing to hold an unpopular position on principle. Thinks in models and exceptions. Detached from the particular case, sometimes to its cost." },
      moon: { k: "Detach",
            t: "Cool, observant and set slightly apart from the situation. Favors abstraction, group settings, and seeing the pattern rather than feeling the instance. Intimacy feels effortful." } },
    { name: "Pisces", glyph: "♓︎", term: "雨水",
      sun: { k: "Dissolve",
            t: "Boundaries thinning — between self and other, waking and dreaming, this thing and that. Compassionate, impressionable, imaginative, and hard to pin to a single position." },
      merc: { k: "Associate",
            t: "Non-linear, symbolic and impressionistic. Reasons by image, resonance and analogy rather than by step. Poor at precision, unmatched at connections nobody was looking for." },
      moon: { k: "Absorb",
            t: "Porous, dreamy and receptive, picking up whatever is in the room. Boundaries are thin and energy is uneven. Favors rest, music, imagination, contemplation. Poor for hard decisions." } },
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

  /* The four phases BETWEEN the quarters, for the Season tab's day-by-day reading. Index matches
     Almanac elongation quadrant: 0 waxing crescent, 1 waxing gibbous, 2 waning gibbous,
     3 waning crescent. Same 16x16 currentColor construction as MOON: an outer limb arc plus a
     terminator ellipse that bulges toward the lit side for a crescent and away for a gibbous. */
  var MOON_MID = [
    { key: 'waxing_crescent', en: 'Waxing Crescent', tc: '蛾眉月',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 1 8 14.5A3.2 6.5 0 0 1 8 1.5Z" fill="currentColor"/></svg>' },
    { key: 'waxing_gibbous', en: 'Waxing Gibbous', tc: '盈凸月',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 1 8 14.5A3.2 6.5 0 0 0 8 1.5Z" fill="currentColor"/></svg>' },
    { key: 'waning_gibbous', en: 'Waning Gibbous', tc: '虧凸月',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 0 8 14.5A3.2 6.5 0 0 1 8 1.5Z" fill="currentColor"/></svg>' },
    { key: 'waning_crescent', en: 'Waning Crescent', tc: '殘月',
      svg: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">' +
           '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
           '<path d="M8 1.5A6.5 6.5 0 0 0 8 14.5A3.2 6.5 0 0 0 8 1.5Z" fill="currentColor"/></svg>' }
  ];


  /* The three western tracks, for the tooltip on each lane's sticky glyph. `what` says what the
     layer measures, `motion` how fast it moves, `note` the one fact worth knowing about it.
     Element and modality are NOT stored per sign: they are recoverable from the index alone,
     element = i % 4 and modality = i % 3, because 4 and 3 are coprime and so every pairing occurs
     exactly once across the twelve. See almZodGrid() in index.html. */
  var ELEMENTS = [
    { name: 'Fire',  gloss: 'animating' }, { name: 'Earth', gloss: 'substantiating' },
    { name: 'Air',   gloss: 'relating'  }, { name: 'Water', gloss: 'absorbing' }
  ];
  var MODES = [
    { name: 'Cardinal', gloss: 'starts' }, { name: 'Fixed', gloss: 'holds' },
    { name: 'Mutable',  gloss: 'adapts' }
  ];

  var PLANETS = {
    sun: { glyph: '\u2609\uFE0E', name: 'Sun', of: "the Sun's sign",
      what: 'The roughly thirty-day frame the whole month sits inside — traditionally the mode of vitality and self-showing, and the quality of the period as a whole.',
      motion: 'About 1\u00B0 a day: one sign a month, the full circuit in 365.24 days.',
      note: 'This layer and the solar terms are the same measurement read two ways. Sign boundaries fall at exact multiples of 30\u00B0 solar longitude, which is precisely where the twelve \u4E2D\u6C23 fall, so one sign is always two solar terms and six \u5019 exactly.' },
    merc: { glyph: '\u263F\uFE0E', name: 'Mercury', of: "Mercury's sign",
      what: 'How thinking and speaking are being done, independent of what is being thought about.',
      motion: 'Variable, 0 to about 2\u00B0 a day, and backwards for three weeks at a time: 14 to 60 days in a sign.',
      note: 'Mercury never strays more than about 28\u00B0 from the Sun. A sign is 30\u00B0, so it is always in the Sun\u2019s sign or one immediately beside it \u2014 if this almanac ever shows it three signs away, the ephemeris is wrong.' },
    moon: { glyph: '\u263D\uFE0E', name: 'Moon', of: "the Moon's sign",
      what: 'The ambient tenor of a short stretch of days — what the atmosphere favours, what feels easy and what feels effortful — rather than a description of character.',
      motion: 'About 13\u00B0 a day: a sign in 2 days and 5 hours, the whole zodiac in 27.32 days.',
      note: 'The Moon turns over about thirteen times for each turn of the Sun layer, and about once for every two and a half \u5019.' }
  };

  /* Traditional dignities, by sign index. A planet is held to work readily in the signs it rules
     or is exalted in, and against the grain in its detriment or fall. Indices into ZODIAC. */
  var DIGNITY = {
    sun:  { rules: [4],    exalt: 0,  detriment: [10],    fall: 6  },
    merc: { rules: [2, 5], exalt: 5,  detriment: [8, 11], fall: 11 },
    moon: { rules: [3],    exalt: 1,  detriment: [9],     fall: 7  }
  };

  /* Mercury retrograde, for the tooltip on the \u211E modifier. The astronomy is exact; the
     reading is a traditional attribution, and `caveat` says so rather than letting the two blur. */
  var RETRO = {
    title: 'Mercury retrograde',
    what: 'Mercury orbits the Sun in 88 days to Earth\u2019s 365, so it periodically overtakes us on the inside. Our changing line of sight makes it appear to slow, stop, run westward against the stars for about three weeks, stop again, and resume. Nothing about Mercury\u2019s own motion changes \u2014 it is the same effect as a faster car appearing to slide backwards as it passes you.',
    when: 'Three times in most years, occasionally four. The synodic period is about 116 days, so retrogrades fall roughly every four months and occupy a little under a fifth of the year.',
    element: 'Successive retrogrades are about 116 days apart, in which the Sun advances roughly 114\u00B0 \u2014 close enough to a third of the zodiac that they land in signs of the same element for a year or two at a stretch before the series drifts on.',
    stations: 'The two standstills: station retrograde at the start, station direct at the end. Mercury\u2019s daily motion falls to zero on either side, so its position barely changes for several days.',
    shadow: 'The stretch of zodiac Mercury covers three times \u2014 forward, back, forward again. Roughly two weeks of shadow on each side of the retrograde proper.',
    tradition: 'Mercury governs speech, writing, records, transactions and short journeys, so the tradition reads its retrograde as a period for the re- prefix: review, revise, repair, revisit, reconsider. Prefer finishing to starting, read what you sign, confirm arrangements twice, and expect returns \u2014 of people, objects, and questions thought settled.',
    caveat: 'The astronomy above is measurable and exact. The interpretation is a traditional symbolic attribution, not a demonstrated effect; controlled studies have not found the disruptions the tradition describes. A real phenomenon that has been assigned a meaning \u2014 which is a fair description of this whole layer.'
  };

  root.AlmanacData = { TERMS: TERMS, HOU: HOU, HOU_UKIAH: HOU_UKIAH, ZODIAC: ZODIAC, MOON: MOON, MOON_MID: MOON_MID,
                       BRANCHES: BRANCHES, SEASONS: SEASONS, TERM_LINKS: TERM_LINKS,
                       ELEMENTS: ELEMENTS, MODES: MODES, PLANETS: PLANETS,
                       DIGNITY: DIGNITY, RETRO: RETRO };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.AlmanacData;
