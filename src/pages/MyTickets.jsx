import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '@solana/wallet-adapter-react';
import { Program, web3, BN, AnchorProvider } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

import { useAppWallet } from '@/hooks/useAppWallet';
import { useAuth } from '@/contexts/AuthContext';
import idl from '@/idl/ticketing_system.json';
import { PROGRAM_ID } from '@/lib/constants';
import { useTickets } from '@/hooks/useTickets';

// Importar componentes individuais
import { UnauthenticatedState } from './tickets/UnauthenticatedState';
import { LoadingSpinner } from './tickets/LoadingSpinner';
import { TicketCard } from './tickets/TicketCard';
import { SellModal } from './tickets/SellModal';

export function MyTickets() {
  const { connection } = useConnection();
  const wallet = useAppWallet();
  const auth = useAuth();
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const {
    tickets,
    isLoading,
    isSubmitting,
    fetchAllData,
    handleListForSale,
    handleCancelListing,
    handleClaimRefund,
    getUserWallet,
    isUserAuthenticated,
    handleConnectWallet,
    handleLogin
  } = useTickets();

  const program = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) {
      console.log('⚠️ Wallet não conectada para operações blockchain');
      return null;
    }

    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };
    
    const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
    return new Program(idl, PROGRAM_ID, provider);
  }, [connection, wallet, auth.isAuthenticated]);

  const openSellModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsSellModalOpen(true);
  };

  const closeSellModal = () => {
    setSelectedTicket(null);
    setIsSellModalOpen(false);
  };

  const onListForSale = async (priceInSol) => {
    await handleListForSale(selectedTicket, priceInSol, program, wallet);
    closeSellModal();
    setTimeout(() => { fetchAllData() }, 2500);
  };

  const onCancelListing = async (ticket) => {
    await handleCancelListing(ticket, program, wallet);
    setTimeout(() => { fetchAllData() }, 2500);
  };

  const onClaimRefund = async (ticket) => {
    await handleClaimRefund(ticket, program, wallet);
    setTimeout(() => { fetchAllData() }, 2500);
  };

  const now = new Date();
  
  const upcomingTickets = tickets.filter(ticket => {
    const startDate = ticket?.event?.metadata?.properties?.dateTime?.start;
    if (!startDate) return false;
    const eventDate = new Date(startDate);
    return eventDate > now;
  });
  
  const pastTickets = tickets.filter(ticket => {
    const startDate = ticket?.event?.metadata?.properties?.dateTime?.start;
    if (!startDate) return false;
    const eventDate = new Date(startDate);
    return eventDate <= now;
  });

  const displayedTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    
    if (!isUserAuthenticated()) {
      return <UnauthenticatedState 
        onConnectWallet={handleConnectWallet} 
        onLogin={handleLogin} 
      />;
    }
    
    if (tickets.length === 0) return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ingresso encontrado</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Você ainda não possui ingressos. Explore os eventos disponíveis e adquira seu primeiro ingresso!
        </p>
        <Link to="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700">
          Explorar Eventos
        </Link>
      </div>
    );

    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Ingressos</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os seus ingressos em um só lugar
              </p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-4 px-1 text-center font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Próximos Eventos
            {upcomingTickets.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                {upcomingTickets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-4 px-1 text-center font-medium text-sm ${
              activeTab === 'collection'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Minha Coleção
            {pastTickets.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {pastTickets.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedTickets.map(ticket => (
            <TicketCard 
              key={ticket.publicKey} 
              ticket={ticket}
              isSubmitting={isSubmitting}
              onSellClick={() => openSellModal(ticket)}
              onCancelClick={() => onCancelListing(ticket)}
              onRefundClick={() => onClaimRefund(ticket)}
              isCollection={activeTab === 'collection'}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
          {isSellModalOpen && (
            <SellModal 
              isOpen={isSellModalOpen}
              onClose={closeSellModal}
              onSubmit={onListForSale}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}