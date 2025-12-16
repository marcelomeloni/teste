import React, { useState } from 'react';
import { 
  FiCheck, 
  FiCopy, 
  FiDownload, 
  FiExternalLink, 
  FiChevronUp, 
  FiChevronDown,
  FiCalendar,
  FiLoader,
  FiClock, // Ícone para pendente
  FiCheckCircle
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
  eventAddress
}) => {
  const [copied, setCopied] = useState(false);

  // --- LÓGICA DO PIX ---
  const pixImage = purchaseResult?.qr_code_base64;
  const pixCode = purchaseResult?.qr_code;
  // Se tiver imagem de QR Code e o status NÃO for approved/paid, é Pix Pendente
  const isPixPending = pixImage && purchaseResult?.payment_status === 'pending';

  const copyPixToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código Pix copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // ==============================================================================
  // RENDERIZAÇÃO 1: TELA DE PAGAMENTO PIX (Se for pendente)
  // ==============================================================================
  if (isPixPending) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalize seu pagamento</h2>
          <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo para garantir seus ingressos.</p>

          {/* Imagem do QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6">
            <img 
               src={`data:image/jpeg;base64,${pixImage}`} 
               alt="QR Code Pix" 
               className="w-64 h-64 object-contain mx-auto"
            />
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
                className="flex-1 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={copyPixToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-white ${
                  copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Após o pagamento, você receberá a confirmação por e-mail em instantes.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()} // Simples refresh para verificar se pagou
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm underline"
        >
          Já paguei? Clique para atualizar
        </button>
      </div>
    );
  }

  // ==============================================================================
  // RENDERIZAÇÃO 2: TELA DE SUCESSO / SEED PHRASE (Seu código original)
  // ==============================================================================
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in">
      {/* Header Simplificado */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isFree ? 'Ingressos Confirmados' : 'Pagamento Aprovado'}
        </h2>
        <p className="text-gray-600">
          Os ingressos foram enviados para <strong className="text-gray-900">{formData['field-2']}</strong>
        </p>
      </div>

      {/* Resumo do Pedido */}
      <div className="border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Evento:</span>
            <p className="font-medium text-gray-900">{eventData?.name || 'Nome do Evento'}</p>
          </div>
          <div>
            <span className="text-gray-600">Data e Hora:</span>
            <p className="font-medium text-gray-900">
              {eventData?.dateTime?.start ? new Date(eventData.dateTime.start).toLocaleString('pt-BR') : 'Data não definida'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Local:</span>
            <p className="font-medium text-gray-900">{eventData?.location?.venueName || 'Local não definido'}</p>
          </div>
          <div>
            <span className="text-gray-600">Ingressos:</span>
            <p className="font-medium text-gray-900">
              {ticketQuantity} x {ticketType}
            </p>
          </div>
          {!isFree && (
            <div className="md:col-span-2">
              <span className="text-gray-600">Valor Total:</span>
              <p className="font-medium text-gray-900">R$ {totalAmount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Carteira Digital - Versão Segura */}
      {purchaseResult.seedPhrase && (
        <div className="border border-yellow-200 rounded-xl p-6 mb-6 bg-yellow-50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">🔐</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Carteira Digital Ticketfy Criada!</h3>
              <p className="text-sm text-gray-600">Sua carteira segura para guardar ingressos</p>
            </div>
          </div>

          {/* Alerta de Segurança */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-red-600 text-lg mr-2">⚠️</span>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Guarde sua Frase Secreta de Recuperação (12 palavras)!</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Esta é a única forma de acessar seus ingressos e sua carteira no futuro</li>
                  <li>A Ticketfy não armazena esta frase e não pode recuperá-la para você</li>
                  <li>Anote as palavras na ordem correta e guarde em local offline e seguro</li>
                  <li>NUNCA compartilhe esta frase com ninguém</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seed Phrase */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frase Secreta de Recuperação (12 palavras)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              {purchaseResult.seedPhrase.split(' ').map((word, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="text-gray-500 w-4 text-xs mr-1">{index + 1}.</span>
                  <span className="font-medium text-gray-900">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação para Seed Phrase */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(purchaseResult.seedPhrase);
                alert('Frase copiada! Cole em um gerenciador de senhas ou local seguro offline.');
              }}
              className="flex items-center justify-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiCopy className="w-4 h-4 mr-2" />
              Copiar Frase Secreta
            </button>
            <button 
              onClick={downloadSeedPhrase}
              className="flex items-center justify-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Baixar Arquivo Seguro (.txt)
            </button>
          </div>

          {/* Endereço da Carteira */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço da sua Nova Carteira
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-900 break-all">
                {purchaseResult.walletAddress}
              </code>
              <button 
                onClick={() => navigator.clipboard.writeText(purchaseResult.walletAddress)}
                className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 border border-gray-300 rounded hover:bg-gray-50"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Checkbox de Confirmação */}
          <div className="flex items-start space-x-3 p-4 bg-white border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              id="seedPhraseConfirmed"
              checked={isSeedPhraseConfirmed}
              onChange={(e) => setIsSeedPhraseConfirmed(e.target.checked)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="seedPhraseConfirmed" className="text-sm text-gray-700">
              Eu anotei e guardei minha frase secreta em local seguro e entendo que sou o único responsável por sua guarda. 
              Compreendo que se perder estas palavras, perderei acesso permanente aos meus ingressos.
            </label>
          </div>
        </div>
      )}

      {/* Detalhes Técnicos (Ocultos por Padrão) */}
      <div className="border border-gray-200 rounded-xl p-6 mb-6">
        <button 
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
        >
          {showTechnicalDetails ? 'Ocultar' : 'Ver'} detalhes técnicos
          {showTechnicalDetails ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
        </button>

        {showTechnicalDetails && (
          <div className="space-y-4 animate-fade-in">
            {purchaseResult.mintAddress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço do NFT
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded font-mono text-xs text-gray-900 break-all">
                  {purchaseResult.mintAddress}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(purchaseResult.mintAddress)}
                  className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Copiar
                </button>
              </div>
            </div>
            )}
            
            {purchaseResult.signature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hash da Transação
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded font-mono text-xs text-gray-900 break-all">
                  {purchaseResult.signature}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(purchaseResult.signature)}
                  className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Copiar
                </button>
              </div>
            </div>
            )}
            
            {purchaseResult.signature && (
            <div>
              <a 
                href={`https://solscan.io/tx/${purchaseResult.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Ver transação no explorador da blockchain
                <FiExternalLink className="ml-1 w-4 h-4" />
              </a>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Próximos Passos */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Próximos Passos</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">1</span>
            </div>
            <p>Verifique seu email para confirmar os detalhes dos ingressos</p>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">2</span>
            </div>
            <p>Acesse "Meus Ingressos" para visualizar seus NFTs</p>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">3</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Adicione o evento ao seu calendário</span>
              <button 
                onClick={handleAddToCalendar}
                className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                <FiCalendar className="w-4 h-4 mr-1" />
                Adicionar ao Calendário
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/my-tickets')}
          disabled={purchaseResult.seedPhrase && !isSeedPhraseConfirmed}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Ver Meus Ingressos
        </button>
        <button
          onClick={() => navigate(`/event/${eventAddress}`)}
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Voltar ao Evento
        </button>
        <button
          onClick={downloadTicketInfo}
          disabled={isDownloadingPdf}
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloadingPdf ? (
            <>
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FiDownload className="w-4 h-4 mr-2" />
              Baixar Ingresso
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;