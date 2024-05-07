import express from 'express';
import fetch from 'node-fetch';
import { parseString } from 'xml2js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route to fetch transcript for a video
app.get('/transcript/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const response = await fetch(`https://video.google.com/timedtext?lang=en&v=${videoId}`);
    if (!response.ok) {
      throw new Error('Transcript not available');
    }
    const data = await response.text();
    parseString(data, (err, result) => {
      if (err) {
        throw new Error('Error parsing transcript');
      }
      const transcript = result.transcript.text.map(textNode => textNode._).join(' ');
      res.json({ videoId, transcript });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
