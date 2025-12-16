import React, { useState } from 'react';
import { 
    DollarSign, 
    Hourglass, 
    CircleOff, 
    Calculator, 
    Trash2, 
    Info, 
    AlertTriangle, 
    Settings,
    ChevronDown,
    Search,
    Upload,
    Filter,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    X, // Para fechar o modal
    Send, // Para "Reenviar"
    Edit, // Para "Alterar Dados"
    XCircle // Para "Cancelar Pedido"
} from 'lucide-react';

// --- DADOS MOCKADOS ATUALIZADOS ---
// Adicionei mais campos para preencher o modal
const mockOrders = [
    { 
        id: "UijxKEaLcsV4pfPplIsZ", 
        buyer: "Maria Clara Lemes da Costa", 
        buyerEmail: "mariaclara14.ct@gmail.com",
        value: "R$ 35,00", // Valor base
        totalValue: "R$ 37,98", // Valor com taxas
        tax: "R$ 2,98",
        tickets: 1, 
        status: "Confirmado", 
        payment: "Pix", 
        paymentStatus: "Confirmado",
        installments: "-", 
        coupon: "-", 
        date: "24/10/2025 02:50:14",
        eventName: "Halloweed",
        eventDate: "30/10/2025 23:00 - 31/10/2025 05:00",
        ticketsDetail: [ // Array de ingressos neste pedido
            {
                id: "TICKET-001",
                qrValue: "UijxKEaLcsV4pfPplIsZ-001",
                buyerName: "Maria Clara Lemes da Costa",
                buyerEmail: "mariaclara14.ct@gmail.com",
                tierName: "1º Lote",
                tierPrice: "R$ 37,98"
            }
        ]
    },
    { 
        id: "gpoSkYhXBJJDmF4fUsq", 
        buyer: "Luís guilherme",
        buyerEmail: "luis.gui@example.com",
        value: "R$ 35,00", 
        totalValue: "R$ 37,98",
        tax: "R$ 2,98",
        tickets: 1, 
        status: "Confirmado", 
        payment: "Cartão de crédito",
        paymentStatus: "Confirmado", 
        installments: "1", 
        coupon: "-", 
        date: "22/10/2025 00:17:30",
        eventName: "Halloweed",
        eventDate: "30/10/2025 23:00 - 31/10/2025 05:00",
        ticketsDetail: [
            {
                id: "TICKET-002",
                qrValue: "gpoSkYhXBJJDmF4fUsq-001",
                buyerName: "Luís guilherme",
                buyerEmail: "luis.gui@example.com",
                tierName: "1º Lote",
                tierPrice: "R$ 37,98"
            }
        ]
    },
    // Adicione mais pedidos mockados aqui...
];


// --- COMPONENTES DO MODAL ---

/**
 * Botão de Aba (Tab)
 */
function TabButton({ title, tabName, activeTab, setActiveTab }) {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-3 px-6 font-semibold text-sm ${
                isActive
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
        >
            {title}
        </button>
    );
}

/**
 * Aba "Ingressos do pedido"
 */
