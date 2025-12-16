import React from 'react';
import { FiShare2 } from 'react-icons/fi';

const EventNavigation = () => {
  // Função para lidar com o compartilhamento
  const handleShare = async () => {
    // Tenta usar a API de compartilhamento nativa do navegador
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title, // Título da página
          url: window.location.href, // URL atual
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam (copia para o clipboard)
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link do evento copiado para a área de transferência!');
      } catch (err) {
        console.error('Falha ao copiar link:', err);
      }
    }
  };

  return (
    // 'sticky top-0' faz a barra grudar no topo ao rolar
    // 'z-20' garante que ela fique acima de outros elementos
    <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Links da Seção */}
        <div className="flex space-x-6 md:space-x-8">
          <a
            href="#descricao"
            className="font-medium text-sm uppercase tracking-wider text-gray-700 hover:text-blue-600 transition-colors"
          >
            Descrição Geral
          </a>
          <a
            href="#localizacao"
            className="font-medium text-sm uppercase tracking-wider text-gray-700 hover:text-blue-600 transition-colors"
          >
            Localização
          </a>
          <a
            href="#organizador"
            className="font-medium text-sm uppercase tracking-wider text-gray-700 hover:text-blue-600 transition-colors"
          >
            Organizador
          </a>
        </div>

        {/* Botão Compartilhar */}
        <button
          onClick={handleShare}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FiShare2 className="w-4 h-4 mr-2" />
          <span className="uppercase tracking-wider">Compartilhar</span>
        </button>
      </nav>
    </div>
  );
};

export default EventNavigation;