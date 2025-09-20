import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Portfolio() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Portfolio</h1>
        <p>Projects will appear here.</p>
      </main>
      <Footer />
    </>
  );
}