function TicketsTab({ order }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Status do pagamento:</span>
                <span className="py-0.5 px-2 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {order.paymentStatus}
                </span>
            </div>
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Digite para buscar"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            {/* Lista de Ingressos */}
            <div className="space-y-4">
                {order.ticketsDetail.map((ticket) => (
                    <div key={ticket.id} className="border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row gap-6 items-center">
                        {/* QR Code */}
                        <div className="text-center">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.qrValue}`} 
                                alt="QR Code"
                                className="w-24 h-24 rounded-md border"
                            />
                            <a href="#" className="text-sm font-medium text-indigo-600 hover:underline mt-1 block">
                                Expandir
                            </a>
                        </div>
                        
                        {/* Infos do Ingresso */}
                        <div className="flex-1 space-y-2">
                            <h4 className="font-bold text-lg text-slate-900">{ticket.buyerName}</h4>
                            <p className="text-sm text-slate-600">{ticket.buyerEmail}</p>
                            <p className="text-sm text-slate-800 font-medium">
                                Tipo do ingresso
                            </p>
                            <p className="text-sm text-slate-600">
                                {ticket.tierName} ({ticket.tierPrice})
                            </p>
                        </div>

                        {/* Ações do Ingresso */}
                        <div className="flex flex-col gap-3">
                            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                                <Search size={16} />
                                Ver Detalhes
                            </button>
                            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                                <Edit size={16} />
                                Alterar Dados
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Helper para "Resumo da Compra"
 */
function InfoItem({ label, value, children }) {
    return (
        <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </span>
            {value && <span className="block text-sm text-slate-900 font-medium mt-1">{value}</span>}
            {children && <div className="mt-1">{children}</div>}
        </div>
    );
}

/**
 * Aba "Resumo da compra"
 */
function SummaryTab({ order }) {
    return (
        <div className="space-y-8">
            {/* Seção 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Nome do Comprador" value={order.buyer} />
                <InfoItem label="E-mail do Comprador" value={order.buyerEmail} />
                <InfoItem label="Código do Pedido" value={order.id} />
                <InfoItem label="Data do Pedido" value={order.date} />
                <InfoItem label="N.º de Ingressos no Pedido" value={order.tickets} />
                <InfoItem label="Método de Pagamento" value={order.payment} />
                <InfoItem label="Valor" value={`${order.totalValue} (${order.tax} de taxas)`} />
                <InfoItem label="Status do Pagamento">
                    <span className="py-0.5 px-2 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {order.paymentStatus}
                    </span>
                </InfoItem>
            </div>

            {/* Informações do evento */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações do evento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoItem label="Nome do Evento">
                        <a href="#" className="text-sm text-indigo-600 hover:underline font-medium">
                            {order.eventName}
                        </a>
                    </InfoItem>
                    <InfoItem label="Data do Evento" value={order.eventDate} />
                </div>
            </div>

            {/* Ações */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                        <XCircle size={16} />
                        Cancelar Pedido
                    </button>
                    <button className="px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2">
                        <Send size={16} />
                        Reenviar Confirmação de Compra
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * O MODAL COMPLETO
 */
function OrderDetailModal({ order, onClose }) {
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' ou 'summary'

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Impede que o clique feche o modal
            >
                {/* Header do Modal */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 truncate">
                        Detalhes do pedido 
                        <span className="ml-2 font-mono text-indigo-600 text-lg">{order.id}</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Abas */}
                <div className="flex border-b border-slate-200 flex-shrink-0">
                    <TabButton 
                        title="Ingressos do pedido" 
                        tabName="tickets" 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                    />
                    <TabButton 
                        title="Resumo da compra" 
                        tabName="summary" 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                    />
                </div>

                {/* Conteúdo da Aba */}
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'tickets' && <TicketsTab order={order} />}
                    {activeTab === 'summary' && <SummaryTab order={order} />}
                </div>
            </div>
        </div>
    );
}


// --- COMPONENTES DO PAINEL (da versão anterior) ---

function StatCard({ title, value, Icon, iconColor, iconBg }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
                        <HelpCircle size={14} className="text-slate-400" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </div>
    );
}

function PayoutsSection() {
    // ... (código da seção de repasses igual ao anterior) ...
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Repasse das vendas */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
                        Repasse das vendas
                        <HelpCircle size={16} className="text-slate-400" />
                    </h3>
                    <p className="text-sm text-slate-500 mb-3">DATA E VALORES AGENDADOS PARA REPASSE</p>
                    <ul className="space-y-2 mb-4">
                        <li className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 font-medium">• 05/11/2025</span>
                            <span className="text-slate-900 font-bold">R$ 70,00</span>
                        </li>
                    </ul>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700">
                            Antecipar valores
                        </button>
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200">
                            Lista de repasses
                        </button>
                    </div>
                </div>
                {/* Lado Direito: Conta para repasse */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Conta para repasse
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
                            <span className="text-sm text-yellow-800 font-medium">
                                Nenhuma conta bancária cadastrada
                            </span>
                        </div>
                        <button className="px-3 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-md hover:bg-yellow-500 flex-shrink-0">
                            CADASTRE AGORA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SalesChartSection() {
    // ... (código do gráfico igual ao anterior) ...
     return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Header do Gráfico */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                    Soma do valor de pedidos por data
                </h3>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                        Por dia
                    </button>
                    <button className="px-3 py-1 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100">
                        Por mês
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
                        <Settings size={20} />
                    </button>
                </div>
            </div>
            {/* Simulação do Gráfico */}
            <div className="h-64 flex items-end gap-3 px-2">
                <div className="flex-1 flex flex-col items-center"><div className="w-4/5 h-[80%] bg-green-500 rounded-t-lg" title="R$ 35,00"></div><span className="text-xs text-slate-500 mt-2">22 Out</span></div>
                <div className="flex-1 flex flex-col items-center"><div className="w-4/5 h-[0%]"></div><span className="text-xs text-slate-500 mt-2">23 Out</span></div>
                <div className="flex-1 flex flex-col items-center"><div className="w-4/5 h-[80%] bg-green-500 rounded-t-lg" title="R$ 35,00"></div><span className="text-xs text-slate-500 mt-2">24 Out</span></div>
                <div className="flex-1 flex flex-col items-center"><div className="w-4/5 h-[0%]"></div><span className="text-xs text-slate-500 mt-2">25 Out</span></div>
            </div>
            {/* Legenda */}
            <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="text-sm text-slate-600">Pedidos confirmados</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400 rounded-sm"></div><span className="text-sm text-slate-600">Pedidos c/ pagamento pendente</span></div>
            </div>
        </div>
    );
}

/**
 * Tabela de Pedidos (MODIFICADA)
 * Agora aceita 'onOrderClick'
 */
function OrdersTable({ orders, onOrderClick }) { // MODIFICADO: recebe props
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header da Tabela */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                 <h3 className="text-lg font-semibold text-slate-900">
                    Pedidos
                </h3>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Upload size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium text-slate-600">ID</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Nome do Comprador</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Valor Recebido</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Ingressos no Pedido</th>
                            <th className="px-4 py-3 font-medium text-slate-600 flex items-center gap-1">Status <Filter size={14} /></th>
                            <th className="px-4 py-3 font-medium text-slate-600 flex items-center gap-1">Método de Pagamento <Filter size={14} /></th>
                            <th className="px-4 py-3 font-medium text-slate-600">Parcelas</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Cupom</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Data do Pedido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {orders.map((order) => ( // MODIFICADO: usa 'orders' da prop
                            <tr 
                                key={order.id} 
                                className="hover:bg-slate-50 cursor-pointer"
                                onClick={() => onOrderClick(order)} // MODIFICADO: Adiciona o clique
                            >
                                <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate" title={order.id}>{order.id.substring(0, 10)}...</td>
                                <td className="px-4 py-3 text-slate-700 font-medium">{order.buyer}</td>
                                <td className="px-4 py-3 text-slate-700">{order.value}</td>
                                <td className="px-4 py-3 text-slate-700">{order.tickets}</td>
                                <td className="px-4 py-3">
                                    <span className="py-0.5 px-2 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{order.payment}</td>
                                <td className="px-4 py-3 text-slate-700">{order.installments}</td>
                                <td className="px-4 py-3 text-slate-700">{order.coupon}</td>
                                <td className="px-4 py-3 text-slate-700">{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                    Mostrando 1 a {orders.length} de 14 pedidos
                </span>
                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-indigo-500 bg-indigo-50 text-indigo-600 text-sm font-medium">
                        1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 text-sm">
                        2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---

export function FinancialPanel() {
    // MODIFICADO: Adiciona estado para o modal
    const [selectedOrder, setSelectedOrder] = useState(null);

    const statsData = [ // Dados dos cards movidos para cá
        { title: "VENDAS COMPLETADAS", value: "R$ 70,00", Icon: DollarSign, iconColor: "text-green-600", iconBg: "bg-green-100" },
        { title: "PENDENTE DE PAGAMENTO", value: "R$ 0,00", Icon: Hourglass, iconColor: "text-orange-600", iconBg: "bg-orange-100" },
        { title: "VENDAS CANCELADAS", value: "R$ 0,00", Icon: CircleOff, iconColor: "text-red-600", iconBg: "bg-red-100" },
        { title: "TICKET MÉDIO", value: "R$ 35,00", Icon: Calculator, iconColor: "text-slate-600", iconBg: "bg-slate-100" },
    ];
    
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
            
                {/* Grid de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {statsData.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            Icon={stat.Icon}
                            iconColor={stat.iconColor}
                            iconBg={stat.iconBg}
                        />
                    ))}
                </div>
                
                {/* Seção de Repasses */}
                <PayoutsSection />

                {/* Seção do Gráfico */}
                <SalesChartSection />

                {/* Seção da Tabela de Pedidos (MODIFICADA) */}
                <OrdersTable 
                    orders={mockOrders} 
                    onOrderClick={setSelectedOrder} // Passa a função para abrir o modal
                />

            </div>

            {/* MODAL (Renderização Condicional) */}
            {selectedOrder && (
                <OrderDetailModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} // Passa a função para fechar
                />
            )}
        </div>
    );
}