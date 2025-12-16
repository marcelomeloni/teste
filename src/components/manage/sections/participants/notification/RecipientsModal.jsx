import { X } from 'lucide-react';

export function RecipientsModal({ 
    isOpen, 
    onClose, 
    recipients = [], // Lista de usuários (futuramente virá da API)
    totalFiltered = 0, 
    totalEnrolled = 0 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">
                        Lista de destinatários
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo Rolável */}
                <div className="overflow-y-auto p-6">
                    {/* Texto informativo */}
                    <div className="mb-6 space-y-3 text-slate-600">
                        <p>
                            Um total de <strong className="text-slate-900">{totalFiltered} participantes</strong> receberão este e-mail, baseado nos filtros selecionados.
                        </p>
                        <p>
                            Este número é menor que o total de inscritos ({totalEnrolled} participantes), pois existem inscrições com o mesmo e-mail. Apenas um envio ocorrerá para cada e-mail duplicado.
                        </p>
                        <p>
                            Abaixo é possível conferir a lista completa dos destinatários:
                        </p>
                    </div>

                    {/* Tabela de Destinatários */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        {/* Header da Tabela */}
                        <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 p-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Nome do Destinatário
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                E-mail do Destinatário
                            </span>
                        </div>

                        {/* Linhas da Tabela */}
                        <div className="divide-y divide-slate-100">
                            {recipients.length > 0 ? (
                                recipients.map((recipient, index) => (
                                    <div key={index} className="grid grid-cols-2 p-4 hover:bg-slate-50 transition-colors">
                                        <span className="text-sm text-slate-700 font-medium truncate pr-4">
                                            {recipient.name}
                                        </span>
                                        <span className="text-sm text-slate-600 truncate">
                                            {recipient.email}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500 italic">
                                    Nenhum destinatário encontrado com os filtros atuais.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer do Modal */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold text-sm transition-colors shadow-sm"
                    >
                        FECHAR
                    </button>
                </div>
            </div>
        </div>
    );
}