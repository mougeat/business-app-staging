const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDB = require('./db/init');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const contactRoutes = require('./routes/contacts');
const communicationRoutes = require('./routes/communications');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Business App API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/communications', communicationRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});