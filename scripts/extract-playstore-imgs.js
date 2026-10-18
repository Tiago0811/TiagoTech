const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Windows\\.gemini\\antigravity\\brain\\5c416788-292f-4630-8ef9-b301e909a0bc\\.system_generated\\steps\\2276\\content.md', 'utf-8');

const regex = /<img[^>]+src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["'][^>]*>/g;
let m;
const imgs = [];
while ((m = regex.exec(content)) !== null) {
  imgs.push(m[0]);
}
console.log('Total img tags found:', imgs.length);
console.log(imgs.slice(0, 10));
