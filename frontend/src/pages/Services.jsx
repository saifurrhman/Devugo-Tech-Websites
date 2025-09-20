import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Services() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Services</h1>
        <ul>
          <li>Landing pages</li>
          <li>E‑commerce (Shopify, WooCommerce, custom)</li>
          <li>Full‑stack web apps</li>
          <li>UI/UX and optimization</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
