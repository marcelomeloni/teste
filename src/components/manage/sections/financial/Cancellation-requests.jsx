import React from 'react';
import { Upload, Settings, Search } from 'lucide-react';

export function CancellationRequests() {
    return (
        <div className="p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                
                {/* Header da Seção */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Título */}
                    <h2 className="text-lg font-semibold text-slate-800">
                        Solicitações de cancelamento de pedidos
                    </h2>

                    {/* Ações */}
                    <div className="flex items-center gap-3">
                        {/* Buscar */}
                        <div className="flex items-center gap-2">
                            <label 
                                htmlFor="cancel-search" 
                                className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                            >
                                BUSCAR:
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="cancel-search"
                                    type="text"
                                    placeholder="Digite para buscar"
                                    className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Botão Exportar */}
                        <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Upload size={16} />
                            Exportar
                        </button>

                        {/* Botão Configurações */}
                        <button className="flex items-center justify-center w-9 h-9 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                            <Settings size={16} />
                        </button>
                    </div>
                </div>

                {/* Conteúdo / Estado Vazio */}
                <div className="py-2">
                    <p className="text-slate-600">
                        Ainda não existem solicitações de cancelamento de pedidos.
                    </p>
                </div>
                
            </div>
        </div>
    );
}