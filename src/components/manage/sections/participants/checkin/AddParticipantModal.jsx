import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlusIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export const AddParticipantModal = ({ isOpen, onClose, onAddParticipant }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tier: 'free',
        price: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação básica
        if (!formData.name || !formData.email) {
            toast.error('Nome e email são obrigatórios');
            return;
        }
        onAddParticipant(formData);
        setFormData({ name: '', email: '', phone: '', tier: 'free', price: 0 });
        onClose();
    };

    const handleTierChange = (tier) => {
        setFormData(prev => ({
            ...prev,
            tier,
            price: tier === 'free' ? 0 : prev.price
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <UserPlusIcon className="h-6 w-6 text-blue-500" />
                            Adicionar Participante
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <XCircleIcon className="h-6 w-6 text-slate-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Digite o nome completo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Telefone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Tipo de Ingresso
                            </label>
                            <select
                                value={formData.tier}
                                onChange={(e) => handleTierChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            >
                                <option value="free">Grátis</option>
                                <option value="paid">Pago</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-500"
                                disabled={formData.tier === 'free'}
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600">
                            <strong>Observação:</strong> Participantes adicionados manualmente não terão NFTs associados e serão marcados como entrada manual no sistema.
                        </p>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <UserPlusIcon className="h-4 w-4" />
                        Adicionar Participante
                    </button>
                </div>
            </div>
        </div>
    );
};