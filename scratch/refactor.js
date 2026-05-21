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

let updated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file.endsWith('theme.ts') || file.endsWith('useTheme.ts')) return;
  if (content.includes('useTheme()')) return;
  if (!/import\s+{[^}]*?\bColors\b[^}]*?}\s+from/.test(content)) return;

  console.log('Processing', file);

  // 1. Remove Colors from import
  content = content.replace(/(import\s+{[^}]*?)(\bColors\b,?)\s*([^}]*?}\s+from)/g, (match, p1, p2, p3) => {
    let newImport = (p1 + p3).replace(/{\s*,/, '{').replace(/,\s*}/, '}').replace(/{\s*}/, '');
    return newImport.includes('from') && !newImport.match(/{.*?}/) ? '' : newImport;
  });
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\n?/g, '');

  // 2. Add useTheme hook import
  const hookPath = getRelativePath(file, path.join(projectRoot, 'src/hooks/useTheme.ts'));
  content = `import { useTheme } from '${hookPath}';\n` + content;

  // 3. Ensure useMemo is imported from react if there is StyleSheet.create
  const hasStyleSheet = /const styles = StyleSheet\.create/.test(content);
  if (hasStyleSheet && !/useMemo/.test(content)) {
    if (/import\s+React.*?from\s+'react'/.test(content)) {
      content = content.replace(/(import\s+React.*?)(from\s+'react')/, (match, p1, p2) => {
        if (p1.includes('{')) {
          return p1.replace('{', '{ useMemo, ') + p2;
        } else {
          return p1.trim() + ', { useMemo } ' + p2;
        }
      });
    } else {
      content = `import React, { useMemo } from 'react';\n` + content;
    }
  }

  // 4. Inject into the main component
  content = content.replace(/(export(?:\s+default)?\s+function\s+[A-Z]\w*\s*\([^)]*\)\s*\{)/g, (match) => {
    let injection = `\n  const { colors: Colors } = useTheme();`;
    if (hasStyleSheet) {
      injection += `\n  const styles = useMemo(() => createStyles(Colors), [Colors]);`;
    }
    return match + injection;
  });

  // 5. Rename StyleSheet.create
  if (hasStyleSheet) {
    content = content.replace(/const styles = StyleSheet\.create/g, 'const createStyles = (Colors: any) => StyleSheet.create');
  }

  fs.writeFileSync(file, content);
  updated++;
});

console.log('Updated', updated, 'files');
