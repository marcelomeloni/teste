// hooks/useManageEvent.js - VERSÃO CORRIGIDA
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppWallet } from '@/hooks/useAppWallet';
import { API_URL } from '@/lib/constants';

// ✅ FUNÇÃO AUXILIAR: Obter wallet do usuário (igual ao MyTickets)
const getUserWallet = (wallet, auth) => {
    console.log('🔍 Buscando wallet do usuário para ManageEvent...');

    // 1. Tentar wallet do localStorage (usuários Google)
    try {
        const stored = localStorage.getItem('user_wallet_data');
        if (stored) {
            const walletData = JSON.parse(stored);
            console.log('✅ Wallet carregada do localStorage:', walletData);
            return {
                address: walletData.address,
                type: walletData.type || 'google_generated',
                source: walletData.source || 'firebase_login',
                connected: true // ✅ IMPORTANTE: Considerar como conectado
            };
        }
    } catch (error) {
        console.warn('❌ Erro ao carregar wallet do localStorage:', error);
    }

    // 2. Fallback: wallet Solana conectada
    if (wallet.connected && wallet.publicKey) {
        console.log('✅ Usando wallet Solana conectada:', wallet.publicKey.toString());
        return {
            address: wallet.publicKey.toString(),
            type: 'solana',
            source: 'connected',
            connected: true
        };
    }

    // 3. Tentar obter do AuthContext se disponível
    if (auth.getUserWallet) {
        const authWallet = auth.getUserWallet();
        if (authWallet?.address) {
            console.log('✅ Wallet do AuthContext:', authWallet);
            return {
                ...authWallet,
                connected: true // ✅ Considerar como conectado
            };
        }
    }

    console.log('❌ Nenhuma wallet disponível');
    return null;
};

export function useManageEvent() {
    const { eventAddress } = useParams();
    const auth = useAuth();
    const wallet = useAppWallet();

    // Estados da página
    const [activeSection, setActiveSection] = useState('overview');
    const [event, setEvent] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ CORREÇÃO: Usar a mesma lógica do MyTickets
    const userWallet = useMemo(() => {
        return getUserWallet(wallet, auth);
    }, [wallet.connected, wallet.publicKey, auth.isAuthenticated, auth.getUserWallet]);

    // ✅ CORREÇÃO: Determinar autenticação baseada na userWallet
    const activeAuth = useMemo(() => {
        console.log('🔐 useManageEvent - Estado da autenticação:', {
            userWallet,
            walletConnected: wallet.connected,
            authAuthenticated: auth.isAuthenticated
        });

        if (userWallet && userWallet.connected) {
            return {
                type: userWallet.type,
                publicKey: userWallet.address,
                connected: true,
                source: userWallet.source
            };
        }

        return {
            type: 'none',
            publicKey: null,
            connected: false,
            source: 'none'
        };
    }, [userWallet, wallet.connected, auth.isAuthenticated]);

    // ✅ CORREÇÃO: Função para buscar dados do evento
    const fetchEventData = useCallback(async () => {
        if (!eventAddress) {
            setError('Endereço do evento não fornecido.');
            setLoading(false);
            return;
        }

        if (!activeAuth.connected || !activeAuth.publicKey) {
            console.log('❌ useManageEvent: Não é possível buscar dados - usuário não autenticado');
            setError('Por favor, conecte sua carteira para gerenciar eventos');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('📡 useManageEvent: Buscando dados do evento...', {
                eventAddress,
                controller: activeAuth.publicKey,
                authType: activeAuth.type
            });

            // ✅ CORREÇÃO: Usar a rota correta para gestão de eventos
            const response = await fetch(
                `${API_URL}/api/manage/${eventAddress}?controller=${activeAuth.publicKey}`
            );

            console.log('📨 useManageEvent: Resposta da API:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ useManageEvent: Erro na resposta:', errorText);
                
                if (response.status === 404) {
                    throw new Error('Evento não encontrado');
                } else if (response.status === 403) {
                    throw new Error('Você não tem permissão para gerenciar este evento');
                } else {
                    throw new Error(`Erro ${response.status}: ${errorText}`);
                }
            }

            const result = await response.json();
            console.log('✅ useManageEvent: Dados recebidos:', result);

            if (result.success) {
                setEvent(result.data);
                setMetadata(result.metadata);
            } else {
                throw new Error(result.error || 'Erro ao carregar dados do evento');
            }

        } catch (err) {
            console.error('❌ useManageEvent: Erro ao buscar dados:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [eventAddress, activeAuth]);

    // ✅ CORREÇÃO: Efeito para buscar dados quando a autenticação mudar
    useEffect(() => {
        console.log('🔄 useManageEvent: Verificando autenticação...', {
            activeAuth,
            eventAddress,
            authLoading: auth.isLoading
        });

        // Não fazer nada se ainda estiver carregando a autenticação
        if (auth.isLoading) {
            console.log('⏳ useManageEvent: Auth ainda carregando...');
            return;
        }

        // Se não está autenticado, definir erro e parar
        if (!activeAuth.connected) {
            console.log('❌ useManageEvent: Nenhuma autenticação ativa');
            setLoading(false);
            setError('Por favor, conecte sua carteira para gerenciar eventos');
            return;
        }

        // Se não tem endereço do evento, definir erro
        if (!eventAddress) {
            console.log('❌ useManageEvent: Endereço do evento não fornecido');
            setLoading(false);
            setError('Endereço do evento inválido');
            return;
        }

        // Buscar dados do evento
        fetchEventData();
    }, [eventAddress, activeAuth, auth.isLoading, fetchEventData]);

    // Retry function
    const retry = useCallback(() => {
        console.log('🔄 useManageEvent: Tentando novamente...');
        fetchEventData();
    }, [fetchEventData]);

    return {
        // Dados do evento
        event,
        metadata,
        
        // Estados de loading/error
        loading: loading || auth.isLoading,
        error,
        
        // Autenticação
        activeAuth,
        authLoading: auth.isLoading,
        
        // UI state
        activeSection,
        setActiveSection,
        eventAddress,
        
        // Ações
        retry,
        refresh: fetchEventData
    };
}