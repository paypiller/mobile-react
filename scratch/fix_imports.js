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

const THEME_CONSTANTS = ['FontSize', 'FontWeight', 'Spacing', 'BorderRadius', 'Shadows', 'Colors'];

files.forEach(file => {
  if (file.endsWith('theme.ts') || file.endsWith('useTheme.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Fix missing theme imports
  let usedConstants = THEME_CONSTANTS.filter(c => {
    const regex = new RegExp('\\b' + c + '\\b');
    return regex.test(content) && c !== 'Colors';
  });

  if (usedConstants.length > 0) {
    const themePath = getRelativePath(file, path.join(projectRoot, 'src/constants/theme.ts'));
    
    // Remove the broken string import
    const brokenRegex = new RegExp(`'\\.\\./.*?/constants/theme';\\n`, 'g');
    content = content.replace(brokenRegex, '');
    
    // Check if there's already an import from theme.ts
    const existingImportRegex = new RegExp(`import\\s+{[^}]*}\\s+from\\s+['"]` + themePath.replace(/\./g, '\\.') + `['"];?`);
    if (existingImportRegex.test(content)) {
      content = content.replace(existingImportRegex, (match) => {
        let matchResult = match.match(/{([^}]*)}/);
        if (!matchResult) return match;
        let items = matchResult[1].split(',').map(s => s.trim()).filter(Boolean);
        usedConstants.forEach(c => { if (!items.includes(c)) items.push(c); });
        return `import { ${items.join(', ')} } from '${themePath}';`;
      });
    } else {
      // Add the import right below useTheme import or at the top
      content = `import { ${usedConstants.join(', ')} } from '${themePath}';\n` + content;
    }
  }

  // 2. Fix arrow functions (e.g. BottomSheet) that didn't get the injection
  if (file.includes('BottomSheet.tsx') && !content.includes('const { colors: Colors } = useTheme()')) {
    content = content.replace(/(export const BottomSheet.*?=> \{)/, (match) => {
      return match + `\n  const { colors: Colors } = useTheme();\n  const styles = useMemo(() => createStyles(Colors), [Colors]);`;
    });
  }

  // Fix React.useMemo vs useMemo in BottomSheet
  if (file.includes('BottomSheet.tsx') && content.includes('const styles = useMemo')) {
     if (!content.includes('import React, { useMemo }') && content.includes('import React from')) {
         content = content.replace('import React from', 'import React, { useMemo } from');
     }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
