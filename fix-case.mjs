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

        // Replace /Common/ with /common/
        // Replace /Components/ with /components/
        // Replace ../Common with ../common
        // Replace ../Components with ../components
        content = content.replace(/(['"])\/?(?:\.\.\/|\.\/)*Common\//g, '$1../common/');
        content = content.replace(/(['"])\/?(?:\.\.\/|\.\/)*Components\//g, '$1../components/');

        // More robust replace for case differences in imports
        content = content.replace(/from\s+['"]([^'"]*)Common([^'"]*)['"]/g, 'from "$1common$2"');
        content = content.replace(/from\s+['"]([^'"]*)Components([^'"]*)['"]/g, 'from "$1components$2"');
        
        if (content !== originalContent) {
           fs.writeFileSync(filePath, content, 'utf8');
           console.log('Fixed cases in: ' + filePath);
        }
      }
    });
  }
});
