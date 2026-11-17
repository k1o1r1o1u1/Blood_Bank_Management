import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Donors from './pages/donors/Donors';
import AddDonor from './pages/donors/AddDonor';
import DonorDetails from './pages/donors/DonorDetails';
import Donations from './pages/donations/Donations';
import AddDonation from './pages/donations/AddDonation';
import Inventory from './pages/inventory/Inventory';
import Hospitals from './pages/hospitals/Hospitals';
import AddHospital from './pages/hospitals/AddHospital';
import Requests from './pages/requests/Requests';
import AddRequest from './pages/requests/AddRequest';
import RequestDetails from './pages/requests/RequestDetails';
import Issues from './pages/issues/Issues';
import IssueDetails from './pages/issues/IssueDetails';
import Reports from './pages/reports/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route outside DashboardLayout */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Workspace with DashboardLayout Shell */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Hospital']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Donor']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Donors Routes - Admin & Staff only */}
          <Route
            path="/donors"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Donors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors/add"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <AddDonor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <DonorDetails />
              </ProtectedRoute>
            }
          />

          {/* Donations Routes - Admin, Staff, and Donors (scoped) */}
          <Route
            path="/donations"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Donor']}>
                <Donations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations/add"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <AddDonation />
              </ProtectedRoute>
            }
          />

          {/* Inventory Route - Available to all authenticated accounts */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* Hospitals Routes - Admin & Staff only */}
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Hospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals/add"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AddHospital />
              </ProtectedRoute>
            }
          />

          {/* Requests Routes - Admin, Staff & Partner Hospitals */}
          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Hospital']}>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/add"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Hospital']}>
                <AddRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Hospital']}>
                <RequestDetails />
              </ProtectedRoute>
            }
          />

          {/* Issues Routes - Admin & Staff only */}
          <Route
            path="/issues"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Issues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <IssueDetails />
              </ProtectedRoute>
            }
          />

          {/* Reports Route - Admin & Staff only */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Reports />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
