import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function InventoryDonut({ inventory = [] }) {
  // Build donut data from real inventory, filter out groups with 0 units
  const donutData = inventory
    .filter((item) => (item.available_units ?? 0) > 0)
    .map((item) => ({
      name:  item.blood_group,
      value: item.available_units,
      color: BLOOD_GROUP_COLORS[item.blood_group] ?? defaultGroupColor,
    }));

  const totalUnits = donutData.reduce((acc, curr) => acc + curr.value, 0);

  if (donutData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
        <p className="text-sm font-medium text-text-muted">No available units to display.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-48 h-48 sm:w-52 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1315',
                borderRadius: '12px',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                padding: '6px 10px',
              }}
              formatter={(value, name) => [`${value} units`, name]}
            />
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-bold text-text-main leading-none">
            {totalUnits.toLocaleString()}
          </span>
          <span className="text-[11px] text-text-muted font-medium mt-0.5">
            Available
          </span>
        </div>
      </div>

      {/* Mini Legend */}
      <div className="grid grid-cols-4 gap-x-3 gap-y-1.5 mt-2 w-full max-w-xs text-[11px]">
        {donutData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-text-main">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
