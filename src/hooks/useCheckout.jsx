import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer'; 
import QRCode from 'qrcode'; 
import toast from 'react-hot-toast'; 
import { useAuth } from '@/contexts/AuthContext';
import { useAppWallet } from '@/hooks/useAppWallet';
import { API_URL } from '@/lib/constants';
import { TicketPDF } from '@/components/pdf/TicketPDF'; 

export const useCheckout = () => {
  const { eventAddress } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const wallet = useAppWallet();
  
  // Estados do fluxo
  const [activeStep, setActiveStep] = useState('form_filling');
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do formulário e pagamento
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  // Estados pós-compra
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [isSeedPhraseConfirmed, setIsSeedPhraseConfirmed] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { selectedTickets, totalPrice } = location.state || {};

  // Carregar dados do evento
  useEffect(() => {
    if (!selectedTickets || Object.keys(selectedTickets).length === 0) {
      navigate(`/event/${eventAddress}`);
      return;
    }

    const fetchEventData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/events/${eventAddress}/fast`);
        if (!response.ok) throw new Error('Erro ao carregar evento');
        const data = await response.json();
        setEventData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventAddress, navigate, selectedTickets]);

  // Helpers de Carteira e Auth
  const getUserWallet = () => {
    try {
      const stored = localStorage.getItem('user_wallet_data');
      if (stored) {
        const walletData = JSON.parse(stored);
        return walletData.address;
      }
    } catch (error) {
      console.warn('Erro ao carregar wallet do localStorage:', error);
    }

    if (wallet.connected && wallet.publicKey) {
      return wallet.publicKey.toString();
    }

    if (auth.getUserWallet) {
      const authWallet = auth.getUserWallet();
      if (authWallet?.address) {
        return authWallet.address;
      }
    }

    return null;
  };

  const getAuthType = () => {
    if (auth.isAuthenticated && wallet.connected) return 'google_wallet';
    if (auth.isAuthenticated) return 'google';
    if (wallet.connected) return 'wallet';
    return 'none';
  };

  const getTicketSummary = () => {
    if (!eventData?.ticketing?.tiers) return [];
    
    return eventData.ticketing.tiers
      .map(tier => ({
        ...tier,
        quantity: selectedTickets[tier.id] || 0,
        subtotal: tier.type === 'paid' ? tier.price * (selectedTickets[tier.id] || 0) : 0
      }))
      .filter(item => item.quantity > 0);
  };

  const ticketSummary = getTicketSummary();
  const isFree = totalPrice === 0;
  const userWallet = getUserWallet();
  const authType = getAuthType();
  const ticketQuantity = ticketSummary.reduce((total, item) => total + item.quantity, 0);
  const ticketType = ticketSummary.map(item => `${item.quantity}x ${item.name}`).join(', ');
  const totalAmount = totalPrice?.toFixed(2) || '0.00';
  const platformFeeBps = eventData?.platform_fee_bps || 0;
  // Manipulação do Formulário
  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxGroupChange = (fieldId, option, isChecked) => {
    setFormData(prev => {
      const currentOptions = prev[fieldId] || {};
      const updatedOptions = {
        ...currentOptions,
        [option]: isChecked
      };

      return {
        ...prev,
        [fieldId]: updatedOptions
      };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // LOG: Dados do formulário antes de validar
    console.log('📋 [FORM SUBMIT] Dados do formulário antes de validar:', {
      formData,
      hasField1: !!formData['field-1'],
      hasField2: !!formData['field-2'],
      fieldsCount: Object.keys(formData).length
    });
    
    const requiredFields = eventData?.registration_form_fields?.filter(field => field.required) || [];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field.id];
      
      if (field.type === 'checkbox') {
        if (typeof value === 'object' && value !== null) {
          const hasSelection = Object.values(value).some(selected => selected === true);
          return !hasSelection;
        }
        return true;
      }
      
      if (field.type === 'terms') {
        return value !== true;
      }
      
      return !value;
    });
    
    if (!formData['field-1']) missingFields.push('Nome Completo');
    if (!formData['field-2']) missingFields.push('E-mail');
    
    // LOG: Campos faltantes
    console.log('🔍 [FORM VALIDATION] Campos obrigatórios faltantes:', missingFields);
    
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(fieldId => {
        if (fieldId === 'Nome Completo') return 'Nome Completo';
        if (fieldId === 'E-mail') return 'E-mail';
        
        const fieldConfig = eventData?.registration_form_fields?.find(field => field.id === fieldId);
        return fieldConfig?.label || fieldId;
      });
      
      console.log('❌ [FORM ERROR] Falta preencher campos:', missingLabels);
      setError(`Preencha os campos obrigatórios: ${missingLabels.join(', ')}`);
      return;
    }
    
    // LOG: Formulário válido
    console.log('✅ [FORM SUCCESS] Formulário válido, avançando para pagamento');
    
    setActiveStep('payment_review');
  };


 const getEndpointAndPayload = (externalPaymentData = null) => {
    
    // 1. Descobrir ID e Index do Tier Selecionado
    let tierIndex = 0;
    let ticketId = null; // UUID do tier para o banco de dados
    
    const selectedTierEntry = Object.entries(selectedTickets || {}).find(([id, qty]) => qty > 0);
    
    if (selectedTierEntry) {
      const [selId] = selectedTierEntry; // selId é o UUID do tier
      ticketId = selId;
      
      const foundIndex = eventData?.ticketing?.tiers?.findIndex(tier => tier.id === selId);
      if (foundIndex !== undefined && foundIndex !== -1) {
        tierIndex = Number(foundIndex);
      }
    }
  
    // 2. Montar Payload ESTRITO (Sem variações)
    const basePayload = {
      eventAddress,
      tierIndex,      // Para a Blockchain/Contrato
      ticketId,       // Para o Banco de Dados (Foreign Key)
      formData,
      
      // Dados de pagamento (Se vier do Brick/Externo)
      paymentId: externalPaymentData?.internal_id || externalPaymentData?.id, 
      paymentStatus: externalPaymentData?.status,
      
      // Se NÃO for grátis, envia dados financeiros padronizados
      ...(!isFree && {
        paymentMethodId: selectedPaymentMethod, // PADRÃO: paymentMethodId
        amount: Number(totalPrice.toFixed(2))   // PADRÃO: amount (Float, ex: 45.90)
      })
    };
  
    // 3. Selecionar Endpoint (Lógica mantida)
    let endpoint = '';
    if (isFree) {
        endpoint = authType === 'none' ? '/free/new-user' : '/free/existing-user';
    } else {
        endpoint = authType === 'none' ? '/paid/new-user' : '/paid/existing-user';
    }

    // Adiciona wallet se necessário
    if (authType !== 'none') {
        basePayload.walletAddress = userWallet || wallet.publicKey?.toString();
    }
      
    return { endpoint, payload: basePayload };
  };

  // --- PROCESSO DE COMPRA ATUALIZADO ---
  const processPurchase = async (externalPaymentData = null) => {
    setProcessing(true);
    setError(null);
  
    try {
      const { endpoint, payload } = getEndpointAndPayload(externalPaymentData);
      
      const requiredFields = ['eventAddress', 'tierIndex'];
      
      if (endpoint.includes('existing-user')) {
        requiredFields.push('walletAddress');
      }
  
      const missingFormFields = [];
      if (!formData?.['field-1']) missingFormFields.push('Nome Completo');
      if (!formData?.['field-2']) missingFormFields.push('E-mail');
  
      const missingPayloadFields = requiredFields.filter(field => {
        if (field === 'walletAddress') {
          return !payload.walletAddress;
        }
        if (field === 'tierIndex') {
          if (payload.tierIndex === undefined || payload.tierIndex === null) {
            return true;
          }
          if (typeof payload.tierIndex !== 'number') {
            return true;
          }
          const isValidTierIndex = eventData?.ticketing?.tiers?.[payload.tierIndex] !== undefined;
          return !isValidTierIndex;
        }
        return payload[field] === undefined || payload[field] === null;
      });
  
      const allMissingFields = [...missingPayloadFields, ...missingFormFields];
  
      // LOG: Validação do payload
      console.log('🔎 [VALIDATION] Validando payload:', {
        endpoint,
        payload,
        requiredFields,
        missingFormFields,
        missingPayloadFields,
        allMissingFields,
        hasFormData: !!formData,
        formDataFields: Object.keys(formData || {}),
        tierIndexValid: eventData?.ticketing?.tiers?.[payload.tierIndex] !== undefined
      });
  
      if (allMissingFields.length > 0) {
        throw new Error(`Parâmetros obrigatórios faltando: ${allMissingFields.join(', ')}`);
      }
  
      // LOG: Iniciando request
      console.log('🚀 [API REQUEST] Enviando para API:', {
        url: `${API_URL}/api/tickets${endpoint}`,
        method: 'POST',
        payload: payload,
        payloadSize: JSON.stringify(payload).length
      });
  
      const response = await fetch(`${API_URL}/api/tickets${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // LOG: Response status
      console.log('📨 [API RESPONSE] Status:', response.status, response.statusText);
      
      const result = await response.json();
      
      // LOG: Response completa
      console.log('📊 [API RESULT] Resultado:', {
        success: result.success,
        error: result.error,
        details: result.details,
        hasMintAddress: !!result.mintAddress,
        hasSeedPhrase: !!result.seedPhrase,
        hasRegistrationId: !!result.registrationId,
        fullResult: result
      });
  
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Erro ao processar pedido');
      }
  
      // --- O PULO DO GATO ---
      // Se tiver dados do Mercado Pago (QR Code), misturamos com o resultado do ticket
      const finalResult = {
        ...result,
        qr_code: externalPaymentData?.qr_code,
        qr_code_base64: externalPaymentData?.qr_code_base64,
        payment_status: externalPaymentData?.status
      };
  
      // LOG: Sucesso
      console.log('🎉 [SUCCESS] Compra processada com sucesso:', {
        mintAddress: finalResult.mintAddress,
        registrationId: finalResult.registrationId,
        hasSeedPhrase: !!finalResult.seedPhrase,
        hasPaymentQrCode: !!finalResult.qr_code_base64,
        resultKeys: Object.keys(finalResult)
      });
  
      setPurchaseResult(finalResult);
      setActiveStep('confirmation');
  
    } catch (err) {
      // LOG: Erro detalhado
      console.error('💥 [ERROR] Erro no processamento:', {
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFreePurchase = async () => {
    await processPurchase();
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod && !isFree) {
      setError('Selecione um método de pagamento');
      return;
    }
    await processPurchase();
  };

  // --- NOVA FUNÇÃO PARA O BRICK ---
  const handlePaymentSuccess = async (paymentResponse) => {
    // paymentResponse contém { id, status, qr_code_base64 ... }
    await processPurchase(paymentResponse);
  };

  // Auxiliares de UI
  const getCurrentStepIndex = () => {
    const steps = [
      { id: 'form_filling', label: 'Seus Dados', icon: null },
      { id: 'payment_review', label: 'Revisar & Pagar', icon: null },
      { id: 'confirmation', label: 'Confirmação', icon: null }
    ];
    return steps.findIndex(step => step.id === activeStep);
  };

  const downloadSeedPhrase = () => {
    if (!purchaseResult?.seedPhrase) return;
    
    const blob = new Blob([purchaseResult.seedPhrase], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seed-phrase-${purchaseResult.walletAddress}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    if (!eventData) return;
    
    const startDate = eventData.dateTime?.start ? new Date(eventData.dateTime.start) : new Date();
    const endDate = eventData.dateTime?.end ? new Date(eventData.dateTime.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const calendarEvent = {
      title: eventData.name,
      description: eventData.description || 'Evento Ticketfy',
      location: eventData.location?.venueName || 'Local do evento',
      start: startDate.toISOString().replace(/-|:|\.\d+/g, ''),
      end: endDate.toISOString().replace(/-|:|\.\d+/g, '')
    };
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}&dates=${calendarEvent.start}/${calendarEvent.end}`;
    
    window.open(googleUrl, '_blank');
  };

  // Função para Gerar e Baixar PDF do Ingresso
  const handleDownloadTicket = async () => {
    if (!purchaseResult || !eventData) {
      toast.error("Detalhes do ingresso não encontrados.");
      return;
    }

    setIsDownloadingPdf(true);
    const loadingToast = toast.loading('Gerando PDF do ingresso...');

    try {
      // 1. Gerar QR Code baseado no mintAddress ou usar o QR do Mercado Pago se disponível
      const qrValue = purchaseResult.mintAddress.toString();
      let qrCodeImage;
      
      if (purchaseResult.qr_code_base64) {
        // Usar QR do Mercado Pago se disponível
        qrCodeImage = purchaseResult.qr_code_base64;
        console.log('💰 Usando QR Code do pagamento Mercado Pago');
      } else {
        // Gerar QR Code localmente baseado no mintAddress
        qrCodeImage = await QRCode.toDataURL(qrValue, {
          width: 512,
          margin: 1,
        });
        console.log('🎫 Gerando QR Code local do mintAddress');
      }

      // 2. Converter Imagem do Evento para Base64
      let eventImageBase64 = null;
      const imageUrl = eventData.image || eventData.metadata?.image;

      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            eventImageBase64 = await new Promise((resolve, reject) => {
              const img = new Image();
              const url = URL.createObjectURL(blob);
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                URL.revokeObjectURL(url);
                resolve(dataUrl);
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
              };
              img.src = url;
            });
          }
        } catch (imgError) {
          console.warn('Erro ao carregar imagem para PDF:', imgError);
        }
      }

      // 3. Montar dados para o template TicketPDF
      const pdfData = {
        eventName: eventData.name,
        eventDate: eventData.dateTime?.start,
        eventLocation: eventData.properties?.location,
        mintAddress: purchaseResult.mintAddress,
        eventImage: eventImageBase64,
        seedPhrase: purchaseResult.seedPhrase,
        privateKey: purchaseResult.privateKey,
        registrationId: purchaseResult.registrationId,
        // Adicionar informações de pagamento se disponíveis
        paymentQrCode: purchaseResult.qr_code_base64,
        paymentStatus: purchaseResult.payment_status
      };

      // 4. Gerar o Blob do PDF
      const blob = await pdf(
        <TicketPDF 
          ticketData={pdfData} 
          qrCodeImage={qrCodeImage}
          brandLogoImage="https://red-obedient-stingray-854.mypinata.cloud/ipfs/bafkreih7ofsa246z5vnjvrol6xk5tpj4zys42tcaotxq7tp7ptgraalrya"
        />
      ).toBlob();
      
      // 5. Trigger do Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ingresso_${eventData.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Ingresso baixado com sucesso!', { id: loadingToast });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Verifique o console.', { id: loadingToast });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return {
    activeStep,
    setActiveStep,
    eventData,
    loading,
    error,
    setError,
    processing,
    formData,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    purchaseResult,
    isSeedPhraseConfirmed,
    setIsSeedPhraseConfirmed,
    showTechnicalDetails,
    setShowTechnicalDetails,
    ticketSummary,
    totalPrice,
    isFree,
    ticketQuantity,
    ticketType,
    totalAmount,
    handleInputChange,
    handleCheckboxGroupChange,
    handleFormSubmit,
    handleFreePurchase,
    handlePayment,
    handlePaymentSuccess, // Nova função exportada para integração com Brick
    getCurrentStepIndex,
    downloadSeedPhrase,
    handleAddToCalendar,
    downloadTicketInfo: handleDownloadTicket,
    isDownloadingPdf,
    navigate,
    eventAddress,
    platformFeeBps
  };
};