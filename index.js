require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to parse JSON
app.use(express.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// In-memory object to store URLs
const urlDatabase = {};
let urlCount = 1;

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Use URL parser to extract hostname and validate
  try {
    const parsedUrl = new URL(originalUrl);

    // Validate DNS (hostname must resolve)
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Store the valid URL and assign a short number
      const shortUrl = urlCount;
      urlDatabase[shortUrl] = originalUrl;
      urlCount++;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (e) {
    // If URL constructor throws an error, it's invalid
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});