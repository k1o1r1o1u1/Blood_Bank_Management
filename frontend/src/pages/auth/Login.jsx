import React from 'react';
import { Droplet } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function Login() {
  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center p-4">
      <Card variant="surface" className="w-full max-w-md p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center mx-auto shadow-sm shadow-brand-teal/30">
          <Droplet className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-main">BloodCare</h1>
          <p className="text-xs text-text-muted mt-1">Blood Bank Management System</p>
        </div>
        <p className="text-sm text-text-muted pt-2 border-t border-border-subtle">
          Login Portal (Phase 1/2 Placeholder)
        </p>
      </Card>
    </div>
  );
}
