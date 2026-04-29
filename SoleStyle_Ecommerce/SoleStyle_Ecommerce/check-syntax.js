const fs = require('fs');
const babel = require('@babel/core');

const html = fs.readFileSync('frontend/index.html', 'utf8');
const scriptStart = html.indexOf('<script type="text/babel">') + '<script type="text/babel">'.length;
const scriptEnd = html.lastIndexOf('</script>');
const scriptContent = html.substring(scriptStart, scriptEnd);

try {
  babel.transformSync(scriptContent, {
    presets: ['@babel/preset-react'],
    filename: 'index.jsx'
  });
  console.log('✅ Babel parse SUCCESS');
} catch (e) {
  console.log('❌ Babel parse ERROR:');
  console.log(e.message);
}
