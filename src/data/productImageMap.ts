import lettuceImg from "@/assets/products/lettuce.jpg";
import carrotsImg from "@/assets/products/carrots.jpg";
import strawberriesImg from "@/assets/products/strawberries.jpg";
import cabbageImg from "@/assets/products/cabbage.jpg";
import chineseCabbageImg from "@/assets/products/chinese-cabbage.jpg";
import baguioBeansImg from "@/assets/products/baguio-beans.jpg";
import broccoliImg from "@/assets/products/broccoli.jpg";
import celeryImg from "@/assets/products/celery.jpg";
import potatoesImg from "@/assets/products/potatoes.jpg";
import radishImg from "@/assets/products/radish.jpg";
import koreanRadishImg from "@/assets/products/korean-radish.jpg";
import cauliflowerImg from "@/assets/products/cauliflower.jpg";
import sayoteImg from "@/assets/products/sayote.jpg";
import leeksImg from "@/assets/products/leeks.jpg";
import pechayImg from "@/assets/products/pechay.jpg";
import mangoesImg from "@/assets/products/mangoes.jpg";
import papayasImg from "@/assets/products/papayas.jpg";
import bananasImg from "@/assets/products/bananas.jpg";
import calamansiImg from "@/assets/products/calamansi.jpg";
import freshEggsImg from "@/assets/products/fresh-eggs.jpg";
import eggsImg from "@/assets/products/eggs.jpg";
import carabaoMilkImg from "@/assets/products/carabao-milk.jpg";
import kesongPutiImg from "@/assets/products/kesong-puti.jpg";
import saltedEggsImg from "@/assets/products/salted-eggs.jpg";
import guavaImg from "@/assets/products/guava.jpg";
import watermelonImg from "@/assets/products/watermelon.jpg";
import pineappleImg from "@/assets/products/pineapple.jpg";
import dragonFruitImg from "@/assets/products/dragon-fruit.jpg";
import blueberriesImg from "@/assets/products/blueberries.jpg";
import grapesImg from "@/assets/products/grapes.jpg";
import avocadoImg from "@/assets/products/avocado.jpg";
import arabicaCoffeeImg from "@/assets/products/arabica-coffee.jpg";
import wildHoneyImg from "@/assets/products/wild-honey.jpg";
import honeyImg from "@/assets/products/honey.jpg";
import driedHerbsImg from "@/assets/products/dried-herbs.jpg";
import muscovadoImg from "@/assets/products/muscovado.jpg";
import ubeJamImg from "@/assets/products/ube-jam.jpg";
import tableaImg from "@/assets/products/tablea.jpg";
import brownRiceImg from "@/assets/products/brown-rice.jpg";
import coconutVinegarImg from "@/assets/products/coconut-vinegar.jpg";
import peanutButterImg from "@/assets/products/peanut-butter.jpg";
import tomatoesImg from "@/assets/products/tomatoes.jpg";
import gingerImg from "@/assets/products/ginger.jpg";
import turmericImg from "@/assets/products/turmeric.jpg";
import passionFruitImg from "@/assets/products/passion-fruit.jpg";
import lemongrassImg from "@/assets/products/lemongrass.jpg";
import sweetPotatoImg from "@/assets/products/sweet-potato.jpg";
import stringBeansImg from "@/assets/products/string-beans.jpg";
import eggplantImg from "@/assets/products/eggplant.jpg";
import bellPeppersImg from "@/assets/products/bell-peppers.jpg";
// New batch imports
import spinachImg from "@/assets/products/spinach.jpg";
import kangkongImg from "@/assets/products/kangkong.jpg";
import kaleImg from "@/assets/products/kale.jpg";
import mustardGreensImg from "@/assets/products/mustard-greens.jpg";
import okraImg from "@/assets/products/okra.jpg";
import ampalayaImg from "@/assets/products/ampalaya.jpg";
import greenBeansImg from "@/assets/products/green-beans.jpg";
import bellPepperRedImg from "@/assets/products/bell-pepper-red.jpg";
import chiliRedImg from "@/assets/products/chili-red.jpg";
import chiliGreenImg from "@/assets/products/chili-green.jpg";
import onionRedImg from "@/assets/products/onion-red.jpg";
import onionWhiteImg from "@/assets/products/onion-white.jpg";
import garlicImg from "@/assets/products/garlic.jpg";
import squashImg from "@/assets/products/squash.jpg";
import cucumberImg from "@/assets/products/cucumber.jpg";
import cornImg from "@/assets/products/corn.jpg";
import coconutImg from "@/assets/products/coconut.jpg";
import orangeImg from "@/assets/products/orange.jpg";
import lemonImg from "@/assets/products/lemon.jpg";
import melonImg from "@/assets/products/melon.jpg";
import whiteRiceImg from "@/assets/products/white-rice.jpg";
import blackRiceImg from "@/assets/products/black-rice.jpg";
import cornGritsImg from "@/assets/products/corn-grits.jpg";
import mongoBeansImg from "@/assets/products/mongo-beans.jpg";
import peanutsImg from "@/assets/products/peanuts.jpg";
import coconutOilImg from "@/assets/products/coconut-oil.jpg";
import vinegarImg from "@/assets/products/vinegar.jpg";
import seaSaltImg from "@/assets/products/sea-salt.jpg";
import basilImg from "@/assets/products/basil.jpg";
import springOnionImg from "@/assets/products/spring-onion.jpg";
import parsleyImg from "@/assets/products/parsley.jpg";
import cilantroImg from "@/assets/products/cilantro.jpg";
import blackPepperImg from "@/assets/products/black-pepper.jpg";
import chiliFlakesImg from "@/assets/products/chili-flakes.jpg";
import freshMilkImg from "@/assets/products/fresh-milk.jpg";

