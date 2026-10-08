import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, PlusCircle, FileText, Send, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add Donor',
      desc: 'Register new blood donor profile',
      icon: UserPlus,
      path: '/donors/add',
    },
    {
      title: 'Record Donation',
      desc: 'Log donation & screening status',
      icon: PlusCircle,
      path: '/donations/add',
    },
    {
      title: 'Create Request',
      desc: 'Submit hospital blood requisition',
      icon: FileText,
      path: '/requests',
    },
    {
      title: 'Issue Blood',
      desc: 'Execute ACID unit issuance',
      icon: Send,
      path: '/issues',
    },
  ];

  return (
    <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean">
      <div className="pb-3 border-b border-border-card mb-4">
        <h3 className="text-sm font-semibold text-text-main">
          Operational Quick Actions
        </h3>
        <p className="text-[11px] text-text-muted">Direct workflows for daily staff operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.title}
              onClick={() => navigate(act.path)}
              className="p-3.5 rounded-xl border border-border-card bg-workspace-bg hover:bg-[#FFF7F8] hover:border-brand-blood/40 transition-all duration-150 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-white border border-border-card flex items-center justify-center text-brand-blood group-hover:bg-brand-blood group-hover:text-white transition-colors shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main group-hover:text-brand-blood transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                    {act.desc}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-blood group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
