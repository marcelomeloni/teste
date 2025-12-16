import React from 'react';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';

const formatEventDates = (start, end) => {
  if (!start) return 'Data a ser definida';
  
  const startDate = new Date(start);
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  let dateString = startDate.toLocaleString('pt-BR', options);

  if (end) {
    const endDate = new Date(end);
    // Adiciona data final se for diferente
    // (Lógica de formatação mais complexa pode ser necessária)
  }
  
  return dateString;
};

// Função para verificar se há algum tier dentro do período de venda
const isEventInSalePeriod = (ticketing) => {
  if (!ticketing || !ticketing.tiers || ticketing.tiers.length === 0) {
    return false;
  }

  const now = new Date();
  
  // Verifica se existe pelo menos um tier que está dentro do período de venda
  return ticketing.tiers.some(tier => {
    const saleStart = new Date(tier.saleWindow.start);
    const saleEnd = new Date(tier.saleWindow.end);
    return now >= saleStart && now <= saleEnd && tier.quantity > 0;
  });
};

// Função para obter a mensagem de status das vendas
const getSaleStatusMessage = (ticketing) => {
  if (!ticketing || !ticketing.tiers || ticketing.tiers.length === 0) {
    return { message: 'Ingressos não disponíveis', type: 'error' };
  }

  const now = new Date();
  const availableTiers = ticketing.tiers.filter(tier => tier.quantity > 0);

  if (availableTiers.length === 0) {
    return { message: 'Ingressos esgotados', type: 'error' };
  }

  // Verificar se todas as vendas já terminaram
  const allSalesEnded = availableTiers.every(tier => {
    const saleEnd = new Date(tier.saleWindow.end);
    return now > saleEnd;
  });

  if (allSalesEnded) {
    return { message: 'Vendas encerradas', type: 'error' };
  }

  // Verificar se as vendas ainda não começaram
  const allSalesNotStarted = availableTiers.every(tier => {
    const saleStart = new Date(tier.saleWindow.start);
    return now < saleStart;
  });

  if (allSalesNotStarted) {
    const nextStart = availableTiers.reduce((earliest, tier) => {
      const saleStart = new Date(tier.saleWindow.start);
      return earliest < saleStart ? earliest : saleStart;
    }, new Date(availableTiers[0].saleWindow.start));

    return { 
      message: `Vendas iniciam ${formatDate(nextStart)}`, 
      type: 'info' 
    };
  }

  // Vendas estão ativas para pelo menos um tier
  return { message: 'Comprar Ingressos', type: 'success' };
};

// Helper para formatar data simplificada
const formatDate = (date) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(date).toLocaleString('pt-BR', options);
};

const EventHeader = ({ event, onOpenTicketModal }) => {
  const { name, dateTime, location, ticketing } = event;

  const isInSalePeriod = isEventInSalePeriod(ticketing);
  const saleStatus = getSaleStatusMessage(ticketing);

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        {/* Coluna da Esquerda: Detalhes */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {name || 'Nome do Evento'}
          </h1>
          
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center">
              <FiCalendar className="w-5 h-5 mr-2 text-gray-500" />
              <span>{formatEventDates(dateTime?.start, dateTime?.end)}</span>
            </div>
            <div className="flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-gray-500" />
              <span>{location?.venueName || 'Local a ser definido'}</span>
            </div>
            
         
          </div>
        </div>

        {/* Coluna da Direita: Botão */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <button 
            onClick={onOpenTicketModal}
            disabled={!isInSalePeriod}
            className={`w-full md:w-auto font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ${
              isInSalePeriod
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saleStatus.type === 'success' ? 'Comprar Ingressos' : saleStatus.message}
          </button>
          
          {/* Mensagem adicional para vendas futuras */}
          {saleStatus.type === 'info' && (
            <p className="text-xs text-gray-500 mt-2 text-center md:text-left">
              Aguarde a data de início das vendas
            </p>
          )}
          
    
        </div>
      </div>
    </div>
  );
};

export default EventHeader;