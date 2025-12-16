import { useState } from 'react';
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export const AdvancedFilters = ({ filters, setFilters, onApplyFilters }) => {
    const [isOpen, setIsOpen] = useState(false);

    const paymentOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'paid', label: 'Apenas Pagos' },
        { value: 'free', label: 'Apenas Grátis' }
    ];

    const checkinOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'checked', label: 'Check-in Realizado' },
        { value: 'pending', label: 'Check-in Pendente' }
    ];

    const statusOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'confirmed', label: 'Confirmado' },
        { value: 'pending', label: 'Pendente' },
        { value: 'cancelled', label: 'Cancelado' }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApplyFilters?.();
        setIsOpen(false);
    };

    const handleReset = () => {
        setFilters({
            paymentStatus: 'all',
            checkinStatus: 'all',
            transactionStatus: 'all',
            tierType: ''
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
                <FunnelIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Filtros</span>
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status de Pagamento
                            </label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {paymentOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status de Check-in
                            </label>
                            <select
                                value={filters.checkinStatus}
                                onChange={(e) => handleFilterChange('checkinStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {checkinOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status da Transação
                            </label>
                            <select
                                value={filters.transactionStatus}
                                onChange={(e) => handleFilterChange('transactionStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tipo de Ingresso
                            </label>
                            <input
                                type="text"
                                placeholder="Filtrar por tipo..."
                                value={filters.tierType}
                                onChange={(e) => handleFilterChange('tierType', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 py-2 text-sm text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};