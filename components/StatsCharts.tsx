import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { User, Counter, LogEntry } from '../types';

interface StatsProps {
  logs: LogEntry[];
  users: User[];
  counters: Counter[];
  activeCounterId: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 rounded shadow-lg text-sm">
        <p className="font-bold">{label}</p>
        <p className="text-blue-500">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const LeaderboardChart: React.FC<StatsProps> = ({ logs, users, activeCounterId }) => {
  const data = users.map(user => {
    const count = logs.filter(l => l.counterId === activeCounterId && l.userId === user.id).length;
    return {
      name: user.name,
      count: count,
      color: user.color
    };
  }).sort((a, b) => b.count - a.count);

  if (data.every(d => d.count === 0)) {
    return <div className="h-40 flex items-center justify-center text-zinc-400 italic">No data yet for this counter</div>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={60} tick={{fill: '#888', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
