import { InfoBanner } from './notification/InfoBanner';
import { EmailConfigForm } from './notification/EmailConfigForm';
import { EmailPreview } from './notification/EmailPreview';
import { useState } from 'react';

export function SendNotification({ event, metadata }) {
    const eventData = event?.data || event;
    
    const organizer = eventData?.metadata?.properties?.organizer || {
        name: 'Organizador não definido',
        email: 'email@exemplo.com'
    };

    const eventName = eventData?.name || 'Evento sem nome';

    const [emailData, setEmailData] = useState({
        subject: '',
        message: '',
        filters: [
            { 
                type: 'payment', 
                value: 'confirmed', 
                label: 'Pagamento do pedido',
                displayValue: 'Confirmado'
            }
        ]
    });

    const updateEmailData = (field, value) => {
        setEmailData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Função para adicionar filtro
    const addFilter = (newFilter) => {
        setEmailData(prev => ({
            ...prev,
            filters: [...prev.filters, newFilter]
        }));
    };

    const removeFilter = (index) => {
        setEmailData(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };

    const handleSendEmail = () => {
        console.log('Enviando email:', emailData);
        alert('Email enviado com sucesso!');
    };

    const handleSaveDraft = () => {
        console.log('Salvando rascunho:', emailData);
        alert('Rascunho salvo!');
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <InfoBanner />

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Enviar email aos participantes
                </h1>
                <p className="text-slate-600 mb-6">
                    Comunique-se com os participantes do seu evento de forma profissional
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <EmailConfigForm 
                            organizer={organizer}
                            eventName={eventName}
                            emailData={emailData}
                            onUpdate={updateEmailData}
                            onAddFilter={addFilter}
                            onRemoveFilter={removeFilter}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <EmailPreview 
                            event={eventData}
                            organizer={organizer}
                            emailData={emailData}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        onClick={handleSaveDraft}
                        className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Salvar Rascunho
                    </button>
                    <button 
                        onClick={handleSendEmail}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Enviar para {emailData.filters.length} Participantes
                    </button>
                </div>
            </div>
        </div>
    );
}