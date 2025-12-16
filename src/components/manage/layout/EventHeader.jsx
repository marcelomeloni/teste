import { ChevronDownIcon, UserCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export function EventHeader({ event, metadata, authType }) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Fechar menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ FUNÇÃO SEGURA para formatar datas (AJUSTADA PARA RECEBER STRING ISO OU TIMESTAMP)
    const formatDate = (dateStringOrTimestamp) => {
        if (!dateStringOrTimestamp) return 'Data indisponível';
        
        let date;
        if (typeof dateStringOrTimestamp === 'number') {
            // Se for um timestamp, converte de segundos para milissegundos
            date = new Date(dateStringOrTimestamp * 1000); 
        } else if (typeof dateStringOrTimestamp === 'string') {
            // Se for uma string (ISO), o Date constructor lida com isso
            date = new Date(dateStringOrTimestamp);
        } else {
            return 'Data inválida';
        }

        if (isNaN(date.getTime())) { // Verifica se a data é inválida
            return 'Data inválida';
        }

        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ VALORES PADRÃO SEGUROS
    const safeEvent = event || {};
    // const safeMetadata = metadata || {}; // Não precisamos mais de safeMetadata.name

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-start">
                {/* Informações do Evento */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {/* ✅ CORREÇÃO AQUI: event.name é o correto */}
                        {safeEvent.name || 'Nome do Evento'}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                            <span>
                                Início: 
                                {/* ✅ CORREÇÃO AQUI: event.event_start_date */}
                                {formatDate(safeEvent.event_start_date)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>→</span>
                            <span>
                                Fim: 
                                {/* ✅ CORREÇÃO AQUI: event.event_end_date */}
                                {formatDate(safeEvent.event_end_date)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Você pode adicionar o menu do usuário aqui se quiser, ou removê-lo se não for usado */}
            </div>
        </header>
    );
}