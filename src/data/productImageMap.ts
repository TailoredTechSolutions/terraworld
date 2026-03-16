import { PRODUCT_IMAGES } from "@/lib/siteImages";

const P = PRODUCT_IMAGES;

// Keyword-based image fallback: MOST SPECIFIC matches first, then general
const imageKeywords: [string[], string][] = [
  // === VEGETABLES (specific first) ===
  [["chinese cabbage", "wombok", "napa cabbage"], P.chineseCabbage],
  [["baguio pechay", "pechay baguio"], P.pechay],
  [["korean radish"], P.koreanRadish],
  [["baguio bean", "string bean", "highland bean", "sitaw"], P.stringBeans],
  [["organic lettuce", "lettuce mix", "salad green", "mixed salad"], P.lettuce],
  [["organic sayote"], P.sayote],
  [["organic broccoli"], P.broccoli],
  [["organic tomato"], P.tomatoes],
  [["organic cauliflower"], P.cauliflower],
  [["organic radish"], P.radish],
  [["baguio cabbage", "repolyo"], P.cabbage],
  [["fresh leek"], P.leeks],
  [["fresh celery"], P.celery],
  [["itogon vegetable"], P.cabbage],
  [["sweet potato", "camote"], P.sweetPotato],
  [["red bell pepper", "bell pepper red"], P.bellPepperRed],
  [["bell pepper"], P.bellPeppers],
  [["eggplant", "talong"], P.eggplant],
  [["ginger", "luya"], P.ginger],
  [["kangkong", "water spinach"], P.kangkong],
  [["spinach"], P.spinach],
  [["kale"], P.kale],
  [["mustard green"], P.mustardGreens],
  [["okra"], P.okra],
  [["ampalaya", "bitter melon", "bitter gourd"], P.ampalaya],
  [["green bean"], P.greenBeans],
  [["red chili", "chili red", "siling labuyo"], P.chiliRed],
  [["green chili", "chili green", "siling haba"], P.chiliGreen],
  [["chili flake"], P.chiliFlakes],
  [["chili", "sili"], P.chiliRed],
  [["red onion", "onion red", "sibuyas pula"], P.onionRed],
  [["white onion", "onion white", "sibuyas puti"], P.onionWhite],
  [["spring onion", "green onion", "scallion"], P.springOnion],
  [["onion", "sibuyas"], P.onionRed],
  [["garlic", "bawang"], P.garlic],
  [["squash", "kalabasa"], P.squash],
  [["cucumber", "pipino"], P.cucumber],
  [["corn", "mais"], P.corn],
  // General vegetables
  [["lettuce"], P.lettuce],
  [["carrot"], P.carrots],
  [["cabbage"], P.cabbage],
  [["broccoli"], P.broccoli],
  [["celery"], P.celery],
  [["potato"], P.potatoes],
  [["radish", "labanos"], P.radish],
  [["cauliflower"], P.cauliflower],
  [["sayote", "chayote"], P.sayote],
  [["leek"], P.leeks],
  [["pechay", "bok choy"], P.pechay],
  [["tomato"], P.tomatoes],
  [["bean"], P.baguioBeans],

  // === FRUITS (specific first) ===
  [["benguet strawberr", "la trinidad strawberr"], P.strawberries],
  [["strawberry jam"], P.ubeJam],
  [["dried strawberr"], P.strawberries],
  [["strawberry seedling", "berry seedling"], P.strawberries],
  [["strawberr"], P.strawberries],
  [["blueberr"], P.blueberries],
  [["raspberr"], P.strawberries],
  [["mixed berry", "berry pack"], P.strawberries],
  [["passion fruit", "passionfruit"], P.passionFruit],
  [["table grape", "fresh grape", "grape"], P.grapes],
  [["grape jam"], P.ubeJam],
  [["apple"], P.guava],
  [["mango"], P.mangoes],
  [["papaya"], P.papayas],
  [["banana"], P.bananas],
  [["calamansi"], P.calamansi],
  [["guava"], P.guava],
  [["watermelon"], P.watermelon],
  [["pineapple"], P.pineapple],
  [["dragon fruit"], P.dragonFruit],
  [["avocado"], P.avocado],
  [["coconut oil"], P.coconutOil],
  [["coconut"], P.coconut],
  [["orange", "dalandan"], P.orange],
  [["lemon", "dayap"], P.lemon],
  [["melon", "cantaloupe"], P.melon],

  // === DAIRY & EGGS (specific first) ===
  [["salted egg", "salted duck", "itlog na maalat"], P.saltedEggs],
  [["duck egg"], P.eggs],
  [["quail egg"], P.eggs],
  [["native chicken egg"], P.freshEggs],
  [["native chicken", "free range chicken", "free-range chicken", "organic chicken"], P.chicken],
  [["chicken"], P.chicken],
  [["free-range egg", "free range egg"], P.freshEggs],
  [["organic brown egg"], P.eggs],
  [["organic duck egg"], P.eggs],
  [["organic egg"], P.freshEggs],
  [["itogon.*egg"], P.freshEggs],
  [["farm fresh egg", "fresh farm egg"], P.freshEggs],
  [["egg tray", "eggs (tray)"], P.eggs],
  [["egg", "itlog"], P.freshEggs],
  [["goat milk", "goat's milk"], P.goatMilk],
  [["carabao milk"], P.carabaoMilk],
  [["fresh milk"], P.freshMilk],
  [["yogurt"], P.carabaoMilk],
  [["kesong puti", "white cheese", "organic kesong"], P.kesongPuti],
  [["cheese"], P.kesongPuti],
  [["milk"], P.freshMilk],

  // === HERBS & SPICES ===
  [["basil"], P.basil],
  [["parsley"], P.parsley],
  [["cilantro", "wansoy", "coriander"], P.cilantro],
  [["black pepper", "peppercorn"], P.blackPepper],
  [["chili flake"], P.chiliFlakes],

  // === PANTRY (specific first) ===
  [["arabica coffee", "typica"], P.arabicaCoffee],
  [["bourbon coffee", "red bourbon"], P.arabicaCoffee],
  [["catimor coffee"], P.arabicaCoffee],
  [["ground coffee", "house blend"], P.arabicaCoffee],
  [["robusta coffee", "barako"], P.arabicaCoffee],
  [["tuba.*coffee", "tuba arabica"], P.arabicaCoffee],
  [["coffee"], P.arabicaCoffee],
  [["wild honey"], P.wildHoney],
  [["tublay honey"], P.honey],
  [["mountain.*honey", "bee honey"], P.honey],
  [["honey"], P.honey],
  [["lemongrass", "tanglad"], P.lemongrass],
  [["turmeric", "luyang dilaw"], P.turmeric],
  [["fresh herb", "herb bundle"], P.driedHerbs],
  [["tea blend", "herbal tea"], P.driedHerbs],
  [["muscovado"], P.muscovado],
  [["ube jam", "ube"], P.ubeJam],
  [["tablea", "cacao"], P.tablea],
  [["black rice", "tapol"], P.blackRice],
  [["white rice"], P.whiteRice],
  [["brown rice"], P.brownRice],
  [["rice"], P.whiteRice],
  [["corn grit"], P.cornGrits],
  [["mongo", "mung bean", "monggo"], P.mongoBeans],
  [["sea salt", "asin"], P.seaSalt],
  [["vinegar", "coconut vinegar", "suka"], P.vinegar],
  [["peanut butter"], P.peanutButter],
  [["peanut", "mani"], P.peanuts],
  [["coconut oil"], P.coconutOil],
  [["mushroom"], P.driedHerbs],
  [["dried mushroom"], P.driedHerbs],
  [["jam", "preserve"], P.ubeJam],
  [["dried"], P.driedHerbs],
];

export function getProductImage(name: string, dbImageUrl: string | null): string {
  // If DB has a valid external/public URL (not a /src/assets path), use it
  if (dbImageUrl && !dbImageUrl.startsWith("/src/") && !dbImageUrl.includes("drive.google.com")) {
    return dbImageUrl;
  }

  const lower = name.toLowerCase();
  for (const [keywords, img] of imageKeywords) {
    if (keywords.some(k => lower.includes(k))) {
      return img;
    }
  }

  // Default fallback
  return P.cabbage;
}
