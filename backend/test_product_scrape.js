const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function scrapeProduct() {
  const url = 'https://itsu.ma/produit/nike-air-force-1-low-stussy-black/';
  const response = await axios.get(url, { httpsAgent });
  const $ = cheerio.load(response.data);
  
  const galleryLinks = [];
  $('.woocommerce-product-gallery img').each((i, el) => {
    galleryLinks.push($(el).attr('data-src') || $(el).attr('data-large_image') || $(el).attr('src'));
  });

  console.log("Found Gallery Links:", galleryLinks);
}

scrapeProduct();
