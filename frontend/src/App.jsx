import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

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
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Donors Routes */}
          <Route path="/donors" element={<Donors />} />
          <Route path="/donors/add" element={<AddDonor />} />
          <Route path="/donors/:id" element={<DonorDetails />} />

          {/* Donations Routes */}
          <Route path="/donations" element={<Donations />} />
          <Route path="/donations/add" element={<AddDonation />} />

          {/* Inventory Route */}
          <Route path="/inventory" element={<Inventory />} />

          {/* Hospitals Routes */}
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/add" element={<AddHospital />} />

          {/* Requests Routes */}
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/add" element={<AddRequest />} />
          <Route path="/requests/:id" element={<RequestDetails />} />

          {/* Issues Routes */}
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />

          {/* Reports Route */}
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
