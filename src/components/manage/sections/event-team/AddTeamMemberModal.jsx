// components/AddTeamMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  WalletIcon, 
  ShieldCheckIcon, 
  UserPlusIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { RoleSelector } from './RoleSelector';
import toast from 'react-hot-toast';

export const AddTeamMemberModal = ({ isOpen, onClose, onAdd }) => {
  // Estados separados para o método de entrada e o valor
  const [addMethod, setAddMethod] = useState(null); // 'wallet' | 'email' | null
  const [inputValue, setInputValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('checkin');
  const [isLoading, setIsLoading] = useState(false);

  // Resetar estados quando o modal fecha ou abre
  useEffect(() => {
    if (isOpen) {
      setAddMethod(null);
      setInputValue('');
      setSelectedRole('checkin');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      return toast.error(
        addMethod === 'wallet' 
          ? "O endereço da carteira é obrigatório." 
          : "O e-mail é obrigatório."
      );
    }

    // Validação simples de email se necessário
    if (addMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      return toast.error("Por favor, insira um e-mail válido.");
    }

    setIsLoading(true);
    try {
      // Passamos o tipo também, caso seu backend precise saber se é email ou wallet
      await onAdd({ type: addMethod, value: inputValue, role: selectedRole });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar membro.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <ModalHeader onClose={onClose} />
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Seleção de Método */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Como deseja adicionar este membro?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <MethodCard 
                icon={WalletIcon}
                label="Carteira"
                description="Endereço Solana"
                isSelected={addMethod === 'wallet'}
                onClick={() => {
                  setAddMethod('wallet');
                  setInputValue(''); // Limpa input ao trocar
                }}
              />
              <MethodCard 
                icon={EnvelopeIcon}
                label="E-mail"
                description="Convite via email"
                isSelected={addMethod === 'email'}
                onClick={() => {
                  setAddMethod('email');
                  setInputValue('');
                }}
              />
            </div>
          </div>

          {/* Área de Input - Renderização Condicional com Animação */}
          <div className={`space-y-6 transition-all duration-300 ease-in-out ${addMethod ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
            
            {addMethod && (
              <DynamicInput 
                method={addMethod}
                value={inputValue}
                onChange={setInputValue}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                  Nível de Permissão
                </div>
              </label>
              <RoleSelector
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />
            </div>
          </div>

          <ModalActions 
            onClose={onClose} 
            isLoading={isLoading} 
            isDisabled={!addMethod || !inputValue} 
          />
        </form>
      </div>
    </div>
  );
};

// --- Subcomponents para Limpeza do Código ---

const ModalHeader = ({ onClose }) => (
  <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
    <div>
      <h3 className="text-xl font-bold text-slate-900">Adicionar à Equipe</h3>
      <p className="text-sm text-slate-500 mt-1">
        Gerencie quem tem acesso ao seu evento
      </p>
    </div>
    <button 
      onClick={onClose}
      className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  </div>
);

const MethodCard = ({ icon: Icon, label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-2
      ${isSelected 
        ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-200' 
        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
      }
    `}
  >
    <div className={`p-2 rounded-lg w-fit ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
        {label}
      </div>
      <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
        {description}
      </div>
    </div>
    
    {/* Indicador de Check no canto */}
    {isSelected && (
      <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
    )}
  </button>
);

const DynamicInput = ({ method, value, onChange }) => {
  const isWallet = method === 'wallet';
  
  return (
    <div className="animate-fadeIn">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {isWallet ? 'Endereço da Carteira' : 'Endereço de E-mail'}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isWallet ? (
            <WalletIcon className="h-5 w-5 text-slate-400" />
          ) : (
            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <input
          type={isWallet ? "text" : "email"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isWallet ? "Digite o endereço Solana..." : "exemplo@email.com"}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          autoFocus
        />
      </div>
      <p className="text-xs text-slate-500 mt-2 ml-1">
        {isWallet 
          ? "O usuário precisará acessar a conta desta carteira." 
          : "Enviaremos um link de convite para este e-mail."}
      </p>
    </div>
  );
};

const ModalActions = ({ onClose, isLoading, isDisabled }) => (
  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-auto">
    <button 
      type="button" 
      onClick={onClose}
      className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
    >
      Cancelar
    </button>
    <button 
      type="submit" 
      disabled={isLoading || isDisabled}
      className={`
        px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 shadow-sm
        ${isDisabled 
          ? 'bg-slate-300 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
        }
      `}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Adicionando...</span>
        </>
      ) : (
        <>
          <UserPlusIcon className="h-4 w-4" />
          <span>Confirmar</span>
        </>
      )}
    </button>
  </div>
);