import { 
    XCircleIcon, 
    UserCircleIcon, 
    TicketIcon, 
    ListBulletIcon, 
    SparklesIcon,
    PhoneIcon, ClockIcon 
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { formatDate, truncateAddress, getInitials, formatPrice } from '@/lib/participantHelpers';

export const ParticipantDetailsModal = ({ participant, isOpen, onClose, onCheckIn }) => {
    if (!isOpen || !participant) return null;

    const user = participant.user || {};
    const responses = participant.responses || {};
    const isPaid = participant.price_brl_cents > 0 && participant.status === 'confirmed';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {getInitials(user.name)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{user.name || 'Nome não informado'}</h2>
                                <p className="text-slate-600">{user.email || 'Email não informado'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <XCircleIcon className="h-6 w-6 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <UserCircleIcon className="h-5 w-5 text-blue-500" />
                                Informações Pessoais
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Telefone:</span> {user.phone_number || 'Não informado'}</p>
                                <p><span className="font-medium">Wallet:</span> {truncateAddress(user.wallet_address, 8)}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <TicketIcon className="h-5 w-5 text-green-500" />
                                Informações do Ingresso
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Tipo:</span> {participant.tier_name}</p>
                                <p><span className="font-medium">Valor:</span> {formatPrice(participant.price_brl_cents)}</p>
                                <p><span className="font-medium">Status:</span> 
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        isPaid ? 'bg-green-100 text-green-800' : 
                                        participant.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {isPaid ? 'Pago' : participant.status === 'confirmed' ? 'Confirmado' : participant.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Check-in Status */}
                    <div className={`p-4 rounded-lg ${
                        participant.is_redeemed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {participant.is_redeemed ? (
                                    <CheckBadgeIcon className="h-8 w-8 text-green-600" />
                                ) : (
                                    <ClockIcon className="h-8 w-8 text-orange-600" />
                                )}
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {participant.is_redeemed ? 'Check-in Realizado' : 'Aguardando Check-in'}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {participant.is_redeemed 
                                            ? `Realizado em ${formatDate(participant.redeemed_at)}`
                                            : 'O participante ainda não fez check-in'
                                        }
                                    </p>
                                </div>
                            </div>
                            {!participant.is_redeemed && (
                                <button
                                    onClick={() => onCheckIn(participant.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Realizar Check-in
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Form Responses */}
                    {Object.keys(responses).length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <ListBulletIcon className="h-5 w-5 text-purple-500" />
                                Respostas do Formulário
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(responses).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                        <span className="font-medium text-slate-700 capitalize">
                                            {key.replace('field-', 'Campo ').replace(/-/g, ' ')}:
                                        </span>
                                        <p className="text-slate-900 mt-1">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Details */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-blue-500" />
                            Detalhes Técnicos
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">NFT Mint:</span> 
                                <code className="ml-2 bg-slate-200 px-2 py-1 rounded text-xs font-mono">
                                    {participant.nft_mint_address}
                                </code>
                            </p>
                            <p><span className="font-medium">Ticket PDA:</span> 
                                <code className="ml-2 bg-slate-200 px-2 py-1 rounded text-xs font-mono">
                                    {participant.ticket_pda_address}
                                </code>
                            </p>
                            <p><span className="font-medium">Data da Compra:</span> {formatDate(participant.purchase_date)}</p>
                            <p><span className="font-medium">Status da Transação:</span> 
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    participant.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {participant.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(participant, null, 2));
                            toast.success('Dados copiados para a área de transferência!');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Copiar Dados
                    </button>
                </div>
            </div>
        </div>
    );
};