// pages/ValidatorPage.jsx - VERSÃO CORRIGIDA
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';

// Componentes de UI Mobile
const MobileScannerOverlay = ({ children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-40 flex flex-col">
    {children}
  </div>
);

const BottomSheet = ({ children, isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh]"
      >
        <div className="p-4">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ValidationCard = ({ validation, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-2"
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      validation.success 
        ? 'bg-green-100 text-green-600' 
        : 'bg-red-100 text-red-600'
    }`}>
      {validation.success ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{validation.ticketName || 'Participante'}</p>
      <p className="text-sm text-gray-500 truncate">{validation.ticketType}</p>
      <p className="text-xs text-gray-400 mt-1">{validation.time}</p>
    </div>
    <div className={`text-xs px-2 py-1 rounded-full ${validation.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {validation.success ? '✓' : '✗'}
    </div>
  </motion.div>
);

const SuccessOverlay = ({ data, onClose }) => {
  useEffect(() => {
    // Vibração de sucesso (padrão: curta-longa-curta)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Som de sucesso simples
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Fallback silencioso
    }
    
    // Auto-close após 3 segundos
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600"
    >
      <div className="text-center p-8 w-full max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-4">ACESSO LIBERADO!</h2>
        
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-2xl font-bold text-white mb-2">{data.ticketName}</p>
          <div className="space-y-2">
            <p className="text-white text-opacity-90">{data.ticketType}</p>
            {data.eventName && (
              <p className="text-white text-opacity-80 text-sm">{data.eventName}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white text-green-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        >
          CONTINUAR
        </button>
      </div>
    </motion.div>
  );
};

const ErrorOverlay = ({ error, onClose }) => {
  useEffect(() => {
    // Vibração de erro (três vibrações curtas)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
    
    // Auto-close após 4 segundos
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600"
    >
      <div className="text-center p-8 w-full max-w-sm">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-4">ACESSO NEGADO</h2>
        
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-xl font-bold text-white mb-2">{error.code || 'ERRO'}</p>
          <p className="text-white text-opacity-90">{error.message}</p>
        </div>
        
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white text-red-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    </motion.div>
  );
};

const LockScreen = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
    <div className="text-center mb-12">
      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-white mb-3">VALIDATOR MODE</h1>
      <p className="text-white text-opacity-80">Faça login para acessar o validador de ingressos</p>
    </div>
    
    <button
      onClick={onLogin}
      className="w-full max-w-xs px-8 py-4 bg-white text-purple-900 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 active:scale-95 flex items-center justify-center space-x-3"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      <span>ENTRAR COMO VALIDADOR</span>
    </button>
    
    <div className="mt-12 text-center">
      <p className="text-white text-opacity-60 text-sm">Posicione a câmera sobre o QR Code do ingresso</p>
    </div>
  </div>
);

// Componente principal corrigido
export const ValidatorPage = () => {
  const { eventAddress } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, profile } = useAuth();
  
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationHistory, setValidationHistory] = useState([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [scannerActive, setScannerActive] = useState(true);
  const [stats, setStats] = useState({ validated: 0, total: 0, rate: 0 });
  const [recentValidations, setRecentValidations] = useState([]);
  
  const scannerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  // Carregar dados do evento e histórico
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventAddress || !isAuthenticated) return;
      
      try {
        const response = await fetch(`${API_URL}/api/events/${eventAddress}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
      }
    };

    const loadValidationHistory = async () => {
      if (!eventAddress || !isAuthenticated) return;
      
      try {
        const response = await fetch(`${API_URL}/api/validations/event/${eventAddress}/validated-tickets`);
        if (response.ok) {
          const data = await response.json();
          
          // Se a API retorna um array diretamente
          if (Array.isArray(data)) {
            const history = data.slice(0, 10).map(item => ({
              id: item.id || item.mint,
              ticketName: item.name || 'Participante',
              ticketType: item.ticketType || 'Ingresso',
              eventName: item.eventName,
              time: item.redeemedAt || 'Agora',
              success: true
            }));
            setValidationHistory(history);
            setRecentValidations(history.slice(0, 3));
          } 
          // Se a API retorna um objeto com history e stats
          else if (data.history) {
            const history = data.history.slice(0, 10).map(item => ({
              id: item.id || item.mint,
              ticketName: item.name || 'Participante',
              ticketType: item.ticketType || 'Ingresso',
              eventName: item.eventName,
              time: item.redeemedAt || 'Agora',
              success: true
            }));
            setValidationHistory(history);
            setRecentValidations(history.slice(0, 3));
            
            if (data.stats) {
              setStats({
                validated: data.stats.validated || 0,
                total: data.stats.total || 0,
                rate: data.stats.validationRate || 0
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        // Fallback para dados de exemplo
        setValidationHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
    loadValidationHistory();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadValidationHistory, 30000);
    return () => clearInterval(interval);
  }, [eventAddress, isAuthenticated]);

  // Inicializar scanner QR
  useEffect(() => {
    if (!isAuthenticated || !scannerActive) return;

    let isMounted = true;
    
    const initScanner = async () => {
      try {
        // Carregar dinamicamente a biblioteca html5-qrcode
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        if (!isMounted || !scannerRef.current) return;

        // Configurações otimizadas para mobile
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        };

        qrCodeScannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          config,
          false
        );

        qrCodeScannerRef.current.render(
          async (decodedText) => {
            await handleScan(decodedText);
          },
          (error) => {
            console.warn(`QR Scan error: ${error}`);
          }
        );
      } catch (error) {
        console.error('Erro ao inicializar scanner:', error);
        toast.error('Erro ao iniciar câmera');
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(error => {
          console.error("Erro ao limpar scanner:", error);
        });
        qrCodeScannerRef.current = null;
      }
    };
  }, [isAuthenticated, scannerActive, eventAddress]);

  // Função de validação corrigida
  const handleScan = async (qrCode) => {
    if (!qrCode || showSuccess || showError) return;
    
    setScannerActive(false);
    
    try {
      const response = await fetch(`${API_URL}/api/validations/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          token: qrCode,
          eventAddress: eventAddress
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Sucesso - extrair dados do ticket
        const ticketData = data.ticket || data.ticketMetadata;
        const validation = {
          id: Date.now(),
          ticketName: ticketData?.ownerName || 'Participante',
          ticketType: ticketData?.ticketType || 'Ingresso',
          eventName: eventData?.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          success: true
        };
        
        setLastValidation(validation);
        setShowSuccess(true);
        
        // Atualizar histórico local
        const newHistory = [validation, ...validationHistory].slice(0, 10);
        setValidationHistory(newHistory);
        setRecentValidations(newHistory.slice(0, 3));
        
        // Atualizar estatísticas
        setStats(prev => ({
          ...prev,
          validated: prev.validated + 1,
          rate: prev.total > 0 ? Math.round(((prev.validated + 1) / prev.total) * 100) : 0
        }));
        
        // Feedback toast
        toast.success('Ingresso validado com sucesso!');
        
      } else {
        // Erro
        setLastError({
          code: data.code || 'ERRO',
          message: data.message || 'Erro desconhecido na validação'
        });
        setShowError(true);
        
        toast.error(data.message || 'Erro na validação');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      setLastError({
        code: 'ERRO_CONEXÃO',
        message: 'Falha na conexão com o servidor'
      });
      setShowError(true);
      toast.error('Erro de conexão com o servidor');
    }
  };

  // Resetar scanner após feedback
  const handleFeedbackClose = useCallback(() => {
    setShowSuccess(false);
    setShowError(false);
    setScannerActive(true);
    
    // Pequeno delay para garantir que o scanner foi limpo
    setTimeout(() => {
      if (qrCodeScannerRef.current && scannerRef.current) {
        // Reinicializar scanner
        try {
          qrCodeScannerRef.current.clear().then(() => {
            const scannerContainer = document.getElementById('qr-reader');
            if (scannerContainer) {
              scannerContainer.innerHTML = '';
              qrCodeScannerRef.current.render(
                (decodedText) => handleScan(decodedText),
                (error) => console.warn(`QR Scan error: ${error}`)
              );
            }
          }).catch(console.error);
        } catch (e) {
          console.log('Scanner já limpo');
        }
      }
    }, 300);
  }, []);

  // Tela de login
  if (!isAuthenticated) {
    return <LockScreen onLogin={() => navigate('/login')} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Minimalista */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black via-black to-transparent p-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">
              {eventData?.name || 'Validador de Ingressos'}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">ONLINE</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400 truncate max-w-[120px]">
                {user?.name?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Validador'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBottomSheetOpen(true)}
              className="relative p-2 bg-white bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all"
              aria-label="Histórico"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {validationHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                  {validationHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-green-400">{stats.validated}</div>
            <div className="text-xs text-gray-400">Validados</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{stats.rate}%</div>
            <div className="text-xs text-gray-400">Taxa</div>
          </div>
        </div>
      </header>

      {/* Área Principal do Scanner */}
      <main className="pt-32 pb-24">
        <div className="relative">
          {/* Scanner Container */}
          <div 
            id="qr-reader" 
            ref={scannerRef}
            className="w-full"
            style={{ minHeight: '50vh' }}
          />
          
          {/* Overlay de Guia do Scanner */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative">
              {/* Moldura do Scanner */}
              <svg className="w-64 h-64" viewBox="0 0 256 256">
                <path
                  d="M32,128 L32,32 L128,32"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M224,128 L224,32 L128,32"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M224,128 L224,224 L128,224"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M32,128 L32,224 L128,224"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                
                {/* Animação de varredura */}
                <rect
                  x="32"
                  y="32"
                  width="192"
                  height="4"
                  fill="rgba(34, 197, 94, 0.5)"
                >
                  <animate
                    attributeName="y"
                    from="32"
                    to="220"
                    dur="2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    keyTimes="0; 0.5; 1"
                  />
                </rect>
              </svg>
              
              {/* Instrução */}
              <div className="absolute -bottom-20 left-0 right-0 text-center">
                <p className="text-green-400 font-medium mb-1">Posicione o QR Code na área</p>
                <p className="text-gray-400 text-sm">A validação é automática</p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico Recente (Mini Cards) */}
        {recentValidations.length > 0 && (
          <div className="px-4 mt-8">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Validações Recentes</h3>
            <div className="space-y-2">
              {recentValidations.map((validation, index) => (
                <motion.div
                  key={validation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-[120px]">{validation.ticketName}</p>
                      <p className="text-xs text-gray-400">{validation.time}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded-full">
                    {validation.ticketType}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sheet de Histórico Completo */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Histórico de Validações</h3>
          <button
            onClick={() => setIsBottomSheetOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {validationHistory.length > 0 ? (
            validationHistory.map((validation, index) => (
              <ValidationCard key={validation.id} validation={validation} index={index} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">Nenhuma validação ainda</p>
              <p className="text-sm mt-1">Os ingressos validados aparecerão aqui</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={logout}
            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair do Validador</span>
          </button>
        </div>
      </BottomSheet>

      {/* Overlays de Feedback */}
      <AnimatePresence>
        {showSuccess && lastValidation && (
          <SuccessOverlay 
            data={lastValidation} 
            onClose={handleFeedbackClose} 
          />
        )}
        
        {showError && lastError && (
          <ErrorOverlay 
            error={lastError} 
            onClose={handleFeedbackClose} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValidatorPage;