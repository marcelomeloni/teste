import { useEventForm } from '@/contexts/EventFormContext';
import { useAuth } from '@/contexts/AuthContext';
import { EventDetailsSection } from './sections/EventDetailsSection';
import { LocationSection } from './sections/LocationSection';
import { TicketsSection } from './sections/TicketsSection';
import { OrganizerSection } from './sections/OrganizerSection';
import { TermsSection } from './sections/TermsSection';
import { Save, Upload, RefreshCw, AlertCircle, Eye, Copy, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function EventForm({
  isLoading = false,
  onSubmit,
  onCancel,
  onSaveDraft, 
  mode = 'create',
  isWhitelisted = null,
  checkingWhitelist = false,
  walletConnected = false,
  isDraft = false,
  showSaveDraft = true,
  showPublish = false,
  showUpdate = false
}) {

  const { formData, errors, handleFormDataChange, isDirty } = useEventForm();
  const auth = useAuth();
  const [showMobileActions, setShowMobileActions] = useState(false);

  // ✅ FUNÇÃO: Verificar se usuário está autenticado (qualquer método)
  const isUserAuthenticated = () => {
    return auth.isAuthenticated || walletConnected;
  };

  // ✅ FUNÇÃO: Obter wallet do usuário (compatível com ambos os métodos)
  const getUserWallet = () => {
    console.log('🔍 Buscando wallet do usuário para EventForm...');

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
    if (walletConnected) {
      console.log('✅ Usando wallet Solana conectada');
      return 'wallet_connected';
    }

    console.log('❌ Nenhuma wallet disponível');
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Formulário submetido para publicação');
    onSubmit();
  };

  // Se ainda está verificando a whitelist, mostra loading
  if (checkingWhitelist) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Verificando autorização...</p>
        </div>
      </div>
    );
  }

  // ✅ ATUALIZADO: Se não está autenticado, mostra mensagem para conectar/fazer login
  if (!isUserAuthenticated()) {
    return (
      <div className="py-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto">
          <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Não Autenticado</h3>
          <p className="text-yellow-700 mb-4">
            {walletConnected ? 
              'Sua wallet está conectada, mas você precisa fazer login para criar eventos.' :
              'Conecte sua carteira ou faça login para criar um evento.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!walletConnected && (
              <button
                onClick={() => window.dispatchEvent(new Event('connect-wallet'))}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Conectar Wallet
              </button>
            )}
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Fazer Login
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-4">
            {walletConnected ? 
              'Faça login com Google para acessar a criação de eventos.' :
              'Autentique-se com wallet Solana ou login Google.'
            }
          </p>
        </div>
      </div>
    );
  }

  // ✅ ATUALIZADO: Se não está na whitelist, mostra mensagem de não autorizado com informações da wallet
  if (isWhitelisted === false) {
    const userWallet = getUserWallet();
    return (
      <div className="py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Não Autorizado</h3>
          <p className="text-red-700 mb-4">
            Você não está autorizado a criar eventos na plataforma.
          </p>
          
          {/* Informações da Wallet */}
          {userWallet && userWallet !== 'wallet_connected' && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 mb-2">Sua Wallet:</p>
              <code className="text-xs text-red-700 break-all bg-red-50 px-2 py-1 rounded">
                {userWallet}
              </code>
              <p className="text-xs text-red-600 mt-2">
                {auth.isAuthenticated ? 'Login Google' : 'Wallet Conectada'}
              </p>
            </div>
          )}

          <div className="text-red-600 text-sm space-y-2">
            <p>Entre em contato com o administrador para solicitar acesso.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={() => window.location.href = 'mailto:contato@ticketfy.link?subject=Solicitação de Acesso - Criador de Eventos'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Solicitar Acesso por Email
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Verificar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ATUALIZADO: Se está autenticado e na whitelist, mostra o formulário completo
  if (isWhitelisted === true) {
    const userWallet = getUserWallet();
    
    // Determinar o texto do botão principal baseado no contexto
    const getSubmitButtonText = () => {
      if (isLoading) {
        if (showPublish) return 'Publicando...';
        if (showUpdate) return 'Atualizando...';
        return 'Processando...';
      }
      
      if (mode === 'create') return 'Publicar Evento';
      if (showPublish) return 'Publicar Evento';
      if (showUpdate) return 'Atualizar Evento';
      return 'Enviar';
    };

    return (
      <div className="space-y-8">
        {/* Cabeçalho com informações do usuário - apenas para criação */}
        {mode === 'create' && userWallet && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Criando Novo Evento</h3>
                <p className="text-sm text-gray-600">
                  Você está criando um evento como{' '}
                  <span className="font-medium text-blue-600">
                    {auth.user?.name || 'Organizador'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de alterações não salvas (modo edição) */}
        {mode === 'edit' && isDirty && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Alterações não salvas</p>
                <p className="text-sm text-amber-700">
                  {isDraft 
                    ? 'Você tem alterações não salvas no rascunho. Salve antes de publicar.'
                    : 'Você tem alterações não salvas no evento publicado.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Seção 1: Detalhes do Evento */}
          <EventDetailsSection />

          {/* Seção 2: Localização */}
          <LocationSection />

          {/* Seção 3: Ingressos */}
          <TicketsSection />

          {/* Seção 4: Organizador */}
          <OrganizerSection />

          {/* Seção 5: Termos e Condições */}
          <TermsSection />

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:block">
            <div className="flex justify-between items-center pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
                >
                  Cancelar
                </button>
                
                {/* Botão Salvar Rascunho - mostra apenas se for draft ou modo criação */}
                {(showSaveDraft && onSaveDraft) && (
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    {isDraft ? 'Salvar Rascunho' : 'Salvar como Rascunho'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    inline-flex items-center gap-2 px-8 py-3 
                    rounded-xl font-semibold transition-all shadow-md hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isDraft || showPublish 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                    }
                  `}
                >
                  {showPublish ? (
                    <Upload className="w-4 h-4" />
                  ) : showUpdate ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : null}
                  {getSubmitButtonText()}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="sm:hidden">
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 z-50 shadow-lg">
              {isDirty && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">
                      Alterações não salvas
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                {(showSaveDraft && onSaveDraft) && (
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isLoading || !isDirty}
                    className={`
                      flex-1 px-4 py-3.5 border border-slate-300 
                      text-slate-700 rounded-xl font-medium 
                      hover:bg-slate-50 disabled:opacity-50 
                      disabled:cursor-not-allowed transition-colors 
                      flex items-center justify-center gap-2
                    `}
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    flex-1 px-4 py-3.5 rounded-xl font-medium 
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors flex items-center justify-center gap-2
                    ${isDraft || showPublish 
                      ? 'flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' 
                      : 'flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                    }
                  `}
                >
                  {showPublish ? (
                    <Upload className="w-4 h-4" />
                  ) : showUpdate ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : null}
                  <span>{getSubmitButtonText()}</span>
                </button>
              </div>
            </div>
            
            {/* Espaço para evitar que o conteúdo fique atrás dos botões fixos */}
            <div className="h-24"></div>
          </div>
        </form>
      </div>
    );
  }

  // Fallback - caso algum estado inesperado
  return (
    <div className="py-12 text-center">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Estado Desconhecido</h3>
        <p className="text-gray-600 mb-4">
          Não foi possível determinar sua autorização para criar eventos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Recarregar Página
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}