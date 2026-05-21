const fs = require('fs');
const path = require('path');

const projectRoot = 'f:/paypiller/paypiller-mobile';

function getRelativePath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.ts$/, '');
}

const walkSync = function(dir, filelist = []) {
  let files = fs.readdirSync(dir);
  files.forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(projectRoot, 'app')).concat(walkSync(path.join(projectRoot, 'src')));

files.forEach(file => {
  if (file.endsWith('theme.ts') || file.endsWith('useTheme.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Remove useTheme import
  content = content.replace(/import { useTheme } from '[^']+';\n?/g, '');

  // 2. Remove injected lines
  content = content.replace(/\n\s*const { colors: Colors } = useTheme\(\);/g, '');
  content = content.replace(/\n\s*const styles = useMemo\(\(\) => createStyles\(Colors\), \[Colors\]\);/g, '');
  content = content.replace(/\n\s*const styles = React\.useMemo\(\(\) => createStyles\(Colors\), \[Colors\]\);/g, '');

  // 3. Revert createStyles
  content = content.replace(/const createStyles = \(Colors: any\) => StyleSheet\.create/g, 'const styles = StyleSheet.create');

  // Remove broken string imports
  content = content.replace(/^\s*'(\.\.\/)+src\/constants\/theme';\n/gm, '');
  content = content.replace(/^\s*'(\.\.\/)+constants\/theme';\n/gm, '');

  // 4. Restore Colors import and others if missing
  const themePath = getRelativePath(file, path.join(projectRoot, 'src/constants/theme.ts'));
  const themeRegex = new RegExp(`import\\s+{([^}]*)}\\s+from\\s+['"]` + themePath.replace(/\./g, '\\.') + `['"];?`);
  
  const THEME_CONSTANTS = ['FontSize', 'FontWeight', 'Spacing', 'BorderRadius', 'Shadows', 'Colors'];
  let used = THEME_CONSTANTS.filter(c => new RegExp('\\b' + c + '\\b').test(content));

  if (used.length > 0) {
    if (themeRegex.test(content)) {
      content = content.replace(themeRegex, (match, p1) => {
        let items = p1.split(',').map(s => s.trim()).filter(Boolean);
        used.forEach(c => { if (!items.includes(c)) items.push(c); });
        return `import { ${items.join(', ')} } from '${themePath}';`;
      });
    } else {
      // Add the import at the top (after other imports or react import)
      content = content.replace(/(import React.*?from 'react';?)/, `$1\nimport { ${used.join(', ')} } from '${themePath}';`);
      if (content === originalContent) { // fallback
         content = `import { ${used.join(', ')} } from '${themePath}';\n` + content;
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Restored', file);
  }
});
