import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../lib/api';

// Professional SVG Icons
const IconPhone = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMail = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGlobe = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const IconFileText = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const IconTag = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="7" r="2" fill="currentColor" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconFilter = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconArrowLeft = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWhatsApp = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />
  </svg>
);

const IconTrash = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Contact Detail Page Component
const ContactDetailPage = ({ contact, onBack, onDelete }) => {
  if (!contact) return null;

  const initials = String(contact.name || contact.email || '?').trim().slice(0, 1).toUpperCase();

  // Format WhatsApp message
  const getWhatsAppLink = () => {
    if (!contact.phone) return '#';
    const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
    const message = `Hi ${contact.name || 'there'}, I received your message regarding: ${contact.subject || 'your inquiry'}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this contact from ${contact.name || contact.email}?`)) {
      return;
    }

    try {
      await onDelete(contact._id);
      onBack();
    } catch (err) {
      alert('Failed to delete contact: ' + err.message);
    }
  };

  // useEffect(() => {
  //   document.title = 'Contact - Devugo Tech';
  // }, []);
  return (
    <div className="w-full" style={{ minHeight: '100vh' }}>
      {/* Header with Back Button */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 mb-6 text-sm font-bold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <IconArrowLeft className="w-5 h-5" />
          <span>Back to Contacts</span>
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: '#ffffff' }}>
          Contact Details
        </h1>
        <p className="text-sm sm:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Complete information about this contact
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Left Column - Contact Info Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sm:p-8 text-center" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            position: 'sticky',
            top: '2rem'
          }}>
            {/* Avatar */}
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mx-auto mb-6 flex items-center justify-center font-black text-4xl sm:text-5xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: '#ffffff',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 12px 48px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.1)'
              }}
            >
              {initials}
            </div>

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl font-black mb-3 px-2" style={{ color: '#ffffff', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {contact.name || 'Unknown'}
            </h2>

            {/* Email */}
            <div className="flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-xl" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <IconMail className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base font-bold" style={{ wordBreak: 'break-all' }}>
                {contact.email || 'No email'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.6)',
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <IconMail className="w-6 h-6" />
                  <span>Send Email</span>
                </a>
              )}

              {contact.phone && (
                <>
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
                      border: '2px solid rgba(16, 185, 129, 0.6)',
                      color: '#ffffff',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <IconPhone className="w-6 h-6" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.3) 0%, rgba(26, 169, 65, 0.3) 100%)',
                      border: '2px solid rgba(37, 211, 102, 0.6)',
                      color: '#ffffff',
                      boxShadow: '0 4px 16px rgba(37, 211, 102, 0.2)'
                    }}
                  >
                    <IconWhatsApp className="w-6 h-6" />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                color: '#ef4444',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
              }}
            >
              <IconTrash className="w-5 h-5" />
              <span>Delete Contact</span>
            </button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Phone Number Card */}
          {contact.phone && (
            <div className="card p-4 sm:p-6 md:p-8" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                  }}>
                    <IconPhone className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#10b981' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5" style={{ color: 'rgba(16, 185, 129, 0.8)' }}>
                      Phone Number
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black truncate" style={{ color: '#ffffff' }}>
                      {contact.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Card */}
          {contact.subject && (
            <div className="card p-4 sm:p-6 md:p-8" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                }}>
                  <IconTag className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#8b5cf6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5" style={{ color: 'rgba(139, 92, 246, 0.8)' }}>
                    Subject
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: '#ffffff', wordBreak: 'break-word' }}>
                    {contact.subject}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Source Card */}
          {contact.source && (
            <div className="card p-4 sm:p-6 md:p-8" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                }}>
                  <IconGlobe className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5" style={{ color: 'rgba(59, 130, 246, 0.8)' }}>
                    Source
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: '#ffffff', wordBreak: 'break-word' }}>
                    {contact.source}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Card */}
          {contact.message && (
            <div className="card p-4 sm:p-6 md:p-8" style={{
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                }}>
                  <IconFileText className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3" style={{ color: 'rgba(245, 158, 11, 0.8)' }}>
                    Message
                  </div>
                  <div className="text-sm sm:text-base md:text-lg leading-relaxed p-3 sm:p-4 rounded-xl" style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {contact.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date Card */}
          <div className="card p-4 sm:p-6 md:p-8" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
              }}>
                <IconClock className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#ec4899' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5" style={{ color: 'rgba(236, 72, 153, 0.8)' }}>
                  Submitted Date
                </div>
                <div className="text-base sm:text-lg md:text-xl font-black" style={{ color: '#ffffff', wordBreak: 'break-word' }}>
                  {contact.createdAt ? new Date(contact.createdAt).toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Date not available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail view state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedContact, setSelectedContact] = useState(null);

  // Dropdown state
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const sourceDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target)) {
        setSourceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await ContactAPI.list({ source: 'Manual' });
        const arr = Array.isArray(res) ? res : (res.items || []);
        // Strict filter for website leads only
        const leads = (arr || []).filter(c => {
          const src = (c.source || '').toLowerCase();
          return !src.includes('import') && !src.includes('csv') && !src.includes('upload');
        });
        if (mounted) setItems(leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) { if (mounted) setError(err.message || 'Failed to load contacts'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let result = items;

    if (term) {
      result = result.filter(c => [c.name, c.email, c.subject, c.message, c.phone, c.source]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
      );
    }

    if (filterSource !== 'all') {
      result = result.filter(c => c.source === filterSource);
    }

    return result;
  }, [items, q, filterSource]);

  const sources = useMemo(() => {
    const sourceSet = new Set(items.map(c => c.source).filter(Boolean));
    return ['all', ...Array.from(sourceSet)];
  }, [items]);

  // Toggle single selection
  const toggleSelect = (id, e) => {
    e.stopPropagation(); // Prevent card click
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c._id));
    }
  };

  // View contact detail
  const viewContactDetail = (contact) => {
    setSelectedContact(contact);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to list
  const backToList = () => {
    setViewMode('list');
    setSelectedContact(null);
  };

  // Delete contact
  const handleDeleteContact = async (contactId) => {
    try {
      await ContactAPI.remove(contactId);
      setItems(prev => prev.filter(c => c._id !== contactId));
      setSelectedIds(prev => prev.filter(id => id !== contactId));
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  // Delete selected contacts
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select contacts to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} selected contact(s)?`)) return;

    try {
      await Promise.all(selectedIds.map(id => ContactAPI.remove(id)));
      setItems(prev => prev.filter(c => !selectedIds.includes(c._id)));
      setSelectedIds([]);
      alert('Selected contacts deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete selected contacts');
    }
  }

  function exportCsv(rows) {
    const header = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Source', 'Date'];
    const lines = [header.join(',')];
    (rows || []).forEach(c => {
      const vals = [c.name || '', c.email || '', c.phone || '', c.subject || '', c.message || '', c.source || '', c.createdAt ? new Date(c.createdAt).toISOString() : ''];
      const escaped = vals.map(v => '"' + String(v).replace(/"/g, '""') + '"');
      lines.push(escaped.join(','));
    });
    const csvContent = '\ufeff' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf(rows) {
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url; s.async = true;
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!(window.jspdf?.jsPDF?.prototype?.autoTable)) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt');
    const pad = 40;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, doc.internal.pageSize.width, 140, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Devugo Tech Solutions', pad, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Contacts Export Report', pad, 75);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pad, 95);
    doc.text('Website: devugo.tech', pad, 110);
    doc.text('Email: hello@devugo.tech  |  Phone: +92 300 123 4567', pad, 125);

    doc.setTextColor(0, 0, 0);

    const body = (rows || []).map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.subject || '',
      (c.message || '').substring(0, 100) + ((c.message || '').length > 100 ? '...' : ''),
      c.source || '',
      c.createdAt ? new Date(c.createdAt).toLocaleString() : ''
    ]);
    const head = [['Name', 'Email', 'Phone', 'Subject', 'Message', 'Source', 'Date']];

    doc.autoTable({
      startY: 160,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak', textColor: 50 },
      head,
      body,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 4: { cellWidth: 150 } },
      margin: { left: pad, right: pad }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: 'center' });
    }

    doc.save(`contacts_export_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  const sourceOptions = sources.map(src => ({
    value: src,
    label: src === 'all' ? 'All Sources' : src
  }));

  const selectedSourceOption = sourceOptions.find(opt => opt.value === filterSource);

  // If detail view mode, show detail page
  if (viewMode === 'detail' && selectedContact) {
    return (
      <div className="admin-layout min-h-screen">
        <AdminSidebar />
        <main className="admin-content w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <AdminTopbar />
          <ContactDetailPage
            contact={selectedContact}
            onBack={backToList}
            onDelete={handleDeleteContact}
          />
        </main>
      </div>
    );
  }

  // Otherwise show list view
  return (
    <div className="admin-layout min-h-screen">
      <AdminSidebar />
      <main className="admin-content w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <AdminTopbar />

        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2"
                style={{

                  color: '#ffffff'
                }}>
                Contacts
              </h1>
              <p className="text-xs sm:text-sm font-medium" style={{ color: '#ffffff' }}>
                Manage and export your contact submissions
              </p>
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => exportCsv(selectedIds.length > 0 ? items.filter(c => selectedIds.includes(c._id)) : filtered)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                  color: '#ffffff',
                  borderRadius: '10px'
                }}
              >
                <IconFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export CSV {selectedIds.length > 0 && `(${selectedIds.length})`}</span>
              </button>
              <button
                className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => exportPdf(selectedIds.length > 0 ? items.filter(c => selectedIds.includes(c._id)) : filtered)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                  color: '#ffffff',
                  borderRadius: '10px'
                }}
              >
                <IconDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export PDF {selectedIds.length > 0 && `(${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card p-3 sm:p-4 mb-4 sm:mb-6" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
        }}>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#ffffff' }} />
              <input
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-all duration-200"
                placeholder="Search by name, email, subject, message..."
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
            </div>

            {/* Source Filter Dropdown */}
            <div className="flex items-center gap-2">
              <IconFilter className="w-5 h-5" style={{ color: '#ffffff' }} />
              <div ref={sourceDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                  className="px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    outline: 'none',
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '.5rem'
                  }}
                >
                  <span>{selectedSourceOption.label}</span>
                  <span style={{ fontSize: '.75rem' }}>▼</span>
                </button>

                {sourceDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + .5rem)',
                      right: 0,
                      minWidth: '200px',
                      padding: '.4rem',
                      zIndex: 1000,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '.5rem',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  >
                    {sourceOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterSource(option.value);
                          setSourceDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '.6rem .85rem',
                          background: filterSource === option.value
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'transparent',
                          border: filterSource === option.value
                            ? '1px solid rgba(59, 130, 246, 0.5)'
                            : '1px solid transparent',
                          borderRadius: '.375rem',
                          color: '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all .2s',
                          fontSize: '.9rem',
                          fontWeight: filterSource === option.value ? '500' : '400',
                          marginBottom: '.25rem'
                        }}
                        onMouseEnter={(e) => {
                          if (filterSource !== option.value) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filterSource !== option.value) {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Total Contacts</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{filtered.length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Filtered</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.filter(c => c.email).length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>With Email</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.filter(c => c.phone).length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>With Phone</div>
          </div>

          {selectedIds.length > 0 && (
            <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1.5px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
            }}>
              <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{selectedIds.length}</div>
              <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Selected</div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {!loading && !error && filtered.length > 0 && (
          <div className="card p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '.9rem', color: '#ffffff', fontWeight: '600' }}>
                {selectedIds.length === filtered.length && filtered.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-xs sm:text-sm px-4 py-2.5 flex items-center gap-2 font-bold rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="card p-6 text-center" style={{ borderRadius: '16px' }}>
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Loading contacts...</div>
          </div>
        )}

        {error && (
          <div className="card p-4 sm:p-6 text-center font-semibold" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Contacts Grid */}
        {!loading && !error && (
          filtered.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-6">
              {filtered.map((c, idx) => {
                const initials = String(c.name || c.email || '?').trim().slice(0, 1).toUpperCase();
                const isSelected = selectedIds.includes(c._id);

                return (
                  <div
                    key={c._id || idx}
                    className="card p-4 sm:p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      border: isSelected ? '2px solid #3b82f6' : '1.5px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '20px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: isSelected ? '0 8px 32px rgba(59, 130, 246, 0.3)' : '0 8px 32px rgba(59, 130, 246, 0.15)',
                      cursor: 'pointer'
                    }}
                    onClick={() => viewContactDetail(c)}
                  >
                    {/* Checkbox and Header with Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(c._id, e)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer', width: '18px', height: '18px', flexShrink: 0 }}
                        />

                        {/* Glass Avatar */}
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-base sm:text-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 24px rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <strong className="block text-base sm:text-lg truncate font-black" style={{ color: '#ffffff' }}>
                            {c.name || 'Unknown'}
                          </strong>
                          <small className="flex items-center gap-1.5 text-xs sm:text-sm truncate font-semibold mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                            <IconMail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{c.email || 'No email'}</span>
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex gap-2 flex-wrap" style={{ paddingLeft: '1.75rem' }}>
                      {c.subject && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconTag className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{c.subject}</span>
                        </span>
                      )}
                      {c.phone && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconPhone className="w-3.5 h-3.5" />
                          <span>Phone</span>
                        </span>
                      )}
                      {c.source && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconGlobe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px]">{c.source}</span>
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {c.message && (
                      <div className="p-3 rounded-xl" style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        marginLeft: '1.75rem'
                      }}>
                        <p
                          className="text-xs sm:text-sm m-0 leading-relaxed"
                          style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={c.message}
                        >
                          {c.message}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 pt-3"
                      style={{ borderTop: '1.5px solid rgba(255, 255, 255, 0.1)', marginLeft: '1.75rem' }}>
                      <small className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <IconClock className="w-3.5 h-3.5" />
                        <span>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </span>
                      </small>

                      <div className="text-xs font-bold" style={{
                        color: '#3b82f6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Click to view details →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 sm:p-12 text-center" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)'
            }}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}>
                  <IconUser className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl mb-2 font-black" style={{ color: '#ffffff' }}>
                    {q || filterSource !== 'all' ? 'No matches found' : 'No contact submissions yet'}
                  </p>
                  <p className="text-sm sm:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {q || filterSource !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Contact submissions will appear here when users fill out your contact form'
                    }
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}