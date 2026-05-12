/**
 * add_products_via_api.js
 * Insère les produits directement via l'API Railway (production)
 * Usage: node add_products_via_api.js
 */

const axios = require('axios');

const API = 'https://solestyle-ecommerce-production.up.railway.app/api';
const ADMIN_EMAIL = 'admin@jbshoes.ma';
const ADMIN_PASSWORD = 'admin123';
const BASE_IMG = 'https://solestyle-ecommerce-production.up.railway.app';

// ── Toutes les images générées par AI ───────────────────────────────────────
const TN_IMGS = [
  `${BASE_IMG}/uploads/gen_tn_black_front.jpg`,
  `${BASE_IMG}/uploads/gen_tn_black_side_left.jpg`,
  `${BASE_IMG}/uploads/gen_tn_black_side_right.jpg`,
  `${BASE_IMG}/uploads/gen_tn_black_back.jpg`,
  `${BASE_IMG}/uploads/gen_tn_black_top.jpg`,
  `${BASE_IMG}/uploads/gen_tn_black_quarter.jpg`,
];
const SAMBA_IMGS = [
  `${BASE_IMG}/uploads/gen_samba_front.jpg`,
  `${BASE_IMG}/uploads/gen_samba_side_left.jpg`,
  `${BASE_IMG}/uploads/gen_samba_back.jpg`,
];
const GEL_NYC_IMGS = [
  `${BASE_IMG}/uploads/gen_gel_nyc_front.jpg`,
  `${BASE_IMG}/uploads/gen_gel_nyc_side_left.jpg`,
  `${BASE_IMG}/uploads/gen_gel_nyc_back.jpg`,
];
const TN_SHARK = [`${BASE_IMG}/uploads/itsu_nike_air_max_plus_tn_shark_attack.jpg`];
const SAMBA_CDG = [`${BASE_IMG}/uploads/itsu_adidas_samba_x_comme_des_garcons.jpg`];
const GEL_NYC_C = [`${BASE_IMG}/uploads/itsu_asics_gel_nyc_cream_clay_grey.jpg`];
const NB1906 = [`${BASE_IMG}/uploads/itsu_new_balance_1906r_x_kith_black.jpg`];
const NB530 = [`${BASE_IMG}/uploads/itsu_new_balance_530_white_grey.jpg`];
const JORDAN = [`${BASE_IMG}/uploads/itsu_nike_air_jordan_1_low_mystic_green.jpg`];
const VOMERO = [`${BASE_IMG}/uploads/itsu_nike_air_zoom_vomero_5_triple_white.jpg`];
const SAUCONY = [`${BASE_IMG}/uploads/itsu_saucony_og_progrid_omni_9_silver_pink.jpg`];
const DEFAULT = [`https://via.placeholder.com/500x500?text=Coming+Soon`];

const SIZES = [38, 39, 40, 41, 42, 43, 44, 45];

