// Simplified and safer email-sender.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class EmailSender {
  constructor() {
    this.emailOutputDir = './docs/email-output';
    this.subscribersFile = './subscribers.json';
  }

  createGmailTransporter() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPassword) throw new Error('Missing Gmail credentials in .env');

    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPassword },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }

  loadSubscribers() {
    if (!fs.existsSync(this.subscribersFile)) throw new Error('No subscribers.json file found');
    return JSON.parse(fs.readFileSync(this.subscribersFile, 'utf8')).subscribers;
  }

  loadEmailContent(emailFile) {
    const filePath = path.join(this.emailOutputDir, emailFile);
    if (!fs.existsSync(filePath)) throw new Error(`Email file not found: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  }

  loadImageManifest(emailFile) {
    const manifestPath = path.join(this.emailOutputDir, emailFile.replace('.html', '-images.json'));
    return fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
  }

  prepareAttachments(imageManifest) {
    return imageManifest.map(({ src, cid }) => {
      const cleanPath = src.replace(/^.*images-optimized\//, '');
      return {
        filename: path.basename(cleanPath),
        path: path.resolve('docs/images-optimized', cleanPath),
        cid
      };
    });
  }

  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, '').trim();
  }

  async send(transporter, { to, bcc = [], subject, html, attachments }) {
    const from = transporter.options.auth.user;
    const text = this.htmlToText(html);
    const mailOptions = { from, to, bcc, subject, html, text, attachments };
    return transporter.sendMail(mailOptions);
  }

  async confirmAndSendAll(transporter, emailFile, subject) {
    const subscribers = this.loadSubscribers();
    const confirmation = await this.confirmMassSend(subscribers.length);
    if (!confirmation) return;
    const html = this.loadEmailContent(emailFile);
    const attachments = this.prepareAttachments(this.loadImageManifest(emailFile));
    const result = await this.send(transporter, {
      to: process.env.GMAIL_USER,
      bcc: subscribers.map(sub => sub.email),
      subject,
      html,
      attachments
    });
    console.log(`✅ Sent to all (${subscribers.length}) via BCC. Message ID: ${result.messageId}`);
  }

  async sendToOne(transporter, recipient, emailFile, subject) {
    const html = this.loadEmailContent(emailFile);
    const attachments = this.prepareAttachments(this.loadImageManifest(emailFile));
    const result = await this.send(transporter, {
      to: recipient,
      subject,
      html,
      attachments
    });
    console.log(`✅ Sent to ${recipient}. Message ID: ${result.messageId}`);
  }

  async confirmMassSend(count) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
      rl.question(`⚠️ Are you sure you want to send to ALL ${count} subscribers? (yes/no): `, answer => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });
  }
}

(async () => {
  const sender = new EmailSender();
  const [_, __, emailFile, subject = 'Michael\'s Travel Newsletter', recipient] = process.argv;
  if (!emailFile) return console.error('❌ Please specify an email file.');

  const transporter = sender.createGmailTransporter();
  if (recipient) {
    await sender.sendToOne(transporter, recipient, emailFile, subject);
  } else {
    await sender.confirmAndSendAll(transporter, emailFile, subject);
  }
})();
