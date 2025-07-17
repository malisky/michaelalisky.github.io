const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');

class NewsletterToEmail {
  constructor() {
    this.newsletterDir = './docs/newsletter';
    this.imagesDir = './docs/images';
    this.outputDir = './email-output';
  }

  // Convert a newsletter HTML file to email format
  async convertNewsletterToEmail(newsletterFile) {
    console.log(`Converting ${newsletterFile} to email format...`);
    
    try {
      // Read the newsletter HTML file
      const htmlPath = path.join(this.newsletterDir, newsletterFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Parse HTML with cheerio
      const $ = cheerio.load(htmlContent);
      
      // Inline CSS styles (adds <style> to <head>)
      await this.inlineStyles($);
      // Convert images to base64 (modifies <img> tags in $)
      await this.convertImagesToBase64($);
      
      // Extract title
      const title = $('title').text() || $('h1').first().text() || 'Newsletter';
      // Extract main content (after images/styles are inlined)
      const mainContent = this.extractMainContent($);
      
      // Generate email HTML
      const emailHtml = this.generateEmailHtml($, title, mainContent);
      
      // Create output directory if it doesn't exist
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
      
      // Save the email HTML
      const outputFile = path.join(this.outputDir, `${path.parse(newsletterFile).name}-email.html`);
      fs.writeFileSync(outputFile, emailHtml);
      
      console.log(`✅ Email created: ${outputFile}`);
      return outputFile;
      
    } catch (error) {
      console.error(`❌ Error converting ${newsletterFile}:`, error.message);
      throw error;
    }
  }

  // Extract the main content from the newsletter
  extractMainContent($) {
    // Remove navigation, footer, and other non-content elements
    $('nav, footer, .sticky, .theme-transition, .scroll-top, script').remove();
    
    // Get the featured image if it exists
    const featuredImage = $('.featured-image').html();
    
    // Find the main content area
    let content = $('.newsletter-card, .card, main').html();
    
    if (!content) {
      // Fallback: get body content without header
      $('header').remove();
      content = $('body').html();
    }
    
    // Combine featured image with main content
    let fullContent = '';
    if (featuredImage) {
      fullContent += `<div class="featured-image">${featuredImage}</div>`;
    }
    fullContent += content || 'No content found';
    
    return fullContent;
  }

  // Convert all images to base64 for email embedding
  async convertImagesToBase64($) {
    const imagePromises = [];
    
    $('img').each((index, element) => {
      const $img = $(element);
      const src = $img.attr('src');
      
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        imagePromises.push(this.convertImageToBase64($img, src));
      }
    });
    
    await Promise.all(imagePromises);
  }

  // Convert a single image to base64
  async convertImageToBase64($img, src) {
    try {
      // Handle relative paths
      let imagePath = src;
      if (src.startsWith('../')) {
        imagePath = path.join(this.imagesDir, src.replace('../images/', ''));
      } else if (src.startsWith('/')) {
        imagePath = path.join(this.imagesDir, src.replace('/images/', ''));
      } else {
        imagePath = path.join(this.imagesDir, src);
      }
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  Image not found: ${imagePath}`);
        return;
      }
      
      // Get original image stats
      const stats = fs.statSync(imagePath);
      const originalSize = stats.size;
      
      // Process image with sharp
      let processedBuffer;
      try {
        // Resize image to max 800px width/height while maintaining aspect ratio
        // and compress to JPEG with 80% quality for better email compatibility
        processedBuffer = await sharp(imagePath)
          .resize(800, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        const newSize = processedBuffer.length;
        console.log(`📸 Processed image: ${path.basename(imagePath)} - ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
        
        // Check if processed image is still too large (shouldn't happen with our settings)
        if (newSize > 1024 * 1024) {
          console.warn(`⚠️  Image still too large after processing: ${imagePath}`);
          return;
        }
        
      } catch (sharpError) {
        console.warn(`⚠️  Could not process image with sharp: ${imagePath}`, sharpError.message);
        // Fallback: try to use original image if it's small enough
        if (originalSize <= 1024 * 1024) {
          processedBuffer = fs.readFileSync(imagePath);
        } else {
          console.warn(`⚠️  Skipping large image: ${imagePath}`);
          return;
        }
      }
      
      // Convert to base64
      const base64 = processedBuffer.toString('base64');
      const mimeType = 'image/jpeg'; // We always convert to JPEG for consistency
      
      // Update image src to base64
      $img.attr('src', `data:${mimeType};base64,${base64}`);
      
    } catch (error) {
      console.warn(`⚠️  Could not convert image ${src}:`, error.message);
    }
  }

  // Get MIME type from file extension
  getMimeType(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Inline CSS styles for email compatibility
  async inlineStyles($) {
    // Remove external stylesheets and scripts
    $('link[rel="stylesheet"], script').remove();
    // Remove any existing <style> tags
    $('style').remove();
    // Add basic email-compatible styles as a <style> tag in <head>
    const emailStyles = `body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; } h1, h2, h3 { color: #2c3e50; } .image-container { margin: 20px 0; text-align: center; } .image-container img { max-width: 100%; height: auto; border-radius: 8px; } .image-grid { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; } .image-grid .image-container { flex: 1; min-width: 200px; } a { color: #3498db; text-decoration: none; } a:hover { text-decoration: underline; } .newsletter-card, .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .featured-image { margin-bottom: 20px; } .featured-image img { width: 100%; height: auto; border-radius: 8px; } .newsletter-navigation { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; } .back-to-map { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }`;
    $('head').append(`<style>${emailStyles}</style>`);
  }

  // Generate the final email HTML
  generateEmailHtml($, title, content) {
    // Get the <style> tag as HTML (not just the CSS text)
    const styleTag = $('head style').toString() || '';
    
    // Fix the Map button link in the content
    const fixedContent = content.replace(
      /href="\.\.\/index\.html"/g, 
      'href="https://www.michaelalisky.com"'
    );
    
    // Create a clean email structure
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styleTag}
</head>
<body>
  <div class="email-container">
    <header>
      <h1>${title}</h1>
    </header>
    
    <main>
      ${fixedContent}
    </main>
  </div>
</body>
</html>`;
    return emailHtml;
  }

  // Convert all newsletters in the directory
  async convertAllNewsletters() {
    try {
      const files = fs.readdirSync(this.newsletterDir);
      const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'template.html');
      
      console.log(`Found ${htmlFiles.length} newsletters to convert...`);
      
      for (const file of htmlFiles) {
        await this.convertNewsletterToEmail(file);
      }
      
      console.log('✅ All newsletters converted successfully!');
      
    } catch (error) {
      console.error('❌ Error converting newsletters:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const converter = new NewsletterToEmail();
  
  // Check if a specific file was provided as command line argument
  const specificFile = process.argv[2];
  
  if (specificFile) {
    await converter.convertNewsletterToEmail(specificFile);
  } else {
    await converter.convertAllNewsletters();
  }
}

// Run the program
if (require.main === module) {
  main().catch(console.error);
}

module.exports = NewsletterToEmail; 