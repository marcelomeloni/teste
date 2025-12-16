import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function UnauthenticatedState({ onConnectWallet, onLogin }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
        <div className="text-yellow-600 mb-4">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
        <p className="text-gray-600 mb-6">
          Faça login ou conecte sua carteira para visualizar seus ingressos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onConnectWallet}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            Conectar Wallet
          </button>
          <button
            onClick={onLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Fazer Login
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Acesse seus ingressos adquiridos com qualquer método de autenticação
        </p>
      </div>
    </div>
  );
}