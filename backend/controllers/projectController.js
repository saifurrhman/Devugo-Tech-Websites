const Project = require('../models/Project');
const EmailRecipient = require('../models/EmailRecipient');
const Invoice = require('../models/Invoice');
const Meeting = require('../models/Meeting');

class ProjectController {

  /**
   * Get all projects
   */
  async getAllProjects(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        client,
        assignedTo,
        healthStatus, 
        startDate,
        endDate,
        search
      } = req.query;

      const query = {};

      // Filters
      if (status) query.status = status;
      if (client) query.client = client;
      if (assignedTo) query.assignedTo = assignedTo;
      if (healthStatus) query.healthStatus = healthStatus;

      // Date range
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }

      // Search
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      const skip = (page - 1) * limit;

      const [projects, total] = await Promise.all([
        Project.find(query)
          .populate('client', 'email fullName company')
          .populate('assignedTo', 'name email')
          .populate('projectManager', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Project.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching projects',
        error: error.message
      });
    }
  }

  /**
   * Get single project
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id)
        .populate('client')
        .populate('assignedTo', 'name email')
        .populate('projectManager', 'name email')
        .populate('invoices')
        .populate('meetings')
        .populate('notes.createdBy', 'name email')
        .populate('sourceCampaign', 'name');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Update health status
      project.updateHealthStatus();
      await project.save();

      res.json({
        success: true,
        data: project
      });

    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project',
        error: error.message
      });
    }
  }

  /**
   * Create new project
   */
  async createProject(req, res) {
    try {
      const {
        title,
        description,
        projectType,
        client,
        status,
        startDate,
        expectedDelivery,
        budget,
        requirements,
        milestones,
        assignedTo,
        projectManager
      } = req.body;

      // Validate client exists
      const clientData = await EmailRecipient.findById(client);
      if (!clientData) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      const project = new Project({
        title,
        description,
        projectType,
        client,
        clientContact: {
          email: clientData.email,
          phone: clientData.phone,
          whatsapp: clientData.whatsapp
        },
        status: status || 'lead',
        startDate,
        expectedDelivery,
        budget,
        requirements: requirements || [],
        milestones: milestones || [],
        assignedTo: assignedTo || [],
        projectManager,
        createdBy: req.user._id
      });

      await project.save();

      // Update client lead status
      clientData.leadStatus = 'qualified';
      await clientData.save();

      const populatedProject = await Project.findById(project._id)
        .populate('client')
        .populate('assignedTo', 'name email')
        .populate('projectManager', 'name email');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: populatedProject
      });

    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating project',
        error: error.message
      });
    }
  }

  /**
   * Update project
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      updateData.lastUpdatedBy = req.user._id;
      Object.assign(project, updateData);

      // Update health status
      project.updateHealthStatus();

      await project.save();

      const updatedProject = await Project.findById(id)
        .populate('client')
        .populate('assignedTo', 'name email')
        .populate('projectManager', 'name email');

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      });

    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating project',
        error: error.message
      });
    }
  }

  /**
   * Add project note
   */
  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { text, isInternal } = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      project.notes.push({
        text,
        createdBy: req.user._id,
        isInternal: isInternal || false
      });

      await project.save();

      const updatedProject = await Project.findById(id)
        .populate('notes.createdBy', 'name email');

      res.json({
        success: true,
        message: 'Note added successfully',
        data: updatedProject
      });

    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding note',
        error: error.message
      });
    }
  }

  /**
   * Update milestone
   */
  async updateMilestone(req, res) {
    try {
      const { id, milestoneId } = req.params;
      const updateData = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const milestone = project.milestones.id(milestoneId);
      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      Object.assign(milestone, updateData);

      if (updateData.status === 'completed' && !milestone.completedDate) {
        milestone.completedDate = new Date();
      }

      project.updateHealthStatus();
      await project.save();

      res.json({
        success: true,
        message: 'Milestone updated successfully',
        data: project
      });

    } catch (error) {
      console.error('Update milestone error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating milestone',
        error: error.message
      });
    }
  }

  /**
   * Add deliverable
   */
  async addDeliverable(req, res) {
    try {
      const { id } = req.params;
      const { title, description, fileUrl } = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      project.deliverables.push({
        title,
        description,
        fileUrl,
        deliveredDate: new Date()
      });

      await project.save();

      res.json({
        success: true,
        message: 'Deliverable added successfully',
        data: project
      });

    } catch (error) {
      console.error('Add deliverable error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding deliverable',
        error: error.message
      });
    }
  }

  /**
   * Approve deliverable
   */
  async approveDeliverable(req, res) {
    try {
      const { id, deliverableId } = req.params;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const deliverable = project.deliverables.id(deliverableId);
      if (!deliverable) {
        return res.status(404).json({
          success: false,
          message: 'Deliverable not found'
        });
      }

      deliverable.approved = true;
      await project.save();

      res.json({
        success: true,
        message: 'Deliverable approved successfully',
        data: project
      });

    } catch (error) {
      console.error('Approve deliverable error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving deliverable',
        error: error.message
      });
    }
  }

  /**
   * Delete project
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Don't allow deletion of active projects
      if (['in_progress', 'won'].includes(project.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete active project'
        });
      }

      await project.remove();

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });

    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting project',
        error: error.message
      });
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const matchQuery = {};
      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
      }

      const stats = await Project.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$finalAmount' }
          }
        }
      ]);

      const healthStats = await Project.aggregate([
        { $match: { status: 'in_progress' } },
        {
          $group: {
            _id: '$healthStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          byStatus: stats,
          byHealth: healthStats
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ProjectController();