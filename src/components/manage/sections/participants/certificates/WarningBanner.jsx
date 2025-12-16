import { Info } from 'lucide-react';

export function WarningBanner() {
    return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex gap-3">
            <Info size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
                No momento, os certificados não serão gerados para os participantes. Para disponibilizá-los, 
                marque as opções desejadas acima (você poderá marcar mais de uma) e clique em "Atualizar".
            </p>
        </div>
    );
}