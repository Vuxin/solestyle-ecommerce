const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

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

function cleanPrice(priceStr) {
  const match = priceStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 650;
}

async function processData() {
  const data = JSON.parse(fs.readFileSync('itsu_data.json', 'utf8'));
  const finalProducts = [];

  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const ext = path.extname(p.imgUrl.split('?')[0]) || '.jpg';
    let cleanName = p.name.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
    const filename = `itsu_${cleanName}${ext}`;
    
    console.log(`Downloading (${i+1}/${data.length}): ${filename}`);
    const downloadedImg = await downloadImage(p.imgUrl, filename);
    
    if (downloadedImg) {
        let brand = "Autre";
        let lcName = p.name.toLowerCase();
        if(lcName.includes("nike") || lcName.includes("jordan") || lcName.includes("dunk") || lcName.includes("v2k") || lcName.includes("v5 rnr") || lcName.includes("air zoom") || lcName.includes("zoomx")) brand = "Nike";
        if(lcName.includes("adidas") || lcName.includes("samba") || lcName.includes("campus") || lcName.includes("gazelle") || lcName.includes("spezial")) brand = "Adidas";
        if(lcName.includes("asics") || lcName.includes("gel")) brand = "Asics";
        if(lcName.includes("new balance") || lcName.includes(" nb")) brand = "New Balance";
        if(lcName.includes("puma")) brand = "Puma";
        if(lcName.includes("on cloud") || lcName.includes("on cloudsurfer")) brand = "On";
        if(lcName.includes("vans")) brand = "Vans";
        if(lcName.includes("converse") || lcName.includes("covnerse")) brand = "Converse";

        finalProducts.push(`
      {
        name: "${p.name}",
        description: "Qualité Premium 1:1, détails authentiques garantis.",
        price: ${cleanPrice(p.price)},
        category: catMap["sneakers"],
        brand: "${brand}",
        sizes: [38, 39, 40, 41, 42, 43, 44, 45],
        images: ["http://localhost:5000/uploads/${downloadedImg}"],
        stock: 50, rating: 4.9, reviewCount: Math.floor(Math.random() * 500) + 50, isFeatured: ${i < 15},
      }`);
    }
  }

  const seedJsContent = `// ─────────────────────────────────────────────────────────────────────────────
//  SOLE STYLE — Scraped from Itsu.ma (Authentic Catalog)
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
    console.log(\`👟 \${createdProducts.length} produits originaux créés (Itsu.ma clone) !\`);

    console.log("\\n✅ Base de données clonée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

seed();
`;

  fs.writeFileSync('seed.js', seedJsContent);
  console.log("seed.js updated!");
}

processData();
