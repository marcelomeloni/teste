import { Eye, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

// Função para renderizar markdown de forma limpa
const renderCleanMessage = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
        let processedLine = line;

        // Processar markdown de forma limpa
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processedLine = processedLine.replace(/__(.*?)__/g, '<u>$1</u>');
        processedLine = processedLine.replace(/~~(.*?)~~/g, '<s>$1</s>');
        
        // Processar links markdown [texto](url)
        processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 underline" target="_blank">$1</a>');
        
        // Processar listas
        if (processedLine.trim().startsWith('-')) {
            processedLine = processedLine.replace('-', '<span class="mr-2">•</span>');
            return (
                <div key={index} className="flex items-start ml-4 mb-1">
                    <div dangerouslySetInnerHTML={{ __html: processedLine }} />
                </div>
            );
        }
        
        // Processar listas ordenadas
        if (/^\d+\./.test(processedLine.trim())) {
            return (
                <div key={index} className="flex items-start ml-4 mb-1">
                    <div dangerouslySetInnerHTML={{ __html: processedLine }} />
                </div>
            );
        }
        
        // Processar centralização (→texto←)
        if (processedLine.startsWith('→') && processedLine.endsWith('←')) {
            const centeredText = processedLine.slice(1, -1);
            return (
                <div key={index} className="text-center mb-2" dangerouslySetInnerHTML={{ __html: centeredText }} />
            );
        }

        return (
            <div 
                key={index}
                dangerouslySetInnerHTML={{ __html: processedLine }}
                className="mb-2 leading-relaxed"
            />
        );
    });
};

export function EmailPreview({ event, organizer, emailData }) {
    const [eventDate, setEventDate] = useState('Carregando datas...');
    const [eventLocation, setEventLocation] = useState('Carregando local...');

    useEffect(() => {
        const formatEventDate = () => {
            if (!event?.event_start_date || !event?.event_end_date) {
                return 'Datas não definidas';
            }
            
            try {
                const start = new Date(event.event_start_date);
                const end = new Date(event.event_end_date);
                
                const formatDate = (date) => {
                    return date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                };
                
                return `${formatDate(start)} - ${formatDate(end)}`;
            } catch (error) {
                return 'Erro ao formatar datas';
            }
        };

        const formatEventLocation = () => {
            const location = event?.metadata?.properties?.location;
            if (!location) return event?.location_name || 'Local não definido';
            
            const { venueName, address, type } = location;
            
            if (venueName && address) {
                const { street, number, neighborhood, city, state } = address;
                const addressParts = [street, number, neighborhood].filter(Boolean);
                return `${venueName} - ${addressParts.join(', ')}, ${city} - ${state}`;
            }
            
            return venueName || event?.location_name || 'Local não definido';
        };

        setEventDate(formatEventDate());
        setEventLocation(formatEventLocation());
    }, [event]);

    const bannerImage = event?.metadata?.bannerImage || event?.image_url;

    return (
        <aside className="sticky top-6">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye size={16} />
                PRÉ-VISUALIZAÇÃO
            </h3>
            <div className="border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
                <div className="p-5">
                    {bannerImage && (
                        <img 
                            src={bannerImage}
                            alt={`Banner do evento ${event?.name}`}
                            className="w-full h-24 object-cover rounded-md mb-4"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    
                    <p className="text-sm text-slate-700 mb-4">
                        Mensagem enviada por <strong>{organizer?.name || 'Organizador'}</strong> sobre o evento <strong>{event?.name || 'Evento'}</strong>
                    </p>
                    
                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <div className="flex items-start gap-2">
                            <Calendar size={15} className="flex-shrink-0 mt-0.5 text-slate-500" />
                            <span><strong>Data do evento:</strong> {eventDate}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={15} className="flex-shrink-0 mt-0.5 text-slate-500" />
                            <span><strong>Local do evento:</strong> {eventLocation}</span>
                        </div>
                    </div>

                    {emailData.subject && (
                        <div className="border-t border-slate-200 pt-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-900 text-center">{emailData.subject}</h3>
                        </div>
                    )}

                    <div className="text-slate-800 border-t border-slate-200 pt-4 mb-4 min-h-[100px] leading-relaxed">
                        {emailData.message ? (
                            <div className="space-y-2">
                                {renderCleanMessage(emailData.message)}
                            </div>
                        ) : (
                            <p className="italic text-slate-500 text-center py-8">
                                Sua mensagem aparecerá aqui
                            </p>
                        )}
                    </div>

                    <p className="text-sm text-slate-600 border-t border-slate-200 pt-4">
                        Em caso de dúvidas, responda este e-mail: <a href={`mailto:${organizer?.email}`} className="text-indigo-600 font-medium">{organizer?.email}</a>.
                    </p>
                </div>
                
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                        Enviado através do Ticketfy • {organizer?.name}
                    </p>
                </div>
            </div>
        </aside>
    );
}