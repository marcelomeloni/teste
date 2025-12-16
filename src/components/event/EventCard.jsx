import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';

// --- COMPONENTE DE STATUS --- (Se houver, mantenha aqui)

// --- COMPONENTE DE ESQUELETO (LOADING STATE) ---
export const EventCardSkeleton = () => (
    <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden animate-pulse w-full">
        {/* Alterado de h-48 para aspect-[3/1] */}
        <div className="w-full aspect-[3/1] bg-slate-200"></div>
        <div className="p-5">
            <div className="h-6 bg-slate-200 rounded w-4/5 mb-4"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-5 bg-slate-200 rounded w-2/3"></div>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DO CARD ---
export function EventCard({ event, isLoading = false }) {
    if (isLoading) {
        return <EventCardSkeleton />;
    }

    // ✅ VALIDAÇÃO CORRIGIDA
    if (!event || !event.event_address) {
        // console.error removido para limpar logs em produção, se desejar manter descomente
        return (
            <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden p-6 text-center">
                <p className="text-slate-500">Dados do evento indisponíveis</p>
            </div>
        );
    }

    // --- LÓGICA DE DADOS ---
    const eventName = event.name || event.account?.name || 'Evento sem nome';
    // const eventDescription = event.description || event.account?.description || 'Descrição não disponível'; (Não usado no render)
    const eventImage = event.image_url || event.account?.imageUrl;
    const locationName = event.location_name || event.account?.locationName || 'Local a definir';
    const eventStartDate = event.event_start_date || event.account?.eventStartDate;
    const eventEndDate = event.event_end_date || event.account?.eventEndDate;
    const eventAddress = event.event_address;

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Data a definir';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
            }).replace(' de', ' de').replace(',', ' às');
        } catch (error) {
            return 'Data inválida';
        }
    };

    const formatLocation = () => {
        return locationName;
    };

    // Obs: A variável 'status' foi calculada mas não estava sendo usada no JSX original.
    // Mantida caso você precise dela no futuro.
    const status = useMemo(() => {
        if (!eventStartDate) return 'upcoming';
        const now = new Date();
        const startDate = new Date(eventStartDate);
        const endDate = eventEndDate ? new Date(eventEndDate) : null;

        if (endDate && now > endDate) return 'finished';
        if (now >= startDate && (!endDate || now <= endDate)) return 'active';
        return 'upcoming';
    }, [eventStartDate, eventEndDate]);
    
    const eventDate = formatDateTime(eventStartDate);
    const location = formatLocation();
    const displayImage = eventImage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3';

    return (
        <Link to={`/event/${eventAddress}`} className="group block w-full">
            {/* Adicionado w-full para garantir largura */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col w-full">
                
                {/* ÁREA DA IMAGEM - Alterada para Proporção 3:1 */}
                {/* Removido h-48, Adicionado aspect-[3/1] */}
                <div className="relative w-full aspect-[3/1] overflow-hidden">
                    <img 
                        src={displayImage}
                        alt={eventName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        onError={(e) => { 
                            e.target.src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'; 
                        }}
                    />
                    
                    {/* Overlay para eventos sem imagem */}
                    {!eventImage && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <div className="text-white text-center p-4">
                                <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 opacity-70" />
                                <p className="font-semibold drop-shadow-md">{eventName}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ÁREA DE CONTEÚDO */}
                <div className="p-5 flex-grow">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 leading-tight line-clamp-2">
                        {eventName}
                    </h2>

                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start">
                            <CalendarDaysIcon className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400 mt-0.5" />
                            <span className="flex-1">{eventDate}</span>
                        </div>
                        <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400 mt-0.5" />
                            <span className="flex-1 line-clamp-2">{location}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}