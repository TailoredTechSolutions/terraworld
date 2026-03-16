/**
 * Centralized Supabase Storage image URL helper.
 * All site images are served from the public `site-images` bucket.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "site-images";

/**
 * Returns a stable public URL for a file in the site-images bucket.
 * @param path — e.g. "farms/atok-highlands-farm.jpg"
 */
export function siteImageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ─── LOGOS ────────────────────────────────────────────────────────
export const LOGO = siteImageUrl("logos/terra-logo.png");
export const LOGO_FULL = siteImageUrl("logos/terra-logo-full.png");
export const HERO_BADGE = siteImageUrl("logos/terra-hero-badge.png");
export const DARK_BADGE = siteImageUrl("logos/terra-dark-badge.png");

// ─── HOMEPAGE / HERO ─────────────────────────────────────────────
export const HERO_HARVEST_SUNRISE = siteImageUrl("homepage/hero-harvest-sunrise.jpg");
export const RICE_TERRACES = siteImageUrl("homepage/rice-terraces.jpg");
export const DELIVERY_LOGISTICS = siteImageUrl("homepage/delivery-farm-logistics.jpg");
export const PRODUCE_SPREAD = siteImageUrl("homepage/produce-spread.jpg");
export const CHEF_PREPARATION = siteImageUrl("homepage/chef-preparation.jpg");
export const FARMER_PORTRAIT = siteImageUrl("homepage/farmer-portrait.jpg");
export const HERO_FARM = siteImageUrl("homepage/hero-farm.jpg");
export const AUTH_FARM_BG = siteImageUrl("homepage/auth-farm-bg.jpg");
export const AUTH_BACKGROUND = siteImageUrl("homepage/auth-background.jpeg");
export const SHOP_HERO = siteImageUrl("homepage/shop-hero.jpg");
export const FARMS_HERO = siteImageUrl("homepage/farms-hero.jpg");
export const BUSINESS_CENTRE_HERO = siteImageUrl("homepage/business-centre-hero.jpg");

// ─── CATEGORIES ──────────────────────────────────────────────────
export const CATEGORY_VEGETABLES = siteImageUrl("categories/category-vegetables.jpg");
export const CATEGORY_FRUITS = siteImageUrl("categories/category-fruits.jpg");
export const CATEGORY_DAIRY = siteImageUrl("categories/category-dairy.jpg");
export const CATEGORY_PANTRY = siteImageUrl("categories/category-pantry.jpg");

// ─── TESTIMONIALS ────────────────────────────────────────────────
export const FARMER_PEDRO = siteImageUrl("testimonials/farmer-pedro.jpg");
export const FARMER_ALING_ROSA = siteImageUrl("testimonials/farmer-aling-rosa.jpg");
export const FARMER_KUYA_BEN = siteImageUrl("testimonials/farmer-kuya-ben.jpg");
export const CUSTOMER_MARIA = siteImageUrl("testimonials/customer-maria.jpg");
export const CUSTOMER_CHEF_JUAN = siteImageUrl("testimonials/customer-chef-juan.jpg");
export const CUSTOMER_ATE_JOY = siteImageUrl("testimonials/customer-ate-joy.jpg");
export const CUSTOMER_MIKE = siteImageUrl("testimonials/customer-mike.jpg");
export const CUSTOMER_SOO_JIN = siteImageUrl("testimonials/customer-soo-jin.jpg");

// ─── FARMS ───────────────────────────────────────────────────────
export const FARM_SAYMAYAT = siteImageUrl("farms/saymayat-vegetable.jpg");
export const FARM_URBAN_GARDEN = siteImageUrl("farms/urban-garden-pines.jpg");
export const FARM_LA_FAUSTINO = siteImageUrl("farms/la-faustino-farm.jpg");
export const FARM_PCJEAM = siteImageUrl("farms/pcjeam-farm.jpg");
export const FARM_DULCHE = siteImageUrl("farms/dulche-chocolates.jpg");
export const FARM_CSB_FAMILY = siteImageUrl("farms/csb-family-farm.jpg");
export const FARM_FIT_FAB = siteImageUrl("farms/fit-fab-farm.jpg");
export const FARM_MLS_HARVEST = siteImageUrl("farms/mls-harvest-farm.jpg");
export const FARM_ATOK_HIGHLANDS = siteImageUrl("farms/atok-highlands-farm.jpg");
export const FARM_KIBUNGAN = siteImageUrl("farms/kibungan-green-terraces.jpg");
export const FARM_BAKUN_VALLEY = siteImageUrl("farms/bakun-valley-farm.jpg");
export const FARM_MANKAYAN = siteImageUrl("farms/mankayan-root-farm.jpg");
export const FARM_BSU_STRAWBERRY = siteImageUrl("farms/bsu-strawberry-farm.jpg");
export const FARM_ITOGON_MIXED = siteImageUrl("farms/itogon-mixed-farm.jpg");
export const FARM_TUBLAY_BERRY = siteImageUrl("farms/tublay-berry-farm.jpg");
export const FARM_PINSAO_URBAN = siteImageUrl("farms/pinsao-urban-farm.jpg");

// ─── PRODUCTS ────────────────────────────────────────────────────
// Product images are accessed via siteImageUrl("products/<filename>")
// e.g. siteImageUrl("products/lettuce.jpg")
export function productImageUrl(filename: string): string {
  return siteImageUrl(`products/${filename}`);
}

