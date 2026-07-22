import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy | Devugo Tech"
        description="Read our privacy policy to understand how Devugo Tech Solutions handles and protects your data."
        url="/privacy-policy"
      />
      <Navbar />
      <main className="container">
        <h1>Privacy Policy</h1>
        <p>We respect your privacy. Update this page with your real policy.</p>
      </main>
      <Footer />
    </>
  );
}
