import { Cog, X, Plus, Eye, Mail } from 'lucide-react';
import { RichTextToolbar } from './RichTextToolbar';
import { RecipientsModal } from './RecipientsModal';
import { AddFilterModal } from './AddFilterModal';
import { useRef, useState } from 'react';

export function EmailConfigForm({ 
    organizer, 
    eventName, 
    emailData, 
    onUpdate, 
    onAddFilter, 
    onRemoveFilter 
}) {
    const textareaRef = useRef(null);
    
    // Estados para controlar os modais
    const [isRecipientsModalOpen, setIsRecipientsModalOpen] = useState(false);
    const [isAddFilterModalOpen, setIsAddFilterModalOpen] = useState(false);

    // Mock data para destinatários
    const recipients = [
        { name: 'João Silva', email: 'joao.silva@email.com' },
        { name: 'Maria Santos', email: 'maria.santos@email.com' },
        { name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com' },
        { name: 'Ana Costa', email: 'ana.costa@email.com' },
        { name: 'Carlos Lima', email: 'carlos.lima@email.com' },
        { name: 'Juliana Pereira', email: 'juliana.pereira@email.com' },
        { name: 'Rafael Souza', email: 'rafael.souza@email.com' },
        { name: 'Fernanda Rodrigues', email: 'fernanda.rodrigues@email.com' },
        { name: 'Bruno Almeida', email: 'bruno.almeida@email.com' },
        { name: 'Camila Ferreira', email: 'camila.ferreira@email.com' },
        { name: 'Lucas Barbosa', email: 'lucas.barbosa@email.com' },
        { name: 'Amanda Cardoso', email: 'amanda.cardoso@email.com' }
    ];

    const totalEnrolled = 15; // Total de inscritos
    const totalFiltered = recipients.length; // Total após filtros

    const applyFormatting = (command, value = null) => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const text = emailData.message;
            const selectedText = text.substring(start, end);

            let newText = text;
            let cursorOffset = 0;
            
            switch (command) {
                case 'bold':
                    newText = text.substring(0, start) + `**${selectedText || 'texto em negrito'}**` + text.substring(end);
                    cursorOffset = selectedText ? 0 : -2;
                    break;
                case 'italic':
                    newText = text.substring(0, start) + `*${selectedText || 'texto em itálico'}*` + text.substring(end);
                    cursorOffset = selectedText ? 0 : -1;
                    break;
                case 'underline':
                    newText = text.substring(0, start) + `__${selectedText || 'texto sublinhado'}__` + text.substring(end);
                    cursorOffset = selectedText ? 0 : -2;
                    break;
                case 'strikethrough':
                    newText = text.substring(0, start) + `~~${selectedText || 'texto tachado'}~~` + text.substring(end);
                    cursorOffset = selectedText ? 0 : -2;
                    break;
                case 'list':
                    if (selectedText.includes('\n')) {
                        const lines = selectedText.split('\n');
                        const listText = lines.map(line => `- ${line}`).join('\n');
                        newText = text.substring(0, start) + listText + text.substring(end);
                    } else {
                        newText = text.substring(0, start) + `- ${selectedText}` + text.substring(end);
                    }
                    break;
                case 'listOrdered':
                    if (selectedText.includes('\n')) {
                        const orderedLines = selectedText.split('\n');
                        const orderedList = orderedLines.map((line, index) => `${index + 1}. ${line}`).join('\n');
                        newText = text.substring(0, start) + orderedList + text.substring(end);
                    } else {
                        newText = text.substring(0, start) + `1. ${selectedText}` + text.substring(end);
                    }
                    break;
                case 'link':
                    const url = prompt('Digite a URL do link:', 'https://');
                    if (url) {
                        const linkText = selectedText || 'clique aqui';
                        newText = text.substring(0, start) + `[${linkText}](${url})` + text.substring(end);
                    } else {
                        return;
                    }
                    break;
                case 'alignCenter':
                    if (selectedText) {
                        newText = text.substring(0, start) + `→${selectedText}←` + text.substring(end);
                    }
                    break;
                case 'emoji':
                    if (value) {
                        newText = text.substring(0, start) + value + text.substring(end);
                    }
                    break;
                default:
                    return;
            }

            onUpdate('message', newText);
            
            setTimeout(() => {
                const newCursorPos = start + newText.length - text.length + cursorOffset;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                textareaRef.current.focus();
            }, 0);
        }
    };

    // Função para aplicar novo filtro vindo do modal
    const handleApplyFilter = (newFilter) => {
        onAddFilter(newFilter);
    };

    return (
        <div className="space-y-8">
            {/* Modais */}
            <RecipientsModal 
                isOpen={isRecipientsModalOpen}
                onClose={() => setIsRecipientsModalOpen(false)}
                recipients={recipients}
                totalFiltered={totalFiltered}
                totalEnrolled={totalEnrolled}
            />
            
            <AddFilterModal 
                isOpen={isAddFilterModalOpen}
                onClose={() => setIsAddFilterModalOpen(false)}
                onApplyFilter={handleApplyFilter}
            />

            {/* Seção de Filtros */}
            <section>
                <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Cog size={16} />
                    Configuração do envio
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Cada destinatário receberá o email apenas se atender a todos os filtros aplicados.
                </p>
                
                {/* Filtros ativos */}
                {emailData.filters.map((filter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-300 rounded-lg bg-slate-50 mb-2">
                        <span className="text-sm font-medium text-slate-700">
                            {filter.label}: <span className="font-bold">{filter.displayValue}</span>
                        </span>
                        <button 
                            onClick={() => onRemoveFilter(index)}
                            className="text-slate-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
                
                <div className="flex items-center gap-3 mt-4">
                    <button 
                        onClick={() => setIsAddFilterModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Plus size={16} />
                        Adicionar Filtro
                    </button>
                    <button 
                        onClick={() => setIsRecipientsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Eye size={16} />
                        Visualizar Destinatários ({totalFiltered})
                    </button>
                </div>
            </section>

            {/* Seção de Conteúdo */}
            <section>
                <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Mail size={16} />
                    Conteúdo da mensagem
                </h3>
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                NOME DO REMETENTE *
                            </label>
                            <input
                                type="text"
                                value={organizer?.name || 'Organizador não definido'}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                                readOnly
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                RESPONDER A *
                            </label>
                            <input
                                type="email"
                                value={organizer?.email || 'email@exemplo.com'}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                                readOnly
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1">
                            ASSUNTO DO E-MAIL *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            placeholder={`Informações importantes sobre ${eventName}`}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            value={emailData.subject}
                            onChange={(e) => onUpdate('subject', e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1">
                            MENSAGEM *
                        </label>
                        <div className="border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors bg-white">
                            <RichTextToolbar onFormat={applyFormatting} />
                            <textarea
                                ref={textareaRef}
                                id="message"
                                rows={12}
                                placeholder={`Prezado participante,

Esperamos que esteja bem! Seguem informações importantes sobre o evento "${eventName}".

Atenciosamente,
${organizer?.name || 'Organizador'}`}
                                className="w-full p-4 text-sm placeholder-slate-400 focus:outline-none rounded-b-lg resize-y leading-relaxed"
                                value={emailData.message}
                                onChange={(e) => onUpdate('message', e.target.value)}
                            />
                        </div>
                  
                    </div>
                </div>
            </section>
        </div>
    );
}