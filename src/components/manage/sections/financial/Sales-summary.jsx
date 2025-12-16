import React, { useState } from 'react';
import { HelpCircle, Edit, Edit2, Ban } from 'lucide-react';

// --- DADOS MOCKADOS ---
const mockTiers = [
    {
        name: "Lote Promocional",
        sold: 10,
        total: 10,
        remaining: 0,
        participantPrice: "R$ 32,55",
        receivedValue: "R$ 30,00"
    },
    {
        name: "1º Lote",
        sold: 3,
        total: 30,
        remaining: 27,
        participantPrice: "R$ 37,98",
        receivedValue: "R$ 35,00"
    },
    {
        name: "2º Lote",
        sold: 0,
        total: 40,
        remaining: 40,
        participantPrice: "R$ 43,40",
        receivedValue: "R$ 40,00"
    },
    {
        name: "3º Lote",
        sold: 0,
        total: 50,
        remaining: 50,
        participantPrice: "R$ 48,83",
        receivedValue: "R$ 45,00"
    },
    {
        name: "Lote Rep",
        sold: 0,
        total: 105,
        remaining: 105,
        participantPrice: "R$ 32,55",
        receivedValue: "R$ 30,00"
    },
    {
        name: "Lote Job",
        sold: 1,
        total: 10,
        remaining: 9,
        participantPrice: "R$ 17,50",
        receivedValue: "R$ 15,00"
    },
];

// --- COMPONENTE DA BARRA DE PROGRESSO ---
function ProgressBar({ sold, total }) {
    const percentage = total > 0 ? (sold / total) * 100 : 0;
    
    return (
        <div className="w-full">
            <span className="text-xs font-medium text-slate-700">
                {sold} / {total} 
            </span>
            <span className="text-xs text-slate-500 ml-1">
                [{percentage.toFixed(0)}% do total]
            </span>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

// --- COMPONENTE DA ABA ---
function TabItem({ title, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`py-3 px-1.5 font-semibold text-sm ${
                active
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            {title}
        </button>
    );
}

// --- COMPONENTE PRINCIPAL ---
export function SalesSummary() {
    const [activeTab, setActiveTab] = useState('types');

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                
                {/* Abas de Navegação */}
                <div className="px-6 border-b border-slate-200">
                    <nav className="flex items-center gap-8 -mb-px">
                        <TabItem 
                            title="Vendas por tipos de ingressos" 
                            active={activeTab === 'types'} 
                            onClick={() => setActiveTab('types')}
                        />
                    
                        <TabItem 
                            title="Vendas por promoters" 
                            active={activeTab === 'promoters'} 
                            onClick={() => setActiveTab('promoters')}
                        />
                    </nav>
                </div>

                {/* Conteúdo das Abas */}
                <div className="p-6">
                    {/* Status em tempo real */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-600">
                            Atualizado em tempo real
                        </span>
                    </div>
                    
                    {/* Tabela de Tipos de Ingressos */}
                    {activeTab === 'types' && (
                        <div>
                            {/* Header da Tabela */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                                    Tipos de ingressos (resumo das vendas)
                                    <HelpCircle size={16} className="text-slate-400" />
                                </h2>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700">
                                    <Edit size={16} />
                                    EDITAR
                                </button>
                            </div>

                            {/* Tabela */}
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Nome do Ingresso</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Quantidade Vendida</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Quantidade Restante</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Valor Pago Pelo Participante</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Valor Recebido por Ingresso</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {mockTiers.map((tier) => (
                                            <tr key={tier.name} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 text-slate-700 font-semibold">{tier.name}</td>
                                                <td className="px-4 py-4 min-w-[200px]">
                                                    <ProgressBar sold={tier.sold} total={tier.total} />
                                                </td>
                                                <td className="px-4 py-4 text-slate-600 font-medium">{tier.remaining}</td>
                                                <td className="px-4 py-4 text-slate-600 font-medium">{tier.participantPrice}</td>
                                                <td className="px-4 py-4 text-slate-800 font-bold">{tier.receivedValue}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button className="text-slate-500 hover:text-indigo-600">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="text-slate-500 hover:text-red-600">
                                                            <Ban size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Placeholder para outras abas */}
                    {activeTab === 'pdv' && (
                        <p className="text-slate-600">Conteúdo de Vendas por PDV.</p>
                    )}
                    {activeTab === 'promoters' && (
                        <p className="text-slate-600">Conteúdo de Vendas por Promoters.</p>
                    )}
                </div>
            </div>
        </div>
    );
}