import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Portfolio from '../pages/Portfolio';
import Team from '../pages/Team';
import Blog from '../pages/Blog';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Dashboard from '../admin/pages/Dashboard';
import PortfolioList from '../admin/pages/PortfolioList';
import PortfolioEdit from '../admin/pages/PortfolioEdit';
import BlogList from '../admin/pages/BlogList';
import BlogEdit from '../admin/pages/BlogEdit';
import TeamList from '../admin/pages/TeamList';
import TeamEdit from '../admin/pages/TeamEdit';
import Contacts from '../admin/pages/Contacts';
import Analytics from '../admin/pages/Analytics';
import Login from '../admin/pages/Login';
import Signup from '../admin/pages/Signup';

export default function PublicRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/team" element={<Team />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        {/* Admin routes (no auth guard yet) */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/portfolio" element={<PortfolioList />} />
        <Route path="/admin/portfolio/:id" element={<PortfolioEdit />} />
        <Route path="/admin/blog" element={<BlogList />} />
        <Route path="/admin/blog/:id" element={<BlogEdit />} />
        <Route path="/admin/team" element={<TeamList />} />
        <Route path="/admin/team/:id" element={<TeamEdit />} />
        <Route path="/admin/contacts" element={<Contacts />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}
