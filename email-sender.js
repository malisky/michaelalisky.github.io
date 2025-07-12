require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class EmailSender {
  constructor() {
    this.emailOutputDir = './email-output';
    this.subscribersFile = './subscribers.json';
  }

  // Create a transporter (email sender) using Gmail
  createGmailTransporter() {
    console.log('Setting up Gmail SMTP...');
    
    // You'll need to create an "App Password" in your Gmail account
    // Go to Google Account > Security > 2-Step Verification > App passwords
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      }
    });

    return transporter;
  }

  // Create a transporter using Outlook/Hotmail
  createOutlookTransporter() {
    console.log('Setting up Outlook SMTP...');
    
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.OUTLOOK_USER || 'your-email@outlook.com',
        pass: process.env.OUTLOOK_PASSWORD || 'your-password'
      }
    });

    return transporter;
  }

  // Create a transporter using SendGrid (paid service)
  createSendGridTransporter() {
    console.log('Setting up SendGrid SMTP...');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey', // This is always 'apikey' for SendGrid
        pass: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key'
      }
    });

    return transporter;
  }

  // Load subscribers from JSON file
  loadSubscribers() {
    try {
      if (fs.existsSync(this.subscribersFile)) {
        const data = fs.readFileSync(this.subscribersFile, 'utf8');
        return JSON.parse(data);
      } else {
        // Create a sample subscribers file
        const sampleSubscribers = {
          subscribers: [
            { email: 'friend1@example.com', name: 'Friend 1' },
            { email: 'friend2@example.com', name: 'Friend 2' },
            { email: 'family@example.com', name: 'Family' }
          ]
        };
        fs.writeFileSync(this.subscribersFile, JSON.stringify(sampleSubscribers, null, 2));
        console.log(`📝 Created sample subscribers file: ${this.subscribersFile}`);
        console.log('Please edit this file with your actual subscribers!');
        return sampleSubscribers;
      }
    } catch (error) {
      console.error('Error loading subscribers:', error.message);
      return { subscribers: [] };
    }
  }

  // Load email HTML content
  loadEmailContent(emailFile) {
    try {
      const emailPath = path.join(this.emailOutputDir, emailFile);
      if (!fs.existsSync(emailPath)) {
        throw new Error(`Email file not found: ${emailPath}`);
      }
      return fs.readFileSync(emailPath, 'utf8');
    } catch (error) {
      console.error('Error loading email content:', error.message);
      throw error;
    }
  }

  // Send newsletter to all subscribers
  async sendNewsletter(transporter, emailFile, subject, fromName = 'Michael Alisky') {
    console.log(`📧 Sending newsletter: ${emailFile}`);
    
    try {
      const subscribers = this.loadSubscribers();
      const emailContent = this.loadEmailContent(emailFile);
      
      if (subscribers.subscribers.length === 0) {
        console.log('⚠️  No subscribers found. Please add subscribers to subscribers.json');
        return;
      }

      console.log(`📬 Sending to ${subscribers.subscribers.length} subscribers...`);

      // Send to each subscriber
      for (const subscriber of subscribers.subscribers) {
        await this.sendToSubscriber(transporter, subscriber, emailContent, subject, fromName);
        
        // Small delay to avoid overwhelming the SMTP server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ Newsletter sent successfully!');

    } catch (error) {
      console.error('❌ Error sending newsletter:', error.message);
      throw error;
    }
  }

  // Send email to a single subscriber
  async sendToSubscriber(transporter, subscriber, emailContent, subject, fromName) {
    try {
      const mailOptions = {
        from: `"${fromName}" <${transporter.options.auth.user}>`,
        to: subscriber.email,
        subject: subject,
        html: emailContent,
        text: this.htmlToText(emailContent) // Fallback for text-only email clients
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${subscriber.email}: ${info.messageId}`);

    } catch (error) {
      console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
    }
  }

  // Convert HTML to plain text (fallback for email clients)
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();
  }

  // Test email connection
  async testConnection(transporter) {
    try {
      console.log('🔍 Testing email connection...');
      await transporter.verify();
      console.log('✅ Email connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Email connection failed:', error.message);
      return false;
    }
  }

  // List available email files
  listAvailableEmails() {
    try {
      if (!fs.existsSync(this.emailOutputDir)) {
        console.log('📁 Email output directory not found. Run the converter first!');
        return [];
      }

      const files = fs.readdirSync(this.emailOutputDir);
      const emailFiles = files.filter(file => file.endsWith('-email.html'));
      
      if (emailFiles.length === 0) {
        console.log('📧 No converted email files found. Run the converter first!');
        return [];
      }

      console.log('📧 Available email files:');
      emailFiles.forEach(file => console.log(`  - ${file}`));
      
      return emailFiles;
    } catch (error) {
      console.error('Error listing email files:', error.message);
      return [];
    }
  }
}

// Main execution
async function main() {
  const sender = new EmailSender();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const emailFile = args[1];
  const subject = args[2] || 'Michael\'s Travel Newsletter';
  
  if (!command) {
    console.log(`
📧 Newsletter Email Sender

Usage:
  node email-sender.js list                    # List available email files
  node email-sender.js send <email-file>       # Send newsletter
  node email-sender.js test                    # Test email connection

Examples:
  node email-sender.js list
  node email-sender.js send baden-email.html "Baden Backroads"
  node email-sender.js test

Setup:
1. Edit subscribers.json with your email list
2. Set environment variables for your email provider:
   - Gmail: GMAIL_USER, GMAIL_APP_PASSWORD
   - Outlook: OUTLOOK_USER, OUTLOOK_PASSWORD
   - SendGrid: SENDGRID_API_KEY
    `);
    return;
  }

  try {
    switch (command) {
      case 'list':
        sender.listAvailableEmails();
        break;
        
      case 'test':
        const transporter = sender.createGmailTransporter();
        await sender.testConnection(transporter);
        break;
        
      case 'send':
        if (!emailFile) {
          console.log('❌ Please specify an email file to send');
          return;
        }
        
        const emailTransporter = sender.createGmailTransporter();
        await sender.sendNewsletter(emailTransporter, emailFile, subject);
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the program
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EmailSender; 