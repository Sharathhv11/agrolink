import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Welcome from './pages/Welcome';
import AuthSuccess from './pages/AuthSuccess';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MandiPrices from './pages/MandiPrices';

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mandi-prices" element={<MandiPrices />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
