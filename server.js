const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const net = require('net');
require('dotenv').config();

const app = express();

// Function to find an available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// Use the function to get an available port
findAvailablePort(8080).then(port => {
  const PORT = port;
  
  // Security middleware
  app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // CORS configuration - restrict to specific origins in production
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // Serve static files
  app.use(express.static(path.join(__dirname, 'docs')));

  // Newsletter database file path
  const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

  // Rate limiting for newsletter signup
  const signupAttempts = new Map();
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 3;

  function checkRateLimit(ip) {
    const now = Date.now();
    const attempts = signupAttempts.get(ip) || [];
    
    // Remove old attempts
    const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return false;
    }
    
    recentAttempts.push(now);
    signupAttempts.set(ip, recentAttempts);
    return true;
  }

  // Helper function to read subscribers from file
  function readSubscribers() {
    try {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return default structure
      return { subscribers: [], lastUpdated: new Date().toISOString() };
    }
  }

  // Helper function to write subscribers to file
  function writeSubscribers(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to subscribers file:', error);
      return false;
    }
  }

  // Enhanced email validation
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Enhanced name validation
  function validateName(name) {
    return name && typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
  }

  // API endpoint to handle newsletter signup
  app.post('/api/newsletter-signup', (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many signup attempts. Please try again later.' 
      });
    }
    
    const { email, name } = req.body;
    
    // Enhanced validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }
    
    if (name && !validateName(name)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid name (max 100 characters)' 
      });
    }
    
    try {
      const data = readSubscribers();
      
      // Check if email already exists
      const existingSubscriber = data.subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
      if (existingSubscriber) {
        return res.status(409).json({ 
          success: false, 
          message: 'This email is already subscribed to the newsletter' 
        });
      }
      
      // Add new subscriber
      const newSubscriber = {
        email: email.toLowerCase().trim(),
        name: name ? name.trim() : email.split('@')[0]
      };
      data.subscribers.push(newSubscriber);
      
      // Save to file
      if (writeSubscribers(data)) {
        console.log(`New newsletter subscriber: ${newSubscriber.email} (${newSubscriber.name})`);
        res.json({ 
          success: true, 
          message: 'Successfully subscribed to the newsletter!' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to save subscription. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error processing newsletter signup:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Please try again later.' 
      });
    }
  });

  // Serve index.html for the root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  });

  // Handle all other routes by serving the corresponding HTML files
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'docs')}`);
    console.log(`🌐 Open your browser and navigate to: http://localhost:${PORT}`);
    console.log(`📧 Newsletter signup API available at: http://localhost:${PORT}/api/newsletter-signup`);
    console.log(`🔒 Rate limiting: ${MAX_ATTEMPTS} attempts per ${RATE_LIMIT_WINDOW/60000} minutes`);
  });
}); 