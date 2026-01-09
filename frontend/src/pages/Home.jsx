import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PortfolioCategories from '../components/PortfolioCategories';
import HomeCta from '../components/HomeCta';
import HomeFaq from '../components/HomeFaq';
import WhyChoose from '../components/WhyChoose';
import ServicesSection from '../components/ServicesSection';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';
import SocialFloating from '../components/SocialFloating';
import HomePortfolio from '../components/HomePortfolio';
import ReviewsSection from '../components/ReviewsSection';
import BrandMarquee from '../components/BrandMarquee';


export default function Home() {

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    document.title = 'Home - Devugo Tech';
  }, []);

  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      <BrandMarquee />

      <PortfolioCategories
        showHeader={true}
        onCategorySelect={setSelectedCategory}
      />

      <HomePortfolio
        limit={6}
        mode="grid"
        selectedCategory={selectedCategory}
      />

      <WhyChoose />
      <ServicesSection variant="home" />

      <PricingSection showCustom={true} limit={6} />

      <HomeFaq />

      <ReviewsSection
        title="What clients say"
        subtitle="Real feedback from our partners"
        limit={6}
        featuredOnly={false}
        mode="carousel"
        showArrows={false}
      />
      <HomeCta />
      <Footer />
    </>
  );
}