// Full product image map (used by productImageMap and data files)
export const PRODUCT_IMAGES = {
  lettuce: productImageUrl("lettuce.jpg"),
  carrots: productImageUrl("carrots.jpg"),
  strawberries: productImageUrl("strawberries.jpg"),
  cabbage: productImageUrl("cabbage.jpg"),
  chineseCabbage: productImageUrl("chinese-cabbage.jpg"),
  baguioBeans: productImageUrl("baguio-beans.jpg"),
  broccoli: productImageUrl("broccoli.jpg"),
  celery: productImageUrl("celery.jpg"),
  potatoes: productImageUrl("potatoes.jpg"),
  radish: productImageUrl("radish.jpg"),
  koreanRadish: productImageUrl("korean-radish.jpg"),
  cauliflower: productImageUrl("cauliflower.jpg"),
  sayote: productImageUrl("sayote.jpg"),
  leeks: productImageUrl("leeks.jpg"),
  pechay: productImageUrl("pechay.jpg"),
  mangoes: productImageUrl("mangoes.jpg"),
  papayas: productImageUrl("papayas.jpg"),
  bananas: productImageUrl("bananas.jpg"),
  calamansi: productImageUrl("calamansi.jpg"),
  freshEggs: productImageUrl("fresh-eggs.jpg"),
  eggs: productImageUrl("eggs.jpg"),
  carabaoMilk: productImageUrl("carabao-milk.jpg"),
  goatMilk: productImageUrl("goat-milk.jpg"),
  chicken: productImageUrl("chicken.jpg"),
  kesongPuti: productImageUrl("kesong-puti.jpg"),
  saltedEggs: productImageUrl("salted-eggs.jpg"),
  guava: productImageUrl("guava.jpg"),
  watermelon: productImageUrl("watermelon.jpg"),
  pineapple: productImageUrl("pineapple.jpg"),
  dragonFruit: productImageUrl("dragon-fruit.jpg"),
  blueberries: productImageUrl("blueberries.jpg"),
  grapes: productImageUrl("grapes.jpg"),
  avocado: productImageUrl("avocado.jpg"),
  arabicaCoffee: productImageUrl("arabica-coffee.jpg"),
  wildHoney: productImageUrl("wild-honey.jpg"),
  honey: productImageUrl("honey.jpg"),
  driedHerbs: productImageUrl("dried-herbs.jpg"),
  muscovado: productImageUrl("muscovado.jpg"),
  ubeJam: productImageUrl("ube-jam.jpg"),
  tablea: productImageUrl("tablea.jpg"),
  brownRice: productImageUrl("brown-rice.jpg"),
  coconutVinegar: productImageUrl("coconut-vinegar.jpg"),
  peanutButter: productImageUrl("peanut-butter.jpg"),
  tomatoes: productImageUrl("tomatoes.jpg"),
  ginger: productImageUrl("ginger.jpg"),
  turmeric: productImageUrl("turmeric.jpg"),
  passionFruit: productImageUrl("passion-fruit.jpg"),
  lemongrass: productImageUrl("lemongrass.jpg"),
  sweetPotato: productImageUrl("sweet-potato.jpg"),
  stringBeans: productImageUrl("string-beans.jpg"),
  eggplant: productImageUrl("eggplant.jpg"),
  bellPeppers: productImageUrl("bell-peppers.jpg"),
  spinach: productImageUrl("spinach.jpg"),
  kangkong: productImageUrl("kangkong.jpg"),
  kale: productImageUrl("kale.jpg"),
  mustardGreens: productImageUrl("mustard-greens.jpg"),
  okra: productImageUrl("okra.jpg"),
  ampalaya: productImageUrl("ampalaya.jpg"),
  greenBeans: productImageUrl("green-beans.jpg"),
  bellPepperRed: productImageUrl("bell-pepper-red.jpg"),
  chiliRed: productImageUrl("chili-red.jpg"),
  chiliGreen: productImageUrl("chili-green.jpg"),
  onionRed: productImageUrl("onion-red.jpg"),
  onionWhite: productImageUrl("onion-white.jpg"),
  garlic: productImageUrl("garlic.jpg"),
  squash: productImageUrl("squash.jpg"),
  cucumber: productImageUrl("cucumber.jpg"),
  corn: productImageUrl("corn.jpg"),
  coconut: productImageUrl("coconut.jpg"),
  orange: productImageUrl("orange.jpg"),
  lemon: productImageUrl("lemon.jpg"),
  melon: productImageUrl("melon.jpg"),
  whiteRice: productImageUrl("white-rice.jpg"),
  blackRice: productImageUrl("black-rice.jpg"),
  cornGrits: productImageUrl("corn-grits.jpg"),
  mongoBeans: productImageUrl("mongo-beans.jpg"),
  peanuts: productImageUrl("peanuts.jpg"),
  coconutOil: productImageUrl("coconut-oil.jpg"),
  vinegar: productImageUrl("vinegar.jpg"),
  seaSalt: productImageUrl("sea-salt.jpg"),
  basil: productImageUrl("basil.jpg"),
  springOnion: productImageUrl("spring-onion.jpg"),
  parsley: productImageUrl("parsley.jpg"),
  cilantro: productImageUrl("cilantro.jpg"),
  blackPepper: productImageUrl("black-pepper.jpg"),
  chiliFlakes: productImageUrl("chili-flakes.jpg"),
  freshMilk: productImageUrl("fresh-milk.jpg"),
} as const;
