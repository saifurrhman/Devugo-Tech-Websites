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
import Contacts from '../admin/pages/Contacts';
import Analytics from '../admin/pages/Analytics';
import Login from '../admin/pages/Login';
import Signup from '../admin/pages/Signup';
import ResetPassword from '../admin/pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import AdminProfile from '../admin/pages/AdminProfile';
import ServicesList from '../admin/pages/ServicesList';
import ServiceEdit from '../admin/pages/ServiceEdit';
import PricingPlans from '../admin/pages/PricingPlans';
import Leads from '../admin/pages/Leads';
import LeadEdit from '../admin/pages/LeadEdit';

export default function PublicRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
        <Route path="/team" element={<Team />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        {/* Admin routes (no auth guard yet) */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/portfolio" element={<ProtectedRoute><PortfolioList /></ProtectedRoute>} />
        <Route path="/admin/portfolio/:id" element={<ProtectedRoute><PortfolioEdit /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
        <Route path="/admin/blog/create" element={<ProtectedRoute><AdminBlogCreate /></ProtectedRoute>} />
        <Route path="/admin/blog/:id" element={<ProtectedRoute><BlogEdit /></ProtectedRoute>} />
        <Route path="/admin/team" element={<ProtectedRoute><TeamList /></ProtectedRoute>} />
        <Route path="/admin/team/:id" element={<ProtectedRoute><TeamEdit /></ProtectedRoute>} />
        <Route path="/admin/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadEdit /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute><ServicesList /></ProtectedRoute>} />
        <Route path="/admin/services/:id" element={<ProtectedRoute><ServiceEdit /></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute><PricingPlans /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
