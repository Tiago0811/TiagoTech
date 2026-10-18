const fs = require('fs');
const https = require('https');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const urls = [
    'https://www.fifplay.com/img/public/efootball-logo-horizontal-white.png',
    'https://logodownload.org/wp-content/uploads/2021/09/efootball-logo-3.png'
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const dest = `assets/img/efootball_logo_${i + 1}.png`;
      await downloadFile(urls[i], dest);
      console.log(`Downloaded ${dest}, size:`, fs.statSync(dest).size);
    } catch (e) {
      console.error(e.message);
    }
  }
}

main();