const products = [
  // ── Batch 1 (déjà injectés localement) ─────────────────────────────────────
  { name: 'Adidas Samba x Comme des Garçons', price: 690, brand: 'Adidas', isFeatured: false, rating: 4.9, reviewCount: 234, images: SAMBA_CDG, desc: 'La collaboration ultime Adidas Samba x Comme des Garçons. Un classique revisité.' },
  { name: 'Nike Air Max Plus TN Shark Attack', price: 590, brand: 'Nike', isFeatured: true, rating: 4.8, reviewCount: 312, images: TN_SHARK, desc: 'La Nike TN Shark Attack dans son coloris agressif et iconique.' },
  { name: 'Asics Gel-NYC Cream Clay Grey', price: 680, brand: 'Asics', isFeatured: true, rating: 4.9, reviewCount: 189, images: GEL_NYC_C, desc: 'La Asics Gel-NYC dans le coloris Cream Clay Grey. Un coloris vintage élégant.' },
  { name: 'New Balance 1906R x KITH Black', price: 740, brand: 'New Balance', isFeatured: true, rating: 4.9, reviewCount: 156, images: NB1906, desc: 'La collaboration exclusive New Balance 1906R x KITH en coloris Black.' },
  { name: 'Nike Air Jordan 1 Low Mystic Green', price: 660, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 278, images: JORDAN, desc: 'La Jordan 1 Low dans le coloris Mystic Green.' },
  { name: 'Saucony OG ProGrid Omni 9 Silver Pink', price: 680, brand: 'Saucony', isFeatured: false, rating: 4.8, reviewCount: 134, images: SAUCONY, desc: 'La Saucony ProGrid Omni 9 dans son coloris Silver Pink.' },
  { name: 'Nike Air Zoom Vomero 5 Triple White', price: 660, brand: 'Nike', isFeatured: true, rating: 4.9, reviewCount: 203, images: VOMERO, desc: 'La Nike Vomero 5 en Triple White, un classique intemporel.' },
  { name: 'New Balance 530 White Grey', price: 650, brand: 'New Balance', isFeatured: false, rating: 4.7, reviewCount: 321, images: NB530, desc: 'La New Balance 530 dans le coloris White/Grey classique.' },

  // ── Batch 2 ─────────────────────────────────────────────────────────────────
  { name: 'Louis Vuitton LV Trainer Monogram Black', price: 1950, brand: 'Louis Vuitton', isFeatured: false, rating: 4.9, reviewCount: 67, images: DEFAULT, desc: 'Le LV Trainer en monogramme noir. La sneaker de luxe ultime.' },
  { name: 'Louis Vuitton LV Trainer Denim Blue', price: 1980, brand: 'Louis Vuitton', isFeatured: false, rating: 4.9, reviewCount: 45, images: DEFAULT, desc: 'Le LV Trainer en denim bleu avec fourrure blanche.' },
  { name: 'Adidas Sambae x Atmos Pink Denim', price: 720, brand: 'Adidas', isFeatured: true, rating: 4.9, reviewCount: 189, images: SAMBA_IMGS, desc: 'La Sambae en collaboration avec Atmos dans le coloris Pink Denim.' },
  { name: 'Adidas Samba OG Love Edition', price: 690, brand: 'Adidas', isFeatured: true, rating: 4.9, reviewCount: 234, images: SAMBA_IMGS, desc: 'La Samba OG Love Edition en blanc/rouge avec motifs cœurs roses.' },
  { name: 'Adidas Sambae x Liberty London Floral', price: 730, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 112, images: SAMBA_IMGS, desc: 'La Sambae en collab avec Liberty London et ses motifs floraux.' },
  { name: 'Adidas Samba OG Pink Gum', price: 670, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 298, images: SAMBA_IMGS, desc: 'La Samba OG rose clair avec semelle gomme naturelle.' },
  { name: "Adidas Sambae Valentine's Day Mauve", price: 700, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 178, images: SAMBA_IMGS, desc: "La Sambae édition Saint-Valentin dans le coloris Mauve/Lilas translucide." },
  { name: 'Adidas Samba OG Special Edition Silver', price: 710, brand: 'Adidas', isFeatured: false, rating: 4.8, reviewCount: 145, images: SAMBA_IMGS, desc: 'La Samba OG édition spéciale Blanc/Crème avec rayures argentées.' },
  { name: 'Adidas Adizero Boston 12 White Pink', price: 680, brand: 'Adidas', isFeatured: false, rating: 4.7, reviewCount: 167, images: DEFAULT, desc: 'La Adizero Boston 12 Blanc/Rose ultra-performante.' },
  { name: 'Adidas Adilette Mauve Lavande', price: 290, brand: 'Adidas', isFeatured: false, rating: 4.6, reviewCount: 203, images: DEFAULT, desc: 'Les claquettes Adilette dans le coloris Mauve/Lavande pastel.', sizes: [36,37,38,39,40,41,42,43] },
  { name: 'Nike Zoom Vomero 5 Pink Furry', price: 670, brand: 'Nike', isFeatured: true, rating: 4.9, reviewCount: 312, images: TN_IMGS, desc: 'La Nike Vomero 5 Rose "Furry" avec sa texture velours unique.' },
  { name: 'Nike Air Max Plus TN Violet', price: 620, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 267, images: TN_IMGS, desc: 'La Nike TN Air Max Plus en violet intégral.' },
  { name: 'Nike Air Max Plus TN Navy Blue', price: 610, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 334, images: TN_IMGS, desc: 'La Nike TN Air Max Plus Bleu Marine. Un classique indémodable.' },
  { name: 'Nike Air Max Plus TN Cyan', price: 610, brand: 'Nike', isFeatured: false, rating: 4.7, reviewCount: 198, images: TN_IMGS, desc: 'La Nike TN Air Max Plus en cyan vif.' },
  { name: 'Nike Air Max Plus TN Triple Black', price: 590, brand: 'Nike', isFeatured: false, rating: 4.9, reviewCount: 512, images: TN_IMGS, desc: 'La Nike TN Air Max Plus Triple Black. Le coloris le plus iconique.' },
  { name: 'Nike Air Max Plus TN Triple White', price: 590, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 423, images: TN_IMGS, desc: 'La Nike TN Air Max Plus Triple White. La pureté du blanc.' },
  { name: 'Nike Air Max Plus TN Pink Gradient', price: 620, brand: 'Nike', isFeatured: false, rating: 4.8, reviewCount: 289, images: TN_IMGS, desc: 'La Nike TN en dégradé Rose/Blanc.' },
  { name: 'Nike Air Force 1 Low White Classic', price: 490, brand: 'Nike', isFeatured: false, rating: 4.9, reviewCount: 876, images: DEFAULT, desc: "La Nike Air Force 1 Low Triple White. L'intemporel absolu." },
  { name: 'Air Jordan 1 Low Mauve Bordeaux Yellow', price: 650, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 234, images: DEFAULT, desc: 'La Jordan 1 Low dans le mix Mauve/Bordeaux/Jaune.' },
  { name: 'Air Jordan 1 Low Beige Olive', price: 650, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 189, images: DEFAULT, desc: 'La Jordan 1 Low Beige/Gris/Olive. Coloris terre naturelle.' },
  { name: 'Air Jordan 1 Low Cream Pink Blue', price: 660, brand: 'Jordan', isFeatured: false, rating: 4.8, reviewCount: 212, images: DEFAULT, desc: 'La Jordan 1 Low Crème/Rose/Bleu pastel.' },
  { name: 'Asics Gel-Kayano 14 Silver Cream', price: 720, brand: 'Asics', isFeatured: true, rating: 4.9, reviewCount: 345, images: GEL_NYC_IMGS, desc: 'La Asics Gel-Kayano 14 Argenté/Crème. Le modèle Y2K qui cartonne.' },
  { name: 'Asics Gel-Nimbus 9 Silver Grey', price: 680, brand: 'Asics', isFeatured: false, rating: 4.8, reviewCount: 156, images: GEL_NYC_IMGS, desc: 'La Asics Gel-Nimbus 9 Argenté/Gris. Icône lifestyle.' },
  { name: 'Asics Gel-NYC Black Grey', price: 730, brand: 'Asics', isFeatured: false, rating: 4.8, reviewCount: 267, images: GEL_NYC_IMGS, desc: 'La Asics Gel-NYC Noir/Gris. Le coloris urbain incontournable.' },
  { name: 'New Balance 1906R Grey Metallic', price: 750, brand: 'New Balance', isFeatured: false, rating: 4.9, reviewCount: 312, images: DEFAULT, desc: 'La New Balance 1906R Gris Métallique. Technologie ENCAP Y2K.' },
  { name: 'New Balance 530 White Silver', price: 640, brand: 'New Balance', isFeatured: false, rating: 4.8, reviewCount: 389, images: DEFAULT, desc: 'La New Balance 530 Blanc/Argenté.' },
  { name: 'New Balance 2002R Protection Pack Grey', price: 720, brand: 'New Balance', isFeatured: false, rating: 4.9, reviewCount: 234, images: DEFAULT, desc: 'La New Balance 2002R Protection Pack Gris/Blanc.' },
  { name: 'Saucony Originals White Pink Silver', price: 660, brand: 'Saucony', isFeatured: false, rating: 4.7, reviewCount: 123, images: DEFAULT, desc: 'La Saucony Originals Blanc/Rose/Argent. Design rétro Y2K.' },
  { name: 'Saucony Originals Green Silver', price: 660, brand: 'Saucony', isFeatured: false, rating: 4.7, reviewCount: 98, images: DEFAULT, desc: 'La Saucony Originals Vert/Argent. Coloris sporty Y2K.' },
];

