import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';

import { useParticipants } from '@/hooks/useParticipants';
import { useParticipantFilters } from '@/hooks/useParticipantFilters';
import { calculateStats, exportToCSV } from '@/lib/participantHelpers';
import { ParticipantDetailsModal } from './checkin/ParticipantDetailsModal';
import { AddParticipantModal } from './checkin/AddParticipantModal';
import { ParticipantCheckinTable } from './checkin/ParticipantCheckinTable';
import { StatsCards } from './checkin/StatsCards';
import { Toolbar } from './checkin/Toolbar';

export function ParticipantsCheckin({ eventAddress }) {
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Controle de colunas visíveis
    const [visibleColumns, setVisibleColumns] = useState({
        participant: true,
        email: true,
        ticket: true,
        purchase: true,
        payment: true,
        value: true,
        checkin: true,
        nft: true,
        actions: true
    });

    // Hooks customizados
    const {
        participants,
        loading,
        favorites,
        toggleFavorite,
        checkInParticipant,
        addParticipant,
        clearAllCheckins
    } = useParticipants(eventAddress);

    const {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        filteredParticipants
    } = useParticipantFilters(participants, favorites);

    // Stats
    const stats = calculateStats(participants);

    // Handlers
    const handleViewDetails = (participant) => {
        setSelectedParticipant(participant);
        setIsDetailsModalOpen(true);
    };

    const handleCheckIn = async (participantId) => {
        try {
            toast.success('Check-in realizado com sucesso!');
            checkInParticipant(participantId);
        } catch (error) {
            toast.error('Erro ao realizar check-in');
        }
    };

    const handleAddParticipant = (participantData) => {
        addParticipant(participantData);
        toast.success('Participante adicionado com sucesso!');
    };

    const handleToggleFavorite = (participantId) => {
        toggleFavorite(participantId);
    };

    const handleExport = () => {
        exportToCSV(filteredParticipants, eventAddress);
        toast.success('Lista exportada com sucesso!');
    };

    const handleClearCheckins = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os check-ins? Esta ação não pode ser desfeita.')) {
            clearAllCheckins();
            toast.success('Check-ins limpos com sucesso!');
        }
    };

    return (
        <div className="space-y-6 pb-4">
            {/* MODAIS */}
            <ParticipantDetailsModal
                participant={selectedParticipant}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onCheckIn={handleCheckIn}
            />

            <AddParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddParticipant={handleAddParticipant}
            />

            {/* STATS CARDS */}
            <StatsCards 
                stats={stats}
                onClearCheckins={handleClearCheckins}
                onExport={handleExport}
            />

            {/* CARD DA LISTA DE PARTICIPANTES */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                    <Toolbar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filters={filters}
                        onFiltersChange={setFilters}
                        visibleColumns={visibleColumns}
                        onColumnsChange={setVisibleColumns}
                        onExport={handleExport}
                        onAddParticipant={() => setIsAddModalOpen(true)}
                    />
                    <span className="text-sm font-normal text-slate-500 mt-2 block">
                        ({filteredParticipants.length} de {stats.totalCount})
                    </span>
                </div>

                {/* Tabela */}
                <ParticipantCheckinTable 
                    participants={filteredParticipants} 
                    isLoading={loading}
                    onViewDetails={handleViewDetails}
                    onCheckIn={handleCheckIn}
                    visibleColumns={visibleColumns}
                    onToggleFavorite={handleToggleFavorite}
                />
            </div>
        </div>
    );
}