const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProposals, getProposal, createProposal, updateProposal, deleteProposal
} = require('../controllers/proposalController');

router.get('/', auth, getProposals);
router.get('/:id', auth, getProposal);
router.post('/', auth, createProposal);
router.put('/:id', auth, updateProposal);
router.delete('/:id', auth, deleteProposal);

module.exports = router;