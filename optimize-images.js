const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class ImageOptimizer {
  constructor() {
    this.imagesDir = './docs/images';
    this.optimizedDir = './docs/images-optimized';
    this.originalDir = './docs/images-original';
    
    // Optimization settings - high resolution and quality
    this.settings = {
      featured: { width: 2560, height: 1920, quality: 95 },
      content: { width: 1920, height: 1440, quality: 92 },
      thumbnail: { width: 800, height: 600, quality: 88 }
    };
  }

  // Main optimization function
  async optimizeAllImages() {
    console.log('🖼️  Starting image optimization...');
    
    try {
      // Create optimized directory if it doesn't exist
      if (!fs.existsSync(this.optimizedDir)) {
        fs.mkdirSync(this.optimizedDir, { recursive: true });
      }
      
      // Create original backup directory if it doesn't exist
      if (!fs.existsSync(this.originalDir)) {
        fs.mkdirSync(this.originalDir, { recursive: true });
      }
      
      // Process all images recursively
      await this.processDirectory(this.imagesDir);
      
      console.log('✅ Image optimization complete!');
      console.log(`📁 Optimized images saved to: ${this.optimizedDir}`);
      console.log(`📁 Original backups saved to: ${this.originalDir}`);
      
    } catch (error) {
      console.error('❌ Error during optimization:', error.message);
      throw error;
    }
  }

  // Process a directory recursively
  async processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.relative(this.imagesDir, fullPath);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Create corresponding directories in optimized and original folders
        const optimizedSubDir = path.join(this.optimizedDir, relativePath);
        const originalSubDir = path.join(this.originalDir, relativePath);
        
        if (!fs.existsSync(optimizedSubDir)) {
          fs.mkdirSync(optimizedSubDir, { recursive: true });
        }
        if (!fs.existsSync(originalSubDir)) {
          fs.mkdirSync(originalSubDir, { recursive: true });
        }
        
        // Recursively process subdirectory
        await this.processDirectory(fullPath);
      } else if (this.isImageFile(item)) {
        await this.optimizeImage(fullPath, relativePath);
      }
    }
  }

  // Check if file is an image
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  // Optimize a single image
  async optimizeImage(imagePath, relativePath) {
    try {
      const filename = path.basename(imagePath);
      const ext = path.extname(filename).toLowerCase();
      const nameWithoutExt = path.basename(filename, ext);
      
      // Skip if already processed
      const optimizedPath = path.join(this.optimizedDir, relativePath);
      const originalBackupPath = path.join(this.originalDir, relativePath);
      
      // Get original file stats
      const stats = fs.statSync(imagePath);
      const originalSize = stats.size;
      
      console.log(`📸 Processing: ${relativePath} (${(originalSize/1024).toFixed(0)}KB)`);
      
      // Determine optimization settings based on image type/location
      const settings = this.getOptimizationSettings(relativePath);
      
      // Create optimized version
      const optimizedBuffer = await sharp(imagePath)
        .resize(settings.width, settings.height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: settings.quality })
        .toBuffer();
      
      // Create WebP version for modern browsers
      const webpBuffer = await sharp(imagePath)
        .resize(settings.width, settings.height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ quality: settings.quality })
        .toBuffer();
      
      // Save only the WebP version in the optimized folder
      const webpPath = optimizedPath.replace(/\.(jpeg|jpg|png)$/i, '.webp');
      fs.writeFileSync(webpPath, webpBuffer);
      
      // Backup original if not already backed up
      if (!fs.existsSync(originalBackupPath)) {
        fs.copyFileSync(imagePath, originalBackupPath);
      }
      
      const newSize = optimizedBuffer.length;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      
      console.log(`✅ Optimized: ${relativePath} - ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${savings}% smaller)`);
      
    } catch (error) {
      console.warn(`⚠️  Could not optimize ${relativePath}:`, error.message);
    }
  }

  // Determine optimization settings based on image location/name
  getOptimizationSettings(relativePath) {
    const pathLower = relativePath.toLowerCase();
    
    // Featured images (usually the first image in each newsletter)
    if (pathLower.includes('baden1') || pathLower.includes('georgia1') || 
        pathLower.includes('mongolia1') || pathLower.includes('hangzhou1') ||
        pathLower.includes('slovenia1') || pathLower.includes('taiwan1')) {
      return this.settings.featured;
    }
    
    // Thumbnails and small images
    if (pathLower.includes('icon') || pathLower.includes('thumb') || 
        pathLower.includes('small') || pathLower.includes('logo')) {
      return this.settings.thumbnail;
    }
    
    // Default to content images
    return this.settings.content;
  }

  // Generate HTML with optimized images
  async updateHtmlFiles() {
    console.log('🔄 Updating HTML files to use optimized images...');
    
    try {
      // Find all HTML files
      const htmlFiles = this.findHtmlFiles('./docs');
      
      for (const htmlFile of htmlFiles) {
        await this.updateHtmlFile(htmlFile);
      }
      
      console.log('✅ HTML files updated!');
      
    } catch (error) {
      console.error('❌ Error updating HTML files:', error.message);
    }
  }

  // Find all HTML files recursively
  findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...this.findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Update a single HTML file
  async updateHtmlFile(htmlPath) {
    try {
      let content = fs.readFileSync(htmlPath, 'utf8');
      let updated = false;
      
      // Replace image paths to use optimized versions
      const imageRegex = /src="([^"]*\.(jpg|jpeg|png|gif))"/gi;
      
      content = content.replace(imageRegex, (match, imagePath) => {
        // Skip if already optimized or external
        if (imagePath.startsWith('http') || imagePath.includes('images-optimized')) {
          return match;
        }
        
        // Convert to optimized path
        const optimizedPath = imagePath.replace('/images/', '/images-optimized/');
        updated = true;
        
        return `src="${optimizedPath}"`;
      });
      
      if (updated) {
        fs.writeFileSync(htmlPath, content);
        console.log(`📝 Updated: ${htmlPath}`);
      }
      
    } catch (error) {
      console.warn(`⚠️  Could not update ${htmlPath}:`, error.message);
    }
  }

  // Restore original images (if needed)
  async restoreOriginals() {
    console.log('🔄 Restoring original images...');
    
    try {
      if (fs.existsSync(this.originalDir)) {
        // Copy originals back to images directory
        this.copyDirectory(this.originalDir, this.imagesDir);
        console.log('✅ Original images restored!');
      } else {
        console.log('⚠️  No original backups found');
      }
    } catch (error) {
      console.error('❌ Error restoring originals:', error.message);
    }
  }

  // Copy directory recursively
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Main execution
async function main() {
  const optimizer = new ImageOptimizer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'optimize':
      await optimizer.optimizeAllImages();
      await optimizer.updateHtmlFiles();
      break;
      
    case 'restore':
      await optimizer.restoreOriginals();
      break;
      
    case 'update-html':
      await optimizer.updateHtmlFiles();
      break;
      
    default:
      console.log(`
🖼️  Image Optimizer

Usage:
  node optimize-images.js optimize    # Optimize all images and update HTML
  node optimize-images.js restore     # Restore original images
  node optimize-images.js update-html # Update HTML files only

This will:
1. Create optimized versions of all images
2. Generate WebP versions for modern browsers
3. Update HTML files to use optimized images
4. Keep originals for email system
      `);
  }
}

// Run the program
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageOptimizer; 