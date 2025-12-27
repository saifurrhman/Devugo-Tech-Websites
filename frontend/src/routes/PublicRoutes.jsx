import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Portfolio from '../pages/Portfolio';
import PortfolioDetail from '../pages/PortfolioDetail';
import Team from '../pages/Team';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/Blogdetail';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Solutions from '../pages/Solutions';
import Pricing from '../pages/Pricing';
import Dashboard from '../admin/pages/Dashboard';
import PortfolioList from '../admin/pages/PortfolioList';
import PortfolioEdit from '../admin/pages/PortfolioEdit';
import BlogList from '../admin/pages/BlogList';
import BlogEdit from '../admin/pages/BlogEdit';
import AdminBlogCreate from '../admin/pages/AdminBlogCreate';
import TeamList from '../admin/pages/TeamList';
import TeamEdit from '../admin/pages/TeamEdit';
import UsersList from '../admin/pages/UsersList';
import Contacts from '../admin/pages/Contacts';
import Analytics from '../admin/pages/Analytics';
import Login from '../admin/pages/Login';
import Signup from '../admin/pages/Signup';
import ResetPassword from '../admin/pages/ResetPassword';
import AcceptInvitation from '../admin/pages/AcceptInvitation';
import ProtectedRoute from './ProtectedRoute';
import AdminProfile from '../admin/pages/AdminProfile';
import ServicesList from '../admin/pages/ServicesList';
import ServiceEdit from '../admin/pages/ServiceEdit';
import PricingPlans from '../admin/pages/PricingPlans';
import Leads from '../admin/pages/Leads';
import LeadEdit from '../admin/pages/LeadEdit';
import PortfolioCategories from '../admin/pages/PortfolioCategories';
import BlogCategories from '../admin/pages/BlogCategories';
import TechStack from '../admin/pages/TechStack';
import ReviewsList from '../admin/pages/ReviewsList';
import ReviewEdit from '../admin/pages/ReviewEdit';
import FAQsList from '../admin/pages/FAQsList';
import FAQEdit from '../admin/pages/FAQEdit';
import Forms from '../admin/pages/Forms';
import Faq from '../pages/Faq';
import SocialLinks from '../admin/pages/SocialLinks';
import Settings from '../admin/pages/Settings';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { NotificationProvider } from '../contexts/NotificationContext';
import CampaignsList from '../admin/pages/campaigns/CampaignsList';
import CreateCampaign from '../admin/pages/campaigns/CreateCampaign';
import InboxList from '../admin/pages/inbox/InboxList';
import TemplatesList from '../admin/pages/templates/TemplatesList';
import EmailAnalytics from '../admin/pages/analytics/EmailAnalytics';
import PipelineBoard from '../admin/pages/pipeline/PipelineBoard';
import ProjectsList from '../admin/pages/projects/ProjectsList';
import InvoicesList from '../admin/pages/invoices/InvoicesList';
import MeetingsList from '../admin/pages/meetings/MeetingsList';
import ContactsList from '../admin/pages/contacts/ContactsList';
import CreateTemplate from '../admin/pages/templates/CreateTemplate';
import AITemplateGenerator from '../admin/pages/templates/AITemplateGenerator';
import SMTPSettings from '../admin/pages/SMTPSettings';
import SenderSettings from '../admin/pages/settings/SenderSettings';
import DomainDNS from '../admin/pages/settings/DomainDNS';


import CreateProject from '../admin/pages/projects/CreateProject';
import ContactsUpload from '../admin/pages/contacts/ContactsUpload';
import CreateInvoice from '../admin/pages/invoices/CreateInvoice';
import MeetingScheduler from '../admin/pages/meetings/MeetingScheduler';

import DynamicTitle from '../components/DynamicTitle';

