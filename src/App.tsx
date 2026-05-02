import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PatientDashboard from './pages/PatientDashboard';
import UploadRecordPage from './pages/UploadRecordPage';
import TimelinePage from './pages/TimelinePage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientViewPage from './pages/PatientViewPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Onboarding */}
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } 
              />

              {/* Patient Routes */}
              <Route 
                path="/patient/dashboard" 
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/upload" 
                element={
                  <ProtectedRoute allowedRole="patient">
                    <UploadRecordPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/timeline" 
                element={
                  <ProtectedRoute allowedRole="patient">
                    <TimelinePage />
                  </ProtectedRoute>
                } 
              />

              {/* Doctor Routes */}
              <Route 
                path="/doctor/dashboard" 
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/patient/:id" 
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <PatientViewPage />
                  </ProtectedRoute>
                } 
              />

              {/* Root Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
