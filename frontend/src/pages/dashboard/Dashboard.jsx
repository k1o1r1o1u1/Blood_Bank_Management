import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import HospitalDashboard from './HospitalDashboard';
import DonorDashboard from './DonorDashboard';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { role: 'Admin', name: 'Director' };
    } catch {
      return { role: 'Admin', name: 'Director' };
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setCurrentUser(u);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const role = currentUser?.role || 'Admin';

  return (
    <div className="space-y-6">
      {role === 'Hospital' ? (
        <HospitalDashboard user={currentUser} />
      ) : role === 'Donor' ? (
        <DonorDashboard user={currentUser} />
      ) : role === 'Staff' ? (
        <StaffDashboard user={currentUser} />
      ) : (
        <AdminDashboard user={currentUser} />
      )}
    </div>
  );
}
