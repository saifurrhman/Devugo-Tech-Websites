import React, { useState } from 'react';
import { PopupModal } from 'react-calendly';
import './HomeCta.css';

export default function HomeCta() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="container">
          <div className="cta-card">
            <h2 id="home-cta-title">Ready to make your business standout?</h2>
            <p>Take the first step toward transforming your business with impactful design and tailored, high‑converting software solutions.</p>
            <button
              className="btn outline light"
              onClick={() => setIsOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              Book a 30 minutes Discovery Call
            </button>
          </div>
        </div>
      </section>

      <PopupModal
        url="https://calendly.com/saifurrehman-devugotech/30min"
        onModalClose={() => setIsOpen(false)}
        open={isOpen}
        rootElement={document.getElementById("root")}
      />
    </>
  );
}
