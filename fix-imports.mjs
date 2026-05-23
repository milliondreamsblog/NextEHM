import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirsToSearch = ['src/components', 'src/common', 'src/pages-old', 'src/app'];

dirsToSearch.forEach(dir => {
  if (fs.existsSync(dir)) {
    walk(dir, function(filePath) {
      if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace any relative path that ends up pointing to common or components with the @ alias
        // Example: "../common/SectionHeading" -> "@/common/SectionHeading"
        // Example: "../../components/Animations" -> "@/components/Animations"
        // Also handle the ones that still have "Common" or "Components"
        
        content = content.replace(/(['"])(\.\.\/|\.\/)+[Cc]ommon\//g, '$1@/common/');
        content = content.replace(/(['"])(\.\.\/|\.\/)+[Cc]omponents\//g, '$1@/components/');

        if (content !== originalContent) {
           fs.writeFileSync(filePath, content, 'utf8');
           console.log('Fixed imports in: ' + filePath);
        }
      }
    });
  }
});
