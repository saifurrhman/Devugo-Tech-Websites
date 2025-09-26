import React from 'react';

export default function SocialFloating() {
  return (
    <aside className="social-float" aria-label="Social links">
      <a href="https://www.linkedin.com/company/devugo" target="_blank" rel="noreferrer" className="sf-btn" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7.5 0h3.84v2.05h.06c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.22V23h-4v-6.63c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-3.86V8Z"/></svg>
      </a>
      <a href="https://instagram.com/devugo" target="_blank" rel="noreferrer" className="sf-btn" aria-label="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/></svg>
      </a>
      <a href="https://twitter.com/devugo" target="_blank" rel="noreferrer" className="sf-btn" aria-label="Twitter">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.68-6.37-1.86.33.04.65.05.99.05 1.95 0 3.75-.66 5.18-1.77-1.82-.04-3.36-1.23-3.89-2.87.26.04.51.06.78.06.38 0 .76-.05 1.12-.15-1.9-.38-3.33-2.06-3.33-4.07v-.05c.56.31 1.2.5 1.88.52-1.11-.74-1.84-2-1.84-3.43 0-.76.2-1.47.56-2.09 2.05 2.51 5.12 4.16 8.58 4.33-.06-.31-.09-.64-.09-.97 0-2.34 1.9-4.24 4.24-4.24 1.22 0 2.32.51 3.1 1.33.97-.2 1.89-.54 2.71-1.03-.32 1-1 1.85-1.9 2.38.86-.1 1.68-.33 2.44-.67-.57.85-1.3 1.6-2.13 2.2Z"/></svg>
      </a>
      <a href="https://facebook.com/devugo" target="_blank" rel="noreferrer" className="sf-btn" aria-label="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 2 6.48 2 12.06c0 4.9 3.5 8.97 8.09 9.86v-6.98H7.56v-2.88h2.53V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.98C18.5 21.03 22 16.96 22 12.06Z"/></svg>
      </a>
      <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="sf-btn sf-whatsapp" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.94 14.51L2 22l5.61-1.48A10 10 0 1 0 12 2Zm5.5 14.5c-.25.7-1.23 1.28-1.96 1.45-.52.12-1.2.21-3.5-.74-2.94-1.22-4.83-4.21-4.98-4.41-.14-.2-1.18-1.58-1.18-3.02 0-1.45.73-2.16.99-2.45.25-.3.55-.37.73-.37h.52c.17 0 .39 0 .59.45.25.58.87 2.01.95 2.15.08.14.12.3.02.49-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.31.31-.13.62.17.31.75 1.23 1.61 1.99 1.11.98 2.04 1.28 2.35 1.42.31.15.49.12.66-.07.17-.19.76-.88.96-1.18.2-.3.41-.25.68-.15.27.1 1.71.81 2 .95.29.14.48.22.55.34.06.12.06.72-.18 1.42Z"/></svg>
      </a>
    </aside>
  );
}
