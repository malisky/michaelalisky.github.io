const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
// Use a higher port to avoid VPN conflicts
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'docs')));

// Newsletter database file path
const SUBSCRIBERS_FILE = path.join(__dirname, 'newsletter-subscribers.json');

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

// API endpoint to handle newsletter signup
app.post('/api/newsletter-signup', (req, res) => {
  const { email } = req.body;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address' 
    });
  }
  
  try {
    const data = readSubscribers();
    
    // Check if email already exists
    if (data.subscribers.includes(email)) {
      return res.status(409).json({ 
        success: false, 
        message: 'This email is already subscribed to the newsletter' 
      });
    }
    
    // Add new email to subscribers
    data.subscribers.push(email);
    
    // Save to file
    if (writeSubscribers(data)) {
      console.log(`New newsletter subscriber: ${email}`);
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
}); 