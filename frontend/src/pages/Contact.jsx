import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Contact Us</h1>
        <form className="contact-form">
          <input placeholder="Your Name" />
          <input placeholder="Email" type="email" />
          <textarea placeholder="Message" />
          <button type="submit">Send</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
