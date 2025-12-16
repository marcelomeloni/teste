import { 
    CheckBadgeIcon, 
    CurrencyDollarIcon, 
    CheckCircleIcon, 
    ListBulletIcon 
} from '@heroicons/react/24/outline';

export const StatsCards = ({ stats, onClearCheckins, onExport }) => {
    const { redeemedCount, totalCount, percentage, paidCount, freeCount, confirmedCount } = stats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Check-in Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">Check-in</h3>
                    <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{redeemedCount}<span className="text-lg font-normal text-slate-500">/{totalCount}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{percentage}% realizado</p>
            </div>

            {/* Pagamentos Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">Pagamentos</h3>
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{paidCount}</div>
                <p className="text-xs text-slate-500 mt-2">{freeCount} ingressos grátis</p>
            </div>

            {/* Status Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">Confirmados</h3>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{confirmedCount}</div>
                <p className="text-xs text-slate-500 mt-2">{totalCount - confirmedCount} pendentes</p>
            </div>

      
        </div>
    );
};