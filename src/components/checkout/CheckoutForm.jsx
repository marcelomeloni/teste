import React from 'react';

const CheckoutForm = ({ 
  eventData, 
  formData, 
  handleInputChange, 
  handleCheckboxGroupChange, 
  handleFormSubmit, 
  processing,
  isFree 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2">Preencha seus dados para os ingressos</h2>
      <p className="text-gray-600 mb-8">Os ingressos serão enviados para o e-mail informado</p>
      
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {eventData?.registration_form_fields?.map(field => (
            <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              {field.type === 'textarea' ? (
                <>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    value={formData[field.id] || ''}
                  />
                </>
              ) : field.type === 'select' ? (
                <>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    required={field.required}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    value={formData[field.id] || ''}
                  >
                    <option value="" disabled>{field.placeholder || 'Selecione uma opção'}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </>
              ) : field.type === 'checkbox' ? (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="flex flex-col gap-2 mt-2">
                    {field.options?.map(option => (
                      <div key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`${field.id}-${option}`}
                          className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                          onChange={(e) => handleCheckboxGroupChange(field.id, option, e.target.checked)}
                          checked={!!formData[field.id]?.[option]}
                        />
                        <label htmlFor={`${field.id}-${option}`} className="text-gray-700 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : field.type === 'terms' ? (
                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id={field.id}
                    required={field.required}
                    className="h-5 w-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                    checked={!!formData[field.id]}
                  />
                  <label htmlFor={field.id} className="block text-gray-700 text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.link && (
                      <a href={field.link} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1">
                        (ler termos)
                      </a>
                    )}
                  </label>
                </div>
              ) : (
                <>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    value={formData[field.id] || ''}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Processando...
            </div>
          ) : (
            `Continuar para ${isFree ? 'Confirmação' : 'Pagamento'}`
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;