// ─────────────────────────────────────────────────────────────────
//  SOLE STYLE — Backend API (Node.js + Express + MongoDB + JWT)
//  server.js — Point d'entrée principal
// ─────────────────────────────────────────────────────────────────

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin.endsWith(".netlify.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("railway.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all in production for now
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES ─────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

// ─── ROUTES ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/promo", require("./routes/promoCodes"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/stats", require("./routes/stats"));

// ─── HEALTH ───────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
  });
});

// ─── SEED ROUTE (via API) ─────────────────────────────────────────
app.get("/api/seed", async (req, res) => {
  try {
    await runSeed();
    res.json({ message: "Base de données initialisée avec succès !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CREATE ADMIN ROUTE ───────────────────────────────────────────
app.get("/api/createAdmin", async (req, res) => {
  try {
    await createAdmins();
    res.json({ message: "Comptes administrateurs créés/mis à jour !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FALLBACK ─────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Route API introuvable" });
  }
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─── AUTO INIT FUNCTIONS ──────────────────────────────────────────
const bcrypt = require("bcryptjs");

async function createAdmins() {
  const User = require("./models/User");
  const admins = [
    { name: "SoleStyle Admin", email: "admin@jbshoes.ma", password: "admin123" },
    { name: "Mohamed Admin", email: "mohamedjbark35@gmail.com", password: "admin123" },
  ];
  for (const a of admins) {
    const hashed = await bcrypt.hash(a.password, 10);
    await User.findOneAndUpdate(
      { email: a.email },
      { name: a.name, email: a.email, password: hashed, role: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Admin ready: ${a.email}`);
  }
}

async function runSeed() {
  const Category = require("./models/Category");
  const Product = require("./models/Product");

  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    console.log(`ℹ️  DB already has ${productCount} products. Skipping seed.`);
    return;
  }

  console.log("🌱 Seeding database...");

  await Category.deleteMany({});
  const cats = await Category.insertMany([
    { name: "Sneakers", slug: "sneakers", emoji: "👟", description: "Baskets Premium", order: 1 },
    { name: "Sandales", slug: "sandales", emoji: "🩴", description: "Slides & Sandals", order: 2 },
  ]);
  const catMap = {};
  cats.forEach((c) => (catMap[c.slug] = c._id));

  const sneakers = catMap["sneakers"];
  const products = [
    { name: "Nike V2K Run Platinum Tint", price: 640, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_v2k_run_platinum_tint.jpg"], stock: 50, rating: 4.9, reviewCount: 312, isFeatured: true },
    { name: "Nike V5 RNR Psychic Blue", price: 660, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_v5_rnr_psychic_blue.jpg"], stock: 50, rating: 4.9, reviewCount: 198, isFeatured: true },
    { name: "Nike V2K Run Pure Platinum Metallic Silver", price: 650, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_v2k_run_pure_platinum_metallic_silver.jpg"], stock: 50, rating: 4.9, reviewCount: 254, isFeatured: true },
    { name: "Nike V2K Run Summery Florals", price: 680, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_v2k_run_summery_florals.jpg"], stock: 50, rating: 4.9, reviewCount: 176, isFeatured: true },
    { name: "Nike V5 RNR Sail Fauna Brown", price: 660, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_v5_rnr_sail_fauna_brown.jpg"], stock: 50, rating: 4.9, reviewCount: 221, isFeatured: true },
    { name: "Vans Knu Skool Bleu Roi Rose", price: 660, brand: "Vans", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_vans_knu_skool_bleu_roi_rose.jpg"], stock: 50, rating: 4.9, reviewCount: 189, isFeatured: true },
    { name: "Nike Air Zoom Alphafly NEXT% 2 Total Orange", price: 650, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_zoom_alphafly_next__2_total_orange.jpg"], stock: 50, rating: 4.9, reviewCount: 143, isFeatured: true },
    { name: "Nike ZoomX Invincible Run Flyknit 3 White Cobalt", price: 670, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_zoomx_invincible_run_flyknit_3_white_cobalt_bliss.jpg"], stock: 50, rating: 4.9, reviewCount: 267, isFeatured: true },
    { name: "ON Cloudsolo x Loewe White Light Grey", price: 730, brand: "On", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_on_cloudsolo_x_loewe_white_light_grey.jpg"], stock: 50, rating: 4.9, reviewCount: 98, isFeatured: false },
    { name: "On Cloudsurfer on Glacier", price: 640, brand: "On", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_on_cloudsurfer_on_glacier.jpg"], stock: 50, rating: 4.9, reviewCount: 115, isFeatured: false },
    { name: "Nike ZoomX Invincible Run Flyknit 3 White Crimson", price: 670, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_zoomx_invincible_run_flyknit_3_white_bright_crimson.jpg"], stock: 50, rating: 4.9, reviewCount: 302, isFeatured: false },
    { name: "New Balance Fresh Foam X More Trail v3 Black", price: 680, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_fresh_foam_x_more_trail_v3_black_cayenne.jpg"], stock: 50, rating: 4.9, reviewCount: 87, isFeatured: false },
    { name: "Asics Gel NYC Cream Cloud Grey", price: 760, brand: "Asics", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_asics_gel_nyc_cream_cloud_grey.jpg"], stock: 50, rating: 4.9, reviewCount: 203, isFeatured: false },
    { name: "Nike Air Zoom Vomero 5 Platinum Violet Gold", price: 670, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_zoom_vomero_5_platinum_violet_gold.jpg"], stock: 50, rating: 4.9, reviewCount: 178, isFeatured: false },
    { name: "Adidas Handball Spezial Scarlet Gum", price: 640, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_handball_spezial_scarlet_gum.jpg"], stock: 50, rating: 4.9, reviewCount: 234, isFeatured: false },
    { name: "Nike Air Max 95 Recraft GS Triple Black", price: 590, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_max_95_recraft_gs_triple_black.jpg"], stock: 50, rating: 4.9, reviewCount: 412, isFeatured: false },
    { name: "Converse Run Star Motion White Gum Honey", price: 670, brand: "Converse", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_covnerse_run_star_motion_white_gum_honey.jpg"], stock: 50, rating: 4.9, reviewCount: 156, isFeatured: false },
    { name: "Nike Air Jordan 1 x Travis Scott Sail Military Blue", price: 680, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_x_fragment_design_x_travis_scott_retro_low_og_sp_sail_military_blue.jpg"], stock: 50, rating: 4.9, reviewCount: 543, isFeatured: false },
    { name: "Nike Air Jordan 1 Low Shadow Brown", price: 670, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_low_shadow_brown.jpg"], stock: 50, rating: 4.9, reviewCount: 321, isFeatured: false },
    { name: "Nike Air Jordan 1 Low Sail Soft Pearl Sequins", price: 680, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_low_sail_soft_pearl_sequins.jpg"], stock: 50, rating: 4.9, reviewCount: 278, isFeatured: false },
    { name: "Nike Air Jordan 1 Mid Digital Pink", price: 640, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_mid_digital_pink.jpg"], stock: 50, rating: 4.9, reviewCount: 189, isFeatured: false },
    { name: "Nike Air Jordan 1 Cactus Jack Travis Scott", price: 660, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_cactus_jack_travis_scott.jpg"], stock: 50, rating: 4.9, reviewCount: 612, isFeatured: false },
    { name: "Nike Air Jordan 1 Retro High OG Hyper Royal", price: 670, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_1_retro_high_og_hyper_royal.jpg"], stock: 50, rating: 4.9, reviewCount: 445, isFeatured: false },
    { name: "New Balance 9060 Black Slate Grey", price: 740, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_9060_black_slate_grey.jpg"], stock: 50, rating: 4.9, reviewCount: 234, isFeatured: false },
    { name: "New Balance x Miu Miu 530 SL Ecru", price: 710, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_x_miu_miu_530_sl_ecru.png"], stock: 50, rating: 4.9, reviewCount: 167, isFeatured: false },
    { name: "New Balance x Miu Miu 530 SL Cinnamon", price: 720, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_x_miu_miu_530_sl_cinnamon.png"], stock: 50, rating: 4.9, reviewCount: 143, isFeatured: false },
    { name: "New Balance 9060 Quartz Grey", price: 750, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_9060_quartz_grey.jpg"], stock: 50, rating: 4.9, reviewCount: 289, isFeatured: false },
    { name: "New Balance 530 Dark Mushroom Incense", price: 660, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_530_dark_mushroom_incense.jpg"], stock: 50, rating: 4.9, reviewCount: 198, isFeatured: false },
    { name: "Asics Gel Kayano 14 Silver Grape", price: 680, brand: "Asics", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_asics_gel_kayano_14_silver_grape.jpg"], stock: 50, rating: 4.9, reviewCount: 312, isFeatured: false },
    { name: "Asics Gel NYC Moss", price: 690, brand: "Asics", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_asics_gel_nyc_moss.jpg"], stock: 50, rating: 4.9, reviewCount: 178, isFeatured: false },
    { name: "Adidas Samba OG White Halo Blue Gum", price: 640, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_samba_og_white_halo_blue_gum.jpg"], stock: 50, rating: 4.9, reviewCount: 521, isFeatured: false },
    { name: "Adidas Stan Smith White Black", price: 390, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_stan_smith_white_black.jpg"], stock: 50, rating: 4.9, reviewCount: 634, isFeatured: false },
    { name: "Adidas Superstar Mauve", price: 490, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_superstar_mauve.jpg"], stock: 50, rating: 4.9, reviewCount: 287, isFeatured: false },
    { name: "Adidas Samba Valentine's Day 2024", price: 700, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_samba_valentine_s_day_2024.jpg"], stock: 50, rating: 4.9, reviewCount: 345, isFeatured: false },
    { name: "Adidas Yeezy 700 V3 Alvah", price: 680, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_yeezy_700_v3_alvah.jpg"], stock: 50, rating: 4.9, reviewCount: 189, isFeatured: false },
    { name: "Adidas Yeezy Boost 350 V2 Mono Ice", price: 710, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_yeezy_boost_350_v2_mono_ice.jpg"], stock: 50, rating: 4.9, reviewCount: 412, isFeatured: false },
    { name: "Nike Air Force 1 07 Triple Black", price: 490, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_force_1__07_triple_black.jpg"], stock: 50, rating: 4.9, reviewCount: 756, isFeatured: false },
    { name: "Nike Air Jordan 4 Metallic Purple", price: 630, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_air_jordan_4_metallic_purple.jpg"], stock: 50, rating: 4.9, reviewCount: 234, isFeatured: false },
    { name: "Nike Dunk Low Off-White Lot 50", price: 680, brand: "Nike", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_nike_dunk_low_off_white_lot_50.jpg"], stock: 50, rating: 4.9, reviewCount: 389, isFeatured: false },
    { name: "Adidas Niteball 2.0 Ecru Tint", price: 520, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_niteball_2_0_ecru_tint.jpg"], stock: 50, rating: 4.9, reviewCount: 167, isFeatured: false },
    { name: "New Balance 530 Triple White", price: 650, brand: "New Balance", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_new_balance_530_triple_white.jpg"], stock: 50, rating: 4.9, reviewCount: 298, isFeatured: false },
    { name: "Adidas SuperStar Cloud White", price: 600, brand: "Adidas", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_adidas_superstar_cloud_white.jpg"], stock: 50, rating: 4.9, reviewCount: 445, isFeatured: false },
    { name: "Dior B25 Black Oblique", price: 1950, brand: "Dior", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_dior_b25_black_oblique.jpg"], stock: 50, rating: 4.9, reviewCount: 89, isFeatured: false },
    { name: "Hermes Izmir Sandal Black", price: 1660, brand: "Hermes", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_hermes_izmir_sandal_black.png"], stock: 50, rating: 4.9, reviewCount: 56, isFeatured: false },
    { name: "Prada Cloudbust Thunder Knit White", price: 740, brand: "Prada", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_prada_cloudbust_thunder_knit_white.jpg"], stock: 50, rating: 4.9, reviewCount: 78, isFeatured: false },
    { name: "On Cloudtilt x Loewe All Black", price: 690, brand: "On", sizes: [38,39,40,41,42,43,44,45], images: ["https://solestyle-ecommerce-production.up.railway.app/uploads/itsu_on_cloudtilt_x_loewe_all_black.jpg"], stock: 50, rating: 4.9, reviewCount: 134, isFeatured: false },
  ];

  const productsWithCategory = products.map((p) => ({ ...p, category: sneakers, isActive: true }));
  await Product.insertMany(productsWithCategory);
  console.log(`✅ Seeded ${productsWithCategory.length} products!`);
}

// ─── START SERVER FIRST, THEN CONNECT TO DB ──────────────────────
// This ensures Railway health checks pass even while MongoDB connects
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/solestyle";

console.log("🔧 MONGODB_URI:", process.env.MONGODB_URI ? "SET ✅" : "NOT SET ❌");
console.log("🔧 MONGO_URI:", process.env.MONGO_URI ? "SET ✅" : "NOT SET ❌");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

// Connect to MongoDB after server starts
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    try {
      await createAdmins();
      await runSeed();
    } catch (initErr) {
      console.error("⚠️ Init error:", initErr.message);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 Make sure MONGODB_URI is set in Railway environment variables");
    // Don't exit - keep server running so health checks pass
  });

