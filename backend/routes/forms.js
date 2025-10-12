const express = require('express');
const router = express.Router();
const FormConfig = require('../models/FormConfig');

// Public: fetch published form config by key
router.get('/public/:key', async (req, res) => {
  try{
    const { key } = req.params;
    const cfg = await FormConfig.findOne({ key }).lean();
    if(!cfg || cfg.enabled === false){
      return res.json({ enabled:false, key, fields: [] });
    }
    return res.json(cfg);
  }catch(err){
    console.error('Form public get error:', err.message);
    return res.status(500).json({ error: 'Failed to load form config' });
  }
});

// Admin: list all
router.get('/', async (_req, res) => {
  try{
    const items = await FormConfig.find().sort({ key: 1 });
    res.json({ items });
  }catch(err){
    console.error('Form list error:', err.message);
    res.status(500).json({ error: 'Failed to list form configs' });
  }
});

// Admin: get one
router.get('/:id', async (req,res)=>{
  try{
    const item = await FormConfig.findById(req.params.id);
    if(!item) return res.status(404).json({ error:'Not found' });
    res.json(item);
  }catch(err){ res.status(500).json({ error:'Failed to fetch form config' }); }
});

// Admin: create
router.post('/', async (req,res)=>{
  try{
    const created = await FormConfig.create(req.body);
    res.status(201).json(created);
  }catch(err){ res.status(400).json({ error: err.message || 'Failed to create form config' }); }
});

// Admin: update
router.put('/:id', async (req,res)=>{
  try{
    const updated = await FormConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  }catch(err){ res.status(400).json({ error: err.message || 'Failed to update form config' }); }
});

// Admin: delete
router.delete('/:id', async (req,res)=>{
  try{
    await FormConfig.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(400).json({ error: err.message || 'Failed to delete form config' }); }
});

module.exports = router;
