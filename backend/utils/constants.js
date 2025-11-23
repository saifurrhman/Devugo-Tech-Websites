module.exports = {
  ROLES: { 
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager'
  },
  
  EMAIL_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    OPENED: 'opened',
    CLICKED: 'clicked',
    BOUNCED: 'bounced',
    FAILED: 'failed',
    UNSUBSCRIBED: 'unsubscribed'
  },

  CAMPAIGN_STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    SENDING: 'sending',
    SENT: 'sent',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
  },

  RECIPIENT_STATUS: {
    ACTIVE: 'active',
    UNSUBSCRIBED: 'unsubscribed',
    BOUNCED: 'bounced',
    COMPLAINED: 'complained',
    INVALID: 'invalid'
  },

  LEAD_STATUS: {
    NEW: 'new',
    CONTACTED: 'contacted',
    QUALIFIED: 'qualified',
    UNQUALIFIED: 'unqualified',
    CONVERTED: 'converted',
    LOST: 'lost'
  },

  INVOICE_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled'
  },

  MEETING_STATUS: {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
  },

  PROJECT_STATUS: {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  PIPELINE_STAGES: {
    LEAD: 'lead',
    CONTACT: 'contact',
    QUALIFIED: 'qualified',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    CLOSED_WON: 'closed_won',
    CLOSED_LOST: 'closed_lost'
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  DATE_FORMATS: {
    DATE: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'MMM DD, YYYY'
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  }
};