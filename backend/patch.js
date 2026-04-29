const fs = require('fs');
let content = fs.readFileSync('seed.js', 'utf8');

const replacements = [
  { match: /"name": "Jordan 4 Military Black",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "jordan_4.png" },
  { match: /"name": "Jordan 1 Retro High OG Chicago",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "jordan_1.png" },
  { match: /"name": "Nike Dunk Low Panda",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "nike_dunk_panda.png" },
  { match: /"name": "Adidas Samba OG White Black",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "adidas_samba.png" },
  { match: /"name": "NB 530 White\/Silver Navy",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "nb_530_silver.png" },
  { match: /"name": "Puma Speedcat OG Red",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "puma_speedcat_red.png" },
  { match: /"name": "Salomon XT-6 Black Phantom",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "salomon.png" },
  { match: /"name": "Birkenstock Boston Taupe",[\s\S]*?"images": \["https:\/\/images\.unsplash\.com.*?"\]/g, img: "birkenstock.png" }
];

replacements.forEach(({match, img}) => {
  content = content.replace(match, (substring) => {
    return substring.replace(/"images": \["https:\/\/images\.unsplash\.com.*?"\]/, `"images": ["http://localhost:5000/uploads/${img}"]`);
  });
});

fs.writeFileSync('seed.js', content, 'utf8');
console.log('Patched seed.js successfully.');
