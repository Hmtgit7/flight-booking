// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BookingProvider } from './context/BookingContext';
import AppRoutes from './routes';
import './styles/tailwind.css';

// Import dev utilities in development mode
import './utils/dev-utils';

const App: React.FC = () => {
  // Log environment info
  useEffect(() => {
    console.log(`App running in ${process.env.NODE_ENV} mode`);
    console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;