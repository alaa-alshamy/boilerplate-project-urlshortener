require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: false}));

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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UrlShortenerSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }
});
const UrlShortener = mongoose.model('urlshortener', UrlShortenerSchema);

app.post('/api/shorturl', async function(req, res) {
  let result;
  // console.log(req.body.url);
  if (/^https?:\/\/.*$/.test(req.body.url)) {
    const urlsShorteners = await UrlShortener.find({});
    const newUrlShortener = new UrlShortener({
      original_url: req.body.url,
      short_url: urlsShorteners.length + 1
    });
    const newUrlShortenerResult = await newUrlShortener.save();
    result = { original_url: newUrlShortenerResult.original_url, short_url: newUrlShortenerResult.short_url };
  }
  else {
    result = { error: 'invalid url' };
  }
  res.json(result);
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  let urlShortener = await UrlShortener.findOne({ short_url: req.params.short_url });

  if (urlShortener) {
    res.redirect(302, urlShortener.original_url);
  }
  else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
