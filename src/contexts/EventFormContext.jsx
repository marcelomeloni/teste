import { createContext, useContext, useState, useCallback } from 'react';

const EventFormContext = createContext(null);

const initialFormData = {
  // Seção de Detalhes
  draft_id: null,
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  bannerImage: null, // <-- MODIFICADO (era 'image')
  image: null,        // <-- MODIFICADO (era 'nftImage')
  
  // Seção de Localização
  locationType: 'presential',
  venueName: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  category: '',
  visibility: 'public',
  resaleAllowed: true,
  maxTicketsPerWallet: 10,
  transferFeeBps: 100, 
  neighborhood: '',
  city: '',
  state: '',
  onlinePlatform: '',
  onlineEventLink: '',
  
  // Seção de Ingressos
  tickets: [],
  
  // Seção de Organizador
  organizerName: '',
  organizerEmail: '',
  organizerDescription: '',
  organizerLogo: null,

  // Seção de Termos
  termsAccepted: false,
};

export function EventFormProvider({ children }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [warnings, setWarnings] = useState({});

  /**
   * ✅ VALIDAÇÕES DE DATA - FUNÇÕES AUXILIARES
   */
  const validateDates = useCallback((startDate, endDate, saleStartDate, saleEndDate, ticketName = '') => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const saleStart = new Date(saleStartDate);
    const saleEnd = new Date(saleEndDate);

    const validation = {
      isValid: true,
      errors: {},
      warnings: {}
    };

    // Validações de ERRO (impedem o envio)
    if (start >= end) {
      validation.errors.eventDates = 'A data de término deve ser após a data de início';
      validation.isValid = false;
    }

    if (saleStart >= saleEnd) {
      validation.errors.saleDates = `As vendas do ingresso ${ticketName} devem terminar após o início`;
      validation.isValid = false;
    }

    if (saleEnd > end) {
      validation.errors.saleAfterEvent = `As vendas do ingresso ${ticketName} não podem terminar após o evento`;
      validation.isValid = false;
    }

    if (saleStart > end) {
      validation.errors.saleStartsAfterEvent = `As vendas do ingresso ${ticketName} não podem iniciar após o evento`;
      validation.isValid = false;
    }

    // Validações de AVISO (apenas alertam o usuário)
    if (start < now) {
      validation.warnings.eventInPast = 'O evento está marcado para uma data passada';
    }

    if (saleEnd < now) {
      validation.warnings.saleEnded = `As vendas do ingresso ${ticketName} já encerraram`;
    }

    if (saleStart < now && saleEnd > now) {
      validation.warnings.saleActive = `As vendas do ingresso ${ticketName} já começaram`;
    }

    if (saleEnd > start) {
      validation.warnings.saleEndsAfterEventStart = `As vendas do ingresso ${ticketName} continuam após o início do evento`;
    }

    return validation;
  }, []);

  /**
   * ✅ VALIDAÇÃO DE TICKETS - IMPEDE DATAS INVÁLIDAS
   */
  const validateTickets = useCallback((tickets, eventStartDate, eventEndDate) => {
    const ticketErrors = {};
    const ticketWarnings = {};
    let hasErrors = false;

    tickets.forEach((ticket, index) => {
      if (!ticket.saleStartDate || !ticket.saleEndDate) return;

      const validation = validateDates(
        eventStartDate,
        eventEndDate,
        ticket.saleStartDate,
        ticket.saleEndDate,
        ticket.name
      );

      if (!validation.isValid) {
        hasErrors = true;
        ticketErrors[`ticket_${index}`] = validation.errors;
      }

      if (Object.keys(validation.warnings).length > 0) {
        ticketWarnings[`ticket_${index}`] = validation.warnings;
      }
    });

    return { errors: ticketErrors, warnings: ticketWarnings, hasErrors };
  }, [validateDates]);

  /**
   * ✅ FUNÇÃO PARA PRÉ-PREENCHER O FORMULÁRIO
   */
