import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';

// Helper para formatar preço
const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

// Helper para formatar data
const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString('pt-BR', options);
};

const QuantitySelector = ({ min, max, currentValue, onChange, tier, platformFeeBps = 0 }) => {
  const [inputValue, setInputValue] = useState(currentValue.toString());
  
  // Calcular taxa baseada na platformFeeBps (não transferFeeBps)
  const calculatePlatformFee = (price, quantity) => {
    return (price * quantity * platformFeeBps) / 10000;
  };

  const handleIncrement = () => {
    const newValue = currentValue + 1;
    if (newValue <= max) {
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleDecrement = () => {
    const newValue = currentValue - 1;
    if (newValue >= 0) { // Permite voltar para 0!
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Permite campo vazio temporariamente
    if (value === '') {
      onChange(0);
      return;
    }
    
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= max) {
      onChange(numericValue);
    }
  };

  const handleInputBlur = () => {
    // Se estiver vazio ou inválido, volta para 0
    if (inputValue === '' || isNaN(parseInt(inputValue))) {
      setInputValue('0');
      onChange(0);
    }
  };

  const baseTotal = tier.price * currentValue;
  const platformFee = calculatePlatformFee(tier.price, currentValue);
  const itemTotal = baseTotal + platformFee;

  return (
    <div className="flex flex-col items-end space-y-3">
      {/* Controles de Quantidade */}
      <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl p-2">
        <button
          onClick={handleDecrement}
          disabled={currentValue <= 0}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
            currentValue > 0
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiMinus className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mx-2">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-20 text-center border-2 border-gray-200 bg-white rounded-xl py-3 px-2 text-lg font-bold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          
            </div>
          </div>
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={currentValue >= max}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
            currentValue < max
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Resumo do Valor - Só mostra quando quantidade > 0 */}
    {currentValue > 0 && tier.type === 'paid' && (
  <div className="mt-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm animate-fade-in">
    <div className="space-y-1 text-sm">
      
      {/* Linha do Preço do Ingresso */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{currentValue} ×</span>
        <span className="font-medium text-gray-900">{formatPrice(baseTotal)}</span>
      </div>

      {/* Linha da Taxa (ESPAÇADA COM JUSTIFY-BETWEEN) */}
      {platformFeeBps > 0 && (
        <div className="flex justify-between items-center text-xs">
          {/* Label na esquerda */}
          <span className="text-gray-500">Taxa</span>
          
          {/* Valor na direita com cor laranja */}
          <span className="text-orange-600 font-medium">
            +{formatPrice(platformFee)}
          </span>
        </div>
      )}

      {/* Linha Divisória */}
      <div className="border-t border-gray-100 my-2 pt-1"></div>

      {/* Linha do Total Final */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Total</span>
        <span className="font-bold text-lg text-emerald-600">
          {formatPrice(itemTotal)}
        </span>
      </div>

    </div>
  </div>
)}
    </div>
  );  
};

const TicketSelectionModal = ({
  isOpen,
  onClose,
  eventTiers,
  selectedTickets,
  onTicketQuantityChange,
  totalPrice,
  eventAddress,
  platformFeeBps = 0 // Recebe platformFeeBps como prop
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Calcular o total considerando APENAS platformFeeBps (não transferFeeBps)
  const calculateItemTotal = (tier, quantity) => {
    if (tier.type === 'free') return 0;
    const basePrice = tier.price * quantity;
    // APENAS platformFeeBps é aplicada na primeira venda
    const platformFee = (basePrice * platformFeeBps) / 10000;
    return basePrice + platformFee;
  };

  const handleProceed = () => {
    // Verificar se há ingressos selecionados
    const hasTickets = Object.values(selectedTickets).some(qty => qty > 0);
    
    if (!hasTickets) {
      alert('Selecione pelo menos um ingresso para continuar');
      return;
    }

    // Validar quantidades mínimas
    const invalidTiers = eventTiers.filter(tier => {
      const quantity = selectedTickets[tier.id] || 0;
      return quantity > 0 && quantity < tier.purchasePolicy.minPerPurchase;
    });

    if (invalidTiers.length > 0) {
      const tierNames = invalidTiers.map(t => t.name).join(', ');
      alert(`Quantidade mínima não atingida para: ${tierNames}. Mínimo: ${invalidTiers[0].purchasePolicy.minPerPurchase} ingresso(s) por tipo.`);
      return;
    }

    // Navegar para a página de checkout
    navigate(`/event/${eventAddress}/checkout`, {
      state: {
        selectedTickets,
        totalPrice,
        platformFeeBps // Passar platformFeeBps para o checkout
      }
    });
    
    // Fechar o modal
    onClose();
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Selecione seus ingressos</h2>
            <p className="text-gray-600 mt-1">Escolha a quantidade desejada para cada tipo</p>
       
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group"
          >
            <FiX className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Lista de Tiers */}
        <div className="p-8 space-y-6">
          {eventTiers.map(tier => {
            const quantity = selectedTickets[tier.id] || 0;
            const itemTotal = calculateItemTotal(tier, quantity);
            const isAvailable = tier.quantity > 0;
            const isInSaleWindow = new Date() >= new Date(tier.saleWindow.start) && 
                                 new Date() <= new Date(tier.saleWindow.end);

            // Calcular taxa da plataforma por ingresso
            const platformFeePerTicket = (tier.price * platformFeeBps) / 10000;

            return (
              <div 
                key={tier.id} 
                className={`flex flex-col lg:flex-row gap-6 p-6 border-2 rounded-2xl transition-all duration-300 ${
                  quantity > 0 
                    ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${!isAvailable || !isInSaleWindow ? 'opacity-50' : ''}`}
              >
                {/* Coluna de Informações */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-xl">{tier.name}</h3>
                        {!isAvailable && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            ESGOTADO
                          </span>
                        )}
                        {!isInSaleWindow && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            FORA DO PERÍODO
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {tier.type === 'free' ? 'Grátis' : formatPrice(tier.price)}
                        </p>
                        
                        {tier.type === 'paid' && platformFeeBps > 0 && (
                          <p className="text-sm text-gray-600">
                            + taxa da plataforma: {formatPrice(platformFeePerTicket)}
                          </p>
                        )}
                        
                   
                      </div>
                    </div>
                    
                    {/* Badge de quantidade selecionada */}
                    {quantity > 0 && (
                      <div className="bg-green-500 text-white rounded-full px-3 py-1 text-sm font-medium">
                        {quantity} selecionado{quantity > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Informações adicionais */}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
              
                    <p>Vendas até {formatDate(tier.saleWindow.end)}</p>
             
                  </div>
                </div>

                {/* Seletor de Quantidade */}
                <div className="flex-shrink-0 flex items-center justify-center lg:justify-end">
                  {isAvailable && isInSaleWindow ? (
                    <QuantitySelector
                      min={0} // Permite voltar para 0
                      max={Math.min(tier.purchasePolicy.maxPerPurchase, tier.quantity)}
                      currentValue={quantity}
                      onChange={(value) => onTicketQuantityChange(tier.id, value)}
                      tier={tier}
                      platformFeeBps={platformFeeBps} // Passando platformFeeBps
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-medium">
                        {!isAvailable ? 'Ingressos esgotados' : 'Fora do período de venda'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-b-3xl">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-gray-900">
                Total: <span className="text-green-600">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-gray-600 mt-1">
                {getTotalTickets()} ingresso{getTotalTickets() !== 1 ? 's' : ''} selecionado{getTotalTickets() !== 1 ? 's' : ''}
              </p>
           
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all duration-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleProceed}
                disabled={!Object.values(selectedTickets).some(qty => qty > 0)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center space-x-2">
                  <span>PROSSEGUIR</span>
                  <FiShoppingCart className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSelectionModal;