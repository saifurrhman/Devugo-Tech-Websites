import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Team() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Our Team</h1>
        <p>Team members will be listed here.</p>
      </main>
      <Footer />
    </>
  );
}
