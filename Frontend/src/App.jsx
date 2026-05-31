import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StateAdminDashboard from './pages/StateAdminDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import ComplaintTrackingPage from './pages/ComplaintTrackingPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Guest Only Routes */}
        <Route path="/login" element={<ProtectedRoute requireGuest={true}><LoginPage /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute requireGuest={true}><RegisterPage /></ProtectedRoute>} />

        {/* Protected Dashboard Routes nested inside layout */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard/citizen" replace />} />
          
          <Route path="citizen" element={<ProtectedRoute allowedRoles={['citizen', 'district_admin', 'state_admin']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute allowedRoles={['district_admin', 'state_admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="state-admin" element={<ProtectedRoute allowedRoles={['state_admin']}><StateAdminDashboard /></ProtectedRoute>} />
          
          <Route path="report" element={<ProtectedRoute allowedRoles={['citizen', 'district_admin', 'state_admin']}><ReportIssuePage /></ProtectedRoute>} />
          <Route path="track" element={<ProtectedRoute allowedRoles={['citizen', 'district_admin', 'state_admin']}><ComplaintTrackingPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['citizen', 'district_admin', 'state_admin']}><ProfilePage /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute allowedRoles={['citizen', 'district_admin', 'state_admin']}><NotificationsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
