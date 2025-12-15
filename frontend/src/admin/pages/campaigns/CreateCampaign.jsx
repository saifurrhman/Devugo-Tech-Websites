import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, CheckCircle, FileSpreadsheet, Upload, Calculator } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { CampaignAPI, TemplateAPI, ContactAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

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
    type: 'email', // email, sms
    smsContent: '',
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
      const [templatesData, contactsData] = await Promise.all([
        TemplateAPI.list(),
        ContactAPI.list()
      ]);

      setTemplates(Array.isArray(templatesData) ? templatesData : (templatesData.data || []));

      // Use real contact data to build dynamic lists
      const rawContacts = Array.isArray(contactsData) ? contactsData : (contactsData.data || []);

      if (rawContacts.length > 0) {
        const allCount = rawContacts.length;
        const verifiedCount = rawContacts.filter(c => c.status === 'Verified').length;
        // Logic for Newsletter: either a specific tag or just those who didn't bounce
        const newsletterCount = rawContacts.filter(c => c.status !== 'Bounced').length;

        setLists([
          { _id: 'all', name: 'All Subscribers', count: allCount, icon: Users, color: 'blue' },
          { _id: 'verified', name: 'Verified Subscribers', count: verifiedCount, icon: CheckCircle, color: 'green' },
          { _id: 'newsletter', name: 'Newsletter Audience', count: newsletterCount, icon: Mail, color: 'purple' }
        ]);
      } else {
        // Fallback for empty state or if API returns nothing but strict format needed
        setLists([
          { _id: 'all', name: 'All Subscribers', count: 0, icon: Users, color: 'blue' },
        ]);
      }
    } catch (err) {
      console.error("Failed to load data", err);
      error("Failed to load initial data. Using demo data.");
      // Fallback mock data
      setTemplates([]);
      setLists([
        { _id: '1', name: 'All Subscribers (Demo)', count: 1247, icon: Users, color: 'blue' },
        { _id: '2', name: 'Verified Users', count: 892, icon: CheckCircle, color: 'green' },
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

  // CSV Drag & Drop Logic
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvCount, setCsvCount] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type === "text/csv" || file.name.endsWith('.csv')) {
      setCsvFile(file);
      processCSV(file);
    } else {
      warning('Please upload a valid CSV file');
    }
  };

  const processCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Simple estimation: count non-empty lines, excluding header
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const count = Math.max(0, lines.length - 1); // Subtract header
      setCsvCount(count);
      success(`Parsed ${count} recipients from CSV`);

      // Auto-select CSV mode if implied or just add to recipients
    };
    reader.readAsText(file);
  };


  function validateStep(currentStep) {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
      if (formData.type === 'email') {
        if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';
        if (!formData.fromName.trim()) newErrors.fromName = 'From name is required';
        if (!formData.fromEmail.trim()) newErrors.fromEmail = 'From email is required';
        if (formData.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
          newErrors.fromEmail = 'Invalid email format';
        }
      }
    }

    if (currentStep === 2) {
      if (formData.lists.length === 0 && !csvFile) {
        newErrors.lists = 'Select at least one list or upload a CSV';
        warning('Please select recipient list or upload CSV');
      }
    }

    if (currentStep === 3) {
      if (formData.type === 'email' && !formData.templateId) {
        newErrors.templateId = 'Select an email template';
        warning('Please select an email template');
      }
      if (formData.type === 'sms' && !formData.smsContent.trim()) {
        newErrors.smsContent = 'SMS content is required';
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
        // If CSV is present, we might want to flag it or handle it. 
        // For now we just pass the metadata that a CSV was part of it if backend supports it.
        // Or realistically, we'd upload the CSV first and get an ID, but for this demo:
        csvIncluded: !!csvFile,
        csvCount: csvCount,
        status: isDraft ? 'draft' : (formData.scheduleType === 'now' ? 'sending' : 'scheduled')
      };

      console.log('Submitting campaign:', payload);

      // In a real app, you might upload the CSV file here if not done already

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
  const listRecipients = lists
    .filter(list => formData.lists.includes(list._id))
    .reduce((sum, list) => sum + list.count, 0);
  const totalRecipients = listRecipients + csvCount;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <AdminTopbar />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 px-1">
          <span
            onClick={() => navigate('/admin/campaigns')}
            className="cursor-pointer hover:text-white transition-colors"
          >
            Campaigns
          </span>
          <span>/</span>
          <span className="text-white">Create Campaign</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-white m-0">Create Email Campaign</h1>
          <p className="text-gray-400 text-sm">Set up and launch your email marketing campaign</p>
        </div>

        {/* Progress Steps */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative max-w-4xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700 -z-0"></div>

            {[
              { num: 1, label: 'Details', icon: '📝' },
              { num: 2, label: 'Recipients', icon: '👥' },
              { num: 3, label: 'Content', icon: '✉️' },
              { num: 4, label: 'Review', icon: '🚀' }
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 bg-[#0f172a] px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : isCompleted
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-700 bg-gray-800 text-gray-500'
                      }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="card mt-6 p-6">
          {/* STEP 1: Campaign Details */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Campaign Details</h2>
                <p className="text-gray-400 text-sm">Basic information about your campaign</p>
              </div>

              {/* Campaign Type Selector */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'email' }))}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.type === 'email' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800/30 border-gray-700 text-gray-400'}`}
                >
                  <Mail size={24} />
                  <span className="font-medium">Email Campaign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'sms' }))}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.type === 'sms' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-800/30 border-gray-700 text-gray-400'}`}
                >
                  <span className="text-xl">📱</span>
                  <span className="font-medium">SMS Campaign</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-sm">Campaign Name *</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Sale 2024"
                    className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <span className="text-red-400 text-xs">{errors.name}</span>}
                </label>

                {formData.type === 'email' && (
                  <>
                    <label className="flex flex-col gap-1">
                      <span className="font-medium text-sm">Subject Line *</span>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Get 50% OFF on all services! 🎉"
                        className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.subject ? 'border-red-500' : ''}`}
                      />
                      {errors.subject && <span className="text-red-400 text-xs">{errors.subject}</span>}
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-medium text-sm">Preheader Text (Optional)</span>
                      <input
                        type="text"
                        name="preheader"
                        value={formData.preheader}
                        onChange={handleChange}
                        placeholder="Preview text shown in inbox"
                        className="form-field ux-input px-3 py-2 border rounded text-base"
                      />
                      <span className="text-xs text-gray-500">This appears next to the subject line in inbox</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-sm">From Name *</span>
                        <input
                          type="text"
                          name="fromName"
                          value={formData.fromName}
                          onChange={handleChange}
                          placeholder="Devugo Tech"
                          className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.fromName ? 'border-red-500' : ''}`}
                        />
                        {errors.fromName && <span className="text-red-400 text-xs">{errors.fromName}</span>}
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-sm">From Email *</span>
                        <input
                          type="email"
                          name="fromEmail"
                          value={formData.fromEmail}
                          onChange={handleChange}
                          placeholder="hello@devugo.com"
                          className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.fromEmail ? 'border-red-500' : ''}`}
                        />
                        {errors.fromEmail && <span className="text-red-400 text-xs">{errors.fromEmail}</span>}
                      </label>
                    </div>
                  </>
                )}

                <label className="flex flex-col gap-1">
                  <span className="font-medium text-sm">Reply-To Email (Optional)</span>
                  <input
                    type="email"
                    name="replyTo"
                    value={formData.replyTo}
                    onChange={handleChange}
                    placeholder="support@devugo.com"
                    className="form-field ux-input px-3 py-2 border rounded text-base"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Recipients */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Select Recipients</h2>
                <p className="text-gray-400 text-sm">Choose who will receive this campaign</p>
              </div>

              {errors.lists && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded">{errors.lists}</div>
              )}

              <div className="flex gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Lists Selected</span>
                  <span className="text-2xl font-bold text-white">{selectedListsCount}</span>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">CSV Recipients</span>
                  <span className="text-2xl font-bold text-white">{csvCount.toLocaleString()}</span>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Total Recipients</span>
                  <span className="text-2xl font-bold text-white">{totalRecipients.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Existing Lists */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Users size={20} className="text-blue-400" />
                    <span>Select From Lists</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {lists.map((list) => {
                      const Icon = list.icon || Users;
                      const isSelected = formData.lists.includes(list._id);

                      return (
                        <div
                          key={list._id}
                          onClick={() => handleListToggle(list._id)}
                          className={`cursor-pointer p-4 rounded-xl border transition-all group ${isSelected
                            ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            : 'bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-800 border border-gray-600 text-gray-400 group-hover:border-gray-500 group-hover:text-gray-300'
                              }`}>
                              {isSelected ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </div>

                            <div className="flex-1">
                              <h3 className={`font-medium transition-colors ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                {list.name}
                              </h3>
                              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                <Users size={14} />
                                {list.count.toLocaleString()} recipients
                              </p>
                            </div>

                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Upload CSV */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <FileSpreadsheet size={20} className="text-green-400" />
                      <span>Import from CSV</span>
                    </h3>
                  </div>

                  <div
                    className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${dragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {!csvFile ? (
                      <>
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg group">
                          <Upload size={32} className="text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">Upload CSV File</h4>
                        <p className="text-sm text-gray-400 mb-6 max-w-[200px]">
                          Drag & Drop your CSV file here or browse to upload
                        </p>
                        <input
                          type="file"
                          id="csv-upload"
                          className="hidden"
                          accept=".csv"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="csv-upload"
                          className="px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
                        >
                          Browse Files
                        </label>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                          <FileSpreadsheet size={32} />
                        </div>
                        <h4 className="text-lg font-medium text-white truncate max-w-[240px] mx-auto">{csvFile.name}</h4>
                        <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
                          <Calculator size={14} />
                          {csvCount} recipients found
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCsvFile(null);
                            setCsvCount(0);
                          }}
                          className="mt-6 text-sm text-red-400 hover:text-red-300 hover:underline"
                        >
                          Remove File
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">ℹ️</span>
                    <span>
                      CSV must contain an <strong>email</strong> column. Other columns like name, company are optional.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Content */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {formData.type === 'sms' ? 'Compose SMS' : 'Choose Email Template'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {formData.type === 'sms' ? 'Write your message content' : 'Select a template for your campaign'}
                </p>
              </div>

              {formData.type === 'sms' ? (
                // SMS Editor
                <div className="max-w-xl">
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm text-gray-300">Message Content</span>
                    <div className="relative">
                      <textarea
                        value={formData.smsContent}
                        onChange={(e) => {
                          if (e.target.value.length <= 160) {
                            setFormData(prev => ({ ...prev, smsContent: e.target.value }));
                          }
                        }}
                        placeholder="Type your SMS message here..."
                        rows={5}
                        className={`w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-green-500 ${errors.smsContent ? 'border-red-500' : ''}`}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        {formData.smsContent.length}/160
                      </div>
                    </div>
                    {errors.smsContent && <span className="text-red-400 text-xs">{errors.smsContent}</span>}
                    <p className="text-xs text-gray-500">
                      Standard SMS limit is 160 characters. Messages longer than this may be split or incur extra charges.
                    </p>
                  </label>
                </div>
              ) : (
                // Email Template Picker
                <>
                  {errors.templateId && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded">{errors.templateId}</div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template._id}
                        onClick={() => setFormData(prev => ({ ...prev, templateId: template._id }))}
                        className={`group cursor-pointer relative rounded-xl overflow-hidden border transition-all ${formData.templateId === template._id
                          ? 'ring-2 ring-blue-500 border-transparent'
                          : 'border-gray-700 hover:border-gray-500'
                          }`}
                      >
                        <div className="aspect-[3/4] bg-gray-800 relative">
                          <img src={template.preview} alt={template.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          {formData.templateId === template._id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                              SELECTED
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-800/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 border-t border-gray-700">
                          <h3 className="text-sm font-medium text-white truncate">{template.name}</h3>
                        </div>
                      </div>
                    ))}

                    {/* Add New Template Card */}
                    <div
                      onClick={() => navigate('/admin/templates/create')}
                      className="cursor-pointer rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-3 aspect-[3/4]"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl text-gray-400">
                        +
                      </div>
                      <span className="text-gray-400 font-medium text-sm">Create New</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Review & Send */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Review & Schedule</h2>
                <p className="text-gray-400 text-sm">Review your campaign before sending</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaign Details Review */}
                <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">📝 Campaign Details</h3>
                    <button onClick={() => setStep(1)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-white font-medium">{formData.name}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                      <span className="text-gray-500">Subject:</span>
                      <span className="text-white font-medium">{formData.subject}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                      <span className="text-gray-500">From:</span>
                      <span className="text-white font-medium">{formData.fromName} &lt;{formData.fromEmail}&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Recipients Review */}
                <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">👥 Recipients</h3>
                    <button onClick={() => setStep(2)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                      <span className="text-gray-500">Total People:</span>
                      <span className="text-2xl font-bold text-white">{totalRecipients.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                      <span className="text-gray-500">Included Lists:</span>
                      <div className="flex flex-wrap gap-1">
                        {lists
                          .filter(list => formData.lists.includes(list._id))
                          .map(list => (
                            <span key={list._id} className="px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300 border border-gray-600">
                              {list.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="col-span-1 lg:col-span-2 bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                  <div className="mb-4">
                    <h3 className="font-bold flex items-center gap-2">🚀 Send Options</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`cursor-pointer p-4 rounded-lg border transition-all flex items-start gap-3 ${formData.scheduleType === 'now' ? 'bg-blue-600/10 border-blue-500' : 'bg-transparent border-gray-700'
                      }`}>
                      <input
                        type="radio"
                        name="scheduleType"
                        value="now"
                        checked={formData.scheduleType === 'now'}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <span className="block font-bold text-white">Send Now</span>
                        <span className="block text-sm text-gray-400 mt-1">Campaign will be sent immediately after you confirm.</span>
                      </div>
                    </label>

                    <label className={`cursor-pointer p-4 rounded-lg border transition-all flex items-start gap-3 ${formData.scheduleType === 'scheduled' ? 'bg-blue-600/10 border-blue-500' : 'bg-transparent border-gray-700'
                      }`}>
                      <input
                        type="radio"
                        name="scheduleType"
                        value="scheduled"
                        checked={formData.scheduleType === 'scheduled'}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <span className="block font-bold text-white">Schedule for Later</span>
                        <span className="block text-sm text-gray-400 mt-1">Pick a specific date and time for delivery.</span>
                      </div>
                    </label>
                  </div>

                  {formData.scheduleType === 'scheduled' && (
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-sm">Date *</span>
                        <input
                          type="date"
                          name="scheduledDate"
                          value={formData.scheduledDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.scheduledDate ? 'border-red-500' : ''}`}
                        />
                        {errors.scheduledDate && <span className="text-red-400 text-xs">{errors.scheduledDate}</span>}
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-sm">Time *</span>
                        <input
                          type="time"
                          name="scheduledTime"
                          value={formData.scheduledTime}
                          onChange={handleChange}
                          className={`form-field ux-input px-3 py-2 border rounded text-base ${errors.scheduledTime ? 'border-red-500' : ''}`}
                        />
                        {errors.scheduledTime && <span className="text-red-400 text-xs">{errors.scheduledTime}</span>}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-800">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  className="btn-secondary px-6"
                  onClick={prevStep}
                  disabled={loading}
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="btn-secondary px-4 text-gray-300 border-gray-600 hover:text-white"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                Save as Draft
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  className="btn px-8"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn px-8 bg-green-600 hover:bg-green-500 border-green-600"
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