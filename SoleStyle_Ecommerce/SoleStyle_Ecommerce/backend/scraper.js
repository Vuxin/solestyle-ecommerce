const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function cleanPrice(priceStr) {
  // e.g. "640,00 د.م." -> 640
  const match = priceStr.match(/(\d+)(,\d+)?/);
  if (match) {
    return parseInt(match[1]);
  }
  return 600; // fallback
}

async function downloadImage(url, filename) {
  const filepath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filepath)) return filename;
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      httpsAgent
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) resolve(filename);
      });
    });
  } catch (err) {
    console.warn("Failed to download image:", url);
    return null;
  }
}

async function scrapeAndSeed() {
  console.log("Fetching itsu.ma...");
  try {
    const response = await axios.get('https://itsu.ma/', { httpsAgent });
    const html = response.data;
    const $ = cheerio.load(html);

    const products = [];
    const seenNames = new Set();

    $('ul.products li.product').each((i, el) => {
      const title = $(el).find('h2').text().trim() || $(el).find('.woocommerce-loop-product__title').text().trim();
      const priceText = $(el).find('.price .amount bdi').first().text().trim();
      
      let imgUrl = $(el).find('img').attr('src');
      // Sometimes lazy loaded
      if (imgUrl && imgUrl.includes('data:image/svg')) {
          imgUrl = $(el).find('img').attr('data-lazy-src') || $(el).find('img').attr('data-src');
      }

      if (title && priceText && imgUrl) {
        if (!seenNames.has(title)) {
          seenNames.add(title);
          products.push({
            name: title,
            price: cleanPrice(priceText),
            imgUrl: imgUrl,
          });
        }
      }
    });

    console.log(`Found ${products.length} products on homepage.`);
    
    const finalProducts = [];

    // Download images
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const ext = path.extname(p.imgUrl.split('?')[0]) || '.png';
        const cleanName = p.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `itsu_${cleanName}${ext}`;
        
        console.log(`Downloading (${i+1}/${products.length}): ${p.name}`);
        const downloadedImg = await downloadImage(p.imgUrl, filename);
        
        // Brand deduction
        let brand = "Autre";
        let lcName = p.name.toLowerCase();
        if(lcName.includes("nike") || lcName.includes("dunk") || lcName.includes("jordan") || lcName.includes("air force") || lcName.includes("air max") || lcName.includes("vomero")) brand = "Nike";
        if(lcName.includes("adidas") || lcName.includes("samba") || lcName.includes("campus") || lcName.includes("yeezy") || lcName.includes("gazelle") || lcName.includes("spezial")) brand = "Adidas";
        if(lcName.includes("asics") || lcName.includes("gel") || lcName.includes("kayano")) brand = "Asics";
        if(lcName.includes("new balance") || lcName.includes(" nb")) brand = "New Balance";
        if(lcName.includes("puma")) brand = "Puma";
        if(lcName.includes("dior")) brand = "Dior";
        if(lcName.includes("hermes")) brand = "Hermes";

        // Category deduction
        let category = 'catMap["sneakers"]';
        if(lcName.includes("sandal") || lcName.includes("slide") || lcName.includes("yeezy slide") || lcName.includes("izmir")) {
            category = 'catMap["sandales"]';
        }

        if (downloadedImg) {
            finalProducts.push(`
      {
        name: "${p.name}",
        description: "Qualité Premium 1:1, détails authentiques garantis.",
        price: ${p.price},
        category: ${category},
        brand: "${brand}",
        sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        images: ["http://localhost:5000/uploads/${downloadedImg}"],
        stock: 50, rating: 4.9, reviewCount: Math.floor(Math.random() * 500) + 50, isFeatured: true,
      }`);
        }
    }

    const seedJsContent = `// ─────────────────────────────────────────────────────────────────────────────
//  SOLE STYLE — Scraped from Itsu.ma (Real Authentic Catalog)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/solestyle";

const categories = [
  { name: "Sneakers", slug: "sneakers", emoji: "👟", description: "Baskets Premium", order: 1 },
  { name: "Sandales", slug: "sandales", emoji: "🩴", description: "Slides & Sandals", order: 2 }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connecté");

    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log("🧹 Collections nettoyées");

    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach((c) => (catMap[c.slug] = c._id));
    console.log(\`📂 \${createdCategories.length} catégories créées\`);

    const products = [${finalProducts.join(",")}
    ];

    const createdProducts = await Product.create(products);
    console.log(\`👟 \${createdProducts.length} produits Itsu créés avec succès !\`);

    console.log("\\n✅ Base de données clonée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

seed();
`;

    fs.writeFileSync(path.join(__dirname, 'seed.js'), seedJsContent, 'utf8');
    console.log("Successfully generated seed.js with itsu.ma products.");

  } catch (err) {
    console.error("Scraping error:", err.message);
  }
}

scrapeAndSeed();
