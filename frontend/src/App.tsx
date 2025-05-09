// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BookingProvider } from './context/BookingContext';
import AppRoutes from './routes';
import './styles/tailwind.css';

const App: React.FC = () => {
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