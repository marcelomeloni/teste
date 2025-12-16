// components/TeamStats.jsx
import React from 'react';

export const TeamStats = ({ team }) => {
  const stats = {
    total: team.length,
    admins: team.filter(m => m.role === 'Administrador').length,
    promoters: team.filter(m => m.role === 'Promoter').length,
    checkins: team.filter(m => m.role === 'Check-in').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <StatCard value={stats.total} label="Total" />
      <StatCard value={stats.admins} label="Administradores" color="blue" />
      <StatCard value={stats.promoters} label="Promoters" color="green" />
      <StatCard value={stats.checkins} label="Check-in" color="orange" />
    </div>
  );
};

const StatCard = ({ value, label, color = 'slate' }) => {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-900',
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    orange: 'bg-orange-50 text-orange-900'
  };

  return (
    <div className={`text-center p-4 ${colorClasses[color]} rounded-lg`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
};