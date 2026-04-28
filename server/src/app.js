const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDB = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Business App API is running 🚀' });
});

// Init DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