export default function PublicRoutes() {
  return (
    <BrowserRouter>
      <DynamicTitle />
      <NotificationProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="/team" element={<Team />} />

          {/* ✅ BLOG ROUTES - IMPORTANT: /blog must come before /blog/:id */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} /> {/* ✅ ADD THIS ROUTE */}

          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/invite/:token" element={<AcceptInvitation />} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin Portfolio */}
          <Route path="/admin/portfolio" element={<ProtectedRoute><PortfolioList /></ProtectedRoute>} />
          <Route path="/admin/portfolio/:id" element={<ProtectedRoute><PortfolioEdit /></ProtectedRoute>} />
          <Route path="/admin/portfolio-categories" element={<ProtectedRoute><PortfolioCategories /></ProtectedRoute>} />

          {/* Admin Blog */}
          <Route path="/admin/blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/admin/blog/create" element={<ProtectedRoute><AdminBlogCreate /></ProtectedRoute>} />
          <Route path="/admin/blog/:id" element={<ProtectedRoute><BlogEdit /></ProtectedRoute>} />
          <Route path="/admin/blog/categories" element={<ProtectedRoute><BlogCategories /></ProtectedRoute>} />

          {/* Admin Team */}
          <Route path="/admin/team" element={<ProtectedRoute><TeamList /></ProtectedRoute>} />
          <Route path="/admin/team/:id" element={<ProtectedRoute><TeamEdit /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersList /></ProtectedRoute>} />

          {/* Admin Contacts & Leads */}
          <Route path="/admin/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/admin/contacts/upload" element={<ProtectedRoute><ContactsUpload /></ProtectedRoute>} />
          <Route path="/admin/recipients/upload" element={<ProtectedRoute><ContactsUpload /></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadEdit /></ProtectedRoute>} />
          <Route path="/admin/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />

          {/* Admin Services */}
          <Route path="/admin/services" element={<ProtectedRoute><ServicesList /></ProtectedRoute>} />
          <Route path="/admin/services/:id" element={<ProtectedRoute><ServiceEdit /></ProtectedRoute>} />

          {/* Admin Content */}
          <Route path="/admin/pricing" element={<ProtectedRoute><PricingPlans /></ProtectedRoute>} />
          <Route path="/admin/tech-stack" element={<ProtectedRoute><TechStack /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute><ReviewsList /></ProtectedRoute>} />
          <Route path="/admin/reviews/:id" element={<ProtectedRoute><ReviewEdit /></ProtectedRoute>} />
          <Route path="/admin/faqs" element={<ProtectedRoute><FAQsList /></ProtectedRoute>} />
          <Route path="/admin/faqs/:id" element={<ProtectedRoute><FAQEdit /></ProtectedRoute>} />

          {/* Admin Settings */}
          <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin/social-links" element={<ProtectedRoute><SocialLinks /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Email Marketing Routes */}
          <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['email_marketing']}><CampaignsList /></ProtectedRoute>} />
          <Route path="/admin/campaigns/create" element={<ProtectedRoute allowedRoles={['email_marketing']}><CreateCampaign /></ProtectedRoute>} />
          <Route path="/admin/recipients" element={<ProtectedRoute allowedRoles={['email_marketing']}><ContactsList /></ProtectedRoute>} />
          <Route path="/admin/inbox" element={<ProtectedRoute allowedRoles={['email_marketing']}><InboxList /></ProtectedRoute>} />
          <Route path="/admin/inbox/:id" element={<ProtectedRoute allowedRoles={['email_marketing']}><InboxList /></ProtectedRoute>} />
          <Route path="/admin/templates" element={<ProtectedRoute allowedRoles={['email_marketing']}><TemplatesList /></ProtectedRoute>} />
          <Route path="/admin/templates/create" element={<ProtectedRoute allowedRoles={['email_marketing']}><CreateTemplate /></ProtectedRoute>} />
          <Route path="/admin/templates/ai-generator" element={<ProtectedRoute allowedRoles={['email_marketing']}><AITemplateGenerator /></ProtectedRoute>} />
          <Route path="/admin/email-analytics" element={<ProtectedRoute allowedRoles={['email_marketing']}><EmailAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings/email" element={<ProtectedRoute allowedRoles={['email_marketing']}><SMTPSettings /></ProtectedRoute>} />
          <Route path="/admin/settings/senders" element={<ProtectedRoute allowedRoles={['email_marketing']}><SenderSettings /></ProtectedRoute>} />
          <Route path="/admin/settings/domains/:domain" element={<ProtectedRoute allowedRoles={['email_marketing']}><DomainDNS /></ProtectedRoute>} />

          {/* CRM & Projects Routes */}
          <Route path="/admin/pipeline" element={<ProtectedRoute allowedRoles={['crm']}><PipelineBoard /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['crm']}><ProjectsList /></ProtectedRoute>} />
          <Route path="/admin/projects/create" element={<ProtectedRoute allowedRoles={['crm']}><CreateProject /></ProtectedRoute>} />
          <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['crm']}><InvoicesList /></ProtectedRoute>} />
          <Route path="/admin/invoices/create" element={<ProtectedRoute allowedRoles={['crm']}><CreateInvoice /></ProtectedRoute>} />
          <Route path="/admin/meetings" element={<ProtectedRoute allowedRoles={['crm']}><MeetingsList /></ProtectedRoute>} />
          <Route path="/admin/meetings/schedule" element={<ProtectedRoute allowedRoles={['crm']}><MeetingScheduler /></ProtectedRoute>} />
        </Routes>

        {/* WhatsApp Float - Shows on all pages */}
        <WhatsAppFloat />
      </NotificationProvider>
    </BrowserRouter>
  );
}