import express from 'express';
import countdownHandler from './api/countdown.js';

const app = express();

app.get('/api/countdown.png', (req, res) => {
  countdownHandler(req, res);
});

app.get('/api/countdown.gif', (req, res) => {
  countdownHandler(req, res, true); // Pass true for GIF mode
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Countdown running at http://localhost:${PORT}/api/countdown.png`);
});