// Keyword-based image fallback: MOST SPECIFIC matches first, then general
const imageKeywords: [string[], string][] = [
  // === VEGETABLES (specific first) ===
  [["chinese cabbage", "wombok", "napa cabbage"], chineseCabbageImg],
  [["baguio pechay", "pechay baguio"], pechayImg],
  [["korean radish"], koreanRadishImg],
  [["baguio bean", "string bean", "highland bean", "sitaw"], stringBeansImg],
  [["organic lettuce", "lettuce mix", "salad green", "mixed salad"], lettuceImg],
  [["organic sayote"], sayoteImg],
  [["organic broccoli"], broccoliImg],
  [["organic tomato"], tomatoesImg],
  [["organic cauliflower"], cauliflowerImg],
  [["organic radish"], radishImg],
  [["baguio cabbage", "repolyo"], cabbageImg],
  [["fresh leek"], leeksImg],
  [["fresh celery"], celeryImg],
  [["itogon vegetable"], cabbageImg],
  [["sweet potato", "camote"], sweetPotatoImg],
  [["red bell pepper", "bell pepper red"], bellPepperRedImg],
  [["bell pepper"], bellPeppersImg],
  [["eggplant", "talong"], eggplantImg],
  [["ginger", "luya"], gingerImg],
  [["kangkong", "water spinach"], kangkongImg],
  [["spinach"], spinachImg],
  [["kale"], kaleImg],
  [["mustard green"], mustardGreensImg],
  [["okra"], okraImg],
  [["ampalaya", "bitter melon", "bitter gourd"], ampalayaImg],
  [["green bean"], greenBeansImg],
  [["red chili", "chili red", "siling labuyo"], chiliRedImg],
  [["green chili", "chili green", "siling haba"], chiliGreenImg],
  [["chili flake"], chiliFlakesImg],
  [["chili", "sili"], chiliRedImg],
  [["red onion", "onion red", "sibuyas pula"], onionRedImg],
  [["white onion", "onion white", "sibuyas puti"], onionWhiteImg],
  [["spring onion", "green onion", "scallion"], springOnionImg],
  [["onion", "sibuyas"], onionRedImg],
  [["garlic", "bawang"], garlicImg],
  [["squash", "kalabasa"], squashImg],
  [["cucumber", "pipino"], cucumberImg],
  [["corn", "mais"], cornImg],
  // General vegetables
  [["lettuce"], lettuceImg],
  [["carrot"], carrotsImg],
  [["cabbage"], cabbageImg],
  [["broccoli"], broccoliImg],
  [["celery"], celeryImg],
  [["potato"], potatoesImg],
  [["radish", "labanos"], radishImg],
  [["cauliflower"], cauliflowerImg],
  [["sayote", "chayote"], sayoteImg],
  [["leek"], leeksImg],
  [["pechay", "bok choy"], pechayImg],
  [["tomato"], tomatoesImg],
  [["bean"], baguioBeansImg],

  // === FRUITS (specific first) ===
  [["benguet strawberr", "la trinidad strawberr"], strawberriesImg],
  [["strawberry jam"], ubeJamImg],
  [["dried strawberr"], strawberriesImg],
  [["strawberry seedling", "berry seedling"], strawberriesImg],
  [["strawberr"], strawberriesImg],
  [["blueberr"], blueberriesImg],
  [["raspberr"], strawberriesImg],
  [["mixed berry", "berry pack"], strawberriesImg],
  [["passion fruit", "passionfruit"], passionFruitImg],
  [["table grape", "fresh grape", "grape"], grapesImg],
  [["grape jam"], ubeJamImg],
  [["apple"], guavaImg],
  [["mango"], mangoesImg],
  [["papaya"], papayasImg],
  [["banana"], bananasImg],
  [["calamansi"], calamansiImg],
  [["guava"], guavaImg],
  [["watermelon"], watermelonImg],
  [["pineapple"], pineappleImg],
  [["dragon fruit"], dragonFruitImg],
  [["avocado"], avocadoImg],
  [["coconut oil"], coconutOilImg],
  [["coconut"], coconutImg],
  [["orange", "dalandan"], orangeImg],
  [["lemon", "dayap"], lemonImg],
  [["melon", "cantaloupe"], melonImg],

  // === DAIRY & EGGS (specific first) ===
  [["salted egg", "salted duck", "itlog na maalat"], saltedEggsImg],
  [["duck egg"], eggsImg],
  [["quail egg"], eggsImg],
  [["native chicken egg"], freshEggsImg],
  [["free-range egg", "free range egg"], freshEggsImg],
  [["organic brown egg"], eggsImg],
  [["organic duck egg"], eggsImg],
  [["organic egg"], freshEggsImg],
  [["itogon.*egg"], freshEggsImg],
  [["farm fresh egg", "fresh farm egg"], freshEggsImg],
  [["egg tray", "eggs (tray)"], eggsImg],
  [["egg", "itlog"], freshEggsImg],
  [["goat milk"], carabaoMilkImg],
  [["carabao milk"], carabaoMilkImg],
  [["fresh milk"], freshMilkImg],
  [["yogurt"], carabaoMilkImg],
  [["kesong puti", "white cheese", "organic kesong"], kesongPutiImg],
  [["cheese"], kesongPutiImg],
  [["milk"], freshMilkImg],

  // === HERBS & SPICES ===
  [["basil"], basilImg],
  [["parsley"], parsleyImg],
  [["cilantro", "wansoy", "coriander"], cilantroImg],
  [["black pepper", "peppercorn"], blackPepperImg],
  [["chili flake"], chiliFlakesImg],

  // === PANTRY (specific first) ===
  [["arabica coffee", "typica"], arabicaCoffeeImg],
  [["bourbon coffee", "red bourbon"], arabicaCoffeeImg],
  [["catimor coffee"], arabicaCoffeeImg],
  [["ground coffee", "house blend"], arabicaCoffeeImg],
  [["robusta coffee", "barako"], arabicaCoffeeImg],
  [["tuba.*coffee", "tuba arabica"], arabicaCoffeeImg],
  [["coffee"], arabicaCoffeeImg],
  [["wild honey"], wildHoneyImg],
  [["tublay honey"], honeyImg],
  [["mountain.*honey", "bee honey"], honeyImg],
  [["honey"], honeyImg],
  [["lemongrass", "tanglad"], lemongrassImg],
  [["turmeric", "luyang dilaw"], turmericImg],
  [["fresh herb", "herb bundle"], driedHerbsImg],
  [["tea blend", "herbal tea"], driedHerbsImg],
  [["muscovado"], muscovadoImg],
  [["ube jam", "ube"], ubeJamImg],
  [["tablea", "cacao"], tableaImg],
  [["black rice", "tapol"], blackRiceImg],
  [["white rice"], whiteRiceImg],
  [["brown rice"], brownRiceImg],
  [["rice"], whiteRiceImg],
  [["corn grit"], cornGritsImg],
  [["mongo", "mung bean", "monggo"], mongoBeansImg],
  [["sea salt", "asin"], seaSaltImg],
  [["vinegar", "coconut vinegar", "suka"], vinegarImg],
  [["peanut butter"], peanutButterImg],
  [["peanut", "mani"], peanutsImg],
  [["coconut oil"], coconutOilImg],
  [["mushroom"], driedHerbsImg],
  [["dried mushroom"], driedHerbsImg],
  [["jam", "preserve"], ubeJamImg],
  [["dried"], driedHerbsImg],

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
  return cabbageImg;
}
