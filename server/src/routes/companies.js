const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');

router.get('/', auth, getCompanies);
router.get('/:id', auth, getCompany);
router.post('/', auth, createCompany);
router.put('/:id', auth, updateCompany);
router.delete('/:id', auth, deleteCompany);

module.exports = router;