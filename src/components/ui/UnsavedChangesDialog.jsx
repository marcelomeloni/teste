// Em algum lugar como /components/ui/UnsavedChangesDialog.jsx

import { AlertTriangle, Save, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function UnsavedChangesDialog({
  toastId,
  onSaveAndPublish,
  onPublishAnyway,
  onCancel,
}) {
  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Você possui alterações não salvas!
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Para garantir que a versão mais recente seja publicada, recomendamos salvar primeiro.
            </p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={onSaveAndPublish}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar e Publicar
              </button>
              <button
                onClick={onPublishAnyway}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <Send className="h-4 w-4 mr-2" />
                Publicar Sem Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={onCancel}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}