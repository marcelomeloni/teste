// hooks/useAppWallet.js - VERSÃO CORRIGIDA
import { useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicKey } from '@solana/web3.js';

export const useAppWallet = () => {
    const walletAdapter = useWallet();
    const auth = useAuth();

    const appWallet = useMemo(() => {
        console.log('🔄 useAppWallet: Calculando estado da carteira...', {
            adapterConnected: walletAdapter.connected,
            adapterPublicKey: walletAdapter.publicKey?.toString(),
            authAuthenticated: auth.isAuthenticated,
            authSolanaWallet: auth.solanaWallet,
            authUser: auth.user
        });

        // Prioridade 1: Carteira do Wallet Adapter
        if (walletAdapter.connected && walletAdapter.publicKey) {
            console.log('✅ useAppWallet: Usando carteira adapter tradicional');
            return {
                ...walletAdapter,
                walletType: 'wallet_adapter',
                signTransaction: walletAdapter.signTransaction || (async (tx) => {
                    console.warn('⚠️ signTransaction não implementado no adapter');
                    return tx;
                }),
                signAllTransactions: walletAdapter.signAllTransactions || (async (txs) => {
                    console.warn('⚠️ signAllTransactions não implementado no adapter');
                    return txs;
                }),
            };
        }

        // Prioridade 2: Carteira Solana conectada via AuthContext
        if (auth.solanaWallet?.connected && auth.solanaWallet.publicKey) {
            console.log('✅ useAppWallet: Usando carteira AuthContext Solana');
            
            return {
                connected: true,
                connecting: false,
                disconnecting: false,
                publicKey: new PublicKey(auth.solanaWallet.publicKey),
                walletType: 'solana_auth',
                
                disconnect: async () => {
                    await auth.disconnectSolanaWallet();
                },
                
                signTransaction: async (transaction) => {
                    console.log('✍️ useAppWallet: signTransaction chamado');
                    
                    const walletInfo = auth.getWalletProvider();
                    if (walletInfo?.provider && walletInfo.provider.signTransaction) {
                        try {
                            console.log('✅ Assinando com provider externo');
                            return await walletInfo.provider.signTransaction(transaction);
                        } catch (error) {
                            console.error('❌ Erro ao assinar transação:', error);
                            throw new Error(`Falha ao assinar: ${error.message}`);
                        }
                    }
                    
                    throw new Error("Provider não disponível para assinar");
                },
                
                signAllTransactions: async (transactions) => {
                    console.log('✍️ useAppWallet: signAllTransactions chamado');
                    
                    const walletInfo = auth.getWalletProvider();
                    if (walletInfo?.provider && walletInfo.provider.signAllTransactions) {
                        try {
                            console.log('✅ Assinando múltiplas transações com provider');
                            return await walletInfo.provider.signAllTransactions(transactions);
                        } catch (error) {
                            console.error('❌ Erro ao assinar transações:', error);
                            throw new Error(`Falha ao assinar múltiplas: ${error.message}`);
                        }
                    }
                    
                    throw new Error("Provider não disponível para assinar múltiplas transações");
                },

                connect: async () => {
                    console.log('🔗 useAppWallet: Conectando via AuthContext');
                    await auth.connectSolanaWallet();
                },

                sendTransaction: async (transaction, connection, options) => {
                    console.log('📤 useAppWallet: sendTransaction chamado');
                    
                    const walletInfo = auth.getWalletProvider();
                    if (walletInfo?.provider && walletInfo.provider.sendTransaction) {
                        try {
                            console.log('✅ Enviando transação com provider');
                            return await walletInfo.provider.sendTransaction(
                                transaction, 
                                connection, 
                                options
                            );
                        } catch (error) {
                            console.error('❌ Erro ao enviar transação:', error);
                            throw new Error(`Falha ao enviar: ${error.message}`);
                        }
                    }
                    
                    throw new Error("Provider não disponível para enviar transação");
                },

                wallet: {
                    name: auth.solanaWallet?.walletName || 'Solana Wallet',
                    icon: auth.solanaWallet?.walletIcon || '🔥',
                    url: 'https://solana.com',
                    adapter: null
                },
            };
        }

        // Prioridade 3: Usuário autenticado via Email/Senha (sem capacidade de assinar)
        if (auth.isAuthenticated && auth.user) {
            console.log('ℹ️ useAppWallet: Usuário autenticado mas sem carteira Solana');
            
            return {
                connected: false,
                connecting: false,
                disconnecting: false,
                publicKey: null,
                walletType: 'email_auth',
                disconnect: auth.logout,
                signTransaction: async () => {
                    throw new Error("Usuário com email/senha não pode assinar transações. Conecte uma carteira Solana.");
                },
                signAllTransactions: async () => {
                    throw new Error("Usuário com email/senha não pode assinar transações. Conecte uma carteira Solana.");
                },
                wallet: {
                    name: 'Email Auth',
                    icon: '📧',
                    url: window.location.origin,
                    adapter: null
                },
            };
        }

        // Caso padrão: Nenhuma autenticação
        console.log('🚫 useAppWallet: Nenhuma carteira disponível');
        return {
            ...walletAdapter,
            connected: false,
            publicKey: null,
            walletType: 'none',
            signTransaction: async () => {
                throw new Error("Carteira não conectada");
            },
            signAllTransactions: async () => {
                throw new Error("Carteira não conectada");
            },
        };
    }, [
        walletAdapter,
        walletAdapter.connected,
        walletAdapter.publicKey,
        auth.isAuthenticated,
        auth.user,
        auth.solanaWallet,
        auth.getWalletProvider,
        auth.connectSolanaWallet,
        auth.disconnectSolanaWallet,
        auth.logout
    ]);

    useEffect(() => {
        console.log('🎯 useAppWallet - Estado Final:', {
            connected: appWallet.connected,
            publicKey: appWallet.publicKey?.toString(),
            walletType: appWallet.walletType,
            hasSignTransaction: !!appWallet.signTransaction,
            hasSignAllTransactions: !!appWallet.signAllTransactions
        });
    }, [appWallet]);

    return appWallet;
};