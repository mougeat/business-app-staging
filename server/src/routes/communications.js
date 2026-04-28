const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCommunications,
  createCommunication,
  deleteCommunication
} = require('../controllers/communicationController');

router.get('/', auth, getCommunications);
router.post('/', auth, createCommunication);
router.delete('/:id', auth, deleteCommunication);

module.exports = router;