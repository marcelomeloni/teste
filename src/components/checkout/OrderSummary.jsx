import React from 'react';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

const OrderSummary = ({ eventData, ticketSummary, totalPrice, platformFeeBps = 0 }) => {
  
  // Função auxiliar para calcular a taxa de um item específico
  const calculateItemFee = (subtotal) => {
    if (!platformFeeBps) return 0;
    return (subtotal * platformFeeBps) / 10000;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
        Resumo do Pedido
      </h3>
      
      {/* Informações do Evento */}
      {eventData && (
        <div className="mb-6">
          <div className="flex items-start space-x-4 mb-4">
            <img
              src={eventData.image}
              alt={eventData.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                {eventData.name}
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  <span>{new Date(eventData.dateTime?.start).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{eventData.location?.venueName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Ingressos */}
      <div className="space-y-4 mb-6">
        {ticketSummary.map(item => {
          // Calcula a taxa específica para este item (se for pago)
          const itemFee = item.type === 'paid' ? calculateItemFee(item.subtotal) : 0;
          
          return (
            <div key={item.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              {/* Linha Principal (Nome e Preço Base) */}
              <div className="flex justify-between items-start text-sm">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {item.quantity}x {item.type === 'free' ? 'Grátis' : `R$ ${(item.subtotal / item.quantity).toFixed(2)}`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-medium text-gray-900">
                    {item.type === 'free' ? 'Grátis' : `R$ ${item.subtotal.toFixed(2)}`}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600 text-sm">Subtotal</span>
          <span className="text-gray-900 font-medium">
             {/* Calculando o subtotal sem taxas para mostrar separado (opcional, mas legal) */}
             R$ {ticketSummary.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)}
          </span>
        </div>
        
        {/* Mostra o total de taxas somadas se houver */}
        {platformFeeBps > 0 && totalPrice > 0 && (
           <div className="flex justify-between items-center mb-3 text-xs text-orange-600">
             <span>Total de taxas</span>
             <span>+ R$ {(totalPrice - ticketSummary.reduce((acc, item) => acc + item.subtotal, 0)).toFixed(2)}</span>
           </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-emerald-600">
            R$ {totalPrice?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;