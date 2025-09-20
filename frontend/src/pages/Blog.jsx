import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Blog() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Blog</h1>
        <p>Posts will be listed here.</p>
      </main>
      <Footer />
    </>
  );
}
