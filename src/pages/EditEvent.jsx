import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventFormProvider, useEventForm } from '@/contexts/EventFormContext';
import { EventForm } from './events/components/EventForm';
import { API_URL } from '@/lib/constants';
import { useAppWallet } from '@/hooks/useAppWallet';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';

function EditEventPageContent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const wallet = useAppWallet();
  const auth = useAuth();

  const { initializeForm, formData, validateForm, isDirty, setIsDirty } = useEventForm();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [eventStatus, setEventStatus] = useState('draft');

  // ✅ FUNÇÃO CORRIGIDA: Obter controller da wallet
  const getController = () => {
    console.log('🔍 Buscando controller...');
    
    // Prioridade 1: Wallet conectada via useAppWallet
    if (wallet.connected && wallet.publicKey) {
      const controller = wallet.publicKey.toString();
      console.log('✅ Controller da wallet conectada:', controller);
      return controller;
    }

    // Prioridade 2: Wallet do AuthContext
    if (auth.getUserWallet) {
      const userWallet = auth.getUserWallet();
      console.log('📦 Wallet do AuthContext:', userWallet);
      if (userWallet?.address) {
        console.log('✅ Controller do AuthContext:', userWallet.address);
        return userWallet.address;
      }
    }

    // Prioridade 3: Wallet do localStorage (compatibilidade)
    try {
      // Tentar diferentes chaves possíveis
      const solanaWallet = localStorage.getItem('solana_wallet_connection');
      const userWalletData = localStorage.getItem('user_wallet_data');
      
      console.log('🔍 localStorage solana_wallet_connection:', solanaWallet);
      console.log('🔍 localStorage user_wallet_data:', userWalletData);
      
      if (solanaWallet) {
        const parsed = JSON.parse(solanaWallet);
        if (parsed.publicKey) {
          console.log('✅ Controller do localStorage (solana_wallet_connection):', parsed.publicKey);
          return parsed.publicKey;
        }
      }
      
      if (userWalletData) {
        const parsed = JSON.parse(userWalletData);
        if (parsed.address) {
          console.log('✅ Controller do localStorage (user_wallet_data):', parsed.address);
          return parsed.address;
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao ler wallet do localStorage:', error);
    }

    console.error('❌ Nenhuma wallet encontrada');
    return null;
  };

  // Buscar dados do evento ao carregar
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log('📥 Buscando dados do evento...', { eventId });
        
        const controller = getController();
        console.log('🎯 Controller obtido para fetch:', controller);
        
        if (!controller) {
          throw new Error('Carteira não encontrada. Por favor, conecte sua carteira.');
        }

        const response = await fetch(`${API_URL}/api/manage/${eventId}?controller=${controller}`);

        if (response.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão para editar este evento.');
        }
        if (!response.ok) {
          throw new Error('Evento não encontrado ou falha ao carregar.');
        }

        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Resposta da API inválida.');
        }

        console.log('✅ Dados do evento recebidos:', result.data);
        initializeForm(result.data);
        setIsDraft(result.data.is_draft);
        setEventStatus(result.data.status || 'draft');
        
        if (result.data.is_draft) {
          toast.success('Rascunho carregado! Você pode publicar ou salvar como rascunho.');
        } else {
          toast.success('Evento publicado carregado! Você pode atualizar as informações.');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar evento:', error);
        toast.error(error.message);
        navigate('/my-events');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchEventData();
  }, [eventId, initializeForm, navigate]);

  // ✅ FUNÇÃO CORRIGIDA: Salvar alterações no rascunho
  const handleSaveDraftChanges = async () => {
    console.log('💾 Iniciando salvamento do rascunho...');
    
    setIsSubmitting(true);
    const toastId = toast.loading('Salvando rascunho...');
    
    try {
      const controller = getController();
      console.log('🎯 Controller para save:', controller);
      
      if (!controller) {
        throw new Error('Carteira não encontrada. Por favor, conecte sua carteira.');
      }

      // ✅ VALIDAÇÃO DO FORMULÁRIO ANTES DE SALVAR
      if (!validateForm()) {
        throw new Error('Por favor, corrija os erros no formulário antes de salvar.');
      }

      const formDataToSend = new FormData();
      const dataToSend = { 
        ...formData, 
        draft_id: eventId,
        controller: controller,
        lastSaved: new Date().toISOString()
      };
      
      console.log('📤 Dados a serem enviados:', dataToSend);
      formDataToSend.append('draftData', JSON.stringify(dataToSend));

      // ✅ ADICIONAR APENAS ARQUIVOS QUE SÃO REALMENTE FILES
      if (formData.bannerImage instanceof File) { // Lendo 'bannerImage' do form
                console.log('🖼️ Adicionando banner...');
                formDataToSend.append('bannerImage', formData.bannerImage); // Enviando como 'bannerImage'
              }
              if (formData.image instanceof File) { // Lendo 'image' (arte do ingresso) do form
                console.log('🖼️ Adicionando imagem do ingresso...');
                formDataToSend.append('image', formData.image); // Enviando como 'image'
              }
              // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
              if (formData.organizerLogo instanceof File) {
                console.log('🖼️ Adicionando logo do organizador...');
                formDataToSend.append('organizerLogo', formData.organizerLogo);
              }

      console.log('🚀 Enviando requisição para salvar rascunho...');
      const response = await fetch(`${API_URL}/api/manage/drafts`, { 
        method: 'POST', 
        body: formDataToSend 
      });

      console.log('📨 Resposta recebida:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.error || "Falha ao salvar o rascunho.");
      }

      const result = await response.json();
      console.log('✅ Resposta completa:', result);

      toast.success("✅ Rascunho salvo com sucesso!");
      setIsDirty(false);
      
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  // Função para proceder com a publicação
  const proceedWithPublish = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('🎉 Publicando seu evento... Isso pode levar alguns instantes.');

    try {
      const controller = getController();
      if (!controller) {
        throw new Error('Carteira não encontrada. Por favor, conecte sua carteira.');
      }

      const response = await fetch(`${API_URL}/api/events/publish-gasless-from-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draftId: eventId,
          controller: controller
        }),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ocorreu um erro ao publicar o evento.");
      }

      toast.success("🚀 Evento publicado com sucesso!");
      navigate(`/dashboard/event/${result.eventAddress}`);
    } catch (error) {
      toast.dismiss();
      console.error("Falha na publicação:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para publicar a partir do rascunho, com checagem de alterações
  const handlePublishFromDraft = async () => {
    console.log('🚀 Iniciando publicação...');
    
    if (!validateForm()) {
      toast.error('❌ Por favor, corrija os erros no formulário antes de publicar.');
      return;
    }

    if (!isDirty) {
      await proceedWithPublish();
      return;
    }

    // Diálogo para alterações não salvas
    toast.custom(
      (t) => (
        <UnsavedChangesDialog
          toastId={t.id}
          onCancel={() => toast.dismiss(t.id)}
          onPublishAnyway={async () => {
            toast.dismiss(t.id);
            await proceedWithPublish();
          }}
          onSaveAndPublish={async () => {
            toast.dismiss(t.id);
            try {
              await handleSaveDraftChanges();
              await proceedWithPublish();
            } catch (error) {
              console.error("Não foi possível publicar porque o salvamento falhou.", error);
              toast.error('Falha ao salvar alterações. Tente novamente.');
            }
          }}
        />
      ),
      { duration: Infinity }
    );
  };

  const handleUpdatePublishedEvent = async () => {
            console.log('🚀 Iniciando atualização de evento publicado...');
        
            if (!validateForm()) {
              toast.error('❌ Por favor, corrija os erros no formulário antes de atualizar.');
              return;
            }
        
            setIsSubmitting(true);
            const toastId = toast.loading('📝 Atualizando seu evento... Isso pode levar alguns instantes.');
        
            try {
              const controller = getController();
              if (!controller) {
                throw new Error('Carteira não encontrada. Por favor, conecte sua carteira.');
              }
        
              // eventId vem do useParams() no topo do seu componente
              console.log(`[✏️] Atualizando evento PDA: ${eventId}`);
              console.log(`[👤] Com controller: ${controller}`);
        
              const formDataToSend = new FormData();
        
              // --- 1. Adicionar Endereço do Controller ---
              formDataToSend.append('controllerAddress', controller);
        
              // --- 2. Adicionar Arquivos (Apenas se forem novos) ---
              // Criamos uma cópia temporária dos dados do formulário para não modificar o estado
              const offChainPayload = { ...formData };
        
              // --- ⬇️ CORREÇÃO AQUI ⬇️ ---
              // Lendo 'bannerImage' do formulário e anexando como 'bannerImage'
              if (formData.bannerImage instanceof File) {
                console.log('🖼️ Anexando novo banner');
                formDataToSend.append('bannerImage', formData.bannerImage);
                // Informa ao backend para usar o arquivo enviado
                offChainPayload.bannerImage = ""; 
              }
        
              // Lendo 'image' (arte do ingresso) do formulário e anexando como 'image'
              if (formData.image instanceof File) {
                console.log('🖼️ Anexando nova imagem do ingresso');
                formDataToSend.append('image', formData.image);
                offChainPayload.image = ""; 
              }
              // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
        
              if (formData.organizerLogo instanceof File) {
                console.log('🖼️ Anexando novo logo do organizador');
                formDataToSend.append('organizerLogo', formData.organizerLogo);
                offChainPayload.organizerLogo = "";
              }
        
              // --- 3. Construir offChainData (igual ao createEvent) ---
              // Usamos o 'offChainPayload' que pode ter as URLs antigas ou "" se um novo arquivo foi enviado
              const offChainData = {
                name: offChainPayload.name,
                description: offChainPayload.description,
                // --- ⬇️ CORREÇÃO AQUI ⬇️ ---
                bannerImage: offChainPayload.bannerImage, // URL antiga ou "" (para ser substituída)
                image: offChainPayload.image, // URL antiga, null, ou ""
                // --- ⬆️ FIM DA CORREÇÃO ⬆️ ---
                properties: {
                  dateTime: {
                    start: offChainPayload.startDate,
                    end: offChainPayload.endDate
                 },
                  location: {
                    type: offChainPayload.locationType,
                    venueName: offChainPayload.venueName,
                    address: {
                      cep: offChainPayload.cep,
                      street: offChainPayload.street,
                      number: offChainPayload.number,
                      complement: offChainPayload.complement,
                      neighborhood: offChainPayload.neighborhood,
                      city: offChainPayload.city,
                      state: offChainPayload.state
                    },
                    onlinePlatform: offChainPayload.onlinePlatform,
                    onlineEventLink: offChainPayload.onlineEventLink
                  },
                  category: offChainPayload.category,
                  visibility: offChainPayload.visibility,
                  organizer: {
                    name: offChainPayload.organizerName,
                    email: offChainPayload.organizerEmail,
                    description: offChainPayload.organizerDescription,
                   logo: offChainPayload.organizerLogo // URL antiga ou ""
                  }
                }
              };
        
              // --- 4. Construir onChainData (igual ao createEvent) ---
              const onChainData = {
                // O controller e treasury não são atualizados, mas enviamos para consistência
                controller: controller,
                treasury: controller, // Assumindo que é o mesmo
                transferFeeBps: parseInt(formData.transferFeeBps, 10) || 100,
                resaleAllowed: formData.resaleAllowed !== undefined ? formData.resaleAllowed : true,
                maxTicketsPerWallet: parseInt(formData.maxTicketsPerWallet, 10) || 10,
                tiers: formData.tickets.map((ticket, index) => {
                  const toISOString = (dateString) => dateString ? new Date(dateString).toISOString() : null;
                  
                  const saleStart = toISOString(ticket.saleStartDate);
                  const saleEnd = toISOString(ticket.saleEndDate);
                  
                  if (!saleEnd) {
                      throw new Error(`O ingresso "${ticket.name}" precisa ter uma data de término de vendas.`);
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
                      start: saleStart, // Envia null se não definido
                      end: saleEnd,
                    },
                    saleStartType: ticket.saleStartType || 'date',
                    saleStartBatch: ticket.saleStartBatch // Nome do lote anterior
                  };
                })
             };
        
              // --- 5. Anexar Dados JSON e Fazer a Chamada ---
              formDataToSend.append('offChainData', JSON.stringify(offChainData));
              formDataToSend.append('onChainData', JSON.stringify(onChainData));
        
              console.log('📤 Enviando requisição de atualização (PUT)...');
              
              // A URL DEVE incluir o eventId
              const response = await fetch(`${API_URL}/api/events/update-published/${eventId}`, {
                method: 'PUT',
                body: formDataToSend,
              });
        
              const result = await response.json();
              toast.dismiss(toastId);
        
              if (!response.ok || !result.success) {
                console.error('❌ Erro na resposta da atualização:', result);
                throw new Error(result.error || "Ocorreu um erro ao atualizar o evento.");
              }
        
              console.log('✅ Evento atualizado com sucesso:', result);
              toast.success("✅ Evento atualizado com sucesso!");
              setIsDirty(false); // Reseta o estado 'isDirty' do formulário
              
              // Atualiza o formulário localmente com os dados retornados
              // (O backend precisa retornar os dados atualizados para isso funcionar)
              if (result.data) {
                initializeForm(result.data);
    s         }
              
            } catch (error) {
             toast.dismiss(toastId);
              console.error("❌ Falha catastrófica na atualização:", error);
              toast.error(error.message);
            } finally {
              setIsSubmitting(false);
            }
          };

  // Função para duplicar evento como rascunho
  const handleDuplicateAsDraft = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('🔄 Criando cópia do evento...');

    try {
      const controller = getController();
      if (!controller) {
        throw new Error('Carteira não encontrada. Por favor, conecte sua carteira.');
      }

      const response = await fetch(`${API_URL}/api/events/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: eventId,
          controller: controller
        }),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ocorreu um erro ao duplicar o evento.");
      }

      toast.success("📋 Cópia criada como rascunho!");
      navigate(`/edit-event/${result.draftId}`);
    } catch (error) {
      toast.dismiss();
      console.error("Falha ao duplicar:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja sair?'
      );
      if (!confirmLeave) return;
    }
    navigate('/my-events');
  };

  // Renderização de loading
  if (isLoadingData) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando evento...</h2>
        <p className="text-gray-500">Preparando tudo para sua edição</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações do evento */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Evento {isDirty && <span className="text-orange-500">•</span>}
            </h1>
            <p className="text-gray-600 mt-1">
              {isDraft ? 'Rascunho - Você pode salvar ou publicar' : 'Publicado - Você pode atualizar informações'}
            </p>
          </div>
    
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EventForm
          isLoading={isSubmitting}
          isDraft={isDraft}
          onSubmit={isDraft ? handlePublishFromDraft : handleUpdatePublishedEvent}
          onSaveDraft={isDraft ? handleSaveDraftChanges : undefined}
          onCancel={handleCancel}
          mode="edit"
          walletConnected={true}
          isWhitelisted={true}
          showSaveDraft={isDraft}
          showPublish={isDraft}
          showUpdate={!isDraft}
        />
      </div>

      {/* Ações móveis fixas no bottom para mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-50">
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          {isDraft && (
            <button
              onClick={handleSaveDraftChanges}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          
          <button
            onClick={isDraft ? handlePublishFromDraft : handleUpdatePublishedEvent}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '...' : (isDraft ? 'Publicar' : 'Atualizar')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditEvent() {
  return (
    <EventFormProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <EditEventPageContent />
        </div>
      </div>
    </EventFormProvider>
  );
}