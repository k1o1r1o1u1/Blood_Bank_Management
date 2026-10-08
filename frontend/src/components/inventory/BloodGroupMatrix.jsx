import React from 'react';
import BloodGroupCard from './BloodGroupCard';

export default function BloodGroupMatrix({ inventory = [], selectedGroup, onSelectGroup }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-main">
            Blood Group Reserves
          </h2>
          <p className="text-xs text-text-muted">
            Click any blood group card to inspect unit batches and storage breakdown
          </p>
        </div>
        <span className="text-xs font-semibold text-text-muted bg-surface-white px-2.5 py-1 rounded-lg border border-border-card">
          {inventory.length} Blood Groups Tracked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <BloodGroupCard
            key={item.blood_group_id || item.blood_group}
            item={item}
            isSelected={selectedGroup?.blood_group === item.blood_group}
            onSelect={onSelectGroup}
          />
        ))}
      </div>
    </div>
  );
}
