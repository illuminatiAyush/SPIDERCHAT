const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/join/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/text-foreground/g, 'text-spider-black');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed text colors in join/page.tsx');
