const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/solestyle";
const UPLOADS_DIR = path.join(__dirname, 'uploads');
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
      writer.on('error', err => { error = err; writer.close(); reject(err); });
      writer.on('close', () => { if (!error) resolve(filename); });
    });
  } catch (err) {
    console.warn("Failed to download image:", url);
    return null;
  }
}

async function processGalleries() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connecté pour mise à jour des galeries");

  const urls = JSON.parse(fs.readFileSync('itsu_urls.json', 'utf8'));

  for (let i = 0; i < urls.length; i++) {
    const p = urls[i];
    console.log(`Processing (${i+1}/${urls.length}): ${p.name}`);
    
    // Find the product in our local MongoDB
    const localProduct = await Product.findOne({ name: p.name });
    if (!localProduct) {
        console.log(`Produit non trouvé: ${p.name}`);
        continue;
    }
    
    // Fetch the product page from itsu.ma
    try {
        const response = await axios.get(p.url, { httpsAgent });
        const $ = cheerio.load(response.data);
        const galleryLinks = [];
        
        $('.woocommerce-product-gallery img').each((i, el) => {
             const src = $(el).attr('data-src') || $(el).attr('data-large_image') || $(el).attr('src');
             if(src && !galleryLinks.includes(src)) {
                  galleryLinks.push(src);
             }
        });
        
        // If empty, try fallback
        if (galleryLinks.length === 0) {
            $('.mfn-product-gallery-grid-item img').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if(src && !galleryLinks.includes(src)) galleryLinks.push(src);
            });
        }
        
        console.log(` Found ${galleryLinks.length} images.`);
        const localImages = [];
        for (let j = 0; j < galleryLinks.length; j++) {
            const ext = path.extname(galleryLinks[j].split('?')[0]) || '.jpg';
            let cleanName = p.name.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
            const filename = `itsu_${cleanName}_gallery_${j}${ext}`;
            const downloadedImg = await downloadImage(galleryLinks[j], filename);
            if (downloadedImg) {
                localImages.push(`http://localhost:5000/uploads/${downloadedImg}`);
            }
        }
        
        if (localImages.length > 0) {
            localProduct.images = localImages; // replace with full gallery
            // ensure the main image is still the first one
            await localProduct.save();
        }
    } catch(err) {
        console.error(" Error fetching", p.url, err.message);
    }
  }

  console.log("✅ Mise à jour des galeries terminée!");
  process.exit(0);
}

processGalleries();
