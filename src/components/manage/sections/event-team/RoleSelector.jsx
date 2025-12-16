// RoleSelector.jsx
import React from 'react';
import { ShieldCheckIcon, UserGroupIcon, UserPlusIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      value: 'checkin',
      label: 'Check-in',
      description: 'Apenas fazer check-in de participantes',
      icon: CheckBadgeIcon,
      color: 'orange'
    },
    {
      value: 'promoter',
      label: 'Promoter',
      description: 'Convidar participantes e fazer check-in',
      icon: UserPlusIcon,
      color: 'green'
    },
    {
      value: 'admin',
      label: 'Administrador',
      description: 'Gerenciar equipe e configurações do evento',
      icon: UserGroupIcon,
      color: 'blue'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700'
    };
    return colors[color] || colors.orange;
  };

  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.value;
        
        return (
          <label 
            key={role.value}
            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
              isSelected 
                ? `${getColorClasses(role.color)} ring-2 ring-offset-2 ring-current` 
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={isSelected}
                onChange={(e) => onRoleChange(e.target.value)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{role.label}</span>
                </div>
                <p className="text-xs text-slate-600">{role.description}</p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
};