async function main() {
  console.log('🔑 Connexion admin...');
  let token;
  try {
    const res = await axios.post(`${API}/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = res.data.token;
    console.log('✅ Token obtenu\n');
  } catch (err) {
    console.error('❌ Login échoué:', err.response?.data || err.message);
    process.exit(1);
  }

  // Get existing product names to skip duplicates
  console.log('📋 Récupération des produits existants...');
  let existingNames = new Set();
  try {
    const res = await axios.get(`${API}/products?limit=500`);
    const prods = res.data.products || res.data;
    prods.forEach(p => existingNames.add(p.name.trim().toLowerCase()));
    console.log(`   → ${existingNames.size} produits déjà en production\n`);
  } catch (err) {
    console.error('⚠️  Impossible de récupérer les produits:', err.message);
  }

  // Get sneakers category
  let categoryId = null;
  try {
    const res = await axios.get(`${API}/categories`);
    const cats = res.data;
    const sneakers = cats.find(c => c.slug === 'sneakers' || c.name.toLowerCase().includes('sneaker'));
    categoryId = sneakers?._id || cats[0]?._id;
    console.log(`📂 Catégorie: ${sneakers?.name || cats[0]?.name} (${categoryId})\n`);
  } catch (err) {
    console.error('⚠️  Catégories:', err.message);
  }

  let added = 0, skipped = 0, errors = 0;
  const headers = { Authorization: `Bearer ${token}` };

  for (const p of products) {
    const key = p.name.trim().toLowerCase();
    if (existingNames.has(key)) {
      console.log(`⏭️  Ignoré (déjà en prod): ${p.name}`);
      skipped++;
      continue;
    }

    try {
      await axios.post(`${API}/products`, {
        name: p.name,
        price: p.price,
        brand: p.brand,
        sizes: p.sizes || SIZES,
        stock: 50,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
        isActive: true,
        description: p.desc,
        category: categoryId,
        images: p.images,
      }, { headers });
      console.log(`✅ Ajouté: ${p.name}`);
      added++;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.log(`❌ Erreur [${p.name}]: ${msg}`);
      errors++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`✅ Ajoutés en PRODUCTION : ${added}`);
  console.log(`⏭️  Ignorés (déjà existants) : ${skipped}`);
  console.log(`❌ Erreurs : ${errors}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n🎉 Rechargez jbshoes.netlify.app pour voir les nouveaux produits !');
}

main().catch(e => { console.error(e); process.exit(1); });
