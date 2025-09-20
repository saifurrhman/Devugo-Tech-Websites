import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>© {new Date().getFullYear()} Devugo Tech Agency. All rights reserved.</p>
        <a href="/privacy-policy">Privacy Policy</a>
      </div>
    </footer>
  );
}
