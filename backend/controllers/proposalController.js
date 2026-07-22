const Proposal = require('../models/Proposal');

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Private (Admin / CRM Role)
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
};

// @desc    Get single proposal
// @route   GET /api/proposals/:id
// @access  Private
exports.getProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Server error fetching proposal' });
  }
};

// @desc    Create new proposal
// @route   POST /api/proposals
// @access  Private
exports.createProposal = async (req, res) => {
  try {
    const proposal = new Proposal(req.body);
    const createdProposal = await proposal.save();
    res.status(201).json(createdProposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Server error creating proposal' });
  }
};

// @desc    Update proposal
// @route   PUT /api/proposals/:id
// @access  Private
exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ message: 'Server error updating proposal' });
  }
};

// @desc    Delete proposal
// @route   DELETE /api/proposals/:id
// @access  Private
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    
    await proposal.deleteOne();
    res.json({ message: 'Proposal removed' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ message: 'Server error deleting proposal' });
  }
};
