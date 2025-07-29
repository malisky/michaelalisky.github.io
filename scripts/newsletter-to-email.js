const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class NewsletterToEmail {
  constructor() {
    this.inputDir = './docs/newsletter';
    this.outputDir = './docs/email-output';
    this.imagesDir = './docs/images-optimized';
  }

  // Finalized CSS block for email
  getEmailCss() {
    return `
<style>
body {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #fff;
  color: #333;
  line-height: 1.6;
  font-size: 95%;
  text-rendering: optimizeLegibility;
}
h1, h2, h3, h4, h5, h6 {
  color: #374151;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.2;
}
h1 { font-size: 2.4rem; margin-top: 2rem; }
h2 { font-size: 1.8rem; margin-top: 1.5rem; }
p { margin-bottom: 1.2rem; }
a {
  color: #0369a1;
  text-decoration: none;
}
a:hover { color: #075985; }
img {
  max-width: 100%;
  height: auto;
  display: block;
}
.featured-image {
  width: 100%;
  margin-bottom: 2rem;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
}
.featured-image img {
  width: 100%;
  height: auto;
  display: block;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}
.image-container {
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #eaeaea;
  margin-bottom: 1.5rem;
}
.image-grid .image-container { margin-bottom: 0; }
.image-container img {
  width: 100%;
  height: auto;
  max-height: 650px;
  object-fit: cover;
  display: block;
}
.poetry-quote {
  background: #f0f0f0;
  border-left: 4px solid #0369a1;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  position: relative;
}
.poetry-quote .chinese {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  color: #333;
}
.poetry-quote .translation {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 0.5rem;
}
.poetry-quote cite {
  font-size: 0.85rem;
  color: #666;
  font-style: normal;
  display: block;
  margin-top: 0.5rem;
}
@media (max-width: 768px) {
  .image-grid { grid-template-columns: 1fr; }
  .featured-image { margin-bottom: 1.5rem; }
}
</style>
`;
  }

  // Replace <img src="..."> with <img src="cid:..."> and collect manifest
  convertImagesToCid(html, imageManifest) {
    let imgIndex = 1;
    return html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      // Only process local images (not http/https)
      if (/^https?:\/\//.test(src)) return match;
      const cid = `img${imgIndex}@newsletter`;
      imageManifest.push({ src, cid });
      imgIndex++;
      return match.replace(src, `cid:${cid}`);
    });
  }

  // Insert CSS into <head>
  insertCssIntoHead(html, cssBlock) {
    return html.replace(/<head>/i, `<head>\n${cssBlock}`);
  }

  async convertSingleNewsletter(filename) {
    if (!filename || !filename.endsWith('.html')) {
      console.error('❌ Please provide a valid HTML filename (e.g., "newsletter.html")');
      return;
    }
    const inputPath = path.join(this.inputDir, filename);
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Newsletter file not found: ${inputPath}`);
      return;
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    const html = fs.readFileSync(inputPath, 'utf8');
    const imageManifest = [];
    let convertedHtml = this.convertImagesToCid(html, imageManifest);
    convertedHtml = this.insertCssIntoHead(convertedHtml, this.getEmailCss());
    const outputFileName = filename.replace('.html', '-email.html');
    const outputPath = path.join(this.outputDir, outputFileName);
    fs.writeFileSync(outputPath, convertedHtml);
    // Write manifest for email sender
    const manifestPath = outputPath.replace('.html', '-images.json');
    fs.writeFileSync(manifestPath, JSON.stringify(imageManifest, null, 2));
    console.log(`✅ Converted and saved: ${outputFileName}`);
    console.log(`📝 Image manifest saved: ${path.basename(manifestPath)}`);
  }

  async convertImagesToBase64(html) {
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let result = html;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const fullMatch = match[0];
      const src = match[1];
      const base64Image = await this.convertImageToBase64(src);
      if (base64Image) {
        result = result.replace(fullMatch, fullMatch.replace(src, base64Image));
      }
    }
    
    return result;
  }

  async convertImageToBase64(src) {
    let imagePath;

    if (src.startsWith('../images-optimized/')) {
      imagePath = path.resolve(src.replace('../images-optimized', this.imagesDir));
    } else if (src.startsWith('/images-optimized/')) {
      imagePath = path.resolve(src.replace('/images-optimized', this.imagesDir));
    } else {
      imagePath = path.resolve(this.imagesDir, src);
    }

    console.warn(`🔍 Attempting to resolve image tag with src="${src}", resolved to "${imagePath}"`);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️ Skipping image tag with src="${src}", resolved to "${imagePath}" (file not found)`);
      return;
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);

      // Convert to JPEG using sharp for better email compatibility
      const jpegBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 85 })
        .toBuffer();

      const base64Image = jpegBuffer.toString('base64');
      const mimeType = 'image/jpeg';

      return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
      console.error(`❌ Error converting image at ${imagePath}:`, error.message);
      return;
    }
  }
}

// Run the script if executed directly
if (require.main === module) {
  const converter = new NewsletterToEmail();
  
  // Get filename from command line arguments
  const filename = process.argv[2];
  
  if (filename) {
    converter.convertSingleNewsletter(filename).catch(console.error);
  } else {
    console.log('Usage: node newsletter-to-email.js <filename.html>');
    console.log('Example: node newsletter-to-email.js kazakhstan.html');
  }
}

module.exports = NewsletterToEmail;
