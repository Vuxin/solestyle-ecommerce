const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const lines = html.split('\n');
const offset = lines.findIndex(l => l.includes('text/babel'));
console.log('Offset:', offset);
console.log('Error around:', offset + 880);
