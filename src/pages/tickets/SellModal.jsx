import { useState } from 'react';

export function SellModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [price, setPrice] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(parseFloat(price));
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Listar Ingresso no Marketplace</h2>
        <p className="text-slate-600 mb-6">Defina o preço em TFY para o seu ingresso no marketplace.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700">Preço (TFY)</label>
          <input 
            type="number" 
            id="price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            placeholder="Ex: 0.5" 
            step="0.01" 
            min="0.01" 
            required 
          />
          <div className="mt-6 flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Listando..." : "Listar no Marketplace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}