const initializeForm = useCallback((eventData) => {
  console.log("🔄 Inicializando formulário com dados da API...", eventData);

  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)); 
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      console.error("Erro ao formatar data:", isoString, e);
      return '';
    }
  };

  const isDraft = eventData.is_draft;
  const data = eventData.metadata || eventData;
  
  console.log("📊 Estrutura dos dados recebidos:", {
    isDraft,
    metadata: eventData.metadata,
    data
  });

  const populatedData = {
    draft_id: eventData.id || null,
    name: data.name || data.eventDetails?.name || '',
    description: data.description || data.eventDetails?.description || '',
    startDate: formatDateTimeForInput(data.properties?.dateTime?.start || data.startDate || eventData.event_start_date),
    endDate: formatDateTimeForInput(data.properties?.dateTime?.end || data.endDate || eventData.event_end_date),
    
    // ✅ CORREÇÃO CRÍTICA: Mapeamento correto baseado na estrutura real da API
    // Banner pode vir de: metadata.bannerImage, data.bannerImage, ou eventData.image_url
    bannerImage: data.bannerImage || eventData.image_url || data.properties?.bannerImage || null,
    
    // Arte do ingresso pode vir de: metadata.image
    image: data.image || data.properties?.image || null,
    
    category: data.properties?.category || data.category || '',
    visibility: data.properties?.visibility || data.visibility || 'public',
    locationType: data.properties?.location?.type || data.locationType || 'presential',
    venueName: data.properties?.location?.venueName || data.venueName || eventData.location_name || '',
    cep: data.properties?.location?.address?.cep || data.cep || '',
    street: data.properties?.location?.address?.street || data.street || '',
    number: data.properties?.location?.address?.number || data.number || '',
    complement: data.properties?.location?.address?.complement || data.complement || '',
    neighborhood: data.properties?.location?.address?.neighborhood || data.neighborhood || '',
    city: data.properties?.location?.address?.city || data.city || '',
    state: data.properties?.location?.address?.state || data.state || '',
    onlinePlatform: data.properties?.location?.onlinePlatform || data.onlinePlatform || '',
    onlineEventLink: data.properties?.location?.onlineEventLink || data.onlineEventLink || '',
    
    tickets: (data.ticketing?.tiers || data.tickets || eventData.tickets || []).map(ticket => {
      const saleStart = ticket.saleWindow?.start || ticket.saleStartDate || ticket.activationDate;
      const saleEnd = ticket.saleWindow?.end || ticket.saleEndDate;
      
      return {
        id: ticket.id || `ticket-${Date.now()}-${Math.random()}`,
        name: ticket.name || 'Ingresso',
        type: ticket.price === 0 ? 'free' : 'paid',
        price: ticket.price || 0,
        quantity: ticket.quantity || ticket.maxSupply || 0,
        saleStartDate: formatDateTimeForInput(saleStart),
        saleEndDate: formatDateTimeForInput(saleEnd),
        allowTransfer: ticket.isTransferable ? 'yes' : 'no',
        minPerPurchase: ticket.purchasePolicy?.minPerPurchase || 1,
        maxPerPurchase: ticket.purchasePolicy?.maxPerPurchase || 5,
      };
    }),
    
    organizerName: data.properties?.organizer?.name || data.organizerName || '',
    organizerEmail: data.properties?.organizer?.email || data.organizerEmail || '',
    organizerDescription: data.properties?.organizer?.description || data.organizerDescription || '',
    organizerLogo: data.properties?.organizer?.logo || data.organizerLogo || null,
    
    resaleAllowed: data.ticketing?.resaleAllowed !== undefined 
      ? data.ticketing.resaleAllowed 
      : (eventData.resale_allowed !== undefined ? eventData.resale_allowed : true),
    
    maxTicketsPerWallet: data.ticketing?.maxTicketsPerWallet || eventData.max_tickets_per_wallet || 10,
    transferFeeBps: data.ticketing?.transferFeeBps || eventData.transfer_fee_bps || 100,
    termsAccepted: data.termsAccepted || false,
  };
  
  console.log("✅ Dados mapeados após inicialização:", {
    bannerImage: populatedData.bannerImage,
    image: populatedData.image,
    totalTickets: populatedData.tickets.length
  });
  
  setFormData(populatedData);
  setIsDirty(false);
  setErrors({});
  setWarnings({});
}, []);

  /**
   * ✅ ATUALIZAÇÃO SEGURA DE DATAS COM VALIDAÇÃO
   */
  const handleFormDataChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => {
      const newData = { ...prevData, [name]: newValue };
      
      // Validação automática quando datas do evento mudam
      if (name === 'startDate' || name === 'endDate') {
        const ticketValidation = validateTickets(newData.tickets, newData.startDate, newData.endDate);
        setErrors(prev => ({ ...prev, ...ticketValidation.errors }));
        setWarnings(prev => ({ ...prev, ...ticketValidation.warnings }));
      }
      
      return newData;
    });
    
    setIsDirty(true);
  }, [validateTickets]);

  /**
   * ✅ ATUALIZAÇÃO DE TICKETS COM VALIDAÇÃO
   */
  const updateTickets = useCallback((newTickets) => {
    setFormData(prevData => {
      const ticketValidation = validateTickets(newTickets, prevData.startDate, prevData.endDate);
      setErrors(prev => ({ ...prev, ...ticketValidation.errors }));
      setWarnings(prev => ({ ...prev, ...ticketValidation.warnings }));
      
      return { ...prevData, tickets: newTickets };
    });
    setIsDirty(true);
  }, [validateTickets]);

  const handleFileChange = useCallback((fieldName, file) => {
    setFormData(prevData => ({ ...prevData, [fieldName]: file }));
    setIsDirty(true);
  }, []);

  /**
   * ✅ VALIDAÇÃO COMPLETA DO FORMULÁRIO
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validações básicas
    if (!formData.name.trim()) newErrors.name = 'Nome do evento é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    
    // --- MODIFICAÇÃO AQUI ---
    if (!formData.bannerImage) newErrors.bannerImage = 'Imagem do banner do evento é obrigatória'; // <-- MODIFICADO (era 'image')
    // Nota: O 'image' (antigo 'nftImage') não é obrigatório no form, pode ser opcional.
    // --- FIM DA MODIFICAÇÃO ---

    if (formData.tickets.length === 0) newErrors.tickets = 'Pelo menos um tipo de ingresso é obrigatório';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Você deve aceitar os termos e condições';

    // Validações de data do evento
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    } else if (startDate < now) {
      newErrors.startDate = 'O evento não pode começar no passado';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de término é obrigatória';
    } else if (endDate <= startDate) {
      newErrors.endDate = 'A data de término deve ser após a data de início';
    }

    // Validações de tickets
    const ticketValidation = validateTickets(formData.tickets, formData.startDate, formData.endDate);
    if (ticketValidation.hasErrors) {
      Object.assign(newErrors, ticketValidation.errors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateTickets]);

  /**
   * ✅ VALIDAÇÃO EM TEMPO REAL PARA UM TICKET ESPECÍFICO
   */
  const validateTicketDates = useCallback((ticketIndex, saleStartDate, saleEndDate) => {
    if (!formData.startDate || !formData.endDate) return { isValid: true, errors: {}, warnings: {} };
    
    return validateDates(
      formData.startDate,
      formData.endDate,
      saleStartDate,
      saleEndDate,
      formData.tickets[ticketIndex]?.name || `Ingresso ${ticketIndex + 1}`
    );
  }, [formData.startDate, formData.endDate, formData.tickets, validateDates]);

  /**
   * ✅ FUNÇÃO PARA OBTER SUGESTÃO DE DATA DE TÉRMINO DE VENDAS
   */
  const getSuggestedSaleEndDate = useCallback((saleStartDate) => {
    if (!saleStartDate || !formData.startDate) return '';
    
    const saleStart = new Date(saleStartDate);
    const eventStart = new Date(formData.startDate);
    
    // Sugere terminar as vendas 1 hora antes do evento ou na data de início
    const suggestedEnd = new Date(Math.min(
      eventStart.getTime(),
      saleStart.getTime() + (7 * 24 * 60 * 60 * 1000) // Máximo 1 semana após início
    ));
    
    // Ajusta para o formato do input datetime-local
    return new Date(suggestedEnd.getTime() - (suggestedEnd.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  }, [formData.startDate]);

const resetForm = useCallback(() => {
      setFormData(initialFormData);
      setErrors({}); 
      setWarnings({});
      setIsDirty(false);
    }, []);

  const logFormState = useCallback(() => {
    console.log('📋 ESTADO COMPLETO DO FORMULÁRIO:', { 
      ...formData, 
      errors, 
      warnings,
      isValid: validateForm()
    });
  }, [formData, errors, warnings, validateForm]);

  const value = {
    formData,
    setFormData,
    errors,
    setErrors,
    warnings,
    setWarnings,
    handleFormDataChange,
    handleFileChange,
    updateTickets,
    validateForm,
    validateTicketDates,
    getSuggestedSaleEndDate,
    resetForm,
    logFormState,
    initializeForm,
    isDirty,     
    setIsDirty,
  };

  return (
    <EventFormContext.Provider value={value}>
      {children}
    </EventFormContext.Provider>
  );
}

export function useEventForm() {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error('useEventForm deve ser usado dentro de um EventFormProvider');
  }
  return context;
}