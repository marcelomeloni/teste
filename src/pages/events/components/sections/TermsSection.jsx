import React from 'react';
// 1. Importe o hook do seu contexto
import { useEventForm } from '@/contexts/EventFormContext'; // Ajuste o caminho se necessário

// 2. Remova as props da assinatura da função
export function TermsSection() {
  // 3. Obtenha o estado e a função de handler diretamente do contexto
  const { formData, errors, handleFormDataChange } = useEventForm();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-semibold">
          5
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Termos e Condições</h2>
      </div>
      
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          Aceitar os termos de responsabilidade
        </h3>
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              // 4. Conecte o 'checked' e o 'onChange' ao estado e handler do contexto
              checked={formData.termsAccepted}
              onChange={handleFormDataChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label htmlFor="termsAccepted" className="text-slate-600 cursor-pointer">
              Ao criar o evento, aceito os{' '}
              <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                termos e condições de uso
              </a>
              , bem como a{' '}
              <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                política de privacidade e cookies
              </a>
              {' '}da Ticketfy
            </label>
          </div>
        </div>
        {/* O display de erro agora também usa os 'errors' do contexto */}
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>
    </div>
  );
}