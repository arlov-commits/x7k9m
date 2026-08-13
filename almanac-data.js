/* almanac-data.js — name tables for solar terms, 72 hou, tropical zodiac, moon phases.
 * v1.4 — data only, no logic. Traditional Chinese throughout.
 * v1.1 adds BRANCHES (地支 solar months) and SEASONS, both keyed off the solar-term index.
 * v1.2 adds TERM_LINKS — further reading per solar term, same index as TERMS.
 * v1.3 adds MOON_MID — the four phases between the quarters, for the Season tab.
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
      desc: "Blacktail bucks drop both antlers over a few days in Jan–Feb. You find them, or you notice the bucks are suddenly plain." },
    { tc: "蛙聲徹夜", en: "Frog voice all night through",
      desc: "Sierran treefrogs at full chorus in every ditch and seasonal pool. Loud enough to be a nuisance. The year's loudest sound." },
    { tc: "七葉先萌", en: "The buckeye leafs out first, alone",
      desc: "California buckeye breaks bud in February while every other deciduous tree is bare. Pale apple-green fingers on grey wood. It runs its whole year early and quits in July." },
    /* 雨水 */
    { tc: "川壑皆盈", en: "Every ravine runs full",
      desc: "Drainages that were dry stone in September are now audible from a distance. The valley has a background sound it lacks half the year." },
    { tc: "雁集水田", en: "The geese gather on the flooded field",
      desc: "Canada geese massed on standing water in winter pasture, along the river, at the lake. Noisy, conspicuous, and the first beat of the goose thread." },
    { tc: "貫葉菜秀", en: "The pierced-leaf herb comes into its own",
      desc: "Miner's lettuce: a round disc of a leaf with the stem running clean through the middle and a little spray of white flowers standing out of it. Shaded banks and the north side of oaks. Edible, mild, faintly sour." },
    /* 驚蟄 */
    { tc: "紫荊先花", en: "Redbud flowers ahead of its leaves",
      desc: "Western redbud goes magenta on completely bare wood. Ornament before substance — the same move as 桃始華, in the same slot." },
    { tc: "孔雀開屏", en: "The peacock raises his screen",
      desc: "Display season opens and runs to high summer: the fan, the rattling shiver of the quills, and the screaming at all hours." },
    { tc: "火雞曳翼", en: "The turkey drags his wings",
      desc: "Wild toms in strut — tail fanned, primaries scraping the dirt, breast puffed, gobbling. They walk stiff-legged in slow circles around indifferent hens." },
    /* 春分 */
    { tc: "玄鳥至", en: "The swallows arrive",
      desc: "Barn and cliff swallows back overhead after six months gone. Kept verbatim from the Chinese — it lands in the same slot here." },
    { tc: "燕銜泥", en: "The swallow carries mud",
      desc: "Birds working a puddle edge, flying beakfuls up under the eaves. The gourd nests go up in about a week." },
    { tc: "橡花垂穗", en: "The oaks hang out their tassels",
      desc: "Catkins in dangling strings, then pollen on every horizontal surface — windshields, water, laundry. A yellow film over everything." },
    /* 清明 */
    { tc: "藍眼遍草", en: "Blue eyes scattered through the grass",
      desc: "Blue-eyed grass: small six-petalled violet-blue stars on grassy slopes, each with a yellow centre. In numbers they look like the field is looking back." },
    { tc: "金燈懸莖", en: "Golden lanterns hang from the stem",
      desc: "Diogenes' lanterns (golden globe lily) — pendant, translucent yellow globes on thin stalks in oak shade. Lit from inside when the sun is behind them." },
    { tc: "蜂蝶咸出", en: "Bees and butterflies, all of them at once",
      desc: "咸 is the classical \"all together.\" There is a week where the insect load goes from noticeable to total." },
    /* 穀雨 */
    { tc: "雁引雛行", en: "The geese lead their goslings in a line",
      desc: "One parent in front, one behind, the yellow-grey goslings strung between them, the whole file crossing a road or lawn at its own pace, refusing to hurry. Everything stops for them." },
    { tc: "石龍拜日", en: "The rock-dragon bows to the sun",
      desc: "Male fence lizards on a rock or post doing rapid push-ups, flashing the blue belly at rivals. It looks exactly like bowing, which is why the entry exists." },
    { tc: "響尾出穴", en: "The rattle-tail leaves its hole",
      desc: "Rattlesnakes out and moving. Watch the trail edges and the warm stone. The classical 蚯蚓出 with the stakes raised." },
    /* 立夏 */
    { tc: "七葉舉燭", en: "The buckeye lifts its candles",
      desc: "Upright white flower spikes, eight inches or more, standing off the branches. Heavily scented, covered in insects. The tree's whole year is spent here." },
    { tc: "鶉引雛", en: "The quail leads her chicks",
      desc: "California quail broods — a dozen chicks the size of bumblebees rolling across a path in a loose ball, the cock on a fencepost keeping watch." },
    { tc: "蛙聲乃寂", en: "And so the frog voice falls silent",
      desc: "The pools go down and the chorus stops. An absence-候, closing the thread that opened in January. You notice it at night, about a week after it happens." },
    /* 小滿 */
    { tc: "芒穗乃堅", en: "And so the awned heads harden",
      desc: "Foxtails go from soft green to barbed and brittle. They start getting into socks, and into dogs' ears and paws. The grass has stopped being food and become armament." },
    { tc: "鹿子初生", en: "Fawns are born",
      desc: "Spotted blacktail fawns, wobbly, usually two. Left folded in tall grass while the doe feeds elsewhere." },
    { tc: "蜩始鳴", en: "The cicada begins to call",
      desc: "First scattered dry buzzing from the oaks — one insect, then a few. Opening the thread the frogs just closed." },
    /* 芒種 */
    { tc: "燕雛滿簷", en: "The eaves are full of swallow chicks",
      desc: "Gaping heads crowding the mouths of the mud nests, adults shuttling constantly, the noise under a roofline all day." },
    { tc: "乳草乃華", en: "And so the milkweed flowers",
      desc: "Narrowleaf milkweed opens its dull-pink umbels. Monarchs come to it to lay; look for the striped caterpillars a few weeks on." },
    { tc: "溪斷成潭", en: "The creek breaks into pools",
      desc: "Continuous flow fails and the creek becomes a chain of disconnected pools with dry stone between them. The background sound of 雨水 ends here." },
    /* 夏至 */
    { tc: "草化黃金", en: "The grasses turn to gold",
      desc: "Over roughly ten days the whole valley changes colour and the annual grasses finish. 化 is the transformation-verb from 腐草為螢, used deliberately: it does not look like drying, it looks like the hills becoming a different substance." },
    { tc: "禿鷲乘熱", en: "The vulture rides the risen heat",
      desc: "Turkey vultures on thermals over the gold hillsides, wings in a shallow V, rocking, not beating. Heat made visible by what it carries." },
    { tc: "蜩鳴日中", en: "The cicadas call at midday",
      desc: "Full chorus, loudest in the hottest hour, cutting out when a cloud crosses. The sound is functionally the sound of the temperature." },
    /* 小暑 */
    { tc: "七葉先凋", en: "The buckeye withers first, alone",
      desc: "Buckeye leaves go brown and crisp and drop in July, sometimes with the flowers still on the tree, while everything around it is green. It is not dying. It finished early." },
    { tc: "地鼠夏蟄", en: "The ground squirrels take their summer sleep",
      desc: "California ground squirrel activity drops off sharply in the heat; adults go below and stay there. China's 蟄蟲 sleep in winter. Here the retreat is from the sun." },
    { tc: "莓樹褪皮", en: "The madrone sheds its skin",
      desc: "Pacific madrone peels its outer bark in thin red curls, leaving smooth cool green underneath. The tree looks skinned and much better for it." },
    /* 大暑 */
    { tc: "孔雀解翎", en: "The peacock sheds his train",
      desc: "The whole train comes out over a few weeks after breeding ends. The birds go abruptly plain and awkward, and there are eye-feathers on the ground everywhere. Same verb as 鹿角解, six months on." },
    { tc: "星薊獨榮", en: "The star-thistle alone flourishes",
      desc: "Yellow star-thistle in full spiny bloom across dead gold ground, the only thing blooming and the only thing feeding bees. Hated, invasive, and honestly the sole flower of this phase." },
    { tc: "橡子乃見", en: "And so the acorns become visible",
      desc: "Green acorns appear in the oaks, small and hard in their cups. They have been forming since the catkins in March; now you can see them." },
    /* 立秋 */
    { tc: "涼風夜至", en: "The cool wind comes by night",
      desc: "Ninety-five degrees at four in the afternoon; low fifties before dawn. The classical 涼風至, corrected for the fact that here it only arrives after dark." },
    { tc: "白露降", en: "White dew descends",
      desc: "Dew back on the grass at first light after two rainless months. Kept verbatim and in its true Chinese slot — 立秋 二候, not the solar term named 白露." },
    { tc: "膠菊乃香", en: "And so the tarweed gives off its scent",
      desc: "Tarweed opens yellow daisies in the dead grass and the whole field smells resinous, sticky and strange — closer to turpentine than to flowers. It is on your hands if you walk through it. The only smell-候 in the calendar." },
    /* 處暑 */
    { tc: "溪涸見石", en: "The creek dries, showing its stones",
      desc: "The pools are gone and the bed is bare rock. The classical 水始涸, forty days early and much more absolute." },
    { tc: "胡蜂爭食", en: "Yellowjackets contend for food",
      desc: "Colonies at maximum, natural forage exhausted, so they come to whatever you are eating outdoors and get bold about it." },
    { tc: "蜩聲忽止", en: "The cicadas abruptly stop",
      desc: "Not a fade — an ending, over a few days. The absence-候 that closes the thread begun at 70. Suddenly you can hear the wind in the oaks again." },
    /* 白露 */
    { tc: "蛛網懸露", en: "Webs hang weighted with dew",
      desc: "Big orb-weaver webs across paths and between fence posts, invisible until the dew loads them, at which point they are everywhere and you have already walked into one." },
    { tc: "玄鳥歸", en: "The swallows go home",
      desc: "They gather on wires for a few days and then the eaves are silent. Closes the swallow thread that opened at 春分." },
    { tc: "松鼠藏橡", en: "The squirrel hides acorns",
      desc: "Western gray squirrels carrying single acorns off and burying them one at a time, in a hundred places, most of which they will not find again. That is how oaks travel." },
    /* 秋分 */
    { tc: "橡實落地", en: "Acorns fall",
      desc: "They come down hard on roofs and cars, and roll. Deer, jays, woodpeckers, squirrels and pigs all converge." },
    { tc: "地蛛出穴", en: "The ground-spider leaves its burrow",
      desc: "Male tarantulas walking the open hills at dusk after the first rain, looking for females, never returning. They are large, slow, harmless, and visibly on a one-way trip. China puts 蟄蟲坯戶 — hibernating insects seal their doors — in exactly this 5°." },
    { tc: "啄木貯倉", en: "The woodpecker stocks his granary",
      desc: "Acorn woodpeckers hammering acorns one-per-hole into a granary snag, thousands of holes, the whole clan working it and fighting over it loudly." },
    /* 寒露 */
    { tc: "初雨土香", en: "First rain, and the earth's scent",
      desc: "The smell that comes off dry ground in the first ten minutes of the first real rain. In a place with a five-month drought this is a genuine annual event, and people mention it to each other." },
    { tc: "毒漆乃丹", en: "And so poison oak turns cinnabar",
      desc: "This is Ukiah's autumn colour — scarlet running up the hillsides and into the oaks, and the most beautiful thing in the landscape is the one you must not touch." },
    { tc: "冠雀來賓", en: "The crowned sparrows come as guests",
      desc: "Golden-crowned and white-crowned sparrows arrive to winter. The golden-crowned sings a thin descending three-note whistle all season. 來賓 — the ones who come and stay, from 鴻雁來賓." },
    /* 霜降 */
    { tc: "朱蝽附壁", en: "The vermilion bugs cling to the wall",
      desc: "Boxelder bugs — black with red lines, often coupled tail-to-tail — massing on warm south and west walls before overwintering, then getting into the house. Your butt-to-butt bugs. Classical parallel: 蟋蟀居壁." },
    { tc: "腐草生菌", en: "Rotted grass gives birth to mushrooms",
      desc: "First flush after the October rain, straight out of the dead thatch. Transposed from 腐草為螢 — there are no fireflies here, so the rotted grass becomes fungus instead." },
    { tc: "鹿始交", en: "The deer begin to mate",
      desc: "Blacktail rut. Bucks with swollen necks, chasing does across roads at bad hours, careless in a way they are not the rest of the year. Antlers now, gone by 立春." },
    /* 立冬 */
    { tc: "秋草反青", en: "The autumn grasses turn green again",
      desc: "Roughly two weeks after the first soaking rain, new grass comes through the dead gold and the valley reverses colour. The growing season is starting. China puts 水始冰 here." },
    { tc: "白橡葉落", en: "The valley oak drops its leaves",
      desc: "The deciduous oaks let go while the ground underneath them turns green — the two events are simultaneous and worth standing still for." },
    { tc: "蠑螈赴水", en: "The newts go down to the water",
      desc: "On rainy nights newts walk overland, slowly and in numbers, downhill to their breeding pools. Orange-bellied, unhurried, and they cross roads." },
    /* 小雪 */
    { tc: "熊果始華", en: "Manzanita begins to flower",
      desc: "Small white-to-pink urns hanging in clusters on that red peeling wood, opening in November. The 桃始華 construction landing in late autumn." },
    { tc: "石楠子丹", en: "Toyon berries redden",
      desc: "Heavy clusters of scarlet berries on evergreen shrubs. The reason it is called Christmas berry, and the reason Hollywood is called that." },
    { tc: "連雀降實", en: "The waxwings descend on the fruit",
      desc: "A flock of cedar waxwings arrives without warning, silent except for a high thin trilling, strips a toyon in a day, and is gone. Sleek, crested, faintly unreal. Constructed after 戴勝降于桑." },
    /* 大雪 */
    { tc: "谷霧不開", en: "The valley fog does not lift",
      desc: "Tule fog settles on the valley floor and stays all day, sometimes for days. The hills above are in sun. It is cold, still and very quiet inside it." },
    { tc: "菌乃遍林", en: "And so mushrooms fill the woods",
      desc: "Peak fungal season. Boletes, russulas, coral fungi, things on logs. The forest floor is doing more visible work now than in June." },
    { tc: "蜂鳥墜空", en: "The hummingbird falls out of the sky",
      desc: "Male Anna's courtship dive: he climbs a hundred feet, drops nearly vertically, and pulls out with a loud explosive pop made by his tail feathers. In December." },
    /* 冬至 */
    { tc: "蜂鳥營巢", en: "The hummingbird builds her nest",
      desc: "A walnut-sized cup of plant down bound with spider silk and camouflaged with lichen, built at the winter solstice and timed to the manzanita bloom. China's 冬至 is 蚯蚓結, 麋角解 — the year's deepest stillness." },
    { tc: "白橡枝空", en: "The valley oak's branches stand empty",
      desc: "Full winter architecture, the whole crown legible for the only time all year. An absence-候, after 虹藏不見." },
    { tc: "蚯蚓出", en: "Earthworms come out",
      desc: "Up through the wet soil and out onto paths after rain. Same three characters as the Chinese 立夏 候 — here they belong to midwinter." },
    /* 小寒 */
    { tc: "鴞乃相答", en: "And so the owls answer one another",
      desc: "Great horned owls duetting at dusk and before dawn — the male lower, the female higher and faster, back and forth. They are pair-bonding to nest in February. Compare 鶡鴠不鳴, the bird that stops singing at China's 大雪." },
    { tc: "霜聚下田", en: "Frost gathers in the low fields",
      desc: "Cold air drains downhill overnight, so the valley floor is white and the slopes above it are not. The frost has a visible upper edge." },
    { tc: "蛙始鳴", en: "The frogs begin to call",
      desc: "A few voices from the wet ground, tentative and intermittent. By 立春 it will be the loudest thing in the valley." },
    /* 大寒 */
    { tc: "熊果花盛", en: "Manzanita in full flower",
      desc: "Whole shrubs hung with pink-white urns, audibly busy with bees and hummingbirds, in January." },
    { tc: "丹蒿出土", en: "A scarlet spike breaks the leaf litter",
      desc: "Indian warrior: a dense crimson-purple flower head pushing straight up out of the oak duff, with fern-like reddish leaves. It looks like it came up in the wrong century." },
    { tc: "雙鷹盤空", en: "A pair of hawks turns in the sky",
      desc: "Red-tailed hawks in courtship flight — two birds circling together, high, sometimes locking talons and tumbling, screaming. Leads directly into 立春." },
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

  root.AlmanacData = { TERMS: TERMS, HOU: HOU, HOU_UKIAH: HOU_UKIAH, ZODIAC: ZODIAC, MOON: MOON, MOON_MID: MOON_MID,
                       BRANCHES: BRANCHES, SEASONS: SEASONS, TERM_LINKS: TERM_LINKS };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.AlmanacData;
