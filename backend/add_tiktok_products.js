/**
 * add_tiktok_products.js
 * Télécharge les images depuis itsu.ma et ajoute les produits TikTok @jb_shoes1
 * Usage: node add_tiktok_products.js
 */

const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/solestyle';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// ─── Products from TikTok @jb_shoes1 with itsu.ma images ───────────────────
const newProducts = [
  {
    name: 'Adidas Samba x Comme des Garçons',
    price: 690,
    brand: 'Adidas',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.9,
    reviewCount: 234,
    isFeatured: false,
    description: 'La collaboration ultime entre Adidas Samba et Comme des Garçons. Un classique revisité avec des détails premium.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2024/10/Adidas-Samba-x-comme-des-garcons-prix-maroc-1.jpg',
    filename: 'itsu_adidas_samba_x_comme_des_garcons.jpg',
  },
  {
    name: 'Nike Air Max Plus TN Shark Attack',
    price: 590,
    brand: 'Nike',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.8,
    reviewCount: 312,
    isFeatured: true,
    description: 'La Nike TN Shark Attack dans son coloris agressif et iconique. Le must-have de la saison.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2025/01/Air-Max-Plus-TN-Shark-Attack-maroc-2.jpg',
    filename: 'itsu_nike_air_max_plus_tn_shark_attack.jpg',
  },
  {
    name: 'Asics Gel-NYC Cream Clay Grey',
    price: 680,
    brand: 'Asics',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.9,
    reviewCount: 189,
    isFeatured: true,
    description: 'La Asics Gel-NYC dans le coloris Cream Clay Grey. Un coloris vintage élégant pour les amateurs de style.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2025/03/Gel-NYC-Cream-Clay-Grey-livraison-tanger-1.jpg',
    filename: 'itsu_asics_gel_nyc_cream_clay_grey.jpg',
  },
  {
    name: 'New Balance 1906R x KITH Black',
    price: 740,
    brand: 'New Balance',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.9,
    reviewCount: 156,
    isFeatured: true,
    description: 'La collaboration exclusive New Balance 1906R x KITH en coloris Black. Édition limitée très recherchée.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2025/07/New-balance-1906R-x-KITH-Black-Prix-1.jpg',
    filename: 'itsu_new_balance_1906r_x_kith_black.jpg',
  },
  {
    name: 'Nike Air Jordan 1 Low Mystic Green',
    price: 660,
    brand: 'Nike',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.8,
    reviewCount: 278,
    isFeatured: false,
    description: 'La Jordan 1 Low dans le coloris Mystic Green, un mix parfait de vert naturel et de blanc cassé.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2025/11/Prix-Air-Jordan-1-Low-Mystic-Green-Marrakech.jpg',
    filename: 'itsu_nike_air_jordan_1_low_mystic_green.jpg',
  },
  {
    name: 'Saucony OG ProGrid Omni 9 Silver Pink',
    price: 680,
    brand: 'Saucony',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.8,
    reviewCount: 134,
    isFeatured: false,
    description: 'La Saucony ProGrid Omni 9 dans son coloris Silver Pink. Un modèle Y2K qui revient en force.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2026/04/Saucony-OG-ProGrid-Omni-9-Silver-Pink-Prix-1.jpg',
    filename: 'itsu_saucony_og_progrid_omni_9_silver_pink.jpg',
  },
  {
    name: 'Nike Air Zoom Vomero 5 Triple White',
    price: 660,
    brand: 'Nike',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.9,
    reviewCount: 203,
    isFeatured: true,
    description: 'La Nike Vomero 5 en Triple White, un classique intemporel pour un look épuré et premium.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2025/09/Air-Zoom-Vomero-5-Triple-White-Maroc.jpg',
    filename: 'itsu_nike_air_zoom_vomero_5_triple_white.jpg',
  },
  {
    name: 'New Balance 530 White Grey',
    price: 650,
    brand: 'New Balance',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    stock: 50,
    rating: 4.7,
    reviewCount: 321,
    isFeatured: false,
    description: 'La New Balance 530 dans le coloris White/Grey classique. Confort et style au quotidien.',
    imageUrl: 'https://itsu.ma/wp-content/uploads/2022/09/New-Balance-530-WhiteGrey-itsu-maroc-1.jpg',
    filename: 'itsu_new_balance_530_white_grey.jpg',
  },
];

// ─── Download image ─────────────────────────────────────────────────────────
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://itsu.ma/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔌 Connexion MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connecté');

  const Category = require('./models/Category');
  const Product = require('./models/Product');

  // Get sneakers category
  let sneakersCat = await Category.findOne({ slug: 'sneakers' });
  if (!sneakersCat) {
    sneakersCat = await Category.create({ name: 'Sneakers', slug: 'sneakers', emoji: '👟', description: 'Baskets Premium', order: 1 });
    console.log('📂 Catégorie Sneakers créée');
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const BASE_URL = 'https://solestyle-ecommerce-production.up.railway.app';
  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const prod of newProducts) {
    console.log(`\n📦 Traitement: ${prod.name}`);

    // Check if already exists
    const existing = await Product.findOne({ name: prod.name });
    if (existing) {
      console.log(`  ⏭️  Déjà dans la DB, ignoré.`);
      skipped++;
      continue;
    }

    const destPath = path.join(UPLOAD_DIR, prod.filename);
    let imageUrl = prod.imageUrl;

    // Download image
    if (!fs.existsSync(destPath)) {
      console.log(`  ⬇️  Téléchargement image...`);
      try {
        await downloadImage(prod.imageUrl, destPath);
        const stats = fs.statSync(destPath);
        console.log(`  ✅ Image téléchargée (${(stats.size / 1024).toFixed(1)} KB)`);
        imageUrl = `${BASE_URL}/uploads/${prod.filename}`;
      } catch (err) {
        console.log(`  ⚠️  Erreur téléchargement: ${err.message}`);
        console.log(`  🔗 Utilisation URL itsu.ma directement`);
        // Use itsu.ma URL as fallback
        imageUrl = prod.imageUrl;
      }
    } else {
      console.log(`  ✅ Image déjà téléchargée`);
      imageUrl = `${BASE_URL}/uploads/${prod.filename}`;
    }

    // Insert product
    try {
      await Product.create({
        name: prod.name,
        price: prod.price,
        brand: prod.brand,
        sizes: prod.sizes,
        stock: prod.stock,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        isFeatured: prod.isFeatured,
        isActive: true,
        description: prod.description,
        category: sneakersCat._id,
        images: [imageUrl],
      });
      console.log(`  ✅ Produit ajouté: ${prod.name}`);
      added++;
    } catch (err) {
      console.log(`  ❌ Erreur insertion: ${err.message}`);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Ajoutés:  ${added}`);
  console.log(`⏭️  Ignorés: ${skipped}`);
  console.log(`❌ Erreurs:  ${errors}`);
  console.log('═══════════════════════════════════════');
  console.log('\n🎉 Terminé ! Rechargez le site pour voir les nouveaux produits.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
