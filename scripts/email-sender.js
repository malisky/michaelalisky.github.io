require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class EmailSender {
  constructor() {
    this.emailOutputDir = './docs/email-output';
    this.subscribersFile = './subscribers.json';
  }

  // Create a transporter (email sender) using Gmail
  createGmailTransporter() {
    console.log('Setting up Gmail SMTP...');
    
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword) {
      console.error('❌ Missing Gmail credentials!');
      console.error('Please set up your environment variables:');
      console.error('1. Create a .env file in your project root');
      console.error('2. Add the following lines:');
      console.error('   GMAIL_USER=your-email@gmail.com');
      console.error('   GMAIL_APP_PASSWORD=your-app-password');
      console.error('');
      console.error('To get an App Password:');
      console.error('1. Go to Google Account > Security > 2-Step Verification');
      console.error('2. Generate an App Password for this application');
      throw new Error('Missing Gmail credentials');
    }
    
    console.log(`📧 Using Gmail account: ${gmailUser}`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      },
      // Add timeout to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 10000      // 10 seconds
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

  // Load image manifest for inline attachments
  loadImageManifest(emailFile) {
    const manifestFile = path.join(this.emailOutputDir, emailFile.replace('.html', '-images.json'));
    if (!fs.existsSync(manifestFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    } catch (e) {
      console.error('Error reading image manifest:', e.message);
      return [];
    }
  }

  // Prepare attachments for nodemailer
  prepareAttachments(imageManifest) {
    return imageManifest.map(img => {
      // img.src is relative to docs/images-optimized or already relative
      let imagePath = img.src;
      if (imagePath.startsWith('../images-optimized/')) {
        imagePath = path.resolve('docs/images-optimized', imagePath.replace('../images-optimized/', ''));
      } else if (imagePath.startsWith('/images-optimized/')) {
        imagePath = path.resolve('docs/images-optimized', imagePath.replace('/images-optimized/', ''));
      } else {
        imagePath = path.resolve('docs/images-optimized', imagePath);
      }
      return {
        filename: path.basename(imagePath),
        path: imagePath,
        cid: img.cid
      };
    });
  }

  // Send newsletter to all subscribers using BCC, with inline image attachments
  async sendNewsletter(transporter, emailFile, subject, fromName = 'Michael Alisky') {
    console.log(`📧 Sending newsletter: ${emailFile}`);
    try {
      const subscribers = this.loadSubscribers();
      const emailContent = this.loadEmailContent(emailFile);
      const imageManifest = this.loadImageManifest(emailFile);
      const attachments = this.prepareAttachments(imageManifest);
      console.log(`📬 Sending to ${subscribers.subscribers.length} subscribers via BCC...`);
      const bccEmails = subscribers.subscribers.map(sub => sub.email);
      const mailOptions = {
        from: `"${fromName}" <${transporter.options.auth.user}>`,
        to: 'mdalisky7@gmail.com',
        bcc: bccEmails,
        subject: subject,
        html: emailContent,
        text: this.htmlToText(emailContent),
        attachments
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Newsletter sent successfully! Message ID: ${info.messageId}`);
      console.log(`📬 Sent to ${bccEmails.length} subscribers via BCC`);
    } catch (error) {
      console.error('❌ Error sending newsletter:', error.message);
      throw error;
    }
  }

  // Send email to a single subscriber (with inline image attachments)
  async sendToSubscriber(transporter, subscriber, emailFile, subject, fromName) {
    try {
      const emailContent = this.loadEmailContent(emailFile);
      const imageManifest = this.loadImageManifest(emailFile);
      const attachments = this.prepareAttachments(imageManifest);
      const mailOptions = {
        from: `"${fromName}" <${transporter.options.auth.user}>`,
        to: subscriber.email,
        subject: subject,
        html: emailContent,
        text: this.htmlToText(emailContent),
        attachments
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
  const testEmail = args[3]; // e.g., node email-sender.js send kashgar-email.html "Kashgar test" malisky@stanford.edu
  
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
        if (testEmail) {
          // Send only to test email
          await sender.sendToSubscriber(
            emailTransporter,
            { email: testEmail, name: testEmail.split('@')[0] },
            emailFile,
            subject
          );
        } else {
          // Send to all subscribers
          await sender.sendNewsletter(emailTransporter, emailFile, subject);
        }
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