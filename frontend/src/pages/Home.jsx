import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import PricingSection from '../components/PricingSection';
import HomeCta from '../components/HomeCta';
import HomeFaq from '../components/HomeFaq';
import WhyChoose from '../components/WhyChoose';
import Footer from '../components/Footer';
import SocialFloating from '../components/SocialFloating';

export default function Home() {
  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      <ServicesSection variant="home" />
      <WhyChoose />
      <PricingSection showCustom={false} />
      <HomeFaq />
      <HomeCta />
      <Footer />
    </>
  );
}
