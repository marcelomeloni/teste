import React from 'react';

// Texto padrão da política de cancelamento
const staticPolicyText = `O cancelamento para pedidos que contém ingressos pagos serão aceitos até 7 dias após a data da compra, considerando ainda que a solicitação seja submetida em até 48 horas antes do início do evento, ou seja, ambas as condições deverão ser conjuntamente observadas. O reembolso sempre será integral quando cancelado pela plataforma, não sendo possível o reembolso de itens unitários em pedidos de compra com mais de um item.`;

const EventDescription = ({ description }) => {
  
  // Função para formatar o texto cru vindo da API
  const formatDescription = (text) => {
    if (!text) return <p className="text-gray-500 italic">Nenhuma descrição fornecida.</p>;

    // 1. Divide o texto onde houver quebras de linha (\n)
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();

      // Se a linha for vazia, renderiza um espaçamento invisível
      if (!trimmedLine) {
        return <div key={index} className="h-4" />;
      }

      // 2. Lógica opcional para detectar Títulos ou Listas baseado em emojis
      // Se a linha começar com emojis comuns de tópicos, podemos dar um destaque
      const isTopic = /^[📅📍⏰🎤⭐✨🎪🎟️🚀🔥]/.test(trimmedLine);
      
      // Se a linha for muito curta e toda maiúscula (ex: "PALCO MUNDO"), pode ser um subtítulo
      const isHeader = trimmedLine.length < 50 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3;

      if (isHeader) {
         return (
            <h3 key={index} className="font-bold text-gray-900 mt-4 mb-2">
               {trimmedLine}
            </h3>
         );
      }

      return (
        <p 
          key={index} 
          className={`text-gray-700 leading-relaxed ${isTopic ? 'font-medium text-gray-900 mt-2' : 'mb-2'}`}
        >
          {trimmedLine}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8 bg-white rounded-2xl p-1"> {/* Adicionei bg-white se quiser um container */}
      
      {/* Seção Descrição Geral */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide border-l-4 border-green-500 pl-3">
            Descrição Geral
            </h2>
        </div>
        
        <div className="prose max-w-none">
          {formatDescription(description)}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Seção Política do Evento */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-gray-300 pl-3">
            Política do evento
            </h2>
        </div>
        
        <div className="prose max-w-none text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p>{staticPolicyText}</p>
          <div className="mt-3">
            <a href="#" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
               Ler termos completos de uso →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDescription;