import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirsToSearch = ['src/components', 'src/common', 'src/pages-old'];

dirsToSearch.forEach(dir => {
  if (fs.existsSync(dir)) {
    walk(dir, function(filePath) {
      if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace <Link to= with <Link href=
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
        
        // Also any <a> tags might have been used, but we only care about <Link
        // Wait, Link from react-scroll or similar might be affected, let's be careful
        // The regex /<Link([^>]+)to=/g will replace `to` with `href` on any <Link. 
        // react-scroll Link also uses `to=`, so let's check if it's imported from react-scroll.
        if (originalContent.includes('import Link from "next/link"')) {
           fs.writeFileSync(filePath, content, 'utf8');
           console.log('Updated to->href in: ' + filePath);
        }
      }
    });
  }
});
