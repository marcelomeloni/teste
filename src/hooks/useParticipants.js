import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants.js';
import { useAuth } from '@/contexts/AuthContext';

export const useParticipants = (eventAddress) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());
    
    const { getUserWallet } = useAuth();

    const getController = useCallback(() => {
        const userWallet = getUserWallet();
        return userWallet?.address || null;
    }, [getUserWallet]);

    const fetchParticipants = useCallback(async () => {
        if (!eventAddress) {
            console.warn("fetchParticipants chamado sem eventAddress");
            setLoading(false);
            return;
        }

        const controller = getController();
        if (!controller) {
            toast.error("Carteira do organizador não encontrada. Faça login.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log(`[API] Buscando ingressos vendidos para ${eventAddress} com controller ${controller}`);
            const response = await fetch(`${API_URL}/api/events/${eventAddress}/sold-tickets?controller=${controller}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                if (response.status === 401 || response.status === 403) {
                     toast.error("Acesso negado. Você não é o organizador deste evento.");
                } else if (response.status === 404) {
                     toast.error("Evento não encontrado.");
                } else {
                    toast.error(`Erro ao carregar participantes: ${errorData.error}`);
                }
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                 throw new Error(result.error || "A API retornou um erro inesperado.");
            }

            console.log(`[API] ${result.count} participantes recebidos.`);
            setParticipants(result.data || []);

        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            setParticipants([]);
        } finally {
            setLoading(false);
        }
    }, [eventAddress, getController]);

    const toggleFavorite = useCallback((participantId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(participantId)) {
                newFavorites.delete(participantId);
            } else {
                newFavorites.add(participantId);
            }
            return newFavorites;
        });
    }, []);

    const checkInParticipant = useCallback((participantId) => {
        setParticipants(prev => prev.map(p => 
            p.id === participantId 
                ? { ...p, is_redeemed: true, redeemed_at: new Date().toISOString() }
                : p
        ));
    }, []);

    const addParticipant = useCallback((participantData) => {
        const newParticipant = {
            id: `manual-${Date.now()}`,
            tier_name: participantData.tier,
            purchase_date: new Date().toISOString(),
            status: 'confirmed',
            price_brl_cents: participantData.tier === 'paid' ? participantData.price * 100 : 0,
            is_redeemed: false,
            redeemed_at: null,
            responses: {
                name: participantData.name,
                email: participantData.email,
                phone: participantData.phone
            },
            nft_mint_address: 'Manual Entry',
            event_address: eventAddress,
            ticket_pda_address: 'Manual Entry',
            user: {
                name: participantData.name,
                email: participantData.email,
                phone_number: participantData.phone,
                wallet_address: 'N/A'
            }
        };

        setParticipants(prev => [newParticipant, ...prev]);
    }, [eventAddress]);

    const clearAllCheckins = useCallback(() => {
        setParticipants(prev => prev.map(p => ({ ...p, is_redeemed: false, redeemed_at: null })));
    }, []);

    useEffect(() => {
        fetchParticipants();
    }, [fetchParticipants]);

    return {
        participants,
        loading,
        favorites,
        fetchParticipants,
        toggleFavorite,
        checkInParticipant,
        addParticipant,
        clearAllCheckins
    };
};