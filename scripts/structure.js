// In a new folder named "scripts", create this file: "structure.js"

const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Directories and files to ignore completely.
const ignoreList = [
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'build',
  'out',
  '.DS_Store',
  'package-lock.json',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  '.env.local',
  '.env',
  'scripts' // We don't need to see the script folder itself
];

// --- Main Function ---
function generateStructure(startPath, indent = '') {
  // Check if the current path should be ignored
  if (ignoreList.includes(path.basename(startPath))) {
    return '';
  }

  let structure = '';
  const files = fs.readdirSync(startPath);

  files.forEach((file, index) => {
    // Determine if this is the last item in the directory for tree structure
    const isLast = index === files.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const newIndent = indent + (isLast ? '    ' : '│   ');
    
    const fullPath = path.join(startPath, file);

    // Skip if the file or directory is in the ignore list
    if (ignoreList.includes(file)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    structure += `${indent}${connector}${file}\n`;

    // If it's a directory, recurse into it
    if (stats.isDirectory()) {
      structure += generateStructure(fullPath, newIndent);
    }
  });

  return structure;
}

// --- Execution ---
const projectRoot = path.resolve(__dirname, '..');
const structureOutput = `project\n${generateStructure(projectRoot)}`;

console.log(structureOutput);