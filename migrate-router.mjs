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

        // Replace Link import
        content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"];?/g, 'import Link from "next/link";');
        content = content.replace(/import\s+\{\s*([^}]*?),\s*Link\s*([^}]*?)\}\s+from\s+['"]react-router-dom['"];?/g, 'import { $1 $2 } from "react-router-dom";\nimport Link from "next/link";');
        content = content.replace(/import\s+\{\s*Link\s*,\s*([^}]*?)\}\s+from\s+['"]react-router-dom['"];?/g, 'import { $1 } from "react-router-dom";\nimport Link from "next/link";');

        // Replace useNavigate
        content = content.replace(/import\s+\{\s*useNavigate\s*\}\s+from\s+['"]react-router-dom['"];?/g, 'import { useRouter } from "next/navigation";');
        content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\);?/g, 'const router = useRouter();');
        content = content.replace(/navigate\(/g, 'router.push(');

        // Replace useLocation
        content = content.replace(/import\s+\{\s*useLocation\s*\}\s+from\s+['"]react-router-dom['"];?/g, 'import { usePathname } from "next/navigation";');
        content = content.replace(/const\s+location\s*=\s*useLocation\(\);?/g, 'const pathname = usePathname();');
        content = content.replace(/location\.pathname/g, 'pathname');

        // Replace useParams
        content = content.replace(/import\s+\{\s*useParams\s*\}\s+from\s+['"]react-router-dom['"];?/g, 'import { useParams } from "next/navigation";');

        // Handle multiple imports like: import { useParams, Link, useNavigate } from "react-router-dom";
        // Let's do a catch-all for remaining react-router-dom imports
        if (content.includes('react-router-dom')) {
          content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/g, (match, p1) => {
            let imports = p1.split(',').map(s => s.trim()).filter(s => s);
            let nextNavImports = [];
            let nextLink = false;
            let others = [];
            imports.forEach(imp => {
              if (imp === 'useNavigate') nextNavImports.push('useRouter');
              else if (imp === 'useLocation') nextNavImports.push('usePathname');
              else if (imp === 'useParams') nextNavImports.push('useParams');
              else if (imp === 'Link') nextLink = true;
              else others.push(imp);
            });
            
            let res = '';
            if (nextNavImports.length > 0) {
              res += `import { ${nextNavImports.join(', ')} } from "next/navigation";\n`;
            }
            if (nextLink) {
              res += `import Link from "next/link";\n`;
            }
            if (others.length > 0) {
              res += `import { ${others.join(', ')} } from "react-router-dom";\n`;
            }
            return res.trim();
          });
        }

        if (originalContent !== content) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log('Updated: ' + filePath);
        }
      }
    });
  }
});
