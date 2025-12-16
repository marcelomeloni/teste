import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppWallet } from '@/hooks/useAppWallet';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';

// Componente de Loading
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Carregando seus eventos...</p>
    </div>
  );
}

// Componente de Empty State
function EmptyEvents({ onCreateEvent }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento criado</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Você ainda não criou nenhum evento. Comece criando seu primeiro evento para gerenciar ingressos e participantes.
      </p>
      <button
        onClick={onCreateEvent}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Criar Primeiro Evento
      </button>
    </div>
  );
}

// Componente de Error State
function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="text-red-600 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar eventos</h3>
      <p className="text-red-700 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Tentar Novamente
      </button>
    </div>
  );
}

// Componente de Barra de Progresso
function ProgressBar({ sold, total }) {
  const percentage = total > 0 ? (sold / total) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{sold} / {total} vendidos</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Componente de Status Pill
function StatusPill({ status }) {
  const statusConfig = {
    0: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800' },
    1: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
    2: { label: 'Finalizado', className: 'bg-blue-100 text-blue-800' },
    3: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

// Componente Principal
export function MyEvents() {
  const navigate = useNavigate();
  const wallet = useAppWallet();
  const auth = useAuth();
  
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // ✅ FUNÇÃO: Obter wallet do usuário (compatível com wallet e login externo)
  const getUserWallet = () => {
    console.log('🔍 Buscando wallet do usuário para MyEvents...');

    // 1. Tentar wallet do localStorage (usuários Google)
    try {
      const stored = localStorage.getItem('user_wallet_data');
      if (stored) {
        const walletData = JSON.parse(stored);
        console.log('✅ Wallet carregada do localStorage:', walletData);
        return walletData.address;
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar wallet do localStorage:', error);
    }

    // 2. Fallback: wallet Solana conectada
    if (wallet.connected && wallet.publicKey) {
      console.log('✅ Usando wallet Solana conectada:', wallet.publicKey.toString());
      return wallet.publicKey.toString();
    }

    // 3. Tentar obter do AuthContext se disponível
    if (auth.getUserWallet) {
      const authWallet = auth.getUserWallet();
      if (authWallet?.address) {
        console.log('✅ Wallet do AuthContext:', authWallet.address);
        return authWallet.address;
      }
    }

    console.log('❌ Nenhuma wallet disponível');
    return null;
  };

  // ✅ FUNÇÃO: Verificar se usuário está autenticado (qualquer método)
  const isUserAuthenticated = () => {
    return auth.isAuthenticated || wallet.connected;
  };

  // ✅ FUNÇÃO: Buscar eventos usando wallet do usuário
  const fetchUserEvents = useCallback(async (tab = activeTab, search = searchTerm) => {
    const userWallet = getUserWallet();
    
    if (!userWallet) {
      console.log('⏭️  Nenhuma wallet disponível, pulando busca de eventos');
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📋 Buscando eventos do organizador...', {
        controller: userWallet,
        status: tab,
        search,
        authType: auth.isAuthenticated ? 'google' : 'wallet'
      });

      // ✅ Usar userWallet (funciona para ambos os tipos de login)
      const params = new URLSearchParams({
        controller: userWallet,
        status: tab,
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_URL}/api/manage/events?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ Resposta da API de eventos:', {
        success: result.success,
        totalEvents: result.data?.length,
        metadata: result.metadata
      });

      if (result.success) {
        setEvents(result.data || []);
      } else {
        throw new Error(result.error || 'Erro ao carregar eventos');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar eventos:', err);
      setError(err.message);
      toast.error('Erro ao carregar eventos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, auth.isAuthenticated, wallet.connected]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ✅ EFFECT: Buscar eventos quando mudar autenticação, wallet, tab ou busca
  useEffect(() => {
    if (isUserAuthenticated()) {
      console.log('🔄 Usuário autenticado, buscando eventos...');
      fetchUserEvents();
    } else {
      console.log('⏳ Aguardando autenticação para buscar eventos...');
      setEvents([]);
      setIsLoading(false);
    }
  }, [fetchUserEvents, auth.isAuthenticated, wallet.connected]);

  // Handler para mudança de aba
  const handleTabChange = (tab) => {
    console.log('🔄 Mudando aba para:', tab);
    setActiveTab(tab);
  };

  // Handler para busca
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handler para criar evento
  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  // Handler para editar evento
  const handleEditEvent = (eventId) => {
    console.log(`📝 Navegando para edição do evento: ${eventId}`);
    navigate(`/edit-event/${eventId}`);
  };

  // Handler para visualizar dashboard
  const handleViewDashboard = (eventId) => {
    console.log(`📊 Navegando para dashboard do evento: ${eventId}`);
    navigate(`/manage-event/${eventId}`);
  };
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Tem certeza que deseja excluir este rascunho de evento?')) {
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/manage/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Adicione headers de autenticação se necessário
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }
  
      // Remove o evento da lista
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Rascunho deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast.error('Erro ao deletar evento: ' + error.message);
    }
  };
  // Handler para visualizar página do evento
  const handleViewEvent = (eventId) => {
    console.log('👀 Visualizando página do evento:', eventId);
    navigate(`/event/${eventId}`);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Erro ao formatar data:', dateString, error);
      return '-';
    }
  };

  // ✅ RENDER: Estado não autenticado
  if (!isUserAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-yellow-600 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
              <p className="text-gray-600 mb-6">
                {wallet.connected ? 
                  'Sua wallet está conectada, mas você precisa fazer login para acessar esta área.' :
                  'Conecte sua carteira ou faça login para acessar a área do organizador.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!wallet.connected && (
                  <button
                    onClick={() => wallet.connect()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    Conectar Wallet
                  </button>
                )}
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Fazer Login
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {wallet.connected ? 
                  'Sua wallet está conectada mas você precisa fazer login com Google para gerenciar eventos.' :
                  'Gerencie seus eventos após conectar sua wallet ou fazer login com Google.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="bg-blue-600 rounded-full p-3 mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meus Eventos</h1>
                <p className="text-gray-600 mt-1">
                  Gerencie todos os seus eventos em um só lugar
                  
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar Novo Evento
            </button>
          </div>

          {/* Container Principal */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Abas e Busca */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Abas de Navegação */}
                <div className="flex space-x-8 mb-4 lg:mb-0">
                  <button
                    onClick={() => handleTabChange('draft')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'draft'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    RASCUNHOS
                  </button>
                  <button
                    onClick={() => handleTabChange('future')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'future'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    EVENTOS FUTUROS
                  </button>
                  <button
                    onClick={() => handleTabChange('finished')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'finished'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    EVENTOS FINALIZADOS
                  </button>
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'all'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    TODOS OS EVENTOS
                  </button>
                </div>

                {/* Barra de Busca */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nome, local ou descrição..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorState error={error} onRetry={fetchUserEvents} />
              ) : events.length === 0 ? (
                <EmptyEvents onCreateEvent={handleCreateEvent} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EVENTO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DATA DE INÍCIO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DATA DE TÉRMINO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          INGRESSOS VENDIDOS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AÇÕES
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {event.image_url && (
                                <img 
                                  src={event.image_url} 
                                  alt={event.name}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {event.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.description ? 
                                    (event.description.length > 50 ? 
                                      `${event.description.substring(0, 50)}...` : 
                                      event.description
                                    ) : 
                                    'Sem descrição'
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(event.event_start_date)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(event.event_end_date)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-48">
                              <ProgressBar 
                                sold={event.tickets_sold || 0} 
                                total={event.total_tickets_supply || 0} 
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StatusPill status={event.state} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-3">
    {/* Painel do Evento - apenas para eventos publicados */}
    {event.state === 1 && (
      <button
        onClick={() => handleViewDashboard(event.id)}
        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
        title="Painel do evento"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    )}

    {/* Editar Evento */}
    <button
      onClick={() => handleEditEvent(event.id)}
      className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
      title="Editar informações do evento"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
      </svg>
    </button>

    {/* Deletar Evento - apenas para rascunhos (state = 0) */}
    {event.state === 0 && (
      <button
        onClick={() => handleDeleteEvent(event.id)}
        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
        title="Excluir rascunho"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    )}

    {/* Visualizar Página do Evento - apenas para eventos publicados */}
    {event.state === 1 && (
      <button
        onClick={() => handleViewEvent(event.id)}
        className="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-50"
        title="Visualizar página do evento"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    )}
  </div>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}