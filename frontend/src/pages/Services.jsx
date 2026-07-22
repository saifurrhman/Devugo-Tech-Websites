import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServicesHero from '../components/ServicesHero';
import ServicesSection from '../components/ServicesSection';
import ServicesContact from '../components/ServicesContact';
import SEO from '../components/SEO';

export default function Services() {
  

  


  return (
    <>
      <SEO
        title="Our Services | Web Development, AI Automation & SaaS | Devugo Tech"
        description="Explore our services: full-stack web development, AI agent integration, n8n automation, CRM systems, and SaaS MVP development for startups worldwide."
        keywords="web development services, AI agent development, SaaS MVP development"
        url="/services"
      />
      <Navbar />
      <ServicesHero />
      <ServicesSection variant="services" />
      <ServicesContact />
      <Footer />
    </>
  );
}