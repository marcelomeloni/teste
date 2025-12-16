// contexts/AuthContext.jsx - VERSÃO COMPLETA ATUALIZADA
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sha256 } from "js-sha256";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { API_URL } from '@/lib/constants';
import { PublicKey } from '@solana/web3.js';

// Firebase imports - CONFIGURAÇÃO SIMPLIFICADA
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase apenas se as configurações existirem
let firebaseApp, firebaseAuth, googleProvider;
try {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  googleProvider = new GoogleAuthProvider();
  
  // Configurações adicionais para melhor UX
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.warn('Firebase não configurado:', error);
}

// Chaves para localStorage
const SOLANA_WALLET_STORAGE_KEY = 'solana_wallet_connection';
const USER_WALLET_STORAGE_KEY = 'user_wallet_data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ✅ NOVAS FUNÇÕES: Gerenciamento da wallet do usuário no localStorage
  const saveUserWalletToStorage = (walletData) => {
    try {
      localStorage.setItem(USER_WALLET_STORAGE_KEY, JSON.stringify(walletData));
      console.log('💾 Wallet do usuário salva no localStorage:', walletData);
    } catch (error) {
      console.warn('❌ Erro ao salvar wallet no localStorage:', error);
    }
  };

  const loadUserWalletFromStorage = () => {
    try {
      const stored = localStorage.getItem(USER_WALLET_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('❌ Erro ao carregar wallet do localStorage:', error);
      return null;
    }
  };

  const removeUserWalletFromStorage = () => {
    try {
      localStorage.removeItem(USER_WALLET_STORAGE_KEY);
      console.log('🗑️ Wallet do usuário removida do localStorage');
    } catch (error) {
      console.warn('❌ Erro ao remover wallet do localStorage:', error);
    }
  };

  // ✅ NOVA FUNÇÃO: Obter wallet do usuário (prioridade: Solana > localStorage)
  const getUserWallet = () => {
    // Prioridade 1: Carteira Solana conectada
    if (solanaWallet?.connected && solanaWallet.publicKey) {
      return {
        address: solanaWallet.publicKey,
        type: 'solana',
        source: 'connected',
        connected: true
      };
    }

    // Prioridade 2: Wallet salva no localStorage
    const storedWallet = loadUserWalletFromStorage();
    if (storedWallet) {
      console.log('📦 Wallet recuperada do localStorage:', storedWallet);
      return {
        ...storedWallet,
        connected: false // Não está conectada, mas temos o endereço
      };
    }

    return null;
  };

  // Funções de persistência no localStorage (Solana)
  const saveSolanaWalletToStorage = (walletData) => {
    try {
      localStorage.setItem(SOLANA_WALLET_STORAGE_KEY, JSON.stringify(walletData));
      console.log('💾 Carteira Solana salva no localStorage');
    } catch (error) {
      console.warn('❌ Erro ao salvar carteira Solana no localStorage:', error);
    }
  };

  const loadSolanaWalletFromStorage = () => {
    try {
      const stored = localStorage.getItem(SOLANA_WALLET_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('❌ Erro ao carregar carteira Solana do localStorage:', error);
      return null;
    }
  };

  const removeSolanaWalletFromStorage = () => {
    try {
      localStorage.removeItem(SOLANA_WALLET_STORAGE_KEY);
      console.log('🗑️ Carteira Solana removida do localStorage');
    } catch (error) {
      console.warn('❌ Erro ao remover carteira Solana do localStorage:', error);
    }
  };

  // Funções de notificação
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Verifica se qualquer carteira Solana está disponível
  const isSolanaWalletAvailable = () => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.solana?.isPhantom ||
      window.solana?.isSolflare ||
      window.solflare ||
      window.solana?.isBackpack ||
      window.solana?.isGlow ||
      window.solana
    );
  };

  // Obtém informações do provedor de carteira ativo
  const getWalletProvider = () => {
    if (!isSolanaWalletAvailable()) return null;
    
    if (window.solana?.isPhantom) {
      return {
        provider: window.solana,
        name: 'Phantom',
        icon: '👻',
        color: 'from-purple-500 to-purple-600'
      };
    } else if (window.solana?.isSolflare) {
      return {
        provider: window.solana,
        name: 'Solflare',
        icon: '🔥',
        color: 'from-orange-500 to-red-500'
      };
    } else if (window.solflare) {
      return {
        provider: window.solflare,
        name: 'Solflare',
        icon: '🔥',
        color: 'from-orange-500 to-red-500'
      };
    }
    
    return null;
  };

  // NOVA FUNÇÃO: Verificar conexão persistente com a carteira
  const checkPersistedWalletConnection = async () => {
    try {
      const storedWallet = loadSolanaWalletFromStorage();
      if (!storedWallet) {
        console.log('ℹ️ Nenhuma carteira persistida encontrada');
        return null;
      }

      console.log('🔍 Verificando carteira persistida:', storedWallet);
      
      const walletInfo = getWalletProvider();
      if (!walletInfo) {
        console.log('❌ Nenhum provedor de carteira disponível');
        removeSolanaWalletFromStorage();
        return null;
      }

      const { provider, name } = walletInfo;
      
      // Verifica se a carteira ainda está conectada
      let isStillConnected = false;
      let currentPublicKey = null;

      try {
        // Tenta obter a chave pública atual
        if (provider.publicKey) {
          currentPublicKey = provider.publicKey.toString();
          isStillConnected = true;
        } else if (provider._publicKey) {
          currentPublicKey = provider._publicKey.toString();
          isStillConnected = true;
        } else if (provider.isConnected && typeof provider.isConnected === 'function' && provider.isConnected()) {
          // Algumas carteiras têm método isConnected
          isStillConnected = true;
          currentPublicKey = storedWallet.publicKey;
        } else if (provider.isConnected) {
          // Ou a propriedade isConnected pode ser booleana
          isStillConnected = provider.isConnected;
          currentPublicKey = storedWallet.publicKey;
        }
      } catch (error) {
        console.log('ℹ️ Não foi possível verificar conexão da carteira:', error.message);
      }

      if (isStillConnected && currentPublicKey) {
        console.log(`✅ Carteira ${name} ainda conectada:`, currentPublicKey);
        return {
          publicKey: currentPublicKey,
          connected: true,
          walletName: name,
          walletIcon: walletInfo.icon,
        };
      } else {
        console.log('❌ Carteira persistida não está mais conectada');
        removeSolanaWalletFromStorage();
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar carteira persistida:', error);
      removeSolanaWalletFromStorage();
      return null;
    }
  };

  // FUNÇÃO CORRIGIDA: Conectar com carteira Solana
  const connectSolanaWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletInfo = getWalletProvider();
      
      if (!walletInfo) {
        throw new Error('Nenhuma carteira Solana detectada. Instale Phantom ou Solflare.');
      }

      const { provider, name } = walletInfo;
      
      console.log(`🔗 Conectando com ${name}...`);

      // CORREÇÃO: Abordagem mais robusta para conexão
      let publicKey;
      let connectionResponse;

      try {
        // Tenta o método padrão de conexão
        connectionResponse = await provider.connect();
        console.log('✅ Resposta da conexão:', connectionResponse);
      } catch (connectError) {
        console.log('❌ Método connect falhou:', connectError);
        throw new Error('Falha na conexão com a carteira');
      }

      // CORREÇÃO: Múltiplas formas de obter a publicKey
      if (connectionResponse?.publicKey) {
        // Phantom e algumas versões do Solflare
        publicKey = connectionResponse.publicKey.toString();
        console.log('PublicKey do connectionResponse:', publicKey);
      } else if (provider.publicKey) {
        // Algumas carteiras armazenam a publicKey no provider
        publicKey = provider.publicKey.toString();
        console.log('PublicKey do provider:', publicKey);
      } else if (connectionResponse) {
        // Tenta acessar diretamente se a resposta for a publicKey
        try {
          publicKey = connectionResponse.toString();
          console.log('PublicKey da resposta direta:', publicKey);
        } catch (e) {
          console.log('❌ Não foi possível converter a resposta direta');
        }
      }

      // Se ainda não encontrou, tenta métodos alternativos
      if (!publicKey) {
        console.log('🔄 Tentando métodos alternativos...');
        
        // Tenta acessar via propriedades do provider após conexão
        if (provider.publicKey) {
          publicKey = provider.publicKey.toString();
        } else if (provider._publicKey) {
          publicKey = provider._publicKey.toString();
        }
      }

      if (!publicKey) {
        console.error('Estrutura da resposta:', connectionResponse);
        console.error('Estrutura do provider:', provider);
        throw new Error('Não foi possível obter a chave pública da carteira.');
      }

      console.log(`✅ ${name} conectada:`, publicKey);
      
      // ✅ SALVAR WALLET NO LOCALSTORAGE
      const walletData = {
        address: publicKey,
        type: 'solana',
        source: name.toLowerCase(),
        connected: true,
        timestamp: new Date().toISOString()
      };
      
      saveUserWalletToStorage(walletData);
      console.log('✅ Wallet Solana salva no localStorage:', walletData);

      // Gerar mensagem para assinatura
      const message = `Assine esta mensagem para autenticar no Ticketfy. Timestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // CORREÇÃO: Abordagem robusta para assinatura
      let signature;
      try {
        // Tenta o método signMessage padrão
        signature = await provider.signMessage(encodedMessage, 'utf8');
        console.log('✅ Assinatura padrão obtida');
      } catch (signError) {
        console.log('❌ Método signMessage padrão falhou, tentando alternativa...', signError);
        try {
          // Tenta sem o parâmetro de encoding
          signature = await provider.signMessage(encodedMessage);
          console.log('✅ Assinatura alternativa obtida');
        } catch (secondError) {
          console.log('❌ Método signMessage alternativo também falhou:', secondError);
          throw new Error('Falha ao assinar a mensagem');
        }
      }

      // CORREÇÃO: Normalizar a assinatura para diferentes formatos
      let signatureBytes;
      if (signature?.signature) {
        signatureBytes = signature.signature;
      } else if (signature) {
        signatureBytes = signature;
      } else {
        throw new Error('Assinatura não retornada pela carteira');
      }

      // Converter para Uint8Array se necessário
      if (Array.isArray(signatureBytes)) {
        signatureBytes = new Uint8Array(signatureBytes);
      }

      console.log('Assinatura recebida (bytes):', signatureBytes);

      // Verificar a assinatura
      const isValidSignature = nacl.sign.detached.verify(
        encodedMessage,
        signatureBytes,
        new PublicKey(publicKey).toBytes()
      );

      if (!isValidSignature) {
        throw new Error('Assinatura inválida');
      }

      // Enviar para o backend para autenticação
      const authResponse = await fetch(`${API_URL}/api/auth/solana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey,
          signature: bs58.encode(signatureBytes),
          message,
          walletName: name
        }),
      });

      // CORREÇÃO: Melhor tratamento de erro HTTP
      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('❌ Erro HTTP:', authResponse.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Erro desconhecido do servidor' };
        }
        throw new Error(errorData.error || `Erro ${authResponse.status} na autenticação`);
      }

      const result = await authResponse.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro na autenticação com carteira');
      }

      // ATUALIZAR ESTADO E SALVAR NO LOCALSTORAGE
      const solanaWalletData = {
        publicKey,
        connected: true,
        walletName: name,
        walletIcon: walletInfo.icon,
      };

      setSolanaWallet(solanaWalletData);
      saveSolanaWalletToStorage(solanaWalletData);
      
      if (result.user) {
        setUser(result.user);
        setProfile(result.profile);
      }
      
      showSuccess(`Conectado com ${name} com sucesso!`);
      console.log(`✅ Login com ${name} bem-sucedido`);
      return result;
      
    } catch (err) {
      console.error('❌ Erro ao conectar carteira Solana:', err);
      
      // Mensagens de erro amigáveis
      let userFriendlyError = err.message;
      if (err.message.includes('User rejected')) {
        userFriendlyError = 'Conexão rejeitada pelo usuário';
      } else if (err.message.includes('not found')) {
        userFriendlyError = 'Carteira não encontrada';
      } else if (err.message.includes('public key')) {
        userFriendlyError = 'Erro ao acessar a carteira. Tente novamente.';
      } else if (err.message.includes('Estrutura inesperada')) {
        userFriendlyError = 'Versão incompatível da carteira. Tente atualizar ou usar outra carteira.';
      }
      
      showError(userFriendlyError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para desconectar carteira Solana
  const disconnectSolanaWallet = async () => {
    try {
      const walletInfo = getWalletProvider();
      if (walletInfo && walletInfo.provider.disconnect) {
        await walletInfo.provider.disconnect();
      }
      
      setSolanaWallet(null);
      setUser(null);
      setProfile(null);
      removeSolanaWalletFromStorage();
      
      showSuccess('Carteira desconectada com sucesso');
      console.log('✅ Carteira desconectada e dados removidos');
    } catch (err) {
      console.error('❌ Erro ao desconectar carteira Solana:', err);
      // Força a limpeza mesmo com erro
      setSolanaWallet(null);
      removeSolanaWalletFromStorage();
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        if (!firebaseAuth) {
            throw new Error('Firebase não está configurado');
        }

        console.log('🔐 Iniciando login com Google via Firebase...');
        
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const user = result.user;
        
        console.log('✅ Login com Google bem-sucedido:', user);
        
        // Criar objeto de usuário para o estado
        const userData = {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            authProvider: 'google'
        };

        setUser(userData);
        
        // CORREÇÃO: Usar a nova rota específica para Firebase
        try {
            const syncResponse = await fetch(`${API_URL}/api/auth/sync-firebase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified
                    }
                }),
            });

            if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                setProfile(syncResult.profile);
                
                // ✅ SALVAR WALLET NO LOCALSTORAGE SE DISPONÍVEL
                if (syncResult.profile?.wallet_address) {
                  const walletData = {
                    address: syncResult.profile.wallet_address,
                    type: 'google_generated',
                    source: 'firebase_login',
                    timestamp: new Date().toISOString()
                  };
                  saveUserWalletToStorage(walletData);
                  console.log('✅ Wallet do Google salva no localStorage:', walletData);
                }
                
                console.log('✅ Perfil Firebase sincronizado com backend');
            } else {
                const errorText = await syncResponse.text();
                console.warn('❌ Erro na sincronização Firebase:', errorText);
            }
        } catch (syncError) {
            console.warn('❌ Erro na sincronização com backend Firebase:', syncError);
        }

        showSuccess('Login com Google realizado com sucesso!');
        return userData;
        
    } catch (err) {
        console.error('❌ Erro no login com Google:', err);
        
        let userFriendlyError = 'Erro ao fazer login com Google';
        if (err.code === 'auth/popup-closed-by-user') {
            userFriendlyError = 'Login cancelado pelo usuário';
        } else if (err.code === 'auth/popup-blocked') {
            userFriendlyError = 'Popup bloqueado. Por favor, permita popups para este site.';
        } else if (err.code === 'auth/network-request-failed') {
            userFriendlyError = 'Erro de rede. Verifique sua conexão.';
        }
        
        showError(userFriendlyError);
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  // --- FUNÇÕES DE EMAIL/SENHA (Supabase) ---
  const loginWithEmail = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }

      // Armazenar token e informações do usuário
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_id', data.session.user.id);
      
      // Buscar perfil completo do usuário
      const profileResponse = await fetch('/api/profile/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: data.session.user.id, 
          authMethod: 'supabase_email' 
        }),
      });
      
      const profileData = await profileResponse.json();
      
      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'Falha ao carregar perfil');
      }

      setUser(profileData.profile);
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha no registro');
      }

      // Login automático após registro bem-sucedido
      await loginWithEmail(email, password);
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout unificado
  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Fazendo logout...');
      
      // Logout do Firebase
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
      
      // Logout do Supabase
      await supabase.auth.signOut();
      
      // Desconectar carteira Solana
      await disconnectSolanaWallet();
      
      // Limpar estados
      setUser(null);
      setProfile(null);
      setWallet(null);
      
      // ✅ LIMPAR WALLET DO LOCALSTORAGE
      removeUserWalletFromStorage();
      
      showSuccess('Logout realizado com sucesso!');
      console.log('✅ Logout completo e wallet removida');
      
    } catch (err) {
      console.error('❌ Erro no logout:', err);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFEITOS ---

  // Listener do Firebase
  useEffect(() => {
    if (!firebaseAuth) return;

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser && !user) {
            console.log('👤 Usuário Firebase detectado:', firebaseUser);
            
            // Criar objeto de usuário para o estado
            const userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
                authProvider: 'google'
            };

            setUser(userData);
            
            // Sincronizar com backend Firebase
            try {
                const syncResponse = await fetch(`${API_URL}/api/auth/sync-firebase`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            emailVerified: firebaseUser.emailVerified
                        }
                    }),
                });

                if (syncResponse.ok) {
                    const syncResult = await syncResponse.json();
                    setProfile(syncResult.profile);
                    
                    // ✅ SALVAR WALLET NO LOCALSTORAGE SE DISPONÍVEL
                    if (syncResult.profile?.wallet_address) {
                      const walletData = {
                        address: syncResult.profile.wallet_address,
                        type: 'google_generated',
                        source: 'firebase_login',
                        timestamp: new Date().toISOString()
                      };
                      saveUserWalletToStorage(walletData);
                      console.log('✅ Wallet do Google salva no localStorage:', walletData);
                    }
                    
                    console.log('✅ Perfil Firebase restaurado e sincronizado');
                }
            } catch (syncError) {
                console.warn('❌ Erro na sincronização Firebase:', syncError);
            }
        }
    });

    return () => unsubscribe();
  }, [user]);

  // Efeito principal de inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Inicializando autenticação...');
      
      try {
        // 1. Carregar wallet do usuário do localStorage
        const userWallet = loadUserWalletFromStorage();
        if (userWallet) {
          console.log('✅ Wallet do usuário carregada do localStorage:', userWallet);
        }

        // 2. Verificar carteira Solana persistida
        const persistedWallet = await checkPersistedWalletConnection();
        if (persistedWallet) {
          console.log('✅ Restaurando carteira Solana persistida:', persistedWallet);
          setSolanaWallet(persistedWallet);
          
          // Tenta obter dados do usuário do backend
          try {
            const userResponse = await fetch(`${API_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.user) {
                setUser(userData.user);
                setProfile(userData.profile);
                console.log('✅ Dados do usuário restaurados do backend');
              }
            }
          } catch (userError) {
            console.log('ℹ️ Não foi possível obter dados do usuário:', userError);
          }
        }

        // 3. Depois verifica sessão Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !user) {
          console.log('✅ Sessão Supabase restaurada:', session.user.email);
          setUser(session.user);
        }
        
      } catch (error) {
        console.error('❌ Erro na inicialização da autenticação:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Autenticação inicializada');
      }
    };

    initializeAuth();

    // Listener do Supabase para mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth State Change:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        console.log('✅ Usuário Supabase definido');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setWallet(null);
        console.log('✅ Usuário Supabase removido');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Debug effect para monitorar mudanças de estado
  useEffect(() => {
    console.log('🔍 Estado do AuthContext atualizado:', {
      user: user ? { email: user.email, id: user.id } : null,
      profile: profile ? '✅' : '❌',
      solanaWallet: solanaWallet ? { 
        connected: solanaWallet.connected, 
        publicKey: solanaWallet.publicKey?.slice(0, 8) + '...',
        walletName: solanaWallet.walletName 
      } : null,
      isLoading,
      isAuthenticated: !!user || !!solanaWallet
    });
  }, [user, profile, solanaWallet, isLoading]);

  const value = useMemo(() => ({
    user,
    profile,
    setProfile,
    wallet,
    solanaWallet,
    isLoading,
    error,
    successMessage,
    isAuthenticated: !!user || !!solanaWallet,
    isSolanaWalletAvailable,
    getWalletProvider,
    connectSolanaWallet,
    disconnectSolanaWallet,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    showError,
    showSuccess,
    getUserWallet, // ✅ NOVA FUNÇÃO
  }), [user, profile, wallet, solanaWallet, isLoading, error, successMessage]);

  return (
    <AuthContext.Provider value={value}>
      {/* Sistema de Notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.414l1.72 1.72a.75.75 0 101.06-1.06L11.414 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.586 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L6.53 10.47a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.154-.114l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Sucesso</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};