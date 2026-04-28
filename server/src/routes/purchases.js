const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase
} = require('../controllers/purchaseController');

router.get('/', auth, getPurchases);
router.get('/:id', auth, getPurchase);
router.post('/', auth, createPurchase);
router.put('/:id', auth, updatePurchase);
router.delete('/:id', auth, deletePurchase);

module.exports = router;