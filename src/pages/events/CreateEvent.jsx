import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventForm } from './components/EventForm';
import { EventFormProvider, useEventForm } from '@/contexts/EventFormContext';
import { PROGRAM_ID, API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useAppWallet } from '@/hooks/useAppWallet';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@solana/web3.js';
// Componente premium para usuários não autorizados
function UnauthorizedState({ publicKey, onRetry }) {
        const [copied, setCopied] = useState(false);
    
        // ✅ CORREÇÃO: Garantir que publicKey seja sempre uma string
        const walletAddress = typeof publicKey === 'string' 
            ? publicKey 
            : (publicKey?.address || 'Wallet não disponível');
    
        const handleCopyCode = async () => {
            if (!walletAddress || walletAddress === 'Wallet não disponível') return;
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            toast.success('Código copiado para a área de transferência!');
            setTimeout(() => setCopied(false), 2000);
        };
    
        const handleEmailClick = () => {
            const subject = "Solicitação de Acesso - Criador de Eventos";
            const body = `Olá, equipe Ticketfy!
    
    Gostaria de solicitar acesso para criar eventos na plataforma.
    
    Minha wallet é: ${walletAddress}
    
    Aguardo o retorno.
    
    Atenciosamente.`;
    
            window.location.href = `mailto:contato@ticketfy.link?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        };
    
        return (
            <div className="min-h-[600px] flex items-center justify-center px-4">
                <div className="max-w-2xl w-full">
                    {/* Header com gradiente premium */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
    
                        <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                            Acesso Exclusivo
                        </h1>
                    </div>
    
                    {/* Card principal */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            {/* Status indicator */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">Acesso Necessário</h2>
                                        <p className="text-sm text-gray-600">Solicite permissão para criar eventos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onRetry}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Verificar Novamente
                                </button>
                            </div>
    
                            {/* Steps */}
                            <div className="space-y-6 mb-8">
                                {/* Step 1 */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            1
                                        </div>
                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <h3 className="font-semibold text-gray-900 mb-3">Copie sua wallet</h3>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                {/* ✅ CORREÇÃO: Usar walletAddress (string) em vez do objeto */}
                                                <code className="text-sm text-gray-800 font-mono break-all flex-1 mr-4">
                                                    {walletAddress}
                                                </code>
                                                <button
                                                    onClick={handleCopyCode}
                                                    disabled={!walletAddress || walletAddress === 'Wallet não disponível'}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${copied
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {copied ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Copiado!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            Copiar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                Esta é sua wallet associada à conta
                                            </p>
                                        </div>
                                    </div>
                                </div>
    
                                {/* Step 2 */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            2
                                        </div>
                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <h3 className="font-semibold text-gray-900 mb-3">Solicite acesso ao time Ticketfy</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <button
                                                onClick={handleEmailClick}
                                                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-semibold">Enviar Email</span>
                                            </button>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <p className="text-sm font-medium text-gray-900 mb-2">Email direto</p>
                                                <p className="text-lg text-blue-600 font-semibold">contato@ticketfy.link</p>
                                                <p className="text-xs text-gray-600 mt-1">Resposta em até 24h</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
    
                                {/* Step 3 */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            3
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-3">Aguarde a aprovação</h3>
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-900">Processo Rápido</p>
                                                    <p className="text-sm text-green-700">Analisaremos sua solicitação e entraremos em contato em breve</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            {/* Support Info */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Precisa de ajuda?</span>
                                    </div>
                                    <a href="mailto:suporte@ticketfy.link" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        suporte@ticketfy.link
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    

// Componente de loading premium
function PermissionLoadingState() {
        // ... (nenhuma alteração nesta seção)
        return (
                <div className="min-h-[400px] flex items-center justify-center">
                        <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Verificando Acesso</h3>
                                <p className="text-gray-600 max-w-sm mx-auto">
                                        Estamos verificando suas permissões para criar eventos na plataforma...
                                </p>
                        </div>
                </div>
        );
}

const getUserWalletFromStorage = () => {
        try {
            const stored = localStorage.getItem('user_wallet_data');
            if (stored) {
                const walletData = JSON.parse(stored);
                console.log('✅ Wallet carregada do localStorage:', walletData);
                
                // ✅ CORREÇÃO: Garantir compatibilidade com diferentes formatos
                if (typeof walletData === 'string') {
                    // Caso antigo: era apenas uma string
                    return {
                        address: walletData,
                        type: 'solana',
                        source: 'localStorage',
                        connected: false,
                        timestamp: new Date().toISOString()
                    };
                } else if (walletData.address) {
                    // Caso novo: objeto com propriedade address
                    return walletData;
                } else {
                    // Formato inesperado
                    console.warn('❌ Formato inesperado da wallet no localStorage:', walletData);
                    return null;
                }
            }
        } catch (error) {
            console.warn('❌ Erro ao carregar wallet do localStorage:', error);
        }
        return null;
    };

// Este componente interno contém a lógica e acessa o contexto
function CreateEventPageContent() {
        const navigate = useNavigate();
        const { formData, validateForm, logFormState } = useEventForm();
        const wallet = useAppWallet();
        const auth = useAuth();

        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isWhitelisted, setIsWhitelisted] = useState(null);
        const [checkingWhitelist, setCheckingWhitelist] = useState(false);

        const getUserWallet = () => {
                console.log('🔍 Buscando wallet do usuário...');
            
                // 1. Tentar wallet do localStorage (mais confiável)
                const storedWallet = getUserWalletFromStorage();
                if (storedWallet) {
                    console.log('✅ Wallet do localStorage:', storedWallet);
                    return storedWallet;
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
                        console.log('✅ Wallet do AuthContext:', authWallet.address);
                        return authWallet;
                    }
                }
            
                console.log('❌ Nenhuma wallet disponível');
                return null;
            };
            
            // ✅ NOVA FUNÇÃO: Obter apenas o endereço da wallet (para compatibilidade)
            const getUserWalletAddress = () => {
                const userWallet = getUserWallet();
                if (!userWallet) return null;
                
                // Se for objeto, retorna o address; se for string, retorna direto
                return typeof userWallet === 'string' ? userWallet : userWallet.address;
            };
            

            const checkWhitelistStatus = async () => {
                const userWallet = getUserWalletAddress(); // ✅ MUDANÇA AQUI
                
                if (!userWallet) {
                    console.log('❌ Não é possível verificar whitelist: nenhuma wallet disponível');
                    setIsWhitelisted(false);
                    toast.error('Faça login para criar eventos');
                    return;
                }
            
                setCheckingWhitelist(true);
                try {
                    console.log('🔍 Verificando whitelist para wallet:', userWallet);
            
                    const response = await fetch(
                        `${API_URL}/api/manage/whitelist/check?identifier=${encodeURIComponent(userWallet)}` // ✅ Já é string
                    );
            
                    const data = await response.json();
            
                    if (response.ok) {
                        console.log('✅ Resposta da whitelist:', data);
                        setIsWhitelisted(data.isWhitelisted);
            
                        if (data.isWhitelisted) {
                            toast.success('Criador verificado!');
                        } else {
                            console.log('❌ Usuário não está na whitelist');
                        }
                    } else {
                        console.error('❌ Erro ao verificar whitelist:', data);
                        setIsWhitelisted(false);
                        toast.error('Erro ao verificar permissões');
                    }
                } catch (error) {
                    console.error('❌ Erro na requisição de whitelist:', error);
                    setIsWhitelisted(false);
                    toast.error('Falha na verificação de permissões');
                } finally {
                    setCheckingWhitelist(false);
                }
            };

        // ✅ VERIFICAR WHITELIST QUANDO USUÁRIO ESTIVER DISPONÍVEL
        useEffect(() => {
                if (auth.isAuthenticated || wallet.connected) {
                        console.log('🔄 Verificando whitelist (usuário/carteira disponível)');
                        checkWhitelistStatus();
                } else {
                        console.log('⏳ Aguardando autenticação para verificar whitelist...');
                        setIsWhitelisted(null);
                }
        }, [auth.isAuthenticated, wallet.connected]);

        const checkCreatePermission = () => {
                const userWallet = getUserWalletAddress(); // ✅ MUDANÇA AQUI
                if (!userWallet) {
                    toast.error("Faça login para criar eventos");
                    return false;
                }
            
                if (checkingWhitelist) {
                    toast.loading("Verificando permissões...");
                    return false;
                }
            
                if (isWhitelisted === false) {
                    return false;
                }
            
                if (isWhitelisted === null) {
                    toast.error("Aguarde a verificação de permissões");
                    return false;
                }
            
                return true;
            };
            const handleCreateEvent = async () => {
                if (!checkCreatePermission()) return;
            
                logFormState();
                
                if (!validateForm()) {
                    console.error('❌ Validação do formulário falhou!'); 
                    toast.error('Por favor, preencha todos os campos obrigatórios.'); 
                    return;
                }
            
                setIsSubmitting(true);
                
                try {
                    const formDataToSend = new FormData();
                    
                    // ✅ CAMPOS DE IMAGEM CORRETOS
                    if (formData.bannerImage) {
                        formDataToSend.append('bannerImage', formData.bannerImage);
                    }
            
                    if (formData.image) {
                        formDataToSend.append('image', formData.image);
                    }
            
                    if (formData.organizerLogo) {
                        formDataToSend.append('organizerLogo', formData.organizerLogo);
                    }
            
                    // ✅ OBTER WALLET DO USUÁRIO (STRING)
                    const userWalletAddress = getUserWalletAddress();
                    console.log('👤 Endereço da wallet:', userWalletAddress);
                    
                    if (!userWalletAddress) {
                        throw new Error("Wallet do usuário não disponível");
                    }
            
                    const offChainData = {
                        name: formData.name,
                        description: formData.description,
                        image: "", // Placeholder para bannerImage
                        nftImage: formData.image ? "" : null, // Placeholder para image (NFT)
                        properties: {
                            dateTime: {
                                start: formData.startDate,
                                end: formData.endDate
                            },
                            location: {
                                type: formData.locationType,
                                venueName: formData.venueName,
                                address: {
                                    cep: formData.cep,
                                    street: formData.street,
                                    number: formData.number,
                                    complement: formData.complement,
                                    neighborhood: formData.neighborhood,
                                    city: formData.city,
                                    state: formData.state
                                },
                                onlinePlatform: formData.onlinePlatform,
                                onlineEventLink: formData.onlineEventLink
                            },
                            category: formData.category,
                            visibility: formData.visibility,
                            organizer: {
                                name: formData.organizerName,
                                email: formData.organizerEmail,
                                description: formData.organizerDescription,
                                logo: ""
                            }
                        }
                    };
            
                    // ✅ USAR APENAS O ENDEREÇO (STRING)
                    const onChainData = {
                        controller: userWalletAddress, // ✅ STRING
                        treasury: userWalletAddress,   // ✅ STRING
                        transferFeeBps: parseInt(formData.transferFeeBps, 10) || 100,
                        resaleAllowed: formData.resaleAllowed !== undefined ? formData.resaleAllowed : true,
                        maxTicketsPerWallet: parseInt(formData.maxTicketsPerWallet, 10) || 10,
                        tiers: formData.tickets.map((ticket, index) => {
                            // Função auxiliar para formatar datas
                            const toISOString = (dateString) => dateString ? new Date(dateString).toISOString() : null;
                    
                            // ✅ CORREÇÃO: DEFINIR AS VARIÁVEIS QUE ESTAVAM FALTANDO
                            const saleStart = toISOString(ticket.saleStartDate);
                            const saleEnd = toISOString(ticket.saleEndDate);
                            const saleStartType = ticket.saleStartType || 'date';
                            const saleStartBatch = ticket.saleStartBatch;
                    
                            // Validação crucial no frontend para data de término
                            if (!saleEnd) {
                                console.error(`Frontend Error: O ingresso "${ticket.name}" está sem data de término de vendas!`, ticket);
                                throw new Error(`O ingresso "${ticket.name}" precisa ter uma data de término de vendas definida nas opções avançadas.`);
                            }
                            
                            if (saleStartType === 'batch' && index === 0) {
                                throw new Error(`O primeiro ingresso ("${ticket.name}") não pode iniciar "Por lote". Escolha uma data de início.`);
                            }
                            if (saleStartType === 'batch' && !saleStartBatch) {
                                throw new Error(`O ingresso "${ticket.name}" está configurado para iniciar "Por lote", mas nenhum lote anterior foi selecionado.`);
                            }
                    
                            return {
                                name: ticket.name || 'Ingresso Sem Nome',
                                price: parseFloat(ticket.price) || 0,
                                quantity: parseInt(ticket.quantity, 10) || 0,
                                isTransferable: ticket.allowTransfer === 'yes',
                                purchasePolicy: {
                                    minPerPurchase: parseInt(ticket.minPerPurchase, 10) || 1,
                                    maxPerPurchase: parseInt(ticket.maxPerPurchase, 10) || 5,
                                },
                                saleWindow: {
                                    start: saleStart,
                                    end: saleEnd,
                                },
                                saleStartType: saleStartType,
                                saleStartBatch: saleStartBatch
                            };
                        })
                    };
            
                    formDataToSend.append('offChainData', JSON.stringify(offChainData));
                    formDataToSend.append('onChainData', JSON.stringify(onChainData));
                    formDataToSend.append('programId', PROGRAM_ID);
            
                    formDataToSend.append('metadata', JSON.stringify({
                        created_at: new Date().toISOString(),
                        source: 'web-app',
                        version: '1.0',
                        controller: userWalletAddress, // ✅ STRING
                        wallet_type: 'solana', // Podemos definir fixo para Solana
                        auth_type: 'wallet',
                        user_wallet: userWalletAddress, // ✅ STRING
                        user_agent: navigator.userAgent
                    }));
            
                    // ✅ DEBUG DETALHADO
                    console.log('📤 DADOS DE ENVIO CORRIGIDOS:', {
                        userWalletAddress: userWalletAddress,
                        controller: onChainData.controller,
                        controllerType: typeof onChainData.controller,
                        hasBannerImage: !!formData.bannerImage,
                        hasImage: !!formData.image,
                        hasOrganizerLogo: !!formData.organizerLogo,
                        ticketsCount: formData.tickets.length,
                        tiersCount: onChainData.tiers.length
                    });
            
                    // ✅ FORÇAR FLUXO DE ASSINATURA NO FRONTEND PARA USUÁRIOS SOLANA
                    console.log('🚀 Enviando requisição para criar evento (forçando assinatura frontend)...');
                    const response = await fetch(`${API_URL}/api/events/create-gasless-event`, {
                        method: 'POST',
                        body: formDataToSend,
                    });
            
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('❌ Erro HTTP:', response.status, errorText);
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch (e) {
                            errorData = { error: errorText || 'Erro desconhecido' };
                        }
                        throw new Error(errorData.error || errorData.message || `Erro ${response.status} ao criar evento`);
                    }
            
                    const result = await response.json();
                    console.log('✅ Resposta do backend:', result);
                    
                    // ✅ SEMPRE USAR FLUXO DE ASSINATURA NO FRONTEND PARA USUÁRIOS SOLANA
                    if (result.requiresSignature || result.userType === 'solana_wallet') {
                        console.log('🖊️  Usuário Solana - Transação requer assinatura no frontend');
                        
                        // Verificar se a wallet Solana está disponível
                        if (!wallet.connected || !wallet.signTransaction) {
                            throw new Error("Sua carteira Solana não está mais conectada. Por favor, reconecte.");
                        }
            
                        // Desserializar a transação
                        const transaction = Transaction.from(
                            Buffer.from(result.transaction, 'base64')
                        );
            
                        console.log('🖊️  Solicitando assinatura do usuário...');
                        
                        // Mostrar toast de loading durante a assinatura
                        const signingToast = toast.loading('Aguardando assinatura na carteira...');
                        
                        let signedTransaction;
                        try {
                            signedTransaction = await wallet.signTransaction(transaction);
                            toast.success('✅ Transação assinada! Enviando...', { id: signingToast });
                        } catch (signError) {
                            toast.error('❌ Assinatura cancelada ou falhou', { id: signingToast });
                            throw new Error("Assinatura da transação cancelada pelo usuário");
                        }
                        
                        // ✅ Enviar transação assinada para o backend
                        const signedResponse = await fetch(`${API_URL}/api/events/process-signed-transaction`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                signedTransaction: Buffer.from(signedTransaction.serialize()).toString('base64'),
                                eventAddress: result.eventAddress,
                                eventId: result.eventId,
                                metadataUrl: result.metadataUrl,
                                userControllerAddress: userWalletAddress,
                                onChainData: onChainData,
                                finalMetadata: offChainData
                            }),
                        });
            
                        const signedResult = await signedResponse.json();
            
                        if (!signedResult.success) {
                            throw new Error(signedResult.error || 'Erro ao processar transação assinada');
                        }
            
                        toast.success('🎉 Evento criado com sucesso!');
                        console.log('✅ Evento criado com assinatura Solana:', signedResult.signature);
                        navigate('/my-events');
            
                    } else if (result.userType === 'database_user') {
                        // ✅ USUÁRIO DATABASE (Google, email) - Backend já processou
                        console.log('✅ Usuário Database - Evento criado diretamente pelo backend');
                        toast.success('🎉 Evento criado com sucesso!');
                        console.log('✅ Evento criado pelo backend:', result.signature);
                        navigate('/my-events');
            
                    } else {
                        // ✅ FALLBACK: Caso não tenha userType definido
                        console.log('ℹ️  Tipo de usuário não especificado, assumindo criação bem-sucedida');
                        toast.success('🎉 Evento criado com sucesso!');
                        navigate('/my-events');
                    }
            
                } catch (error) {
                    console.error('❌ Erro ao criar evento:', error);
                    
                    // ✅ MENSAGENS DE ERRO ESPECÍFICAS
                    let errorMessage = error.message || 'Erro desconhecido';
                    
                    if (error.message.includes('carteira Solana não está mais conectada')) {
                        errorMessage = 'Sua carteira Solana foi desconectada. Por favor, reconecte e tente novamente.';
                    } else if (error.message.includes('assinar') || error.message.includes('assinatura')) {
                        errorMessage = 'Erro ao assinar a transação. Verifique sua carteira Solana.';
                    } else if (error.message.includes('data de término de vendas')) {
                        errorMessage = error.message; // Manter a mensagem específica do ingresso
                    } else if (error.message.includes('Por lote')) {
                        errorMessage = error.message; // Manter a mensagem específica do lote
                    } else if (error.message.includes('Wallet do usuário não disponível')) {
                        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
                    } else if (error.message.includes('Controller')) {
                        errorMessage = 'Erro de autenticação. Por favor, reconecte sua wallet.';
                    } else if (error.message.includes('Chave privada') || error.message.includes('keypair')) {
                        errorMessage = 'Sua carteira Solana precisa assinar a transação. Por favor, confirme a assinatura quando solicitado.';
                    }
                    
                    toast.error('Erro ao criar evento: ' + errorMessage);
                } finally {
                    setIsSubmitting(false);
                }
            };

        const handleCancel = () => {
                navigate('/my-events');
        };
        const getUserCapabilities = () => {
                const userWallet = getUserWallet(); // Mantém objeto para debug
                const userWalletAddress = getUserWalletAddress(); // String para exibição
                const hasSolanaExtension = window.solana || window.solflare;
                
                return {
                    // Capacidades de autenticação
                    canUseSolana: hasSolanaExtension && wallet.connected,
                    canUseGoogle: true,
                    canUseEmail: true,
            
                    // Tipo de usuário atual
                    currentUserType: userWallet?.type || 'unknown',
                    hasWalletConnected: !!userWallet,
            
                    // Capacidades de assinatura
                    canSignTransactions: hasSolanaExtension && wallet.connected && wallet.signTransaction,
            
                    // Informações de debug
                    debug: {
                        solanaExtension: hasSolanaExtension,
                        walletConnected: wallet.connected,
                        walletType: userWallet?.type,
                        walletAddress: userWalletAddress // ✅ Usa a string aqui
                    }
                };
            };

        // ✅ Use essa função para mostrar informações úteis
        useEffect(() => {
                const capabilities = getUserCapabilities();
                console.log('🔧 Capacidades do usuário:', capabilities);
        }, [wallet.connected, auth.user]);

        const handleSaveDraft = async () => {
                if (!checkCreatePermission()) return;
        
                logFormState();
        
                setIsSubmitting(true);
                const loadingToast = toast.loading("Salvando rascunho...");
        
                try {
                    const formDataToSend = new FormData();
                    const draftId = formData.draft_id || uuidv4();
        
                    // --- ⬇️ CORREÇÃO APLICADA AQUI ⬇️ ---
                    // Obter o OBJETO para metadados e a STRING para a query
                    const userWalletObject = getUserWallet(); 
                    const userWalletAddress = getUserWalletAddress(); // <- A STRING "7twi..."
                    
                    if (!userWalletObject || !userWalletAddress) {
                    // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
                        throw new Error("Wallet do usuário não disponível");
                    }
        
                    const draftData = {
                        ...formData,
                        draft_id: draftId,
                        // --- ⬇️ CORREÇÃO ⬇️ ---
                        // Salva a STRING do endereço no JSON principal
                        controller: userWalletAddress, 
                        // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
                        wallet_type: userWalletObject?.type || 'unknown',
                        auth_type: auth.user?.app_metadata?.provider || 'wallet',
                        // --- ⬇️ CORREÇÃO ⬇️ ---
                        // Salva a STRING do endereço aqui também
                        user_wallet: userWalletAddress, 
                        // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
                        saved_at: new Date().toISOString()
                    };
        
                    formDataToSend.append('draftData', JSON.stringify(draftData));
                    
                    // --- ⬇️ CORREÇÃO ⬇️ ---
                    // Este campo é o que deve ser usado para a coluna 'controller'
                    // para garantir que a query .eq() funcione.
                    formDataToSend.append('controller', userWalletAddress);
                    // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
        
        
                    if (formData.bannerImage) {
                        formDataToSend.append('bannerImage', formData.bannerImage);
                    }
        
                    if (formData.image) {
                        formDataToSend.append('image', formData.image);
                    }
        
                    const response = await fetch(`${API_URL}/api/manage/drafts`, {
                        method: 'POST',
                        body: formDataToSend,
                    });
        
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Falha ao salvar o rascunho");
                    }
        
                    const result = await response.json();
                    toast.success("Rascunho salvo com sucesso!", { id: loadingToast });
        
                } catch (error) {
                    console.error("❌ Erro ao salvar rascunho:", error);
                    toast.error(`Erro: ${error.message}`, { id: loadingToast });
                } finally {
                    setIsSubmitting(false);
                }
            };

        // ✅ RENDERIZAÇÃO SIMPLIFICADA
        const renderContent = () => {
                // ... (nenhuma alteração nesta seção)
                if (checkingWhitelist) {
                        return <PermissionLoadingState />;
                }
                if (isWhitelisted === false) {
                        const userWalletAddress = getUserWalletAddress(); // ✅ Isso retorna uma string
                        return (
                            <UnauthorizedState
                                publicKey={userWalletAddress} // ✅ Agora passando string, não objeto
                                onRetry={checkWhitelistStatus}
                            />
                        );
                    }

                // Se não está autenticado, mostrar mensagem para fazer login
                if (!auth.isAuthenticated && !wallet.connected) {
                        return (
                                <div className="py-12 text-center">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto">
                                                <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Login Necessário</h3>
                                                <p className="text-yellow-700 mb-4">
                                                        Faça login para criar um evento.
                                                </p>
                                                <button
                                                        onClick={() => navigate('/login')}
                                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                        Fazer Login
                                                </button>
                                        </div>
                                </div>
                        );
                }

                // Permitir criação se whitelisted
                return (
                        <EventForm
                                isLoading={isSubmitting}
                                onSubmit={handleCreateEvent}
                                onSaveDraft={handleSaveDraft}
                                onCancel={handleCancel}
                                mode="create"
                                isWhitelisted={isWhitelisted}
                                checkingWhitelist={checkingWhitelist}
                        />
                );
        };

        return (
                <div>
                        {renderContent()}
                </div>
        );
}

// O componente exportado agora é um "Wrapper" que provê o contexto
export function CreateEvent() {
        return (
                <EventFormProvider>
                        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
                                <div className="container mx-auto px-4">
                                        <div className="max-w-6xl mx-auto">


                                                <CreateEventPageContent />
                                        </div>
                                </div>
                        </div>
                </EventFormProvider>
        );
}
