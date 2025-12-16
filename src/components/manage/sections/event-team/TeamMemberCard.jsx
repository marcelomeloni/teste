// components/TeamMemberCard.jsx
import React, { useState } from 'react';
import { 
  TrashIcon, 
  InformationCircleIcon,
  EnvelopeIcon,
  WalletIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export const TeamMemberCard = ({ member, onRemove, isRemoving }) => {
  const [showFullAddress, setShowFullAddress] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <MemberAvatar name={member.name} />
          <MemberInfo 
            member={member} 
            showFullAddress={showFullAddress}
            onToggleAddress={() => setShowFullAddress(!showFullAddress)}
          />
        </div>
        <MemberActions 
          member={member} 
          onRemove={onRemove} 
          isRemoving={isRemoving} 
        />
      </div>
    </div>
  );
};

const MemberAvatar = ({ name }) => (
  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
    {getInitials(name)}
  </div>
);

const MemberInfo = ({ member, showFullAddress, onToggleAddress }) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      <h3 className="font-semibold text-slate-900 truncate">
        {member.name}
      </h3>
      {member.role === 'Proprietário' && (
        <InformationCircleIcon 
          className="h-4 w-4 text-slate-400 flex-shrink-0" 
          title="O proprietário não pode ser removido."
        />
      )}
    </div>
    
    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
      <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{member.email}</span>
    </div>
    
    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
      <WalletIcon className="h-4 w-4 flex-shrink-0" />
      <button
        onClick={onToggleAddress}
        className="font-mono text-xs hover:text-slate-800 transition-colors flex items-center gap-1"
        title={showFullAddress ? 'Ocultar endereço' : 'Mostrar endereço completo'}
      >
        {showFullAddress ? member.address : `${member.address.slice(0, 8)}...${member.address.slice(-8)}`}
        {showFullAddress ? <EyeSlashIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
      </button>
    </div>
    
    <RoleBadge role={member.role} />
  </div>
);

const MemberActions = ({ member, onRemove, isRemoving }) => {
  if (member.role === 'Proprietário') return null;

  return (
    <button 
      onClick={() => onRemove(member)}
      disabled={isRemoving}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Remover membro"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
    {getRoleIcon(role)}
    {role}
  </span>
);

// Funções auxiliares
const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'Proprietário':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Administrador':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Promoter':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Check-in':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'Proprietário':
      return <ShieldCheckIcon className="h-4 w-4" />;
    case 'Administrador':
      return <UserGroupIcon className="h-4 w-4" />;
    case 'Promoter':
      return <UserPlusIcon className="h-4 w-4" />;
    case 'Check-in':
      return <CheckBadgeIcon className="h-4 w-4" />;
    default:
      return <InformationCircleIcon className="h-4 w-4" />;
  }
};

const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};