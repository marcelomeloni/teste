// hooks/useTeamManagement.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { API_URL } from '@/lib/constants';

export const useTeamManagement = (event) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeamProfiles = useCallback(async () => {
    if (!event?.account?.controller || !event?.account?.validators) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const controllerAddress = event.account.controller;
      const validatorAddresses = event.account.validators;
      const allAddresses = [...new Set([controllerAddress, ...validatorAddresses])];

      if (allAddresses.length === 0) {
        setTeam([]);
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('name, email, wallet_address')
        .in('wallet_address', allAddresses);

      if (error) throw error;
      
      const profilesMap = new Map(profiles.map(p => [p.wallet_address, p]));
      
      const enrichedTeam = allAddresses.map(address => {
        const profile = profilesMap.get(address);
        const role = address === controllerAddress ? 'Proprietário' : 'Check-in';
        
        return {
          address,
          name: profile?.name || 'Usuário sem perfil',
          email: profile?.email || '-',
          role: role,
          roleKey: address === controllerAddress ? 'controller' : 'checkin'
        };
      });
      
      setTeam(enrichedTeam);
    } catch (error) {
      toast.error("Erro ao buscar perfis da equipe.");
      console.error("Erro no Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, [event]);

  const handleApiAction = async (action, memberAddress, role = 'checkin', messages) => {
    if (!event || !event.publicKey) {
      return toast.error("Dados do evento ainda não carregados. Tente novamente.");
    }
    
    const userLoginData = localStorage.getItem('solana-local-wallet-credentials');
    if (!userLoginData) {
      return toast.error("Você precisa estar logado para realizar esta ação.");
    }

    setActionLoading(true);
    const loadingToastId = toast.loading(messages.loading);

    try {
      const response = await fetch(`${API_URL}/api/events/${event.publicKey}/validators/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventAddress: event.publicKey,
          validatorAddress: memberAddress,
          userLoginData,
          role: role
        }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || messages.error);
      }

      toast.success(messages.success, { id: loadingToastId });
      fetchTeamProfiles();
      return true;

    } catch (error) {
      toast.error(error.message, { id: loadingToastId });
      console.error(`Falha na ação '${action}':`, error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    team,
    loading,
    actionLoading,
    fetchTeamProfiles,
    handleApiAction
  };
};