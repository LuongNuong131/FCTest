const express = require('express');
const router = express.Router();
const traitController = require('../controllers/traitController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, traitController.getAllCustomTraits);
router.post('/', protect, adminOnly, traitController.createCustomTrait);
router.put('/:id', protect, adminOnly, traitController.updateCustomTrait);
router.delete('/:id', protect, adminOnly, traitController.deleteCustomTrait);

module.exports = router;
