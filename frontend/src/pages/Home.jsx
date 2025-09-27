import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import PricingSection from '../components/PricingSection';
import HomeCta from '../components/HomeCta';
import HomeFaq from '../components/HomeFaq';
import Footer from '../components/Footer';
import SocialFloating from '../components/SocialFloating';

export default function Home() {
  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      <ServicesSection variant="home" />
      <PricingSection showCustom={false} />
      <HomeFaq />
      <HomeCta />
      <Footer />
    </>
  );
}
