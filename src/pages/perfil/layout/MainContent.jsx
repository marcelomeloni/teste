import React from 'react';
import InformacoesPessoais from '../sections/InformacoesPessoais';
import GerenciarConexao from '../sections/TrocarSenha';
import ConfiguracoesGerais from '../sections/ConfiguracoesGerais';
import IntegracoesAPIs from '../sections/IntegracoesAPIs';
import ApagarConta from '../sections/ApagarConta';

function MainContent({ activeSection }) {
  const renderSection = () => {
    switch (activeSection) {
      case 'pessoais':
        return <InformacoesPessoais />;
      case 'senha':
        return <GerenciarConexao />;
      case 'eventos':
        return <ConfiguracoesGerais />;
      case 'apis':
        return <IntegracoesAPIs />;
      case 'apagar':
        return <ApagarConta />;
      default:
        return <InformacoesPessoais />;
    }
  };

  return (
    <main className="flex-grow p-10 m-8 bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[calc(100vh-64px)]"> {/* Estilo aprimorado para o conteúdo principal */}
      {/* Adicione um título dinâmico para a seção ativa */}
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4 border-gray-200">
        {
          activeSection === 'pessoais' ? 'Informações Pessoais' :
          activeSection === 'senha' ? 'Gerenciar Conexão' :
          activeSection === 'eventos' ? 'Configurações de Eventos' :
          activeSection === 'apis' ? 'Integrações e APIs' :
          activeSection === 'apagar' ? 'Apagar Conta' :
          'Configurações'
        }
      </h2>
      <div className="animate-fade-in"> {/* Adiciona uma pequena animação de fade ao trocar de seção */}
        {renderSection()}
      </div>
    </main>
  );
}

export default MainContent;