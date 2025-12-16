import { 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon, 
    UserPlusIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { AdvancedFilters } from './AdvancedFilters';
import { ColumnFilter } from './ColumnFilter';

export const Toolbar = ({
    searchTerm,
    onSearchChange,
    filters,
    onFiltersChange,
    visibleColumns,
    onColumnsChange,
    onExport,
    onAddParticipant
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-slate-500"/>
                Lista de Participantes 
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search Input */}
                <div className="relative flex-grow md:flex-grow-0 md:w-64">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar participantes..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>
                
                {/* Filtros Avançados */}
                <AdvancedFilters 
                    filters={filters}
                    setFilters={onFiltersChange}
                    onApplyFilters={() => {}} // Filtros são aplicados automaticamente
                />
                
                {/* Controle de Colunas */}
                <ColumnFilter 
                    visibleColumns={visibleColumns}
                    setVisibleColumns={onColumnsChange}
                />
                
                {/* Ações */}
                <button 
                    onClick={onExport}
                    className="p-2 text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    title="Exportar lista"
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                
                <button 
                    onClick={onAddParticipant}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
                >
                    <UserPlusIcon className="h-4 w-4" /> 
                    Adicionar
                </button>
            </div>
        </div>
    );
};