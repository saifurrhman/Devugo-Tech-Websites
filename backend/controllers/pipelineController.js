const Pipeline = require('../models/Pipeline');
const EmailRecipient = require('../models/EmailRecipient');

class PipelineController {

  /**
   * Get all pipelines
   */
  async getAllPipelines(req, res) {
    try {
      const { type, isActive } = req.query;

      const query = {};
      if (type) query.type = type;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const pipelines = await Pipeline.find(query)
        .populate('createdBy', 'name email')
        .sort({ isDefault: -1, createdAt: -1 });

      res.json({
        success: true,
        data: pipelines
      });

    } catch (error) {
      console.error('Get pipelines error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pipelines',
        error: error.message
      });
    }
  }

  /**
   * Get single pipeline
   */
  async getPipelineById(req, res) {
    try {
      const { id } = req.params;

      const pipeline = await Pipeline.findById(id)
        .populate('createdBy', 'name email')
        .populate('stages.autoAssign', 'name email');

      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      // Get leads in each stage
      const stageStats = await Promise.all(
        pipeline.stages.map(async (stage) => {
          const count = await EmailRecipient.countDocuments({
            pipelineStage: stage._id
          });
          return {
            stageId: stage._id,
            stageName: stage.name,
            leadCount: count
          };
        })
      );

      res.json({
        success: true,
        data: {
          ...pipeline.toObject(),
          stageStats
        }
      });

    } catch (error) {
      console.error('Get pipeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pipeline',
        error: error.message
      });
    }
  }

  /**
   * Create new pipeline
   */
  async createPipeline(req, res) {
    try {
      const {
        name,
        description,
        type,
        stages,
        settings,
        isDefault
      } = req.body;

      // Validate stages
      if (!stages || stages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pipeline must have at least one stage'
        });
      }

      // Ensure stages have proper order
      const orderedStages = stages.map((stage, index) => ({
        ...stage,
        order: stage.order || index + 1
      }));

      const pipeline = new Pipeline({
        name,
        description,
        type: type || 'sales',
        stages: orderedStages,
        settings,
        isDefault: isDefault || false,
        createdBy: req.user._id
      });

      await pipeline.save();

      res.status(201).json({
        success: true,
        message: 'Pipeline created successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Create pipeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating pipeline',
        error: error.message
      });
    }
  }

  /**
   * Update pipeline
   */
  async updatePipeline(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      // If updating stages, ensure proper order
      if (updateData.stages) {
        updateData.stages = updateData.stages.map((stage, index) => ({
          ...stage,
          order: stage.order || index + 1
        }));
      }

      Object.assign(pipeline, updateData);
      await pipeline.save();

      res.json({
        success: true,
        message: 'Pipeline updated successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Update pipeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating pipeline',
        error: error.message
      });
    }
  }

  /**
   * Add stage to pipeline
   */
  async addStage(req, res) {
    try {
      const { id } = req.params;
      const stageData = req.body;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      await pipeline.addStage(stageData);

      res.json({
        success: true,
        message: 'Stage added successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Add stage error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding stage',
        error: error.message
      });
    }
  }

  /**
   * Update stage
   */
  async updateStage(req, res) {
    try {
      const { id, stageId } = req.params;
      const updateData = req.body;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      const stage = pipeline.stages.id(stageId);
      if (!stage) {
        return res.status(404).json({
          success: false,
          message: 'Stage not found'
        });
      }

      Object.assign(stage, updateData);
      await pipeline.save();

      res.json({
        success: true,
        message: 'Stage updated successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Update stage error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stage',
        error: error.message
      });
    }
  }

  /**
   * Delete stage
   */
  async deleteStage(req, res) {
    try {
      const { id, stageId } = req.params;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      // Check if any leads are in this stage
      const leadsInStage = await EmailRecipient.countDocuments({
        pipelineStage: stageId
      });

      if (leadsInStage > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete stage with ${leadsInStage} leads. Move leads first.`
        });
      }

      pipeline.stages.pull(stageId);
      await pipeline.save();

      res.json({
        success: true,
        message: 'Stage deleted successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Delete stage error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting stage',
        error: error.message
      });
    }
  }

  /**
   * Reorder stages
   */
  async reorderStages(req, res) {
    try {
      const { id } = req.params;
      const { stageOrders } = req.body; // Array of { stageId, newOrder }

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      await pipeline.reorderStages(stageOrders);

      res.json({
        success: true,
        message: 'Stages reordered successfully',
        data: pipeline
      });

    } catch (error) {
      console.error('Reorder stages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reordering stages',
        error: error.message
      });
    }
  }

  /**
   * Get leads by stage
   */
  async getLeadsByStage(req, res) {
    try {
      const { id, stageId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      const stage = pipeline.stages.id(stageId);
      if (!stage) {
        return res.status(404).json({
          success: false,
          message: 'Stage not found'
        });
      }

      const skip = (page - 1) * limit;

      const [leads, total] = await Promise.all([
        EmailRecipient.find({ pipelineStage: stageId })
          .populate('campaigns.campaign', 'name')
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        EmailRecipient.countDocuments({ pipelineStage: stageId })
      ]);

      res.json({
        success: true,
        data: {
          stage: stage.name,
          leads,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get leads by stage error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching leads',
        error: error.message
      });
    }
  }

  /**
   * Move lead to different stage
   */
  async moveLeadToStage(req, res) {
    try {
      const { id, stageId } = req.params;
      const { leadId, notes } = req.body;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      const stage = pipeline.stages.id(stageId);
      if (!stage) {
        return res.status(404).json({
          success: false,
          message: 'Stage not found'
        });
      }

      const lead = await EmailRecipient.findById(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      const oldStageId = lead.pipelineStage;

      // Update lead stage
      lead.pipelineStage = stageId;

      // Update lead status based on stage
      if (stage.isWon) {
        lead.leadStatus = 'converted';
      } else if (stage.isLost) {
        lead.leadStatus = 'not_interested';
      } else if (stage.isFinal) {
        lead.leadStatus = 'qualified';
      }

      // Add note if provided
      if (notes) {
        lead.notes.push({
          text: `Moved to ${stage.name}: ${notes}`,
          createdBy: req.user._id
        });
      }

      await lead.save();

      // Update stage stats
      if (oldStageId) {
        const oldStage = pipeline.stages.id(oldStageId);
        if (oldStage && oldStage.totalLeads > 0) {
          oldStage.totalLeads -= 1;
        }
      }

      stage.totalLeads += 1;
      await pipeline.save();

      res.json({
        success: true,
        message: 'Lead moved successfully',
        data: lead
      });

    } catch (error) {
      console.error('Move lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Error moving lead',
        error: error.message
      });
    }
  }

  /**
   * Delete pipeline
   */
  async deletePipeline(req, res) {
    try {
      const { id } = req.params;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      // Check if any leads are using this pipeline
      const leadsInPipeline = await EmailRecipient.countDocuments({
        pipelineStage: { $in: pipeline.stages.map(s => s._id) }
      });

      if (leadsInPipeline > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete pipeline with ${leadsInPipeline} leads`
        });
      }

      await pipeline.remove();

      res.json({
        success: true,
        message: 'Pipeline deleted successfully'
      });

    } catch (error) {
      console.error('Delete pipeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting pipeline',
        error: error.message
      });
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(req, res) {
    try {
      const { id } = req.params;

      const pipeline = await Pipeline.findById(id);
      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      const stats = await Promise.all(
        pipeline.stages.map(async (stage) => {
          const leads = await EmailRecipient.find({ pipelineStage: stage._id });

          return {
            stageId: stage._id,
            stageName: stage.name,
            order: stage.order,
            color: stage.color,
            totalLeads: leads.length,
            newLeads: leads.filter(l => l.leadStatus === 'new').length,
            qualifiedLeads: leads.filter(l => l.leadStatus === 'qualified').length,
            convertedLeads: leads.filter(l => l.leadStatus === 'converted').length
          };
        })
      );

      const totalLeads = stats.reduce((sum, s) => sum + s.totalLeads, 0);
      const conversionRate = totalLeads > 0
        ? (stats.reduce((sum, s) => sum + s.convertedLeads, 0) / totalLeads) * 100
        : 0;

      res.json({
        success: true,
        data: {
          pipeline: {
            id: pipeline._id,
            name: pipeline.name,
            type: pipeline.type
          },
          totalLeads,
          conversionRate: conversionRate.toFixed(2),
          stages: stats
        }
      });

    } catch (error) {
      console.error('Get pipeline stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
  /**
   * Get all deals (leads) with stages
   * Mapped to /api/pipeline/deals
   */
  async getLeads(req, res) {
    try {
      const { pipelineId, stageId } = req.query;
      const query = { pipelineStage: { $exists: true, $ne: null } };

      if (stageId) query.pipelineStage = stageId;

      const leads = await EmailRecipient.find(query)
        .sort({ updatedAt: -1 })
        .populate('addedBy', 'name');

      // Map to "Deal" format expected by frontend
      const deals = leads.map(lead => ({
        id: lead._id,
        title: lead.company || lead.name || lead.email,
        value: lead.customFields?.value || '$0', // Assuming value is stored in customFields
        stageId: lead.pipelineStage,
        contact: lead.name || lead.email.split('@')[0],
        date: new Date(lead.updatedAt).toLocaleDateString(),
        ...lead.toObject()
      }));

      res.json(deals); // Return array directly as expected by frontend Promise.all destructuring

    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({ error: 'Failed to fetch deals' });
    }
  }

  /**
   * Get stages for pipeline
   * Mapped to /api/pipeline/stages
   */
  async getStages(req, res) {
    try {
      // Get default pipeline or first available
      const pipeline = await Pipeline.findOne({ isDefault: true }) || await Pipeline.findOne();

      if (!pipeline) {
        // Return default structure if no pipeline exists in DB
        return res.json([
          { id: 'new', name: 'New Leads', color: 'blue', items: [] },
          { id: 'qualified', name: 'Qualified', color: 'purple', items: [] },
          { id: 'proposal', name: 'Proposal Sent', color: 'yellow', items: [] },
          { id: 'negotiation', name: 'Negotiation', color: 'orange', items: [] },
          { id: 'won', name: 'Closed Won', color: 'green', items: [] },
        ]);
      }

      // Map DB stages to frontend format
      const stages = pipeline.stages.map(stage => ({
        id: stage._id,
        name: stage.name,
        color: stage.color || 'blue',
        order: stage.order,
        items: [] // Will be populated by frontend logic
      }));

      res.json(stages);

    } catch (error) {
      console.error('Get stages error:', error);
      res.status(500).json({ error: 'Failed to fetch stages' });
    }
  }
}

module.exports = new PipelineController();