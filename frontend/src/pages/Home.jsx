import React, { useState } from 'react';
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

export default function Home() {
  // State to manage selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      
      {/* Portfolio Categories - User will click here */}
      <PortfolioCategories 
        showHeader={true}
        onCategorySelect={setSelectedCategory}
      />
      
      {/* Portfolio Items - Will filter based on selected category */}
      <HomePortfolio 
        limit={6} 
        mode="grid" 
        selectedCategory={selectedCategory}
      />
      
      <WhyChoose />
      <ServicesSection variant="home" />
      
      {/* Pricing Section - shows pricing from admin */}
      <PricingSection showCustom={true} limit={6} />
      
      <HomeFaq />
      <HomeCta />
      
      <ReviewsSection 
        title="What clients say" 
        subtitle="Real feedback from our partners" 
        limit={6} 
        featuredOnly={false} 
        mode="carousel" 
        showArrows={false} 
      />
      
      <Footer />
    </>
  );
}