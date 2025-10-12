import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PortfolioCategories from '../components/PortfolioCategories';
import HomeCta from '../components/HomeCta';
import HomeFaq from '../components/HomeFaq';
import WhyChoose from '../components/WhyChoose';
import Footer from '../components/Footer';
import SocialFloating from '../components/SocialFloating';
import HomePortfolio from '../components/HomePortfolio';
import ReviewsSection from '../components/ReviewsSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <SocialFloating />
      <Hero />
      <PortfolioCategories />
      <HomePortfolio limit={6} mode="carousel" />
      <WhyChoose />
      <HomeFaq />
      <HomeCta />
      <ReviewsSection title="What clients say" subtitle="Real feedback from our partners" limit={6} featuredOnly={false} mode="carousel" showArrows={false} />
      <Footer />
    </>
  );
}
