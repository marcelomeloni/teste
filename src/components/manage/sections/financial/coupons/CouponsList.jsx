import React from 'react';
import { Search, Plus, Upload, Download } from 'lucide-react';

const CouponsList = ({ onOpenModal }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Header da Lista */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                    Lista de cupons de desconto
                </h3>
                <div className="flex items-center gap-3">
                    {/* Buscar */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    {/* Botões */}
                    <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Upload size={16} />
                        Exportar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Download size={16} />
                        Importar
                    </button>
                    <button 
                        onClick={onOpenModal}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Criar cupom
                    </button>
                </div>
            </div>

            {/* Conteúdo da Lista (Vazio) */}
            <div className="text-center py-10 border-t border-slate-200">
                <p className="text-slate-500">
                    Nenhum cupom de desconto foi criado.
                </p>
            </div>
        </div>
    );
};

export default CouponsList;