import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServicesHero from '../components/ServicesHero';
import ServicesSection from '../components/ServicesSection';
import ServicesContact from '../components/ServicesContact';

export default function Services() {
  return (
    <>
      <Navbar />
      <ServicesHero />
      <ServicesSection />
      <ServicesContact />
      <Footer />
    </>
  );
}
