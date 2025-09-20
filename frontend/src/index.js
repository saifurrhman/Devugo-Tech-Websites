import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import PublicRoutes from './routes/PublicRoutes';
import reportWebVitals from './reportWebVitals';

// Apply saved admin theme early (admin-light | admin-dark)
try {
  const saved = localStorage.getItem('adminTheme');
  if (saved === 'admin-light' || saved === 'admin-dark') {
    document.body.classList.remove('admin-light', 'admin-dark');
    document.body.classList.add(saved);
  }
} catch (e) {}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PublicRoutes />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
