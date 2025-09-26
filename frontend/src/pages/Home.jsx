import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import Footer from '../components/Footer';
import SocialFloating from '../components/SocialFloating';

export default function Home() {
  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      <ServicesSection />
      <Footer />
    </>
  );
}
