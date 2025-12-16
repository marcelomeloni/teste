import {
    EnvelopeIcon,
    TicketIcon,
    CalendarDaysIcon,
    PhoneIcon,
    EyeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    CheckBadgeIcon,
    XCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { TableRowSkeleton } from './TableRowSkeleton';
import { formatDate, formatPrice, truncateAddress, getInitials } from '@/lib/participantHelpers';

export const ParticipantCheckinTable = ({
    participants,
    isLoading,
    onViewDetails,
    onCheckIn,
    visibleColumns,
    onToggleFavorite
}) => {
    const renderPaymentStatus = (participant) => {
        const isPaid = participant.price_brl_cents > 0 && participant.status === 'confirmed';
        
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPaid ? 'bg-green-100 text-green-800' : 
                participant.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {isPaid ? <CheckCircleIcon className="h-3 w-3" /> : 
                 participant.status === 'confirmed' ? <CheckCircleIcon className="h-3 w-3" /> : <ClockIcon className="h-3 w-3" />}
                {isPaid ? 'Pago' : participant.status === 'confirmed' ? 'Confirmado' : participant.status}
            </span>
        );
    };

    const renderStatusBadge = (status, textTrue, textFalse, IconTrue, IconFalse) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
        }`}>
            {status ? <IconTrue className="h-3 w-3" /> : <IconFalse className="h-3 w-3" />}
            {status ? textTrue : textFalse}
        </span>
    );

    if (isLoading) {
        return (
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {visibleColumns.participant && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Participante</th>}
                        {visibleColumns.email && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                        {visibleColumns.ticket && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresso</th>}
                        {visibleColumns.purchase && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compra</th>}
                        {visibleColumns.payment && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Pagto</th>}
                        {visibleColumns.value && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>}
                        {visibleColumns.checkin && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in</th>}
                        {visibleColumns.nft && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NFT Mint</th>}
                        {visibleColumns.actions && <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {[...Array(5)].map((_, i) => (
                        <TableRowSkeleton 
                            key={i} 
                            columns={Object.values(visibleColumns).filter(Boolean).length} 
                        />
                    ))}
                </tbody>
            </table>
        );
    }

    if (!participants || participants.length === 0) {
        return (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-b-lg">
                <TicketIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold">Nenhum ingresso vendido ainda.</p>
                <p className="text-sm">Compartilhe seu evento para começar a vender!</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto align-middle inline-block min-w-full">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {visibleColumns.participant && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Participante</th>}
                        {visibleColumns.email && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                        {visibleColumns.ticket && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresso</th>}
                        {visibleColumns.purchase && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compra</th>}
                        {visibleColumns.payment && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Pagto</th>}
                        {visibleColumns.value && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>}
                        {visibleColumns.checkin && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in</th>}
                        {visibleColumns.nft && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NFT Mint</th>}
                        {visibleColumns.actions && <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                            {/* Participante */}
                            {visibleColumns.participant && (
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onToggleFavorite(participant.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                                            title="Marcar como favorito"
                                        >
                                            <StarIcon className={`h-4 w-4 ${
                                                onToggleFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300'
                                            }`} />
                                        </button>
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {getInitials(participant.user?.name)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">
                                                {participant.user?.name || 'Nome não informado'}
                                            </div>
                                            {participant.user?.phone_number && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <PhoneIcon className="h-3 w-3" />
                                                    {participant.user.phone_number}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            )}

                            {/* Email */}
                            {visibleColumns.email && (
                                <td className="p-4 whitespace-nowrap text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                                        {participant.user?.email || 'Email não informado'}
                                    </div>
                                </td>
                            )}

                            {/* Ingresso */}
                            {visibleColumns.ticket && (
                                <td className="p-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        participant.price_brl_cents === 0 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        <TicketIcon className="h-3 w-3" />
                                        {participant.tier_name || 'Tipo não especificado'}
                                    </span>
                                </td>
                            )}

                            {/* Compra */}
                            {visibleColumns.purchase && (
                                <td className="p-4 whitespace-nowrap text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                                        {formatDate(participant.purchase_date)}
                                    </div>
                                </td>
                            )}

                            {/* Status Pagto */}
                            {visibleColumns.payment && (
                                <td className="p-4 whitespace-nowrap">
                                    {renderPaymentStatus(participant)}
                                </td>
                            )}

                            {/* Valor */}
                            {visibleColumns.value && (
                                <td className="p-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${
                                        participant.price_brl_cents === 0 ? 'text-green-600' : 'text-slate-900'
                                    }`}>
                                        {formatPrice(participant.price_brl_cents)}
                                    </div>
                                </td>
                            )}

                            {/* Check-in */}
                            {visibleColumns.checkin && (
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        {renderStatusBadge(
                                            participant.is_redeemed, 
                                            'Realizado', 
                                            'Pendente', 
                                            CheckBadgeIcon, 
                                            XCircleIcon
                                        )}
                                        {participant.is_redeemed && participant.redeemed_at && (
                                            <span className="text-xs text-slate-400">
                                                {formatDate(participant.redeemed_at)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            )}

                            {/* NFT Mint */}
                            {visibleColumns.nft && (
                                <td 
                                    className="p-4 whitespace-nowrap text-sm text-slate-600 font-mono" 
                                    title={participant.nft_mint_address}
                                >
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="h-4 w-4 text-purple-500" />
                                        {truncateAddress(participant.nft_mint_address)}
                                    </div>
                                </td>
                            )}

                            {/* Ações */}
                            {visibleColumns.actions && (
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(participant)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Ver detalhes"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        
                                        {!participant.is_redeemed && (
                                            <button
                                                onClick={() => onCheckIn(participant.id)}
                                                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                Check-in
                                            </button>
                                        )}
                                        
                                        {participant.is_redeemed && (
                                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 border border-green-200 rounded-lg">
                                                ✅ Check-in
                                            </span>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};