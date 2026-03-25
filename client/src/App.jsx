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
import JobCreate from './pages/JobCreate';
import JobAnalytics from './pages/JobAnalytics';
import MatchedWorkers from './pages/MatchedWorkers';
import JobShortView from './pages/JobShortView';
import JobPublicView from './pages/JobPublicView';
import JobsList from './pages/JobsList';
import AppliedJobs from './pages/AppliedJobs';
import FasalPlanner from './pages/FasalPlanner';
import LaborRegister from './pages/LaborRegister';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/labor-register" element={<LaborRegister />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/jobs/new" element={<JobCreate />} />
          <Route path="/jobs/:jobId/analytics" element={<JobAnalytics />} />
          <Route path="/jobs/:jobId/workers" element={<MatchedWorkers />} />
          <Route path="/jobs/view/:jobId" element={<JobPublicView />} />
          <Route path="/j/:shortCode" element={<JobShortView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mandi-prices" element={<MandiPrices />} />
          <Route path="/fasal-planner" element={<FasalPlanner />} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
