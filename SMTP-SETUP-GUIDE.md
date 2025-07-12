# SMTP Server Setup Guide

This guide explains how to set up SMTP servers to send your newsletter emails.

## What is SMTP?

**SMTP** (Simple Mail Transfer Protocol) is how computers send emails. Think of it as the postal service for emails:
- Your program = You writing a letter
- SMTP Server = The post office
- Recipients = People receiving your letters

## Option 1: Gmail SMTP (Recommended for beginners)

### Step 1: Enable 2-Step Verification
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Turn on "2-Step Verification" if not already enabled

### Step 2: Create an App Password
1. In Security settings, find "2-Step Verification"
2. Click "App passwords" (at the bottom)
3. Select "Mail" and "Other (Custom name)"
4. Name it "Newsletter Sender"
5. Click "Generate"
6. **Copy the 16-character password** (you'll only see it once!)

### Step 3: Set Environment Variables
Create a `.env` file in your project root:
```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Test the Connection
```bash
npm install
node email-sender.js test
```

## Option 2: Outlook/Hotmail SMTP

### Step 1: Enable App Passwords
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Turn on "Two-step verification" if not enabled
3. Go to "Advanced security options"
4. Create an "App password"

### Step 2: Set Environment Variables
```bash
OUTLOOK_USER=your-email@outlook.com
OUTLOOK_PASSWORD=your-app-password
```

## Option 3: SendGrid (For serious email sending)

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Newsletter Sender"
4. Select "Restricted Access" → "Mail Send"
5. Copy the API key

### Step 3: Set Environment Variables
```bash
SENDGRID_API_KEY=your-api-key-here
```

## Option 4: Your Own SMTP Server

If you have your own domain and hosting:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: 'newsletter@yourdomain.com',
    pass: 'your-password'
  }
});
```

## Environment Variables Setup

### Method 1: .env file (Recommended)
1. Create a `.env` file in your project root
2. Add your credentials:
```bash
# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Outlook
OUTLOOK_USER=your-email@outlook.com
OUTLOOK_PASSWORD=your-password

# SendGrid
SENDGRID_API_KEY=your-api-key
```

3. Install dotenv: `npm install dotenv`
4. Add to the top of your email-sender.js:
```javascript
require('dotenv').config();
```

### Method 2: Command Line (Temporary)
```bash
# Mac/Linux
export GMAIL_USER="your-email@gmail.com"
export GMAIL_APP_PASSWORD="your-app-password"

# Windows
set GMAIL_USER=your-email@gmail.com
set GMAIL_APP_PASSWORD=your-app-password
```

## Testing Your Setup

1. **Test connection:**
```bash
node email-sender.js test
```

2. **List available emails:**
```bash
node email-sender.js list
```

3. **Send a test email:**
```bash
node email-sender.js send baden-email.html "Test Newsletter"
```

## Troubleshooting

### Gmail Issues:
- **"Invalid credentials"**: Make sure you're using an App Password, not your regular password
- **"Less secure app access"**: Use App Passwords instead
- **"Quota exceeded"**: Gmail has daily sending limits (500/day for regular accounts)

### Outlook Issues:
- **"Authentication failed"**: Enable 2FA and use App Password
- **"Connection timeout"**: Check if your network blocks port 587

### SendGrid Issues:
- **"Unauthorized"**: Check your API key
- **"Rate limit"**: Upgrade your plan for higher limits

## Security Best Practices

1. **Never commit credentials to Git**
   - Add `.env` to your `.gitignore` file
   - Use environment variables

2. **Use App Passwords**
   - Don't use your main account password
   - App passwords can be revoked if compromised

3. **Limit sending rates**
   - Don't send too many emails too quickly
   - Respect email provider limits

4. **Monitor your sending**
   - Check your email provider's sending logs
   - Watch for bounces and complaints

## Email Sending Limits

| Provider | Free Tier Limit | Paid Tier |
|----------|----------------|-----------|
| Gmail | 500/day | 2,000/day |
| Outlook | 300/day | 10,000/day |
| SendGrid | 100/day | 100,000+/day |
| Mailgun | 5,000/month | 50,000+/month |

## Next Steps

Once your SMTP is set up:

1. **Create your subscriber list** in `subscribers.json`
2. **Convert your newsletters** using the converter
3. **Test with a small group** first
4. **Send to your full list**

## Example Workflow

```bash
# 1. Convert newsletter to email format
node newsletter-to-email.js baden.html

# 2. Test email connection
node email-sender.js test

# 3. Send to subscribers
node email-sender.js send baden-email.html "Baden Backroads"
```

This setup gives you a complete email sending system for your newsletters! 