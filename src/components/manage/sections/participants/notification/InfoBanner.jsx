import { Link } from 'lucide-react';

export function InfoBanner() {
    return (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex gap-3 mb-6">
            <Link size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">
                Utilize esta funcionalidade para enviar e-mails aos <strong>participantes do evento</strong>. 
                
            </p>
        </div>
    );
}