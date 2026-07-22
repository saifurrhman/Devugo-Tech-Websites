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
        title="AI SaaS & MVP Development Services | Devugo Tech"
        description="Explore our specialized services for the software industry: AI SaaS development, custom MVP builder, scalable MERN stack apps, and AI automations."
        keywords="AI SaaS development, custom MVP development, software industry solutions, scalable web apps"
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