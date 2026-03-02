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
import carabaoMilkImg from "@/assets/products/carabao-milk.jpg";
import kesongPutiImg from "@/assets/products/kesong-puti.jpg";
import saltedEggsImg from "@/assets/products/salted-eggs.jpg";
import guavaImg from "@/assets/products/guava.jpg";
import watermelonImg from "@/assets/products/watermelon.jpg";
import pineappleImg from "@/assets/products/pineapple.jpg";
import dragonFruitImg from "@/assets/products/dragon-fruit.jpg";
import avocadoImg from "@/assets/products/avocado.jpg";
import arabicaCoffeeImg from "@/assets/products/arabica-coffee.jpg";
import wildHoneyImg from "@/assets/products/wild-honey.jpg";
import driedHerbsImg from "@/assets/products/dried-herbs.jpg";
import muscovadoImg from "@/assets/products/muscovado.jpg";
import ubeJamImg from "@/assets/products/ube-jam.jpg";
import tableaImg from "@/assets/products/tablea.jpg";
import brownRiceImg from "@/assets/products/brown-rice.jpg";
import coconutVinegarImg from "@/assets/products/coconut-vinegar.jpg";
import peanutButterImg from "@/assets/products/peanut-butter.jpg";
import tomatoesImg from "@/assets/products/tomatoes.jpg";
import honeyImg from "@/assets/products/honey.jpg";

// Keyword-based image fallback: first match wins
const imageKeywords: [string[], string][] = [
  [["strawberr"], strawberriesImg],
  [["lettuce"], lettuceImg],
  [["carrot"], carrotsImg],
  [["cabbage", "repolyo"], cabbageImg],
  [["chinese cabbage", "wombok"], chineseCabbageImg],
  [["baguio bean", "string bean"], baguioBeansImg],
  [["broccoli"], broccoliImg],
  [["celery"], celeryImg],
  [["potato"], potatoesImg],
  [["korean radish"], koreanRadishImg],
  [["radish", "labanos"], radishImg],
  [["cauliflower"], cauliflowerImg],
  [["sayote", "chayote"], sayoteImg],
  [["leek"], leeksImg],
  [["pechay"], pechayImg],
  [["tomato"], tomatoesImg],
  [["mango"], mangoesImg],
  [["papaya"], papayasImg],
  [["banana"], bananasImg],
  [["calamansi"], calamansiImg],
  [["guava"], guavaImg],
  [["watermelon"], watermelonImg],
  [["pineapple"], pineappleImg],
  [["dragon fruit"], dragonFruitImg],
  [["avocado"], avocadoImg],
  [["egg", "itlog"], freshEggsImg],
  [["salted egg"], saltedEggsImg],
  [["carabao milk", "fresh milk"], carabaoMilkImg],
  [["kesong puti", "cheese"], kesongPutiImg],
  [["coffee", "arabica", "bourbon", "catimor"], arabicaCoffeeImg],
  [["wild honey"], wildHoneyImg],
  [["honey"], honeyImg],
  [["herb", "basil"], driedHerbsImg],
  [["muscovado"], muscovadoImg],
  [["ube jam", "ube"], ubeJamImg],
  [["tablea", "cacao"], tableaImg],
  [["brown rice", "rice"], brownRiceImg],
  [["vinegar", "coconut vinegar"], coconutVinegarImg],
  [["peanut butter", "peanut"], peanutButterImg],
  [["mushroom"], driedHerbsImg],
  [["berry", "blueberr", "raspberr"], strawberriesImg],
  [["jam"], ubeJamImg],
  [["dried"], driedHerbsImg],
];

export function getProductImage(name: string, dbImageUrl: string | null): string {
  // If DB has a valid bundled image URL, use it
  if (dbImageUrl && !dbImageUrl.startsWith("/src/")) {
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
