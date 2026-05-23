import fs from 'fs';

const cssPath = 'src/app/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

const importRegex = /@import\s+url\([^)]+\);/g;
let imports = [];
let match;
while ((match = importRegex.exec(content)) !== null) {
  imports.push(match[0]);
}

content = content.replace(importRegex, '');
content = imports.join('\n') + '\n\n' + content;

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Fixed globals.css');
