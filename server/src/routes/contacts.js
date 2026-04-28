const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

router.get('/', auth, getContacts);
router.get('/:id', auth, getContact);
router.post('/', auth, createContact);
router.put('/:id', auth, updateContact);
router.delete('/:id', auth, deleteContact);

module.exports = router;