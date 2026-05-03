/**
 * update_360_images.js — Met à jour les produits phares avec les images 360° générées
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/solestyle';
const BASE = 'https://solestyle-ecommerce-production.up.railway.app';

const updates = [
  {
    name: 'Nike Air Max Plus TN Triple Black',
    images: [
      `${BASE}/uploads/gen_tn_black_front.jpg`,
      `${BASE}/uploads/gen_tn_black_side_left.jpg`,
      `${BASE}/uploads/gen_tn_black_side_right.jpg`,
      `${BASE}/uploads/gen_tn_black_back.jpg`,
      `${BASE}/uploads/gen_tn_black_top.jpg`,
      `${BASE}/uploads/gen_tn_black_quarter.jpg`,
    ]
  },
  {
    name: 'Adidas Samba OG Special Edition Silver',
    images: [
      `${BASE}/uploads/gen_samba_front.jpg`,
      `${BASE}/uploads/gen_samba_side_left.jpg`,
      `${BASE}/uploads/gen_samba_back.jpg`,
    ]
  },
  {
    name: 'Asics Gel-NYC Cream Clay Grey',
    images: [
      `${BASE}/uploads/gen_gel_nyc_front.jpg`,
      `${BASE}/uploads/gen_gel_nyc_side_left.jpg`,
      `${BASE}/uploads/gen_gel_nyc_back.jpg`,
    ]
  },
  // Also apply Samba images to other Samba variants
  {
    name: 'Adidas Samba OG Love Edition',
    images: [`${BASE}/uploads/gen_samba_front.jpg`, `${BASE}/uploads/gen_samba_side_left.jpg`, `${BASE}/uploads/gen_samba_back.jpg`]
  },
  {
    name: 'Adidas Samba OG Pink Gum',
    images: [`${BASE}/uploads/gen_samba_front.jpg`, `${BASE}/uploads/gen_samba_side_left.jpg`, `${BASE}/uploads/gen_samba_back.jpg`]
  },
  // TN variants share the same base images
  {
    name: 'Nike Air Max Plus TN Violet',
    images: [`${BASE}/uploads/gen_tn_black_front.jpg`, `${BASE}/uploads/gen_tn_black_side_left.jpg`, `${BASE}/uploads/gen_tn_black_back.jpg`]
  },
  {
    name: 'Nike Air Max Plus TN Navy Blue',
    images: [`${BASE}/uploads/gen_tn_black_front.jpg`, `${BASE}/uploads/gen_tn_black_side_right.jpg`, `${BASE}/uploads/gen_tn_black_back.jpg`]
  },
  {
    name: 'Nike Air Max Plus TN Triple White',
    images: [`${BASE}/uploads/gen_tn_black_front.jpg`, `${BASE}/uploads/gen_tn_black_side_left.jpg`, `${BASE}/uploads/gen_tn_black_top.jpg`]
  },
  {
    name: 'Asics Gel-NYC Black Grey',
    images: [`${BASE}/uploads/gen_gel_nyc_front.jpg`, `${BASE}/uploads/gen_gel_nyc_side_left.jpg`, `${BASE}/uploads/gen_gel_nyc_back.jpg`]
  },
];

async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connecté\n');
  const Product = require('./models/Product');
  let updated = 0;
  for (const u of updates) {
    const res = await Product.updateOne({ name: u.name }, { $set: { images: u.images } });
    if (res.modifiedCount > 0) { console.log(`✅ ${u.name}`); updated++; }
    else console.log(`⚠️  Non trouvé: ${u.name}`);
  }
  console.log(`\n🎉 ${updated} produits mis à jour avec images 360°`);
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
