# Newsletter to Email Converter

This program converts your HTML newsletters into email-compatible format that can be sent to subscribers.

## What it does:

1. **Parses HTML newsletters** - Extracts content, images, and styling
2. **Converts images to base64** - Embeds images directly in the email (no external dependencies)
3. **Inlines CSS styles** - Makes styles email-client compatible
4. **Removes JavaScript** - Email clients don't support JavaScript
5. **Generates clean email HTML** - Ready to send via any email service

## Installation

1. Install Node.js dependencies:
```bash
npm install
```

## Usage

### Convert all newsletters:
```bash
npm run convert
```

### Convert a specific newsletter:
```bash
npm run convert-one baden.html
```

Or directly:
```bash
node newsletter-to-email.js baden.html
```

### Test with a single newsletter:
```bash
npm test
```

## Output

The program creates an `email-output/` directory with converted newsletters:
- `baden-email.html`
- `georgia-email.html`
- etc.

## How it works:

### 1. HTML Parsing
- Uses Cheerio (like jQuery for Node.js) to parse your newsletter HTML
- Extracts the main content while removing navigation, scripts, and other web-specific elements

### 2. Image Conversion
- Finds all `<img>` tags in your newsletter
- Converts local images to base64 format (embedded directly in the email)
- Handles relative paths like `../images/baden/baden1.jpeg`

### 3. Style Inlining
- Removes external CSS files (email clients ignore them)
- Adds email-compatible inline styles
- Ensures your newsletter looks good across different email clients

### 4. Email Structure
- Creates a clean HTML structure optimized for email
- Adds a professional footer with your social links
- Maintains responsive design for mobile email clients

## Email Client Compatibility

The converted emails work with:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Most mobile email apps

## Next Steps

Once you have the email HTML files, you can:

1. **Use an email service** like Mailchimp, SendGrid, or ConvertKit
2. **Send via your own SMTP server** using Node.js email libraries
3. **Test the emails** in different email clients before sending

## Example Output

The converted email will look like your newsletter but with:
- All images embedded (no broken links)
- Clean, email-friendly styling
- Professional footer
- Mobile-responsive design

## Troubleshooting

- **Missing images**: Check that image paths in your newsletters are correct
- **Large file sizes**: Base64 images increase file size significantly
- **Style issues**: Some advanced CSS may not work in all email clients

## Customization

You can modify the `inlineStyles()` method in `newsletter-to-email.js` to change the email styling, or update the `generateEmailHtml()` method to modify the email structure. 