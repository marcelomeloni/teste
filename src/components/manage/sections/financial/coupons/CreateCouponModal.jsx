import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import FormSelect from './FormSelect';
import FormInput from './FormInput';
import { mockTiers } from './constants';

const CreateCouponModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        code: '',
        type: 'fixed',
        value: '',
        expiry: 'limit',
        limit: 'unlimited',
        validFor: 'all',
        perTierValues: {}
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTierValueChange = (tierName, value) => {
        setFormData(prev => ({
            ...prev,
            perTierValues: {
                ...prev.perTierValues,
                [tierName]: value
            }
        }));
    };

    const showPerTierPricing = formData.validFor === 'per-tier';
    const showSingleValueField = formData.validFor !== 'per-tier';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-6 overflow-y-auto">
            <div 
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">
                        Criar cupom de desconto
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Formulário */}
                <div className="p-6 space-y-5">
                    <FormInput
                        label="CÓDIGO DO CUPOM*"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Insira um código para este cupom (ex.: CUPOM50VIP)"
                        helpText
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormSelect
                            label="TIPO*"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            options={[
                                { value: 'fixed', label: 'Valor em reais' },
                                { value: 'percentage', label: 'Porcentagem (%)' }
                            ]}
                        />
                        
                        {showSingleValueField && (
                            <FormInput
                                label="VALOR DO DESCONTO*"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                placeholder="Insira o valor do cupom"
                                type="number"
                            />
                        )}
                    </div>

                    <FormSelect
                        label="ENCERRAMENTO DESTE CUPOM*"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        options={[
                            { value: 'limit', label: 'Quando esgotarem os cupons' },
                            { value: 'date', label: 'Em uma data específica' }
                        ]}
                    />

                    <FormSelect
                        label="LIMITE DE CUPONS*"
                        name="limit"
                        value={formData.limit}
                        onChange={handleChange}
                        options={[
                            { value: 'unlimited', label: 'Não limitado' },
                            { value: 'custom', label: 'Definir limite' }
                        ]}
                    />

                    <FormSelect
                        label="CUPOM VÁLIDO PARA QUAIS INGRESSOS?*"
                        name="validFor"
                        value={formData.validFor}
                        onChange={handleChange}
                        options={[
                            { value: 'all', label: 'Todos os tipos os ingressos' },
                            { value: 'per-tier', label: 'Valores diferentes para cada tipo de ingresso' },
                            { value: 'specific', label: 'Apenas para ingressos específicos' }
                        ]}
                    />

                    <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        {showAdvanced ? <Minus size={16} /> : <Plus size={16} />}
                        {showAdvanced ? 'Esconder opções avançadas' : 'Mostrar opções avançadas'}
                    </button>

                    {showPerTierPricing && (
                        <div className="pt-4 space-y-4 border-t border-slate-200">
                            <h4 className="text-md font-semibold text-slate-800">
                                Valores diferentes para cada tipo de ingresso
                            </h4>
                            {mockTiers.map(tierName => (
                                <div key={tierName} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <FormInput
                                        label="TIPO DO INGRESSO"
                                        name={`tier_${tierName}`}
                                        value={tierName}
                                        onChange={() => {}}
                                        type="text"
                                        disabled
                                    />
                                    <FormInput
                                        label="VALOR"
                                        name={`value_${tierName}`}
                                        value={formData.perTierValues[tierName] || ''}
                                        onChange={(e) => handleTierValueChange(tierName, e.target.value)}
                                        placeholder="Valor do cupom para este tipo"
                                        type="number"
                                        helpText
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                    <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700">
                        Criar Cupom
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCouponModal;