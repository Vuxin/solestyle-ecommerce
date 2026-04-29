const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('itsu.html', 'utf8');
const $ = cheerio.load(html);

const products = [];
const headings = $('h2.title');
headings.each((i, el) => {
    const text = $(el).text().trim();
    if(text === 'Popular Categories' || text === 'Best Sellers' || text === 'Chaussures du Running' || text.length < 5) return;

    const container = $(el).closest('.mfn-queryloop-item-wrapper') || $(el).closest('.mcb-wrap');
    if(!container.length) return;

    let productUrl = container.find('a').attr('href');
    if(!productUrl) {
        productUrl = $(el).closest('a').attr('href') || container.parent().closest('a').attr('href');
    }

    if(productUrl) {
        products.push({
            name: text,
            url: productUrl
        });
    }
});

const unique = [];
const seen = new Set();
products.forEach(p => {
    if(!seen.has(p.name) && !p.url.includes('category') && p.url.includes('/produit/')) {
        seen.add(p.name);
        unique.push(p);
    }
});

fs.writeFileSync('itsu_urls.json', JSON.stringify(unique, null, 2));
console.log(`Saved ${unique.length} URLs to itsu_urls.json`);
