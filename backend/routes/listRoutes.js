const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/', listController.list);
router.post('/', listController.create);
router.delete('/:id', listController.delete);
router.post('/:id/add', listController.addContacts); // Add contacts to list
router.get('/:id/contacts', listController.getContacts); // Get contacts of a list

module.exports = router;
