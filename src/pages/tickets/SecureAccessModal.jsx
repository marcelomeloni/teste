import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon, TagIcon } from '@heroicons/react/24/outline';
import { useSecureQRCode } from '@/hooks/useSecureQRCode';

export function SecureAccessModal({ 
  isOpen, 
  onClose, 
  ticket,
  eventImage 
}) {
  const ticketMint = ticket?.account?.nftMint?.toString();
  const {
    qrData,
    loading,
    error,
    timeLeft,
    generateSecureCode,
    refresh
  } = useSecureQRCode(ticketMint);

  const [manualRefresh, setManualRefresh] = useState(false);

  // 1. Carregar dados iniciais apenas quando o modal abrir
  useEffect(() => {
    if (isOpen && ticketMint && !qrData) {
      console.log('🎫 Modal aberto, gerando código inicial...');
      generateSecureCode();
    }
  }, [isOpen, ticketMint, qrData, generateSecureCode]);

  // 2. Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setManualRefresh(false);
    }
  }, [isOpen]);

  const handleManualRefresh = () => {
    setManualRefresh(true);
    refresh();
  };

  const progressPercentage = (timeLeft / 60) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Acesso ao Evento</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                {timeLeft > 0 ? 'Live Code Ativo' : 'Atualizando...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo Principal */}
        <div className="p-6 bg-slate-50 flex flex-col items-center justify-center flex-grow min-h-[380px]">
          
          {loading && (!qrData || manualRefresh) ? (
            // Loading Inicial ou Refresh Manual
            <div className="flex flex-col items-center">
              <ArrowPathIcon className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-slate-600 font-medium">
                {manualRefresh ? 'Atualizando código...' : 'Gerando token seguro...'}
              </p>
            </div>
          ) : error ? (
            // Estado de Erro
            <div className="text-center px-4">
              <div className="bg-red-50 p-4 rounded-full inline-block mb-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-slate-800 font-bold mb-1">Falha na conexão</p>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <button 
                onClick={generateSecureCode}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition shadow-lg"
              >
                Tentar Novamente
              </button>
            </div>
          ) : qrData ? (
            // QR Code Ativo
            <>
              <div className="relative p-4 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
                <QRCode
                  value={qrData}
                  size={200}
                  level="H"
                  className="rounded-lg"
                />
                
                {/* Efeito visual de scan */}
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30 blur-sm animate-[scan_2s_ease-in-out_infinite] pointer-events-none rounded-2xl" />
              </div>

              {/* Timer e Controles */}
              <div className="w-full max-w-[240px] mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-mono text-slate-500 mb-1.5">
                      <span>EXPIRA EM</span>
                      <span className={`font-bold transition-colors ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>
                        {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="ml-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition disabled:opacity-50"
                    title="Atualizar QR Code"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Info do Ingresso */}
              <div className="flex items-center gap-3 w-full bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                {eventImage ? (
                  <img src={eventImage} alt="Event" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-slate-400"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {ticket.event?.metadata?.name || 'Evento'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    ID: {ticketMint?.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Não compartilhe prints de tela
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 5%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}