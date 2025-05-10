// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Import dev utils in development mode
if (process.env.NODE_ENV === 'development') {
  // Import and initialize dev utils
  import('./utils/dev-utils/index').then(module => {
    console.log('DevUtils loaded in development mode');
  }).catch(err => {
    console.error('Failed to load DevUtils:', err);
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);