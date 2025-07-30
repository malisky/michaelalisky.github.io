// Refactored newsletter-to-email.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class NewsletterToEmail {
  constructor() {
    this.inputDir = './docs/newsletter';
    this.outputDir = './docs/email-output';
    this.imagesDir = './docs/images-optimized';
  }

  getEmailCss() {
    return `
<style>
body {
  font-family: 'Space Grotesk', sans-serif;
  background-color: #fff;
  color: #333;
  font-size: 100%;
  line-height: 1.6;
}
@media screen and (min-width: 600px) {
  body {
    font-size: 115%;
  }
}
h1, h2, h3, h4, h5, h6 {
  color: #374151;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1rem;
}
h1 { font-size: 2.4rem; margin-top: 2rem; }
h2 { font-size: 1.8rem; margin-top: 1.5rem; }
p { margin-bottom: 1.2rem; }
a { color: #0369a1; text-decoration: none; }
a:hover { color: #075985; }
img {
  border-radius: 8px;
}
</style>`;
  }

  convertImagesToCid(html, imageManifest, startIndex = 1) {
    let imgIndex = startIndex;
    return html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      if (/^https?:\/\//.test(src)) return match;
      const cid = `img${imgIndex}@newsletter`;
      imageManifest.push({ src, cid });
      imgIndex++;
      return match.replace(src, `cid:${cid}`).replace('<img', '<img style="width:100%;height:auto;display:block;border-radius:8px;"');
    });
  }

  appendWebsiteLink(html) {
    const pattern = /(Until next time,[^<]*)<\/p>/i;
    if (pattern.test(html)) {
      return html.replace(pattern, `$1<br><a href="https://michaelalisky.com" style="color: #0369a1;">https://michaelalisky.com</a></p>`);
    } else {
      return html + `<p><a href="https://michaelalisky.com" style="color: #0369a1;">https://michaelalisky.com</a></p>`;
    }
  }

  replaceImageGridsWithTables(html) {
    return html.replace(/<div class="image-grid">([\s\S]*?)<\/div>/gi, (match, inner) => {
      const imageTags = inner.match(/<img[^>]+>/g);
      if (!imageTags || imageTags.length === 0) return match;

      let tableRows = '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>';
      for (let i = 0; i < imageTags.length; i++) {
        tableRows += `<td width="50%" style="padding: 0 5px 10px 0;">${imageTags[i]}</td>`;
        if (i % 2 === 1 && i !== imageTags.length - 1) tableRows += '</tr><tr>';
      }
      tableRows += '</tr></table>';
      return tableRows;
    });
  }

  extractFeaturedImageBlock(html) {
    const match = html.match(/<div class="featured-image">[\s\S]*?<\/div>/i);
    return match ? match[0] : '';
  }

  removeFeaturedImageBlock(html) {
    return html.replace(/<div class="featured-image">[\s\S]*?<\/div>/i, '');
  }

  extractTitleBlock(html) {
    const match = html.match(/<h1[\s\S]*?<\/h1>/i);
    return match ? match[0] : '';
  }

  removeTitleBlock(html) {
    return html.replace(/<h1[\s\S]*?<\/h1>/i, '');
  }

  wrapInCenteredTable(content) {
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr>
          <td>
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
  }

  wrapFeaturedBlock(content) {
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 2rem;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr>
          <td>
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
  }

  insertCssIntoHead(html, cssBlock) {
    return html.replace(/<head>/i, `<head>\n${cssBlock}`);
  }

  async convertSingleNewsletter(filename) {
    if (!filename || !filename.endsWith('.html')) {
      console.error('❌ Please provide a valid HTML filename');
      return;
    }

    const inputPath = path.join(this.inputDir, filename);
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ File not found: ${inputPath}`);
      return;
    }

    const rawHtml = fs.readFileSync(inputPath, 'utf8');
    const imageManifest = [];

    const titleBlock = this.extractTitleBlock(rawHtml);
    const featuredImageBlock = this.extractFeaturedImageBlock(rawHtml);
    let body = this.removeTitleBlock(this.removeFeaturedImageBlock(rawHtml));

    let titleHtml = this.convertImagesToCid(titleBlock, imageManifest);
    let featuredHtml = this.convertImagesToCid(featuredImageBlock, imageManifest, imageManifest.length + 1);

    let convertedHtml = this.convertImagesToCid(body, imageManifest, imageManifest.length + 1);
    convertedHtml = this.appendWebsiteLink(convertedHtml);
    convertedHtml = this.replaceImageGridsWithTables(convertedHtml);
    convertedHtml = this.wrapInCenteredTable(convertedHtml);

    const wrappedHeader = this.wrapFeaturedBlock(titleHtml + featuredHtml);
    convertedHtml = wrappedHeader + convertedHtml;
    convertedHtml = this.insertCssIntoHead(convertedHtml, this.getEmailCss());

    const outputFileName = filename.replace('.html', '-email.html');
    const outputPath = path.join(this.outputDir, outputFileName);
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });
    fs.writeFileSync(outputPath, convertedHtml);

    const manifestPath = outputPath.replace('.html', '-images.json');
    fs.writeFileSync(manifestPath, JSON.stringify(imageManifest, null, 2));
    console.log(`✅ Saved: ${outputFileName}`);
    console.log(`📝 Manifest: ${path.basename(manifestPath)}`);
  }
}

if (require.main === module) {
  const converter = new NewsletterToEmail();
  const filename = process.argv[2];
  if (filename) converter.convertSingleNewsletter(filename).catch(console.error);
  else console.log('Usage: node newsletter-to-email.js <filename.html>');
}

module.exports = NewsletterToEmail;
