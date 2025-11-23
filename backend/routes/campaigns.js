const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, campaignController.getAllCampaigns);
router.get('/:id', auth, campaignController.getCampaignById);
router.post('/', auth, campaignController.createCampaign);
router.put('/:id', auth, campaignController.updateCampaign);
router.delete('/:id', auth, campaignController.deleteCampaign);

module.exports = router;