// components/ConfirmationModal.jsx
import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, member }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
            Remover Membro
          </h3>
          <p className="text-sm text-slate-600 text-center mb-2">
            Tem certeza que deseja remover <strong>{member.name}</strong> da equipe?
          </p>
          <p className="text-xs text-slate-500 text-center">
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Manter Membro
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};