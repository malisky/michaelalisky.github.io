#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to safely replace quotes with q tags
function replaceQuotesWithQTags(content) {
  // Split content into HTML tags and text
  const parts = content.split(/(<[^>]*>)/);
  
  for (let i = 0; i < parts.length; i++) {
    // Skip HTML tags (odd indices)
    if (i % 2 === 1) {
      continue;
    }
    
    // Process text content (even indices)
    let text = parts[i];
    
    // Replace straight quotes with q tags, but be smart about it
    // Look for patterns like: "word" or 'word' but not in HTML contexts
    
    // Replace double quotes that are likely actual quotes
    text = text.replace(/"([^"]{2,})"/g, '<q>$1</q>');
    
    // Replace single quotes that are likely actual quotes
    text = text.replace(/'([^']{2,})'/g, '<q>$1</q>');
    
    parts[i] = text;
  }
  
  return parts.join('');
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replaceQuotesWithQTags(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find HTML files
function findHtmlFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (item !== 'node_modules' && item !== '.git') {
          scan(fullPath);
        }
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || './docs';
const htmlFiles = findHtmlFiles(targetDir);

console.log(`🔍 Found ${htmlFiles.length} HTML files to process...\n`);

for (const file of htmlFiles) {
  processFile(file);
}

console.log(`\n✨ Quote replacement complete!`); 