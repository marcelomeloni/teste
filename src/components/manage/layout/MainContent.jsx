import React from 'react';
import {
    EventInfo,
    EventTeam,
    RegistrationForm
} from '@/components/manage/sections';

import {
    FinancialPanel,
    SalesSummary,
    Coupons,
    CancellationRequests
} from '@/components/manage/sections/financial';

import {
    ParticipantsCheckin,
    SendNotification,
    Certificates
} from '@/components/manage/sections/participants';

export function MainContent({ activeSection, event, metadata, eventAddress }) {
    const renderContent = () => {
        switch (activeSection) {
            // Seções Gerais
            case 'event-info': return <EventInfo event={event} metadata={metadata} eventAddress={eventAddress}/>;
            case 'registration-form': return <RegistrationForm event={event} metadata={metadata} eventAddress={eventAddress}/>;
            case 'event-team': return <EventTeam event={event} metadata={metadata} eventAddress={eventAddress}/>;

            // Seções Financeiras
            case 'financial-panel': return <FinancialPanel event={event} metadata={metadata} eventAddress={eventAddress}/>;
            case 'sales-summary': return <SalesSummary event={event} metadata={metadata} eventAddress={eventAddress}/>;
            case 'coupons': return <Coupons event={event} metadata={metadata} eventAddress={eventAddress} />;
            case 'cancellation-requests': return <CancellationRequests event={event} metadata={metadata} eventAddress={eventAddress} />;

            // Seções de Participantes
            case 'participants-checkin': return <ParticipantsCheckin event={event} metadata={metadata} eventAddress={eventAddress} />;
            case 'send-notification': return <SendNotification event={event} metadata={metadata} eventAddress={eventAddress} />;
            case 'certificates': return <Certificates event={event} metadata={metadata} eventAddress={eventAddress} />;

            default: return <EventInfo event={event} metadata={metadata} eventAddress={eventAddress}/>;
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderContent()}
        </main>
    );
}