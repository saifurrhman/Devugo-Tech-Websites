import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>About Us</h1>
        <p>We are a tech agency delivering results across SaaS, Finance/Travel/Transportation, Healthcare and E‑Commerce.</p>
      </main>
      <Footer />
    </>
  );
}
