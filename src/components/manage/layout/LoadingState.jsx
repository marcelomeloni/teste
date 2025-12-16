import { Spinner } from '@/components/ui/Spinner';

export function LoadingState({ eventAddress, authType }) {
    return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-slate-600">Carregando evento...</p>
                <p className="text-sm text-slate-500 mt-2">Endereço: {eventAddress}</p>
                <p className="text-xs text-slate-400 mt-1">
                    Autenticação: {authType === 'wallet' ? 'Wallet Externa' : authType === 'auth' ? 'Login Local' : 'Nenhum'}
                </p>
            </div>
        </div>
    );
}