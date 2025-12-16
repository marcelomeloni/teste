import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Importe os componentes
import EventBanner from '../components/event/EventBanner';
import EventHeader from '../components/event/EventHeader';
import EventNavigation from '../components/event/EventNavigation';
import EventDescription from '../components/event/EventDescription';
import EventLocation from '../components/event/EventLocation';
import EventOrganizer from '../components/event/EventOrganizer';
import TicketSelectionModal from '../components/event/TicketSelectionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { API_URL } from '@/lib/constants';

const EventDetailsPage = () => {
  const { eventAddress } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controle do modal de ingressos
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [platformFeeBps, setPlatformFeeBps] = useState(0); 

  useEffect(() => {
    if (!eventAddress) {
      setError('Endereço do evento não fornecido.');
      setLoading(false);
      return;
    }

    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/events/${eventAddress}/fast`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();
        setEventData(data);
        
        // ✅ ATUALIZADO: Pega a taxa diretamente do JSON do evento
        // Não faz mais a segunda chamada para /whitelist/check
        if (data.platform_fee_bps !== undefined) {
           setPlatformFeeBps(data.platform_fee_bps);
        } else {
           setPlatformFeeBps(0);
        }

      } catch (err) {
        console.error('Erro ao buscar dados do evento:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventAddress]);

  // Funções para controle do modal de ingressos
  const handleOpenTicketModal = () => {
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    // Resetar seleção ao fechar modal
    setSelectedTickets({});
    setTotalPrice(0);
  };

  const handleTicketQuantityChange = (tierId, quantity) => {
    setSelectedTickets(prev => {
      const updated = { ...prev };
      if (quantity === 0) {
        delete updated[tierId];
      } else {
        updated[tierId] = quantity;
      }
      return updated;
    });
  };

  // Calcular preço total considerando APENAS platformFeeBps (não transferFeeBps)
  useEffect(() => {
    if (eventData && eventData.ticketing && eventData.ticketing.tiers) {
      let newTotal = 0;
      eventData.ticketing.tiers.forEach(tier => {
        const quantity = selectedTickets[tier.id] || 0;
        if (tier.type === 'paid') {
          const basePrice = tier.price * quantity;
          // APENAS platformFeeBps é aplicada na primeira venda
          const platformFee = (basePrice * platformFeeBps) / 10000;
          newTotal += basePrice + platformFee;
        }
      });
      setTotalPrice(newTotal);
    }
  }, [selectedTickets, eventData, platformFeeBps]);

  const sections = [
    { id: 'descricao', label: 'Descrição' },
    { id: 'localizacao', label: 'Localização' },
    { id: 'organizador', label: 'Organizador' }
  ];

  return (
    <div className="min-h-screen scroll-smooth">
      {/* --- FUNDO COM BLUR --- */}
      <div className="fixed inset-0 -z-10">
        {eventData && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${eventData.image})`,
                filter: 'blur(16px)',
                transform: 'scale(1.1)'
              }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        )}
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="relative z-10">
        {/* Card Principal */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* Banner com proporção 3/1 */}
            <div className="w-full aspect-[3/1] relative">
              {eventData && (
                <EventBanner
                  imageUrl={eventData.bannerImage}
                  eventName={eventData.name}
                />
              )}
              {loading && !eventData && (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              )}
            </div>
            
            {/* Conteúdo do Card */}
            <div className="relative">
              {loading && ( <div className="p-8"><LoadingSpinner /></div> )}
              {error && ( <div className="p-8"><ErrorDisplay message={error} /></div> )}
              {eventData && (
                <div className="p-8">
                  {/* Passamos a função para abrir o modal para o EventHeader */}
                  <EventHeader event={eventData} onOpenTicketModal={handleOpenTicketModal} />
                  <div className="sticky top-0 bg-white pt-6 pb-4 -mx-8 px-8 border-b border-gray-100 z-20 mt-6">
                    <EventNavigation sections={sections} />
                  </div>
                  <div className="mt-8 space-y-12">
                    <section id="descricao" className="scroll-mt-28">
                        <EventDescription description={eventData.description} policy={eventData.policy}/>
                    </section>
                    <section id="localizacao" className="scroll-mt-28">
                      <EventLocation 
                        location={eventData.location} 
                        properties={eventData.properties} 
                      />
                    </section>
                    <section id="organizador" className="scroll-mt-28">
                    <EventOrganizer organizer={eventData.properties?.organizer} />
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && !eventData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 font-medium">Carregando evento...</p>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Ingressos */}
      {eventData && (
        <TicketSelectionModal
          isOpen={showTicketModal}
          onClose={handleCloseTicketModal}
          eventTiers={eventData.ticketing.tiers}
          selectedTickets={selectedTickets}
          onTicketQuantityChange={handleTicketQuantityChange}
          totalPrice={totalPrice}
          eventAddress={eventAddress}
          platformFeeBps={platformFeeBps} // Passando platformFeeBps para o modal
        />
      )}
    </div>
  );
};

export default EventDetailsPage;