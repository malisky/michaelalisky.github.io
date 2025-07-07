const express = require('express');
const path = require('path');

const app = express();
// Use a higher port to avoid VPN conflicts
const PORT = process.env.PORT || 8080;

// Serve static files from 'docs'
app.use(express.static(path.join(__dirname, 'docs')));

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
}); 