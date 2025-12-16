import { useState } from 'react';
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export const ColumnFilter = ({ visibleColumns, setVisibleColumns }) => {
    const [isOpen, setIsOpen] = useState(false);

    const columns = [
        { key: 'participant', label: 'Participante' },
        { key: 'email', label: 'Email' },
        { key: 'ticket', label: 'Ingresso' },
        { key: 'purchase', label: 'Data Compra' },
        { key: 'payment', label: 'Status Pagto' },
        { key: 'value', label: 'Valor' },
        { key: 'checkin', label: 'Check-in' },
        { key: 'nft', label: 'NFT Mint' },
        { key: 'actions', label: 'Ações' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Colunas</span>
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-2">
                    {columns.map(column => (
                        <label key={column.key} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibleColumns[column.key]}
                                onChange={(e) => setVisibleColumns(prev => ({
                                    ...prev,
                                    [column.key]: e.target.checked
                                }))}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{column.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};