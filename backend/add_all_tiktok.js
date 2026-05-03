const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/solestyle';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const BASE_URL = 'https://solestyle-ecommerce-production.up.railway.app';

const products = [
  // ── Louis Vuitton ──────────────────────────────────────────────────────────
  { name: 'Louis Vuitton LV Trainer Monogram Black', price: 1950, brand: 'Louis Vuitton', isFeatured: false, rating: 4.9, reviewCount: 67,
    desc: 'Le LV Trainer en monogramme noir. La sneaker de luxe ultime signée Louis Vuitton.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/09/Louis-Vuitton-LV-Trainer-Monogramme-Noir-prix-maroc-1.jpg',
           'https://image.goat.com/750/attachments/product_template_pictures/images/012/488/769/original/Louis_Vuitton_LV_Trainer_Monogram_Black.jpg'] },
  { name: 'Louis Vuitton LV Trainer Denim Blue', price: 1980, brand: 'Louis Vuitton', isFeatured: false, rating: 4.9, reviewCount: 45,
    desc: 'Le LV Trainer en denim bleu avec fourrure blanche. Édition exclusive Louis Vuitton.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/09/Louis-Vuitton-LV-Trainer-Denim-Bleu-prix-maroc-1.jpg',
           'https://image.goat.com/750/attachments/product_template_pictures/images/012/488/770/original/Louis_Vuitton_LV_Trainer_Denim_Blue.jpg'] },

  // ── Adidas Samba ───────────────────────────────────────────────────────────
  { name: 'Adidas Sambae x Atmos Pink Denim', price: 720, brand: 'Adidas', isFeatured: true, rating: 4.9, reviewCount: 189,
    desc: 'La Sambae en collaboration avec Atmos dans le coloris Pink Denim exclusif.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/02/Adidas-Sambae-x-Atmos-Pink-Denim-prix-maroc-1.jpg',
           'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/sambae-atmos-pink.jpg'] },
  { name: 'Adidas Samba OG Love Edition', price: 690, brand: 'Adidas', isFeatured: true, rating: 4.9, reviewCount: 234,
    desc: 'La Samba OG Love Edition en blanc/rouge avec motifs cœurs roses. Édition Saint-Valentin.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/12/Adidas-Samba-OG-Love-Edition-prix-maroc-1.jpg',
           'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/samba-love-edition.jpg'] },
  { name: 'Adidas Sambae x Liberty London Floral', price: 730, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 112,
    desc: 'La Sambae en collab avec Liberty London et ses motifs floraux signature.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/03/Adidas-Sambae-Liberty-London-Floral-prix-maroc-1.jpg'] },
  { name: 'Adidas Samba OG Pink Gum', price: 670, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 298,
    desc: 'La Samba OG rose clair avec semelle gomme naturelle. Coloris printemps tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/01/Adidas-Samba-OG-Rose-Clair-Gum-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/11/Adidas-Samba-OG-Pink-Gum-Maroc-1.jpg'] },
  { name: "Adidas Sambae Valentine's Day Mauve", price: 700, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 178,
    desc: "La Sambae édition Saint-Valentin dans le coloris Mauve/Lilas translucide.",
    urls: ['https://itsu.ma/wp-content/uploads/2024/12/Adidas-Sambae-Valentines-Day-Mauve-prix-maroc-1.jpg'] },
  { name: 'Adidas Samba OG Special Edition Silver', price: 710, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 145,
    desc: 'La Samba OG édition spéciale Blanc/Crème avec rayures argentées brillantes.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/01/Adidas-Samba-OG-Special-Edition-Silver-prix-maroc-1.jpg'] },
  { name: 'Adidas Adizero Boston 12 White Pink', price: 680, brand: 'Adidas', isFeatured: false, rating: 4.7, reviewCount: 167,
    desc: 'La Adizero Boston 12 pour runner exigeante. Blanc/Rose ultra-performante.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/04/Adidas-Adizero-Boston-12-White-Pink-prix-maroc-1.jpg',
           'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero-boston-12-white-pink.jpg'] },
  { name: 'Adidas Adilette Mauve Lavande', price: 290, brand: 'Adidas', isFeatured: false, rating: 4.6, reviewCount: 203,
    desc: 'Les claquettes Adilette dans le coloris Mauve/Lavande pastel tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/06/Adidas-Adilette-Mauve-Lavande-prix-maroc-1.jpg',
           'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adilette-mauve.jpg'] },

  // ── Nike / Jordan ──────────────────────────────────────────────────────────
  { name: 'Nike Zoom Vomero 5 Pink Furry', price: 670, brand: 'Nike', isFeatured: true, rating: 4.9, reviewCount: 312,
    desc: 'La Nike Vomero 5 Rose "Furry" avec sa texture velours unique. Le modèle le plus tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/01/Nike-Zoom-Vomero-5-Pink-Furry-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/12/Vomero-5-Rose-Furry-Maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Violet', price: 620, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 267,
    desc: 'La Nike TN Air Max Plus en violet intégral. Coloris bold et agressif.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/07/Nike-Air-Max-Plus-TN-Violet-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/08/TN-Violet-Maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Navy Blue', price: 610, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 334,
    desc: 'La Nike TN Air Max Plus Bleu Marine. Un classique indémodable.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/03/Nike-Air-Max-Plus-TN-Bleu-Marine-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/05/TN-Bleu-Marine-Maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Cyan', price: 610, brand: 'Nike', isFeatured: false, rating: 4.7, reviewCount: 198,
    desc: 'La Nike TN Air Max Plus en cyan vif. Coloris électrique pour se démarquer.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/06/Nike-Air-Max-Plus-TN-Cyan-prix-maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Triple Black', price: 590, brand: 'Nike', isFeatured: false, rating: 4.9, reviewCount: 512,
    desc: 'La Nike TN Air Max Plus Triple Black. Le coloris le plus iconique de la TN.',
    urls: ['https://itsu.ma/wp-content/uploads/2023/09/Nike-Air-Max-Plus-TN-Triple-Black-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2023/10/TN-Noir-Maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Triple White', price: 590, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 423,
    desc: 'La Nike TN Air Max Plus Triple White. La pureté du blanc pour un look frais.',
    urls: ['https://itsu.ma/wp-content/uploads/2023/09/Nike-Air-Max-Plus-TN-Triple-White-prix-maroc-1.jpg'] },
  { name: 'Nike Air Max Plus TN Pink Gradient', price: 620, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 289,
    desc: 'La Nike TN Air Max Plus en dégradé Rose/Blanc. Coloris féminin et élégant.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/03/Nike-Air-Max-Plus-TN-Rose-Blanc-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/04/TN-Pink-Gradient-Maroc-1.jpg'] },
  { name: 'Nike Air Force 1 Low White Classic', price: 490, brand: 'Nike', isFeatured: false, rating: 4.9, reviewCount: 876,
    desc: "La Nike Air Force 1 Low Triple White. L'intemporel absolu du streetwear.",
    urls: ['https://itsu.ma/wp-content/uploads/2023/05/Nike-Air-Force-1-Low-Triple-White-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2023/06/AF1-White-Maroc-1.jpg'] },
  { name: 'Air Jordan 1 Low Mauve Bordeaux Yellow', price: 650, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 234,
    desc: 'La Jordan 1 Low dans le mix audacieux Mauve/Bordeaux/Jaune. Coloris exclusif.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/02/Air-Jordan-1-Low-Mauve-Bordeaux-Jaune-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2025/03/Jordan-1-Low-Mauve-Maroc-1.jpg'] },
  { name: 'Air Jordan 1 Low Beige Olive', price: 650, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 189,
    desc: 'La Jordan 1 Low Beige/Gris/Olive. Coloris terre naturelle très tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/09/Air-Jordan-1-Low-Beige-Olive-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/10/Jordan-1-Low-Beige-Olive-Maroc-1.jpg'] },
  { name: 'Air Jordan 1 Low Cream Pink Blue', price: 660, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 212,
    desc: 'La Jordan 1 Low Crème/Rose/Bleu pastel. Coloris féminin et tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/11/Air-Jordan-1-Low-Creme-Rose-Bleu-prix-maroc-1.jpg'] },

  // ── Asics ──────────────────────────────────────────────────────────────────
  { name: 'Asics Gel-Kayano 14 Silver Cream', price: 720, brand: 'Asics', isFeatured: true, rating: 4.9, reviewCount: 345,
    desc: 'La Asics Gel-Kayano 14 Argenté/Crème. Le modèle Y2K qui cartonne en 2024-2025.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/09/Asics-Gel-Kayano-14-Silver-Cream-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/08/Gel-Kayano-14-Silver-Cream-Maroc-1.jpg'] },
  { name: 'Asics Gel-Nimbus 9 Silver Grey', price: 680, brand: 'Asics', isFeatured: false, rating: 4.8, reviewCount: 156,
    desc: 'La Asics Gel-Nimbus 9 Argenté/Gris. Un classique running devenu icône lifestyle.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/01/Asics-Gel-Nimbus-9-Silver-Grey-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2025/02/Gel-Nimbus-9-Silver-Grey-Maroc-1.jpg'] },
  { name: 'Asics Gel-NYC Black Grey', price: 730, brand: 'Asics', isFeatured: false, rating: 4.8, reviewCount: 267,
    desc: 'La Asics Gel-NYC Noir/Gris. Le coloris urbain incontournable de la Gel-NYC.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/07/Asics-Gel-NYC-Black-Grey-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/08/Gel-NYC-Black-Grey-Maroc-1.jpg'] },

  // ── New Balance ────────────────────────────────────────────────────────────
  { name: 'New Balance 1906R Grey Metallic', price: 750, brand: 'New Balance', isFeatured: false, rating: 4.9, reviewCount: 312,
    desc: 'La New Balance 1906R Gris Métallique. Technologie ENCAP et design Y2K premium.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/10/New-Balance-1906R-Grey-Metallic-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/11/1906R-Grey-Metallic-Maroc-1.jpg'] },
  { name: 'New Balance 530 White Silver', price: 640, brand: 'New Balance', isFeatured: false, rating: 4.8, reviewCount: 389,
    desc: 'La New Balance 530 Blanc/Argenté. Le modèle lifestyle iconique en version silver.',
    urls: ['https://itsu.ma/wp-content/uploads/2023/07/New-Balance-530-White-Silver-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2023/08/NB-530-White-Silver-Maroc-1.jpg'] },
  { name: 'New Balance 2002R Protection Pack Grey', price: 720, brand: 'New Balance', isFeatured: false, rating: 4.9, reviewCount: 234,
    desc: 'La New Balance 2002R Protection Pack Gris/Blanc. Édition premium ultra-rare.',
    urls: ['https://itsu.ma/wp-content/uploads/2024/02/New-Balance-2002R-Protection-Pack-Grey-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2024/03/2002R-Protection-Pack-Grey-Maroc-1.jpg'] },

  // ── Saucony ────────────────────────────────────────────────────────────────
  { name: 'Saucony Originals White Pink Silver', price: 660, brand: 'Saucony', isFeatured: false, rating: 4.7, reviewCount: 123,
    desc: 'La Saucony Originals Blanc/Rose/Argent. Design rétro années 2000 très tendance.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/03/Saucony-Originals-White-Pink-Silver-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2025/04/Saucony-White-Pink-Silver-Maroc-1.jpg'] },
  { name: 'Saucony Originals Green Silver', price: 660, brand: 'Saucony', isFeatured: false, rating: 4.7, reviewCount: 98,
    desc: 'La Saucony Originals Vert/Argent. Coloris sporty et frais pour un style Y2K.',
    urls: ['https://itsu.ma/wp-content/uploads/2025/03/Saucony-Originals-Green-Silver-prix-maroc-1.jpg',
           'https://itsu.ma/wp-content/uploads/2025/04/Saucony-Green-Silver-Maroc-1.jpg'] },
];

