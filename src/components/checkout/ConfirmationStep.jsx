import React, { useState, useEffect } from 'react';
import { 
  FiCheck, 
  FiCopy, 
  FiDownload, 
  FiExternalLink, 
  FiChevronUp, 
  FiChevronDown,
  FiCalendar,
  FiLoader,
  FiClock, 
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ConfirmationStep = ({
  purchaseResult,
  eventData,
  formData,
  isFree,
  ticketQuantity,
  ticketType,
  totalAmount,
  isSeedPhraseConfirmed,
  setIsSeedPhraseConfirmed,
  showTechnicalDetails,
  setShowTechnicalDetails,
  downloadSeedPhrase,
  handleAddToCalendar,
  downloadTicketInfo, 
  isDownloadingPdf,   
  navigate,
  eventAddress,
  checkPaymentStatus // ✅ Nova prop recebida do hook
}) => {
  const [copied, setCopied] = useState(false);

  // --- LÓGICA DO PIX ---
  const pixImage = purchaseResult?.qr_code_base64;
  const pixCode = purchaseResult?.qr_code;
  
  // Se tiver imagem de QR Code e o status for 'pending' ou 'in_process', é Pix Pendente
  const isPixPending = pixImage && (purchaseResult?.payment_status === 'pending' || purchaseResult?.payment_status === 'in_process');

  const copyPixToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código Pix copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // --- POLLING AUTOMÁTICO ---
  // Verifica o status a cada 5 segundos se estiver pendente
  useEffect(() => {
    let intervalId;

    if (isPixPending && checkPaymentStatus) {
      // Cria o intervalo
      intervalId = setInterval(() => {
        console.log("🔄 Verificando status do pagamento...");
        checkPaymentStatus();
      }, 5000);
    }

    // Limpa o intervalo ao desmontar ou quando o status mudar
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPixPending, checkPaymentStatus]);


  // ==============================================================================
  // RENDERIZAÇÃO 1: TELA DE PAGAMENTO PIX (Se for pendente)
  // ==============================================================================
  if (isPixPending) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in text-center shadow-sm">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiClock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalize seu pagamento</h2>
          <p className="text-gray-600 mb-6">
            Escaneie o QR Code abaixo no app do seu banco para garantir seus ingressos.
          </p>

          {/* Imagem do QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6 relative">
            <img 
               src={`data:image/jpeg;base64,${pixImage}`} 
               alt="QR Code Pix" 
               className="w-64 h-64 object-contain mx-auto"
            />
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-gray-400 font-medium">
                QR Code Seguro
            </div>
          </div>

          {/* Copia e Cola */}
          <div className="max-w-md mx-auto text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pix Copia e Cola
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={pixCode} 
                className="flex-1 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={copyPixToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-white shadow-sm ${
                  copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé de Status */}
        <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium">
               <FiLoader className="animate-spin" />
               Aguardando confirmação do banco...
            </div>
            
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Esta tela será atualizada automaticamente assim que o pagamento for aprovado.
            </p>

            <button
              onClick={checkPaymentStatus}
              className="mt-2 text-gray-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" />
              Verificar manualmente agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDERIZAÇÃO 2: TELA DE SUCESSO / SEED PHRASE (Aprovado)
  // ==============================================================================
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in shadow-sm">
      {/* Header Simplificado */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isFree ? 'Ingressos Confirmados' : 'Pagamento Aprovado!'}
        </h2>
        <p className="text-gray-600">
          Os ingressos foram enviados para <strong className="text-gray-900">{formData['field-2']}</strong>
        </p>
      </div>

      {/* Resumo do Pedido */}
      <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-green-500"/> Resumo do Pedido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide font-semibold mb-1">Evento</span>
            <p className="font-medium text-gray-900 text-base">{eventData?.name || 'Nome do Evento'}</p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide font-semibold mb-1">Data</span>
            <p className="font-medium text-gray-900">
              {eventData?.dateTime?.start ? new Date(eventData.dateTime.start).toLocaleString('pt-BR') : 'Data não definida'}
            </p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide font-semibold mb-1">Local</span>
            <p className="font-medium text-gray-900">{eventData?.location?.venueName || 'Local não definido'}</p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide font-semibold mb-1">Ingressos</span>
            <p className="font-medium text-gray-900">
              {ticketQuantity} x {ticketType}
            </p>
          </div>
          {!isFree && (
            <div className="md:col-span-2 border-t border-gray-200 pt-3 mt-1">
              <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Valor Total Pago:</span>
                  <p className="font-bold text-lg text-green-600">R$ {totalAmount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carteira Digital - Exibe apenas se houver seedPhrase (Usuário novo/Google) */}
      {purchaseResult.seedPhrase && (
        <div className="border border-amber-200 rounded-xl p-6 mb-6 bg-amber-50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white text-sm">🔐</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Carteira Digital Ticketfy Criada!</h3>
              <p className="text-sm text-amber-800">Esta é sua carteira segura na Blockchain</p>
            </div>
          </div>

          {/* Alerta de Segurança */}
          <div className="bg-white border border-red-100 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-start">
              <span className="text-red-500 text-lg mr-2 mt-0.5">⚠️</span>
              <div className="text-sm text-gray-700">
                <p className="font-bold text-red-600 mb-1">Guarde sua Frase Secreta (12 palavras)!</p>
                <p className="mb-1">Esta é a <strong>única forma</strong> de recuperar seus ingressos se você perder o acesso.</p>
                <p className="text-xs text-gray-500">A Ticketfy não armazena essa frase. Guarde em local seguro (ex: cofre ou gerenciador de senhas).</p>
              </div>
            </div>
          </div>

          {/* Seed Phrase Display */}
          <div className="mb-4 relative group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Sua Frase Secreta
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-4 bg-white border border-amber-200 rounded-lg shadow-inner">
              {purchaseResult.seedPhrase.split(' ').map((word, index) => (
                <div key={index} className="flex items-center text-sm bg-gray-50 px-2 py-1 rounded">
                  <span className="text-gray-400 w-4 text-[10px] mr-1 select-none">{index + 1}.</span>
                  <span className="font-mono font-medium text-gray-800">{word}</span>
                </div>
              ))}
            </div>
            
            {/* Overlay de proteção visual (opcional, remove se quiser sempre visível) */}
            {/* <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-dashed border-gray-300">
                <span className="text-sm font-medium text-gray-600">Copie abaixo para salvar</span>
            </div> */}
          </div>

          {/* Botões de Ação para Seed Phrase */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(purchaseResult.seedPhrase);
                toast.success('Frase copiada! Cole em local seguro.');
              }}
              className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
            >
              <FiCopy className="w-4 h-4 mr-2" />
              Copiar Frase
            </button>
            <button 
              onClick={downloadSeedPhrase}
              className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Baixar (.txt)
            </button>
          </div>

          {/* Endereço da Carteira */}
          <div className="mb-4 pt-4 border-t border-amber-200/50">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Endereço Público
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2.5 bg-amber-100/50 border border-amber-200 rounded text-xs text-amber-900 break-all font-mono">
                {purchaseResult.walletAddress}
              </code>
              <button 
                onClick={() => {
                    navigator.clipboard.writeText(purchaseResult.walletAddress);
                    toast.success('Endereço copiado!');
                }}
                className="p-2.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition-colors"
                title="Copiar endereço"
              >
                <FiCopy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Checkbox de Confirmação */}
          <div className="flex items-start space-x-3 p-3 bg-white border border-amber-200 rounded-lg">
            <input
              type="checkbox"
              id="seedPhraseConfirmed"
              checked={isSeedPhraseConfirmed}
              onChange={(e) => setIsSeedPhraseConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="seedPhraseConfirmed" className="text-sm text-gray-600 cursor-pointer select-none">
              Confirmo que <strong>salvei minha frase secreta</strong> em local seguro. Entendo que a Ticketfy não pode recuperar minha conta se eu a perder.
            </label>
          </div>
        </div>
      )}

      {/* Detalhes Técnicos (Ocultos por Padrão) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button 
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          <span>Detalhes da Transação (Blockchain)</span>
          {showTechnicalDetails ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 space-y-4 bg-white animate-fade-in border-t border-gray-200">
            {purchaseResult.mintAddress && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Endereço do NFT (Mint)
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-600 break-all">
                  {purchaseResult.mintAddress}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(purchaseResult.mintAddress)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
            </div>
            )}
            
            {purchaseResult.signature && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Hash da Transação
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-600 break-all">
                  {purchaseResult.signature}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(purchaseResult.signature)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <a 
                href={`https://solscan.io/tx/${purchaseResult.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Ver no Solscan (Explorer)
                <FiExternalLink className="ml-1 w-3 h-3" />
              </a>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Próximos Passos */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-4">Próximos Passos</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-blue-700 font-bold text-xs mt-0.5">1</div>
            <p>Um e-mail de confirmação foi enviado para você.</p>
          </div>
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-blue-700 font-bold text-xs mt-0.5">2</div>
            <p>Acesse a aba <strong>"Meus Ingressos"</strong> no menu para visualizar seus tickets.</p>
          </div>
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-blue-700 font-bold text-xs mt-0.5">3</div>
            <div className="flex flex-wrap items-center gap-2">
              <span>Salve a data!</span>
              <button 
                onClick={handleAddToCalendar}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors text-xs font-medium"
              >
                <FiCalendar className="w-3 h-3 mr-1" />
                Adicionar ao Google Agenda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Final */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => navigate('/my-tickets')}
          // Se tiver seed phrase, obriga a marcar o checkbox para sair
          disabled={purchaseResult.seedPhrase && !isSeedPhraseConfirmed}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Ver Meus Ingressos
          <FiExternalLink className="w-4 h-4" />
        </button>
        
        <button
          onClick={downloadTicketInfo}
          disabled={isDownloadingPdf}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloadingPdf ? (
            <>
              <FiLoader className="w-5 h-5 mr-2 animate-spin text-blue-600" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FiDownload className="w-5 h-5 mr-2" />
              Baixar Ingresso (PDF)
            </>
          )}
        </button>

        <button
          onClick={() => navigate(`/event/${eventAddress}`)}
          className="md:w-auto text-gray-500 hover:text-gray-900 font-medium py-3.5 px-6 rounded-xl transition-colors hover:bg-gray-100"
        >
          Voltar ao Evento
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;