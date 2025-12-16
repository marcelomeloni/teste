import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TicketModal } from './modal/TicketModal';
import { useEventForm } from '@/contexts/EventFormContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/constants';

// Ícones para a UI
const Icons = {
  free: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>,
  paid: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
  edit: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  delete: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  ticket: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
};

// Componente Switch para a UI de "Permitir Revenda"
function Switch({ checked, onChange, name }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        name={name} 
        checked={checked} 
        onChange={onChange} 
        className="sr-only peer" 
      />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      <span className="ml-3 text-sm font-medium text-slate-700">Permitir revenda</span>
    </label>
  );
}

export function TicketsSection() {
  const { formData, setFormData, handleFormDataChange } = useEventForm();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('paid');
  const [editingTicket, setEditingTicket] = useState(null);
  
  // Estados para a taxa do usuário
  const [userPlatformFee, setUserPlatformFee] = useState(1000); // 1000 bps = 10% padrão
  const [loadingFee, setLoadingFee] = useState(false);

  // Buscar a taxa do usuário uma vez ao montar o componente
  useEffect(() => {
    const fetchUserPlatformFee = async () => {
      if (!user?.wallet_address && !user?.email && !user?.id) return;
      
      setLoadingFee(true);
      try {
        let identifier;
        if (user.wallet_address) {
          identifier = user.wallet_address;
        } else if (user.email) {
          identifier = `email:${user.email}`;
        } else if (user.id) {
          identifier = `supabase:${user.id}`;
        } else {
          return;
        }

        const response = await fetch(
          `${API_URL}/api/manage/whitelist/check?identifier=${encodeURIComponent(identifier)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.platformFeeBps && data.isWhitelisted) {
            setUserPlatformFee(data.platformFeeBps);
            console.log('✅ Taxa do usuário encontrada:', data.platformFeeBps, 'bps');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar taxa da plataforma:', error);
      } finally {
        setLoadingFee(false);
      }
    };

    fetchUserPlatformFee();
  }, [user?.wallet_address, user?.email, user?.id]);

  const openModal = useCallback((type, ticket = null) => {
    console.log('Abrindo modal, tickets existentes:', formData.tickets);
    setModalType(type);
    setEditingTicket(ticket);
    setIsModalOpen(true);
  }, [formData.tickets]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTicket(null);
  }, []);

  const handleTicketCreated = useCallback((ticketData) => {
    setFormData(prev => {
      const isEditing = !!editingTicket;
      if (isEditing) {
        return { 
          ...prev, 
          tickets: prev.tickets.map(t => 
            t.id === editingTicket.id ? { ...ticketData, id: editingTicket.id } : t
          ) 
        };
      } else {
        const newTicket = { ...ticketData, id: Date.now().toString() };
        return { 
          ...prev, 
          tickets: [...(prev.tickets || []), newTicket] 
        };
      }
    });
  }, [setFormData, editingTicket]);

  const handleDeleteTicket = useCallback((ticketId) => {
    setFormData(prev => ({ 
      ...prev, 
      tickets: (prev.tickets || []).filter(t => t.id !== ticketId) 
    }));
  }, [setFormData]);

  const handleFeeChange = (e) => {
    const percentage = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ 
      ...prev, 
      transferFeeBps: Math.round(percentage * 100) 
    }));
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value || 0);

  // Para exibir o sumário dos ingressos (exemplo, você pode ajustar)
  const calculateTotals = () => {
    const tickets = formData.tickets || [];
    const totalQuantity = tickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
    const totalRevenue = tickets.reduce((sum, ticket) => {
      if (ticket.type === 'paid') {
        return sum + ((ticket.price || 0) * (ticket.quantity || 0));
      }
      return sum;
    }, 0);
    
    const paidTickets = tickets.filter(t => t.type === 'paid');
    const freeTickets = tickets.filter(t => t.type === 'free');
    
    return {
      totalQuantity,
      totalRevenue,
      paidCount: paidTickets.length,
      freeCount: freeTickets.length,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-semibold">
          3
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Ingressos e Regras de Venda</h2>
      </div>

      <div className="border-t border-b border-slate-200 my-8 py-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Regras de Venda e Transferência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <div>
            <label htmlFor="transferFeeBps" className="block text-sm font-medium text-slate-700 mb-1">
              Taxa de Revenda (%)
            </label>
            <input 
              type="number" 
              id="transferFeeBps" 
              name="transferFeeBps" 
              value={formData.transferFeeBps ? formData.transferFeeBps / 100 : ''} 
              onChange={handleFeeChange} 
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" 
              placeholder="Ex: 5"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label htmlFor="maxTicketsPerWallet" className="block text-sm font-medium text-slate-700 mb-1">
              Máx. por Comprador
            </label>
            <input 
              type="number" 
              id="maxTicketsPerWallet" 
              name="maxTicketsPerWallet" 
              value={formData.maxTicketsPerWallet || ''} 
              onChange={handleFormDataChange} 
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" 
              placeholder="Ex: 10"
              min="1"
            />
          </div>
          <div className="pt-7">
            <Switch 
              checked={formData.resaleAllowed || false} 
              onChange={handleFormDataChange} 
              name="resaleAllowed" 
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Crie os Tipos de Ingresso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {type: 'free', label: 'Ingresso Grátis', desc: 'Oferecer ingressos sem custo.', Icon: Icons.free, color: 'green'}, 
            {type: 'paid', label: 'Ingresso Pago', desc: 'Cobrar um valor pelos ingressos.', Icon: Icons.paid, color: 'indigo'}
          ].map(btn => (
            <button 
              key={btn.type} 
              type="button" 
              onClick={() => openModal(btn.type)} 
              className={`group relative bg-white border-2 border-${btn.color}-200 rounded-xl p-6 hover:border-${btn.color}-400 hover:bg-${btn.color}-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-${btn.color}-500 focus:ring-offset-2`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 bg-${btn.color}-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-${btn.color}-200 transition-colors`}>
                  <btn.Icon className={`w-6 h-6 text-${btn.color}-600`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">{btn.label}</h3>
                <p className="text-slate-600 text-sm">{btn.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {formData.tickets && formData.tickets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="border-t border-slate-200 mt-12 pt-8"
          >
            <h3 className="font-semibold text-slate-900 text-lg mb-4">
              Ingressos Criados ({formData.tickets.length})
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Nome</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Preço</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-semibold">Quantidade</th>
                    <th className="text-right py-3 px-4 text-slate-600 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{ticket.name}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {ticket.type === 'free' ? 
                          <span className="text-green-600 font-semibold">Grátis</span> : 
                          formatCurrency(ticket.price)
                        }
                      </td>
                      <td className="py-3 px-4 text-slate-700">{ticket.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            type="button" 
                            onClick={() => openModal(ticket.type, ticket)} 
                            className="text-slate-400 hover:text-indigo-600 p-2 rounded-md hover:bg-indigo-50" 
                            title="Editar"
                          >
                            <Icons.edit className="w-5 h-5" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteTicket(ticket.id)} 
                            className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50" 
                            title="Excluir"
                          >
                            <Icons.delete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Sumário dos ingressos */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Resumo dos ingressos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">{totals.totalQuantity}</p>
                  <p className="text-sm text-slate-600">Total de ingressos</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">{totals.paidCount}</p>
                  <p className="text-sm text-slate-600">Tipos pagos</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">{totals.freeCount}</p>
                  <p className="text-sm text-slate-600">Tipos gratuitos</p>
                </div>
              </div>
              {totals.totalRevenue > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-center font-semibold text-indigo-800">
                    Receita potencial: {formatCurrency(totals.totalRevenue * 0.95)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {(!formData.tickets || formData.tickets.length === 0) && (
        <div className="text-center py-16 border-t border-slate-200 mt-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.ticket className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum ingresso criado</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Comece adicionando um tipo de ingresso para seu evento.
          </p>
        </div>
      )}

      {isModalOpen && (
        <TicketModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          eventEndDate={formData.endDate} 
          modalType={modalType} 
          editingTicket={editingTicket} 
          onTicketCreated={handleTicketCreated}
          existingTickets={formData.tickets || []}
          userPlatformFee={userPlatformFee}
          loadingFee={loadingFee}
        />
      )}
    </div>
  );
}