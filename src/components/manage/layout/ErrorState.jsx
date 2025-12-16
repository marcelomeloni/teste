import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export function ErrorState({ type, error, eventAddress }) {
    if (type === 'auth') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20 max-w-2xl mx-auto">
                    <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Autenticação Necessária</h2>
                    <p className="text-slate-600 mb-6">Conecte uma carteira ou faça login para gerenciar eventos.</p>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                Fazer Login
                            </Link>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Conectar Wallet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center py-20 max-w-2xl mx-auto">
                <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Erro ao Carregar Evento</h2>
                <p className="text-slate-600 mb-6">{error || "Evento não encontrado ou sem permissão."}</p>
                <Link to="/create-event" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Voltar para Meus Eventos
                </Link>
            </div>
        </div>
    );
}