// Simple redirect to the main server
export default function handler(req, res) {
  res.redirect(301, '/api/countdown.png');
}