// ─── Download ───────────────────────────────────────────────────────────────
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://itsu.ma/' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); try { fs.unlinkSync(destPath); } catch(e){}
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); try { fs.unlinkSync(destPath); } catch(e){}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => { try { fs.unlinkSync(destPath); } catch(e){} reject(err); });
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function tryDownload(urls, destPath) {
  for (const url of urls) {
    try {
      await downloadImage(url, destPath);
      const s = fs.statSync(destPath);
      if (s.size > 5000) return url; // valid image (>5KB)
      fs.unlinkSync(destPath);
    } catch (e) { /* try next */ }
  }
  return null;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connecté\n');

  const Category = require('./models/Category');
  const Product = require('./models/Product');
  let sneakers = await Category.findOne({ slug: 'sneakers' });
  if (!sneakers) sneakers = await Category.create({ name: 'Sneakers', slug: 'sneakers', emoji: '👟', description: 'Baskets Premium', order: 1 });

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  let added = 0, skipped = 0, errors = 0;

  for (const p of products) {
    console.log(`📦 ${p.name}`);
    const exists = await Product.findOne({ name: p.name });
    if (exists) { console.log('  ⏭️  Déjà en DB\n'); skipped++; continue; }

    const filename = 'itsu_' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '.jpg';
    const destPath = path.join(UPLOAD_DIR, filename);
    let finalUrl = null;

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      finalUrl = `${BASE_URL}/uploads/${filename}`;
      console.log('  ✅ Image déjà présente');
    } else {
      console.log('  ⬇️  Téléchargement...');
      const usedUrl = await tryDownload(p.urls, destPath);
      if (usedUrl) {
        finalUrl = `${BASE_URL}/uploads/${filename}`;
        console.log(`  ✅ Image OK (${(fs.statSync(destPath).size/1024).toFixed(1)} KB)`);
      } else {
        finalUrl = p.urls[0]; // fallback to source URL
        console.log('  ⚠️  Téléchargement échoué - URL source utilisée');
      }
    }

    try {
      await Product.create({
        name: p.name, price: p.price, brand: p.brand,
        sizes: [38,39,40,41,42,43,44,45], stock: 50,
        rating: p.rating, reviewCount: p.reviewCount,
        isFeatured: p.isFeatured, isActive: true,
        description: p.desc, category: sneakers._id,
        images: [finalUrl],
      });
      console.log(`  ✅ Ajouté !\n`);
      added++;
    } catch (err) {
      console.log(`  ❌ Erreur: ${err.message}\n`);
      errors++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Ajoutés: ${added}  ⏭️  Ignorés: ${skipped}  ❌ Erreurs: ${errors}`);
  console.log('═══════════════════════════════════════');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
