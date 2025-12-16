// sections/OrganizerSection.jsx
import { useEventForm } from '@/contexts/EventFormContext';

export function OrganizerSection() {
  const { formData, errors, handleFormDataChange } = useEventForm();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-semibold">
          4
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Organizador</h2>
      </div>
      
      <div className="space-y-6">
        {/* Campo: Nome da empresa / organização responsável */}
        <div>
          <label htmlFor="organizerName" className="block text-sm font-medium text-slate-700 mb-1">
            Nome da empresa / organização responsável*
          </label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName || ''}
            onChange={handleFormDataChange}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      
          />
          {errors.organizerName && <p className="mt-1 text-sm text-red-600">{errors.organizerName}</p>}
        </div>

        {/* Campo: E-mail para contato */}
        <div>
          <label htmlFor="organizerEmail" className="block text-sm font-medium text-slate-700 mb-1">
            E-mail para contato*
          </label>
          <input
            type="email"
            id="organizerEmail"
            name="organizerEmail"
            value={formData.organizerEmail || ''}
            onChange={handleFormDataChange}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="seu@email.com"
          />
          {errors.organizerEmail && <p className="mt-1 text-sm text-red-600">{errors.organizerEmail}</p>}
        </div>

        {/* Campo: Descrição da empresa / organização */}
        <div>
          <label htmlFor="organizerDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Descrição da empresa / organização responsável
          </label>
          <textarea
            id="organizerDescription"
            name="organizerDescription"
            rows={4}
            value={formData.organizerDescription || ''}
            onChange={handleFormDataChange}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Fale um pouco sobre sua empresa ou organização..."
          />
          {errors.organizerDescription && <p className="mt-1 text-sm text-red-600">{errors.organizerDescription}</p>}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-6">
        Obs.: após a criação do evento você poderá <strong>editar</strong> ou ainda <strong>adicionar mais dados</strong> ao seu perfil de organizador, tais como um logotipo, redes sociais e também criar uma página contando todos os seus eventos. <a href="#" className="text-indigo-600 hover:underline font-semibold">Clique aqui</a> para saber mais.
      </p>
    </div>
  );
}