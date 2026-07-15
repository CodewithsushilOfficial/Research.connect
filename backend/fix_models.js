const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace standard imports
  content = content.replace(/import (\w+) from '([^']+)';/g, "const $1 = require('$2');");
  // Replace destructured imports
  content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*'([^']+)';/g, "const { $1 } = require('$2');");
  // Replace export default
  content = content.replace(/export default (\w+);/g, "module.exports = $1;");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      fixFile(fullPath);
    }
  }
}

processDirectory(modelsDir);
console.log('Done fixing models!');
