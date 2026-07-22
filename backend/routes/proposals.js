const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal
} = require('../controllers/proposalController');

router.route('/')
  .get(protect, getProposals)
  .post(protect, createProposal);

router.route('/:id')
  .get(protect, getProposal)
  .put(protect, updateProposal)
  .delete(protect, deleteProposal);

module.exports = router;
