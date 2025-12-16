// src/components/event/sections/TicketModal.jsx
import { useState, useEffect, useRef } from 'react';

export function TicketModal({ 
  isOpen, 
  onClose, 
  modalType, 
  editingTicket, 
  onTicketCreated,
  existingTickets = [],
  eventEndDate,
  userPlatformFee = 1000, // Recebe como prop do componente pai
  loadingFee = false // Recebe como prop do componente pai
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: modalType,
    quantity: 100,
    price: 0,
    availability: 'public',
    allowTransfer: 'yes',
    saleStartType: 'date',
    saleStartDate: '',
    saleEndDate: '',
    saleStartBatch: '',
    minPerPurchase: 1,
    maxPerPurchase: 5
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableBatches, setAvailableBatches] = useState([]);

  // Filtra os lotes disponíveis para seguir
  useEffect(() => {
    if (existingTickets.length > 0) {
      const filteredBatches = existingTickets.filter(ticket => 
        !editingTicket || ticket.id !== editingTicket.id
      );
      setAvailableBatches(filteredBatches);
    } else {
      setAvailableBatches([]);
    }
  }, [existingTickets, editingTicket]);

  // Reset form quando modalType muda ou quando editingTicket muda
  useEffect(() => {
    if (editingTicket) {
      setFormData(editingTicket);
      
      if (editingTicket.saleStartType === 'batch' && availableBatches.length === 0) {
        setFormData(prev => ({
          ...prev,
          saleStartType: 'date',
          saleStartBatch: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        type: modalType,
        price: modalType === 'free' ? 0 : prev.price,
        name: '',
        quantity: 100,
        saleStartType: availableBatches.length > 0 ? prev.saleStartType : 'date',
        saleStartBatch: ''
      }));
    }
  }, [modalType, editingTicket, availableBatches.length]);

  // Formatação do preço para exibição
  const formatCurrencyDisplay = (value) => {
    if (!value) return '0,00';
    return parseFloat(value).toFixed(2).replace('.', ',');
  };

  // Formatação do preço para cálculo
  const parseCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return parseFloat(numericValue) / 100;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePriceChange = (value) => {
    const price = parseCurrency(value);
    setFormData(prev => ({
      ...prev,
      price: isNaN(price) ? 0 : price
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome do ingresso é obrigatório';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que zero';
    if (formData.type === 'paid' && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.saleStartType === 'date') {
      if (!formData.saleStartDate) newErrors.saleStartDate = 'Data de início é obrigatória';
      if (!formData.saleEndDate) newErrors.saleEndDate = 'Data de término é obrigatória';
      
      if (formData.saleStartDate && formData.saleEndDate) {
        const startDate = new Date(formData.saleStartDate);
        const endDate = new Date(formData.saleEndDate);
        
        if (endDate <= startDate) {
          newErrors.saleEndDate = 'Data de término deve ser após a data de início';
        }
        
        const now = new Date();
        if (startDate < now) {
          newErrors.saleStartDate = 'Data de início não pode ser no passado';
        }
      }
      if (formData.saleEndDate && eventEndDate) {
        const saleEnd = new Date(formData.saleEndDate);
        const eventEnd = new Date(eventEndDate);
        
        if (saleEnd > eventEnd) {
          newErrors.saleEndDate = 'A data de término das vendas não pode ser após o fim do evento.';
        }
      }
    }

    if (formData.saleStartType === 'batch') {
      if (!formData.saleStartBatch) {
        newErrors.saleStartBatch = 'Selecione um lote para seguir';
      } else {
        const selectedBatchExists = availableBatches.some(batch => batch.id === formData.saleStartBatch);
        if (!selectedBatchExists) {
          newErrors.saleStartBatch = 'Lote selecionado não está mais disponível';
        }
      }
    }

    if (formData.minPerPurchase <= 0) newErrors.minPerPurchase = 'Mínimo deve ser maior que zero';
    if (formData.maxPerPurchase <= 0) newErrors.maxPerPurchase = 'Máximo deve ser maior que zero';
    if (formData.maxPerPurchase < formData.minPerPurchase) {
      newErrors.maxPerPurchase = 'Máximo não pode ser menor que o mínimo';
    }
    if (formData.maxPerPurchase > formData.quantity) {
      newErrors.maxPerPurchase = 'Máximo por compra não pode ser maior que a quantidade total';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        ...formData,
        saleStartBatch: formData.saleStartType === 'batch' ? formData.saleStartBatch : ''
      };
      onTicketCreated(submitData);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Cálculo da taxa DO USUÁRIO
  const platformFeePercentage = userPlatformFee / 100; // Converte bps para porcentagem
  const platformFeeAmount = formData.type === 'paid' ? formData.price * (platformFeePercentage / 100) : 0;
  const youReceive = formData.type === 'paid' ? formData.price - platformFeeAmount : 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingTicket ? 'Editar ingresso' : 'Criar tipo de ingresso'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome do ingresso *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Ex: Lote Promocional"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo de ingresso *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
              >
                <option value="free">Grátis</option>
                <option value="paid">Pago</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                min="1"
              />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Preço {formData.type === 'paid' && '*'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">R$</span>
                <input
                  type="text"
                  value={formatCurrencyDisplay(formData.price)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={formData.type === 'free'}
                  className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    formData.type === 'free' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                  placeholder="0,00"
                />
              </div>
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            {formData.type === 'paid' && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Preço do ingresso:</span>
                  <span className="font-semibold">R$ {formatCurrencyDisplay(formData.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Taxa da plataforma ({platformFeePercentage.toFixed(2)}%):
                    {loadingFee ? (
                      <span className="text-xs text-blue-600 ml-2">carregando sua taxa...</span>
                    ) : (
                      <span className="text-xs text-green-600 ml-2">sua taxa personalizada</span>
                    )}
                  </span>
                  <span className="text-slate-600">R$ {formatCurrencyDisplay(platformFeeAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-800 font-semibold">Você recebe:</span>
                  <span className="text-green-600 font-semibold">R$ {formatCurrencyDisplay(youReceive)}</span>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span className="font-semibold text-slate-700">Configurações avançadas</span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    showAdvanced ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="space-y-6 mt-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Disponibilidade do ingresso *
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                    >
                      <option value="public">Todo o público</option>
                      <option value="members">Apenas membros</option>
                      <option value="invite">Apenas com convite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Permitir troca de titularidade? *
                    </label>
                    <select
                      value={formData.allowTransfer}
                      onChange={(e) => handleInputChange('allowTransfer', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                    >
                      <option value="yes">Sim</option>
                      <option value="no">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Início de vendas deste ingresso *
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="saleStartType"
                          value="date"
                          checked={formData.saleStartType === 'date'}
                          onChange={(e) => handleInputChange('saleStartType', e.target.value)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700">Por data</span>
                      </label>
                      
                      {formData.saleStartType === 'date' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                          <div>
                            <label className="block text-sm text-slate-600 mb-2">Data de início</label>
                            <input
                              type="datetime-local"
                              value={formData.saleStartDate}
                              onChange={(e) => handleInputChange('saleStartDate', e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.saleStartDate && <p className="text-red-600 text-sm mt-1">{errors.saleStartDate}</p>}
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-2">Data de término</label>
                            <input
                              type="datetime-local"
                              value={formData.saleEndDate}
                              onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.saleEndDate && <p className="text-red-600 text-sm mt-1">{errors.saleEndDate}</p>}
                          </div>
                        </div>
                      )}

                      <label className={`flex items-center space-x-3 ${
                        availableBatches.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                        <input
                          type="radio"
                          name="saleStartType"
                          value="batch"
                          checked={formData.saleStartType === 'batch'}
                          onChange={(e) => {
                            if (availableBatches.length > 0) {
                              handleInputChange('saleStartType', e.target.value);
                            }
                          }}
                          disabled={availableBatches.length === 0}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700">
                          Após lote {availableBatches.length === 0 && '(crie um lote primeiro)'}
                        </span>
                      </label>
                      
                      {formData.saleStartType === 'batch' && availableBatches.length > 0 && (
                        <div className="ml-7">
                          <label className="block text-sm text-slate-600 mb-2">
                            Iniciar vendas quando este lote esgotar:
                          </label>
                          <select
                            value={formData.saleStartBatch}
                            onChange={(e) => handleInputChange('saleStartBatch', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            <option value="">Selecione um lote...</option>
                            {availableBatches.map((batch) => (
                              <option key={batch.id} value={batch.id}>
                                {batch.name} ({batch.quantity} ingressos)
                              </option>
                            ))}
                          </select>
                          {errors.saleStartBatch && <p className="text-red-600 text-sm mt-1">{errors.saleStartBatch}</p>}
                          
                          {formData.saleStartBatch && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-700">
                                <strong>Como funciona:</strong> As vendas deste lote começarão automaticamente 
                                quando o lote selecionado esgotar completamente.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {formData.saleStartType === 'batch' && availableBatches.length === 0 && (
                        <div className="ml-7 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-700">
                            <strong>⚠️ Crie um lote primeiro</strong><br/>
                            Para usar esta opção, você precisa criar pelo menos um tipo de ingresso antes.
                            As vendas deste lote começarão automaticamente quando o lote anterior esgotar.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mínimo por compra *
                      </label>
                      <input
                        type="number"
                        value={formData.minPerPurchase}
                        onChange={(e) => handleInputChange('minPerPurchase', parseInt(e.target.value) || 0)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        min="1"
                        max={formData.quantity}
                      />
                      {errors.minPerPurchase && <p className="text-red-600 text-sm mt-1">{errors.minPerPurchase}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Máximo por compra *
                      </label>
                      <input
                        type="number"
                        value={formData.maxPerPurchase}
                        onChange={(e) => handleInputChange('maxPerPurchase', parseInt(e.target.value) || 0)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        min="1"
                        max={formData.quantity}
                      />
                      {errors.maxPerPurchase && <p className="text-red-600 text-sm mt-1">{errors.maxPerPurchase}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
              >
                {editingTicket ? 'Atualizar ingresso' : 'Criar ingresso'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}