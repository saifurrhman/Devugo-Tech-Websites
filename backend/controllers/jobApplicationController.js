const JobApplication = require('../models/JobApplication');
const Career = require('../models/Career');

// @desc  Submit job application
// @route POST /api/applications
// @access Public
exports.submitApplication = async (req, res) => {
  try {
    const { careerId, fullName, email, phone, linkedin, portfolio, coverLetter, experience } = req.body;

    if (!careerId || !fullName || !email) {
      return res.status(400).json({ message: 'Career ID, full name and email are required.' });
    }

    const career = await Career.findById(careerId);
    if (!career) return res.status(404).json({ message: 'Job posting not found.' });
    if (!career.isActive) return res.status(400).json({ message: 'This job is no longer accepting applications.' });

    // Prevent duplicate applications
    const existing = await JobApplication.findOne({ career: careerId, email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this position.' });
    }
    let resume = null;
    if (req.file) {
      resume = `/uploads/resumes/${req.file.filename}`;
    }

    const application = await JobApplication.create({
      career: careerId,
      jobTitle: career.title,
      fullName, email, phone, linkedin, portfolio, coverLetter, experience, resume
    });

    // Send notification email to admin (fire and forget)
    sendAdminNotification(application, career).catch(err =>
      console.error('Admin notification email failed:', err)
    );

    // Send confirmation email to applicant (fire and forget)
    sendApplicantConfirmation(application, career).catch(err =>
      console.error('Applicant confirmation email failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will get back to you soon.',
      applicationId: application._id,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error submitting application.' });
  }
};

// @desc  Get all applications (admin)
// @route GET /api/applications
// @access Private (Admin)
exports.getApplications = async (req, res) => {
  try {
    const { careerId, status } = req.query;
    const filter = {};
    if (careerId) filter.career = careerId;
    if (status) filter.status = status;

    const applications = await JobApplication.find(filter)
      .populate('career', 'title department location type')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error fetching applications.' });
  }
};

// @desc  Update application status
// @route PATCH /api/applications/:id/status
// @access Private (Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('career', 'title');

    if (!application) return res.status(404).json({ message: 'Application not found.' });

    // Outreach email on status change
    if (status === 'shortlisted' || status === 'rejected' || status === 'hired') {
      sendStatusUpdateEmail(application, status).catch(console.error);
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc  Delete application
// @route DELETE /api/applications/:id
// @access Private (Admin)
exports.deleteApplication = async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc  Send custom email to applicant
// @route POST /api/applications/:id/email
// @access Private (Admin)
exports.sendCustomEmail = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Devugo Tech Solutions" <${process.env.SMTP_USER}>`,
      to: application.email,
      subject: subject || 'Message from Devugo Tech Solutions',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
          <div style="background:#002747;color:#fff;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
            <h1 style="margin:0;font-size:24px;">Devugo Tech Solutions</h1>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
            <p style="color:#374151;line-height:1.7;">Hi <strong>${application.fullName}</strong>,</p>
            <div style="color:#374151;line-height:1.7;white-space:pre-wrap;margin-bottom:20px;">${body}</div>
            <p style="color:#374151;line-height:1.7;">Best regards,<br><strong>Devugo Tech Solutions Team</strong></p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ message: 'Server error sending email.' });
  }
};

// ─── Email Helpers ────────────────────────────────────────────────────────────

async function sendAdminNotification(application, career) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Devugo Careers" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🆕 New Application: ${career.title} — ${application.fullName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#002747;color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:20px;">
          <h2 style="margin:0;font-size:20px;">New Job Application Received</h2>
          <p style="margin:4px 0 0;opacity:.75;font-size:14px;">${career.title} · ${career.department || ''} · ${career.location || ''}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          ${row('Applicant', application.fullName)}
          ${row('Email', `<a href="mailto:${application.email}">${application.email}</a>`)}
          ${row('Phone', application.phone || '—')}
          ${row('Experience', application.experience ? application.experience + ' years' : '—')}
          ${row('LinkedIn', application.linkedin ? `<a href="${application.linkedin}">${application.linkedin}</a>` : '—')}
          ${row('Portfolio', application.portfolio ? `<a href="${application.portfolio}">${application.portfolio}</a>` : '—')}
        </table>
        ${application.coverLetter ? `
        <div style="margin-top:20px;background:#fff;border-radius:8px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          <h4 style="margin:0 0 10px;color:#002747;">Cover Letter</h4>
          <p style="margin:0;line-height:1.7;color:#374151;white-space:pre-wrap;">${application.coverLetter}</p>
        </div>` : ''}
        <p style="margin-top:20px;font-size:13px;color:#9ca3af;">Application ID: ${application._id}</p>
      </div>
    `,
  });
}

async function sendApplicantConfirmation(application, career) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Devugo Tech Solutions" <${process.env.SMTP_USER}>`,
    to: application.email,
    subject: `Application Received — ${career.title} at Devugo`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#002747;color:#fff;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">Application Received! 🎉</h1>
        </div>
        <div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          <p style="color:#374151;line-height:1.7;">Hi <strong>${application.fullName}</strong>,</p>
          <p style="color:#374151;line-height:1.7;">Thank you for applying for the <strong>${career.title}</strong> position at Devugo Tech Solutions. We have received your application and our team will review it carefully.</p>
          <div style="background:#f0f7ff;border-left:4px solid #4385cd;padding:16px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;color:#1e3a5f;font-weight:600;">What happens next?</p>
            <ul style="margin:8px 0 0;padding-left:20px;color:#374151;line-height:1.8;">
              <li>Our team will review your application within <strong>3–5 business days</strong></li>
              <li>If shortlisted, we will contact you via email for next steps</li>
              <li>You will receive a status update regardless of the outcome</li>
            </ul>
          </div>
          <p style="color:#374151;line-height:1.7;">In the meantime, feel free to explore our work at <a href="https://devugotechsolution.store" style="color:#4385cd;">devugotechsolution.store</a>.</p>
          <p style="color:#374151;line-height:1.7;">Best regards,<br><strong>Devugo Tech Solutions Team</strong></p>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Devugo Tech Solutions · info@devugotechsolution.store</p>
      </div>
    `,
  });
}

async function sendStatusUpdateEmail(application, status) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const jobTitle = application.career ? application.career.title : 'the position';

  const messages = {
    shortlisted: { emoji: '⭐', subject: 'Great News — You\'ve Been Shortlisted!', body: `We are excited to inform you that your application for <strong>${jobTitle}</strong> has been shortlisted! Our team will be in touch very soon with the next steps.` },
    hired: { emoji: '🎉', subject: 'Congratulations — Welcome to Devugo Tech Solutions!', body: `We are absolutely thrilled to extend an official offer for the <strong>${jobTitle}</strong> position. Your skills and experience stood out to us, and we believe you will be an incredible addition to our team.<br><br>Our HR team will be sending you a detailed official offer letter with all requirements, benefits, and next steps within the next 24 hours.` },
    rejected: { emoji: '💌', subject: `Application Update — ${jobTitle}`, body: `After careful review, we regret to inform you that we will not be moving forward with your application for <strong>${jobTitle}</strong> at this time. We appreciate the time you invested and encourage you to apply for future openings.` },
  };

  const m = messages[status];
  if (!m) return;

  await transporter.sendMail({
    from: `"Devugo Tech Solutions" <${process.env.SMTP_USER}>`,
    to: application.email,
    subject: `${m.emoji} ${m.subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#002747;color:#fff;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
          <h1 style="margin:0;font-size:28px;">${m.emoji}</h1>
          <h2 style="margin:8px 0 0;font-size:20px;">${m.subject}</h2>
        </div>
        <div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          <p style="color:#374151;line-height:1.7;">Hi <strong>${application.fullName}</strong>,</p>
          <p style="color:#374151;line-height:1.7;">${m.body}</p>
          <p style="color:#374151;line-height:1.7;">Best regards,<br><strong>Devugo Tech Solutions Team</strong></p>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Devugo Tech Solutions</p>
      </div>
    `,
  });
}

function row(label, value) {
  return `<tr style="border-bottom:1px solid #f3f4f6;">
    <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;width:130px;">${label}</td>
    <td style="padding:12px 16px;font-size:14px;color:#111827;">${value}</td>
  </tr>`;
}
