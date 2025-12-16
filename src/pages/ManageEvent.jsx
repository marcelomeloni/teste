// pages/ManageEvent.jsx - VERSÃO CORRIGIDA
import React from 'react';
import { useManageEvent } from '@/hooks/useManageEvent';
import { LoadingState } from '@/components/manage/layout/LoadingState';
import { ErrorState } from '@/components/manage/layout/ErrorState';
import { EventHeader } from '@/components/manage/layout/EventHeader';
import { EventSidebar } from '@/components/manage/layout/EventSidebar';
import { MainContent } from '@/components/manage/layout/MainContent';

export function ManageEvent() {
    const {
        event,
        metadata,
        loading,
        error,
        activeAuth,
        authLoading,
        activeSection,
        setActiveSection,
        eventAddress,
        retry
    } = useManageEvent();

    console.log('🏠 ManageEvent - Estado:', {
        loading,
        error,
        event: !!event,
        activeAuth,
        activeSection,
        authLoading
    });

    // 🔄 Loading State
    if (loading || authLoading) {
        return <LoadingState eventAddress={eventAddress} />;
    }

    // ❌ Error State
    if (error) {
        return (
            <ErrorState 
                error={error} 
                eventAddress={eventAddress}
                onRetry={retry}
                authType={activeAuth.type}
                showConnectButton={!activeAuth.connected}
                showLoginButton={!activeAuth.connected}
            />
        );
    }

    // 🔐 Auth Required State
    if (!activeAuth.connected) {
        return (
            <ErrorState 
                error="Para gerenciar eventos, faça login ou conecte sua carteira"
                eventAddress={eventAddress}
                onRetry={retry}
                authType="none"
                showConnectButton={true}
                showLoginButton={true}
            />
        );
    }

    // 📊 Main Content
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <div className="lg:w-80 lg:min-h-screen bg-white border-r border-slate-200">
                    <EventSidebar 
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        event={event}
                        authType={activeAuth.type}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <EventHeader 
                        event={event}
                        metadata={metadata}
                        authType={activeAuth.type}
                        publicKey={activeAuth.publicKey}
                    />
                    
                    <MainContent 
                        activeSection={activeSection}
                        event={event}
                        metadata={metadata}
                        eventAddress={eventAddress}
                    />
                </div>
            </div>
        </div>
    );
}