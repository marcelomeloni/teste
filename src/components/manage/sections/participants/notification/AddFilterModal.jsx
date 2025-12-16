import { X, ChevronDown, Search, Check, Info, Filter } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export function AddFilterModal({ isOpen, onClose, onApplyFilter }) {
    const [selectedField, setSelectedField] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Novo: Busca de ingressos

    // Mock de dados
    const ticketTypes = [
        "Lote Promocional", "1º Lote", "2º Lote", "3º Lote", "Lote Rep", "Lote Job", 
        "Área VIP", "Backstage", "Camarote Open Bar"
    ];

    // Resetar valores ao mudar filtro
    useEffect(() => {
        setSelectedValue('');
        setSelectedTickets([]);
        setSearchTerm('');
    }, [selectedField]);

    // Filtragem local para busca de ingressos
    const filteredTickets = useMemo(() => {
        return ticketTypes.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, ticketTypes]);

    if (!isOpen) return null;

    // Handlers
    const handleTicketToggle = (ticket) => {
        if (selectedTickets.includes(ticket)) {
            setSelectedTickets(selectedTickets.filter(t => t !== ticket));
        } else {
            setSelectedTickets([...selectedTickets, ticket]);
        }
    };

    const handleSelectAllTickets = () => setSelectedTickets([...ticketTypes]);
    const handleResetTickets = () => setSelectedTickets([]);

    const handleApply = () => {
        let finalValue = selectedValue;
        
        if (selectedField === 'ticket_type') {
            if (selectedTickets.length === 0) return; // UX: Impede envio vazio silenciosamente ou adicione toast
            finalValue = selectedTickets.join(', ');
        } else {
            if (!selectedValue) return;
        }

        const labelMap = {
            'payment_status': 'Pagamento do pedido',
            'ticket_type': 'Tipo do ingresso',
            'checkin_status': 'Check-in realizado'
        };

        onApplyFilter({
            field: selectedField,
            label: labelMap[selectedField],
            value: finalValue,
            displayValue: finalValue
        });
        
        handleClose();
    };

    const handleClose = () => {
        setSelectedField('');
        setSelectedValue('');
        setSelectedTickets([]);
        setSearchTerm('');
        onClose();
    };

    // Renderização Condicional do Input de Valor
    const renderValueInput = () => {
        const selectClass = "w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer hover:border-indigo-300";
        const wrapperClass = "relative group";
        const iconClass = "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none";

        switch (selectedField) {
            case 'payment_status':
                return (
                    <div className={wrapperClass}>
                        <select 
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(e.target.value)}
                            className={selectClass}
                        >
                            <option value="" disabled>Selecione o status do pedido</option>
                            <option value="Confirmado">Confirmado (Pago)</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Cancelado">Cancelado / Estornado</option>
                        </select>
                        <ChevronDown className={iconClass} size={18} />
                    </div>
                );

            case 'checkin_status':
                return (
                    <div className={wrapperClass}>
                        <select 
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(e.target.value)}
                            className={selectClass}
                        >
                            <option value="" disabled>O participante já entrou no evento?</option>
                            <option value="Sim">Sim, check-in realizado</option>
                            <option value="Não">Não, aguardando check-in</option>
                        </select>
                        <ChevronDown className={iconClass} size={18} />
                    </div>
                );

            case 'ticket_type':
                return (
                    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
                        {/* Header do Multi-select com Busca */}
                        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Buscar ingresso..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Lista Scrollável */}
                        <div className="max-h-52 overflow-y-auto p-1 custom-scrollbar">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => {
                                    const isSelected = selectedTickets.includes(ticket);
                                    return (
                                        <label 
                                            key={ticket} 
                                            className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all group ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={isSelected}
                                                onChange={() => handleTicketToggle(ticket)}
                                            />
                                            <span className={`ml-3 text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                {ticket}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-400">
                                    Nenhum ingresso encontrado.
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 p-2 flex justify-between items-center text-xs">
                            <div className="flex gap-3 px-2">
                                <button onClick={handleSelectAllTickets} className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline decoration-indigo-200 underline-offset-2">
                                    Marcar todos
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={handleResetTickets} className="text-slate-500 hover:text-slate-700 font-medium hover:underline decoration-slate-300 underline-offset-2">
                                    Limpar seleção
                                </button>
                            </div>
                            <span className="text-slate-400 font-medium px-2">
                                {selectedTickets.length} selecionados
                            </span>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="relative">
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-slate-400 text-sm flex items-center gap-2 select-none">
                            <Filter size={16} className="opacity-50" />
                            <span>Selecione um filtro acima para habilitar as opções</span>
                        </div>
                    </div>
                );
        }
    };

    const isApplyDisabled = !selectedField || (selectedField === 'ticket_type' ? selectedTickets.length === 0 : !selectedValue);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop com Blur e Fade */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-slate-900/5">
                
                {/* Header Style */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            Novo Filtro
                        </h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Segmentação de Envio
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body com Scroll */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    
                    {/* Info Box Melhorada */}
                    <div className="mb-8 flex gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-lg text-sm text-blue-900 leading-relaxed">
                        <Info className="shrink-0 text-blue-600 mt-0.5" size={18} />
                        <div>
                            <p className="font-medium mb-1">Como funcionam os filtros?</p>
                            <p className="text-blue-800/80 text-xs leading-5">
                                Você pode filtrar participantes com base em dados da inscrição (ex: Check-in, Pagamento). 
                                Ao aplicar múltiplos filtros, apenas os participantes que atenderem a <strong>todas</strong> as condições receberão o e-mail.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Campo 1: Seleção do Filtro */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                1. Critério de Filtro
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <select 
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer hover:border-indigo-300"
                                >
                                    <option value="" disabled>Escolha por onde deseja filtrar...</option>
                                    <optgroup label="Dados do Pedido">
                                        <option value="payment_status">Status do Pagamento</option>
                                        <option value="ticket_type">Tipo do Ingresso</option>
                                    </optgroup>
                                    <optgroup label="Controle de Acesso">
                                        <option value="checkin_status">Status de Check-in</option>
                                    </optgroup>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Conector Visual (Linha tracejada) */}
                        <div className="flex justify-center -my-2 opacity-30">
                            <div className="h-4 w-px border-l border-dashed border-slate-400"></div>
                        </div>

                        {/* Campo 2: Valor Dinâmico */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                2. Condição
                                <span className="text-red-500">*</span>
                            </label>
                            
                            {renderValueInput()}

                            {/* Dica de rodapé do input */}
                            {selectedField === 'ticket_type' && selectedTickets.length > 0 && (
                                <p className="text-xs text-indigo-600 font-medium ml-1 animate-in fade-in slide-in-from-left-2">
                                    Filtro aplicável a {selectedTickets.length} tipos de ingresso.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={isApplyDisabled}
                        className={`px-6 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all flex items-center gap-2
                            ${isApplyDisabled 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}
                        `}
                    >
                        <Check size={16} strokeWidth={2.5} />
                        Aplicar Filtro
                    </button>
                </div>
            </div>

            {/* Style global para scrollbar fina dentro do modal */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}