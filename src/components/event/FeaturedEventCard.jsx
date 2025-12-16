// src/components/event/FeaturedEventCard.tsx
import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Função auxiliar para formatar a data como nos exemplos
// "18 OUT" ou "18 OUT > 19 OUT"
const formatDateRange = (startDateStr, endDateStr) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        }).toUpperCase().replace('.', '');
    };

    const start = formatDate(startDateStr);
    const end = formatDate(endDateStr);

    if (!start) return "EM BREVE";
    // Se não houver data final ou for igual à inicial
    if (start === end || !end) return start;
    
    return `${start} > ${end}`;
};

export function FeaturedEventCard({ featuredEvent }) {

    if (!featuredEvent) {
        // Pode adicionar um skeleton aqui se quiser
        return null;
    }

    // Usando as chaves do seu código original
    const { 
        image_url, 
        name, 
        event_start_date, 
        event_end_date, // Adicionei para a lógica da data
        location_name, 
        event_address 
    } = featuredEvent;

    return (
        // Container com estilo mais limpo
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-7xl mx-auto transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
                
                {/* 1. Banner do Evento (Proporção 3:1) */}
                <div className="lg:w-2/3 relative bg-slate-100">
                    {/* Proporção 3:1 como solicitado */}
                    <div className="aspect-[3/1] w-full">
                        <img 
                            src={image_url} 
                            alt={name}
                            className="w-full h-full object-cover"
                            // Adicionando um fallback
                           
                        />
                    </div>
                </div>
                
                {/* 2. Container de Informações (Estilo dos exemplos) */}
                <div className="lg:w-1/3 p-6 lg:p-8 bg-white flex flex-col justify-center">
                    
                    {/* Data (Estilo da imagem) */}
                    <div className="mb-3">
                        <span className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                            {formatDateRange(event_start_date, event_end_date)}
                        </span>
                    </div>

                    {/* Título do Evento (Estilo da imagem) */}
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
                        {name}
                    </h3>

                    {/* Localização (Estilo da imagem) */}
                    <div className="mb-6 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <p className="text-base text-slate-600 font-normal truncate">
                            {location_name || 'Local a definir'}
                        </p>
                    </div>

                    {/* Botão de Ação (Estilo da imagem) */}
                    <Link 
                        to={`/event/${event_address}`}
                        className="w-full text-center bg-white text-purple-600 font-bold py-3 px-6 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors uppercase text-sm tracking-wider"
                    >
                        Ver Detalhes
                    </Link>
                </div>
            </div>
        </div>
    );
}