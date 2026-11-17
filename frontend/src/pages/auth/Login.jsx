import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Shield, Stethoscope, Building2, Heart, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Staff');

  const demoAccounts = {
    Admin: {
      email: 'admin@bloodbank.org',
      password: 'adminpassword',
      name: 'Dr. Sarah Jenkins',
      role: 'Admin',
      badge: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    Staff: {
      email: 'staff@bloodbank.org',
      password: 'staffpassword',
      name: 'Rajesh Verma',
      role: 'Staff',
      badge: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    Hospital: {
      email: 'emergency@apollohospitals.com',
      password: 'hospital123',
      name: 'Apollo Hospital',
      role: 'Hospital',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    Donor: {
      email: 'rahul.sharma@gmail.com',
      password: 'donor123',
      name: 'Rahul Sharma',
      role: 'Donor',
      badge: 'bg-rose-100 text-rose-800 border-rose-200'
    }
  };

  const handleQuickFill = (roleKey) => {
    setActiveTab(roleKey);
    setEmail(demoAccounts[roleKey].email);
    setPassword(demoAccounts[roleKey].password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.login({ email, password });
      
      if (response && response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#C52233] text-white flex items-center justify-center mx-auto shadow-md shadow-[#C52233]/30 mb-3">
          <Droplet className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#181415] tracking-tight">BloodCare</h1>
        <p className="text-sm text-[#7E7678] mt-1">Full-Stack Blood Bank & Multi-Role Healthcare Management</p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-[#EFEBE4] p-6 sm:p-8">
        {/* Role Category Selector Pills */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#7E7678] uppercase tracking-wider mb-2 text-center">
            Select User Role for Quick Demo Sign-In
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'Admin', label: 'Admin', icon: Shield, color: 'text-purple-600' },
              { id: 'Staff', label: 'Staff', icon: Stethoscope, color: 'text-teal-600' },
              { id: 'Hospital', label: 'Hospital', icon: Building2, color: 'text-blue-600' },
              { id: 'Donor', label: 'Donor', icon: Heart, color: 'text-rose-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleQuickFill(tab.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#181415] text-white border-[#181415] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#555] border-[#EFEBE4] hover:bg-[#F3ECE4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Account Quick Preview Pill */}
        <div className="mb-6 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEBE4] flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-[#181415]">{demoAccounts[activeTab].name}</span>
            <span className="text-[#7E7678] block">{demoAccounts[activeTab].email}</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${demoAccounts[activeTab].badge}`}>
            {demoAccounts[activeTab].role}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#181415] mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@bloodbank.org"
              required
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[#DCD5CB] bg-white text-[#181415] focus:outline-none focus:ring-2 focus:ring-[#C52233] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181415] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[#DCD5CB] bg-white text-[#181415] focus:outline-none focus:ring-2 focus:ring-[#C52233] focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#C52233] hover:bg-[#A61C2E] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#EFEBE4] text-center text-xs text-[#7E7678]">
          <p>Multi-Role Access Control: Admin • Staff • Hospital Partner • Blood Donor</p>
        </div>
      </div>
    </div>
  );
}
