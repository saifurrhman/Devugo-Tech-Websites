import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { CampaignAPI, TemplateAPI, ContactAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { success, error, warning } = useNotification();
  const [step, setStep] = useState(1); // 1: Details, 2: Recipients, 3: Content, 4: Review
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    templateId: '',
    recipients: [],
    lists: [],
    scheduleType: 'now', // now, scheduled
    scheduledDate: '',
    scheduledTime: ''
  });

  const [templates, setTemplates] = useState([]);
  const [lists, setLists] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [templatesData, listsData] = await Promise.all([
        TemplateAPI.list(),
        ContactAPI.getLists ? ContactAPI.getLists() : Promise.resolve([]) // Fallback if getLists not implemented yet
      ]);

      setTemplates(Array.isArray(templatesData) ? templatesData : (templatesData.data || []));
      // Mock lists if API not ready, or use real data
      const loadedLists = Array.isArray(listsData) ? listsData : (listsData.data || []);
      if (loadedLists.length === 0) {
        setLists([
          { _id: '1', name: 'All Subscribers', count: 1247 },
          { _id: '2', name: 'Newsletter Subscribers', count: 892 },
          { _id: '3', name: 'VIP Customers', count: 156 }
        ]);
      } else {
        setLists(loadedLists);
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
      error("Failed to load initial data");
      // Fallback mock data for demo purposes if API fails
      setTemplates([
        { _id: '1', name: 'Newsletter Template', preview: 'https://via.placeholder.com/150' },
        { _id: '2', name: 'Promotional Email', preview: 'https://via.placeholder.com/150' },
      ]);
      setLists([
        { _id: '1', name: 'All Subscribers', count: 1247 },
        { _id: '2', name: 'Newsletter Subscribers', count: 892 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  function handleListToggle(listId) {
    setFormData(prev => ({
      ...prev,
      lists: prev.lists.includes(listId)
        ? prev.lists.filter(id => id !== listId)
        : [...prev.lists, listId]
    }));
    if (errors.lists) {
      setErrors(prev => ({ ...prev, lists: '' }));
    }
  }

  function validateStep(currentStep) {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
      if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';
      if (!formData.fromName.trim()) newErrors.fromName = 'From name is required';
      if (!formData.fromEmail.trim()) newErrors.fromEmail = 'From email is required';
      if (formData.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
        newErrors.fromEmail = 'Invalid email format';
      }
    }

    if (currentStep === 2) {
      if (formData.lists.length === 0) {
        newErrors.lists = 'Select at least one recipient list';
        warning('Please select at least one recipient list');
      }
    }

    if (currentStep === 3) {
      if (!formData.templateId) {
        newErrors.templateId = 'Select an email template';
        warning('Please select an email template');
      }
    }

    if (currentStep === 4) {
      if (formData.scheduleType === 'scheduled') {
        if (!formData.scheduledDate) newErrors.scheduledDate = 'Select a date';
        if (!formData.scheduledTime) newErrors.scheduledTime = 'Select a time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  }

  function prevStep() {
    setStep(prev => Math.max(prev - 1, 1));
  }

  async function handleSubmit(isDraft = false) {
    if (!isDraft && !validateStep(4)) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: isDraft ? 'draft' : (formData.scheduleType === 'now' ? 'sending' : 'scheduled')
      };

      console.log('Submitting campaign:', payload);

      await CampaignAPI.create(payload);

      success(isDraft ? 'Campaign saved as draft!' : 'Campaign created successfully!');
      navigate('/admin/campaigns');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      error('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedListsCount = formData.lists.length;
  const totalRecipients = lists
    .filter(list => formData.lists.includes(list._id))
    .reduce((sum, list) => sum + list.count, 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <AdminTopbar />

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/admin/campaigns')} style={{ cursor: 'pointer' }}>
            Campaigns
          </span>
          <span className="separator">/</span>
          <span className="active">Create Campaign</span>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Create Email Campaign</h1>
            <p className="page-subtitle">Set up and launch your email marketing campaign</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="steps-progress">
            {[
              { num: 1, label: 'Campaign Details', icon: '📝' },
              { num: 2, label: 'Recipients', icon: '👥' },
              { num: 3, label: 'Email Content', icon: '✉️' },
              { num: 4, label: 'Review & Send', icon: '🚀' }
            ].map((s) => (
              <div
                key={s.num}
                className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
              >
                <div className="step-number">{step > s.num ? '✓' : s.icon}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {/* STEP 1: Campaign Details */}
          {step === 1 && (
            <div className="form-step">
              <h2 className="step-title">Campaign Details</h2>
              <p className="step-description">Basic information about your email campaign</p>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Campaign Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Sale 2024"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">Subject Line *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Get 50% OFF on all services! 🎉"
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">Preheader Text (Optional)</label>
                  <input
                    type="text"
                    name="preheader"
                    value={formData.preheader}
                    onChange={handleChange}
                    placeholder="Preview text shown in inbox"
                    className="form-input"
                  />
                  <small className="field-hint">This appears next to the subject line in inbox</small>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">From Name *</label>
                    <input
                      type="text"
                      name="fromName"
                      value={formData.fromName}
                      onChange={handleChange}
                      placeholder="Devugo Tech"
                      className={`form-input ${errors.fromName ? 'error' : ''}`}
                    />
                    {errors.fromName && <span className="error-text">{errors.fromName}</span>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">From Email *</label>
                    <input
                      type="email"
                      name="fromEmail"
                      value={formData.fromEmail}
                      onChange={handleChange}
                      placeholder="hello@devugo.com"
                      className={`form-input ${errors.fromEmail ? 'error' : ''}`}
                    />
                    {errors.fromEmail && <span className="error-text">{errors.fromEmail}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Reply-To Email (Optional)</label>
                  <input
                    type="email"
                    name="replyTo"
                    value={formData.replyTo}
                    onChange={handleChange}
                    placeholder="support@devugo.com"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Recipients */}
          {step === 2 && (
            <div className="form-step">
              <h2 className="step-title">Select Recipients</h2>
              <p className="step-description">Choose who will receive this campaign</p>

              {errors.lists && (
                <div className="error-banner">{errors.lists}</div>
              )}

              <div className="recipients-summary">
                <div className="summary-stat">
                  <span className="stat-label">Lists Selected:</span>
                  <span className="stat-value">{selectedListsCount}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Total Recipients:</span>
                  <span className="stat-value">{totalRecipients.toLocaleString()}</span>
                </div>
              </div>

              <div className="lists-grid">
                {lists.map((list) => (
                  <div
                    key={list._id}
                    className={`list-card ${formData.lists.includes(list._id) ? 'selected' : ''}`}
                    onClick={() => handleListToggle(list._id)}
                  >
                    <div className="list-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.lists.includes(list._id)}
                        onChange={() => { }}
                      />
                    </div>
                    <div className="list-info">
                      <h3 className="list-name">{list.name}</h3>
                      <p className="list-count">{list.count.toLocaleString()} recipients</p>
                    </div>
                    <div className="list-icon">📋</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Email Content */}
          {step === 3 && (
            <div className="form-step">
              <h2 className="step-title">Choose Email Template</h2>
              <p className="step-description">Select a template for your campaign</p>

              {errors.templateId && (
                <div className="error-banner">{errors.templateId}</div>
              )}

              <div className="templates-grid">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className={`template-card ${formData.templateId === template._id ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, templateId: template._id }))}
                  >
                    <div className="template-preview">
                      <img src={template.preview} alt={template.name} />
                    </div>
                    <div className="template-info">
                      <h3 className="template-name">{template.name}</h3>
                      {formData.templateId === template._id && (
                        <span className="selected-badge">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/templates/create')}
                >
                  ➕ Create New Template
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Send */}
          {step === 4 && (
            <div className="form-step">
              <h2 className="step-title">Review & Schedule</h2>
              <p className="step-description">Review your campaign before sending</p>

              <div className="review-sections">
                {/* Campaign Details Review */}
                <div className="review-section">
                  <div className="review-header">
                    <h3>📝 Campaign Details</h3>
                    <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="review-content">
                    <div className="review-item">
                      <span className="review-label">Campaign Name:</span>
                      <span className="review-value">{formData.name}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Subject:</span>
                      <span className="review-value">{formData.subject}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">From:</span>
                      <span className="review-value">{formData.fromName} &lt;{formData.fromEmail}&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Recipients Review */}
                <div className="review-section">
                  <div className="review-header">
                    <h3>👥 Recipients</h3>
                    <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div className="review-content">
                    <div className="review-item">
                      <span className="review-label">Total Recipients:</span>
                      <span className="review-value">{totalRecipients.toLocaleString()}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Lists:</span>
                      <span className="review-value">
                        {lists
                          .filter(list => formData.lists.includes(list._id))
                          .map(list => list.name)
                          .join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="review-section">
                  <div className="review-header">
                    <h3>🚀 Send Options</h3>
                  </div>
                  <div className="review-content">
                    <div className="schedule-options">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="now"
                          checked={formData.scheduleType === 'now'}
                          onChange={handleChange}
                        />
                        <div className="radio-content">
                          <span className="radio-title">Send Now</span>
                          <span className="radio-desc">Send immediately after review</span>
                        </div>
                      </label>

                      <label className="radio-option">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="scheduled"
                          checked={formData.scheduleType === 'scheduled'}
                          onChange={handleChange}
                        />
                        <div className="radio-content">
                          <span className="radio-title">Schedule for Later</span>
                          <span className="radio-desc">Choose a specific date and time</span>
                        </div>
                      </label>
                    </div>

                    {formData.scheduleType === 'scheduled' && (
                      <div className="form-row" style={{ marginTop: '1rem' }}>
                        <div className="form-field">
                          <label className="form-label">Date *</label>
                          <input
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`form-input ${errors.scheduledDate ? 'error' : ''}`}
                          />
                          {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
                        </div>
                        <div className="form-field">
                          <label className="form-label">Time *</label>
                          <input
                            type="time"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleChange}
                            className={`form-input ${errors.scheduledTime ? 'error' : ''}`}
                          />
                          {errors.scheduledTime && <span className="error-text">{errors.scheduledTime}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={prevStep}
                disabled={loading}
              >
                ← Previous
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                Save as Draft
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (formData.scheduleType === 'now' ? '🚀 Send Now' : '📅 Schedule Campaign')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}