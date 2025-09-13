import express from 'express';
import countdownHandler from './api/countdown.js';

const app = express();

// Root route - redirect to the countdown image
app.get('/', (req, res) => {
  res.redirect('/api/countdown.png');
});

app.get('/api/countdown.png', (req, res) => {
  countdownHandler(req, res);
});

app.get('/api/countdown.gif', (req, res) => {
  countdownHandler(req, res, true); // Pass true for GIF mode
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Countdown running at http://localhost:${PORT}`);
  console.log(`PNG: http://localhost:${PORT}/api/countdown.png`);
  console.log(`GIF: http://localhost:${PORT}/api/countdown.gif`);
});
