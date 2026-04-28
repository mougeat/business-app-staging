const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDB = require('./db/init');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Business App API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});