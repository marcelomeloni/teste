// EventTeam.jsx - COMPONENTE PRINCIPAL
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { API_URL } from '@/lib/constants';
import { 
    UserPlusIcon, 
    UserGroupIcon 
} from '@heroicons/react/24/outline';
import { AddTeamMemberModal } from './event-team/AddTeamMemberModal';
import { ConfirmationModal } from './event-team/ConfirmationModal';
import { TeamMemberCard } from './event-team/TeamMemberCard';
import { TeamStats } from './event-team/TeamStats';
import { useTeamManagement } from '@/hooks/useTeamManagement';

export function EventTeam({ event }) {
  const {
    team,
    loading,
    actionLoading,
    fetchTeamProfiles,
    handleApiAction
  } = useTeamManagement(event);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    fetchTeamProfiles();
  }, [fetchTeamProfiles]);

  const handleAddTeamMember = (walletAddress, role) => {
    handleApiAction('add', walletAddress, role, {
      loading: `Adicionando membro...`,
      success: `Membro adicionado com sucesso!`,
      error: `Falha ao adicionar membro.`,
    }).then(() => {
      setIsAddModalOpen(false);
    });
  };

  const openRemoveConfirmation = (member) => {
    setMemberToRemove(member);
    setIsConfirmModalOpen(true);
  };

  const confirmRemoveMember = () => {
    if (!memberToRemove) return;
    
    handleApiAction('remove', memberToRemove.address, memberToRemove.roleKey, {
      loading: 'Removendo membro...',
      success: 'Membro removido da equipe!',
      error: 'Falha ao remover membro.',
    });

    setIsConfirmModalOpen(false);
    setMemberToRemove(null);
  };

  if (!event) {
    return <EventTeamLoading />;
  }

  return (
    <>
      <AddTeamMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTeamMember}
      />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmRemoveMember}
        member={memberToRemove}
      />
      
      <div className="space-y-6">
        <TeamHeader 
          onAddMember={() => setIsAddModalOpen(true)}
          teamStats={team}
        />
        
        <TeamMembersList
          team={team}
          loading={loading}
          actionLoading={actionLoading}
          onRemoveMember={openRemoveConfirmation}
          onAddMember={() => setIsAddModalOpen(true)}
        />
      </div>
    </>
  );
}

// Componentes auxiliares locais
const EventTeamLoading = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <UserGroupIcon className="h-8 w-8 text-slate-400" />
    </div>
    <p className="text-slate-500">Carregando dados do evento...</p>
  </div>
);

const TeamHeader = ({ onAddMember, teamStats }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <UserGroupIcon className="h-8 w-8 text-blue-600" />
          Equipe do Evento
        </h2>
        <p className="text-slate-600 mt-1">
          Gerencie as permissões da sua equipe
        </p>
      </div>
      <button 
        onClick={onAddMember}
        className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shrink-0"
      >
        <UserPlusIcon className="h-5 w-5" /> 
        Adicionar Membro
      </button>
    </div>
    
    <TeamStats team={teamStats} />
  </div>
);

const TeamMembersList = ({ team, loading, actionLoading, onRemoveMember, onAddMember }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800">
        Membros da Equipe
        <span className="text-sm font-normal text-slate-500 ml-2">
          ({team.length} membro{team.length !== 1 ? 's' : ''})
        </span>
      </h3>
    </div>
    
    <div className="p-6">
      {loading ? (
        <TeamMembersLoading />
      ) : team.length === 0 ? (
        <EmptyTeamState onAddMember={onAddMember} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {team.map((member) => (
            <TeamMemberCard
              key={member.address}
              member={member}
              onRemove={onRemoveMember}
              isRemoving={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

const TeamMembersLoading = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyTeamState = ({ onAddMember }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <UserGroupIcon className="h-12 w-12 text-slate-400" />
    </div>
    <h4 className="text-lg font-semibold text-slate-900 mb-2">
      Nenhum membro na equipe
    </h4>
    <p className="text-slate-600 mb-6 max-w-sm mx-auto">
      Adicione membros à sua equipe para ajudar a gerenciar o evento.
    </p>
    <button 
      onClick={onAddMember}
      className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-colors"
    >
      <UserPlusIcon className="h-5 w-5" /> 
      Adicionar Primeiro Membro
    </button>
  </div>
);