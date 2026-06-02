const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getRelativeImport(filePath, targetSrcPath) {
  const fileDir = path.dirname(filePath);
  // targetSrcPath is e.g. "src/utilies/constant"
  // We want to resolve it relative to the srcDir
  const targetFullPath = path.join(srcDir, '..', targetSrcPath);
  let relativePath = path.relative(fileDir, targetFullPath).replace(/\\/g, '/');
  
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex to match imports from 'src/...'
  const importRegex = /(import\s+(?:[\w\s{},*]+)\s+from\s+['"])(src\/[^'"]+)(['"])/g;
  content = content.replace(importRegex, (match, p1, p2, p3) => {
    const relativePath = getRelativeImport(filePath, p2);
    modified = true;
    console.log(`In ${path.basename(filePath)}: replaced "${p2}" with "${relativePath}"`);
    return p1 + relativePath + p3;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

console.log('Converting absolute src/ imports to relative imports...');
walk(srcDir);
console.log('Conversion complete!');
