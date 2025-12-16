import React from 'react';
import { useEventForm } from '@/contexts/EventFormContext'; // Ajuste o caminho se necessário
import { AnimatePresence, motion } from 'framer-motion';

// Ícones (sem alterações)
const Icons = {
  presential: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  online: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>,
  tbd: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};


export function LocationSection() {
  const { formData, setFormData, errors, setErrors, handleFormDataChange } = useEventForm();
  
  const platformOptions = ['YouTube', 'Zoom', 'Twitch', 'Microsoft Teams', 'Google Meet', 'Vimeo', 'Facebook Live', 'Instagram Live', 'Discord', 'Outra'];

  const handleLocationTypeChange = (type) => {
    const locationText = type === 'online' ? 'Evento Online' : type === 'tbd' ? 'Local a definir' : formData.location;
    setFormData(prev => ({ ...prev, locationType: type, location: locationText }));
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setErrors(prev => ({...prev, cep: "CEP não encontrado."}));
        return;
      }
      setErrors(prev => ({...prev, cep: undefined }));
      setFormData(prevData => ({
        ...prevData,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch (error) {
      setErrors(prev => ({...prev, cep: "Falha ao buscar o CEP."}));
    }
  };

  // Este useEffect agora também considera o `venueName` ao montar a string `location`
  React.useEffect(() => {
    if (formData.locationType === 'presential') {
      const { venueName, street, number, neighborhood, city, state } = formData;
      const addressParts = [street, number, neighborhood, city, state].filter(Boolean).join(', ');
      
      // Concatena o nome do local com o endereço, se ambos existirem
      const fullLocation = [venueName, addressParts].filter(Boolean).join(' - ');
      
      if (fullLocation !== formData.location) {
        setFormData(prev => ({...prev, location: fullLocation}));
      }
    }
  }, [formData.venueName, formData.street, formData.number, formData.neighborhood, formData.city, formData.state, formData.locationType, formData.location, setFormData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-semibold">2</div>
        <h2 className="text-2xl font-bold text-slate-900">Onde o seu evento vai acontecer?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[{id: 'presential', label: 'Presencial', Icon: Icons.presential}, {id: 'online', label: 'Online', Icon: Icons.online}, {id: 'tbd', label: 'A definir', Icon: Icons.tbd}].map(option => (
          <div key={option.id} onClick={() => handleLocationTypeChange(option.id)}
            className={`cursor-pointer p-4 border-2 rounded-xl flex items-center gap-4 transition-all duration-200 ${
              formData.locationType === option.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-slate-50 border-transparent hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${formData.locationType === option.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <option.Icon className="w-6 h-6" />
            </div>
            <span className={`font-semibold ${formData.locationType === option.id ? 'text-indigo-800' : 'text-slate-700'}`}>{option.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {formData.locationType === 'presential' && (
          <motion.div key="presential" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              
              {/* ✅ NOVO CAMPO: NOME DO LOCAL */}
              <div className="md:col-span-6">
                <label htmlFor="venueName" className="block text-sm font-medium text-slate-700 mb-1">Nome do Local (Opcional)</label>
                <input type="text" id="venueName" name="venueName" value={formData.venueName || ''} onChange={handleFormDataChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" 
                />
              </div>

              {/* Campos de endereço existentes */}
              <div className="md:col-span-2"><label htmlFor="cep" className="block text-sm font-medium text-slate-700 mb-1">CEP*</label><input type="text" id="cep" name="cep" value={formData.cep || ''} onChange={handleFormDataChange} onBlur={handleCepBlur} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="00000-000" maxLength="9"/>{errors.cep && <p className="text-red-600 text-sm mt-1">{errors.cep}</p>}</div>
              <div className="md:col-span-4"><label htmlFor="street" className="block text-sm font-medium text-slate-700 mb-1">Rua / Logradouro*</label><input type="text" id="street" name="street" value={formData.street || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/></div>
              <div className="md:col-span-2"><label htmlFor="number" className="block text-sm font-medium text-slate-700 mb-1">Número*</label><input type="text" id="number" name="number" value={formData.number || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/></div>
              <div className="md:col-span-4"><label htmlFor="complement" className="block text-sm font-medium text-slate-700 mb-1">Complemento</label><input type="text" id="complement" name="complement" value={formData.complement || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="Apto, Bloco, etc."/></div>
              <div className="md:col-span-2"><label htmlFor="neighborhood" className="block text-sm font-medium text-slate-700 mb-1">Bairro*</label><input type="text" id="neighborhood" name="neighborhood" value={formData.neighborhood || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/></div>
              <div className="md:col-span-3"><label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">Cidade*</label><input type="text" id="city" name="city" value={formData.city || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/></div>
              <div className="md:col-span-1"><label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">Estado*</label><input type="text" id="state" name="state" value={formData.state || ''} onChange={handleFormDataChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" maxLength="2"/></div>
            </div>
          </motion.div>
        )}

        {formData.locationType === 'online' && (
          <motion.div key="online" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="space-y-6 bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900">Configurações do Evento Online</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="onlinePlatform" className="block text-sm font-semibold text-slate-700 mb-2">Plataforma de transmissão *</label>
                  <select id="onlinePlatform" name="onlinePlatform" value={formData.onlinePlatform || ''} onChange={handleFormDataChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Selecionar plataforma</option>
                    {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="onlineEventLink" className="block text-sm font-semibold text-slate-700 mb-2">Link para acesso ao evento *</label>
                  <input type="url" id="onlineEventLink" name="onlineEventLink" value={formData.onlineEventLink || ''} onChange={handleFormDataChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="https://"/>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {formData.locationType === 'tbd' && (
          <motion.div key="tbd" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800">Local a ser definido</h3>
              <p className="text-yellow-700">Você poderá adicionar a localização exata posteriormente.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}