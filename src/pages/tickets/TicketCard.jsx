// components/tickets/TicketCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BN } from '@coral-xyz/anchor';

import { formatLocation } from '@/lib/ticketHelpers';
import { APP_BASE_URL } from '@/lib/constants';
import { SecureAccessModal } from './SecureAccessModal';
import {
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  ShareIcon,
  QrCodeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  TagIcon as TagIconSolid
} from '@heroicons/react/24/solid';

export function TicketCard({ 
  ticket, 
  isSubmitting, 
  onSellClick, 
  onCancelClick, 
  onRefundClick, 
  isCollection 
}) {
  const { account: ticketData, event: eventDetails, isListed } = ticket;
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!eventDetails) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[420px] p-6 flex flex-col justify-center items-center">
        <p className="text-slate-500">Não foi possível carregar os detalhes deste ingresso.</p>
      </div>
    );
  }
  
  const eventDate = new Date(eventDetails.metadata.properties?.dateTime?.start).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const location = formatLocation(eventDetails.metadata.properties?.location);
  const isEventCanceled = eventDetails.account?.canceled;
  
  // FIX: Added ', 16' to parse the hexadecimal string correctly
  const isFreeTicket = new BN(ticketData.pricePaidBrlCents, 16).toNumber() === 0;
  
  const certificateUrl = `${APP_BASE_URL}/certificate/${ticketData.nftMint.toString()}`;

  const getStatusInfo = () => {
    if (isEventCanceled) return { text: 'Evento Cancelado', color: 'bg-red-100 text-red-800 border border-red-200' };
    if (ticketData.redeemed) return { text: 'Utilizado', color: 'bg-slate-100 text-slate-800 border border-slate-200' };
    if (isListed) return { text: 'À Venda', color: 'bg-blue-100 text-blue-800 border border-blue-200' };
    return { text: 'Válido', color: 'bg-green-100 text-green-800 border border-green-200' };
  };

  const status = getStatusInfo();

  const renderEventCanceledActions = () => {
    if (isEventCanceled && isListed) {
      return (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-center text-orange-800 bg-orange-50 p-3 rounded-lg border border-orange-100">
            Retire o ingresso da venda para solicitar seu reembolso.
          </div>
          <button 
            onClick={onCancelClick} 
            disabled={isSubmitting} 
            className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2"
          >
            <XMarkIcon className="h-5 w-5"/>
            {isSubmitting ? 'Retirando...' : 'Retirar da Venda'}
          </button>
        </div>
      );
    }
    
    if (isEventCanceled && !isListed) {
      return (
        <button 
          onClick={onRefundClick} 
          disabled={isSubmitting || ticketData.redeemed} 
          className="mt-4 w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {ticketData.redeemed ? 'Ingresso já utilizado' : (isSubmitting ? 'Processando...' : 'Solicitar Reembolso')}
        </button>
      );
    }
    
    return null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100">
        {/* Secondary Actions Bar */}
        {!isEventCanceled && !ticketData.redeemed && (
          <div className="flex justify-end p-3 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              {/* Sell/Cancel Button */}
              <button
                onClick={isListed ? onCancelClick : onSellClick}
                disabled={ticketData.redeemed || isSubmitting}
                title={isListed ? 'Cancelar Venda' : 'Vender no Marketplace'}
                className={`p-2 rounded-lg transition ${isListed 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListed ? (
                  <TagIconSolid className="h-5 w-5 text-red-600" />
                ) : (
                  <TagIcon className="h-5 w-5" />
                )}
              </button>

              {/* Transfer Button */}
              <button
                onClick={() => toast.success('Funcionalidade em breve!')}
                disabled={ticketData.redeemed || isListed}
                title="Transferir"
                className="p-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Event Image with Status Badge */}
        <div className="relative">
          <Link to={`/event/${ticketData.event}`} className="block">
            <img 
              className={`h-48 w-full object-cover ${isEventCanceled ? 'filter grayscale opacity-80' : ''}`} 
              src={eventDetails.metadata.image} 
              alt={eventDetails.metadata.name} 
            />
          </Link>
          <div className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-semibold rounded-full ${status.color}`}>
            {status.text}
          </div>
        </div>

        {/* Event Details */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-tight">
            {eventDetails.metadata.name}
          </h3>
          
          <div className="space-y-3 text-slate-700 mb-4">
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{eventDate}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          {/* Dynamic Actions Section */}
          <div className="mt-auto pt-4 space-y-3">
            {/* Event Canceled Actions */}
            {renderEventCanceledActions()}

            {/* Primary Action Button - Acessar Ingresso/QR Code */}
            {!isEventCanceled && !isCollection && (
              <button
                onClick={() => {
                  if (!ticketData.redeemed) {
                    setIsModalOpen(true);
                  }
                }}
                disabled={ticketData.redeemed}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                  ticketData.redeemed
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                }`}
              >
                <QrCodeIcon className="h-5 w-5" />
                {ticketData.redeemed ? 'Ingresso Utilizado' : 'Acessar Ingresso'}
              </button>
            )}

            {/* Certificate Button for Free Tickets (only when used) */}
            {isFreeTicket && ticketData.redeemed && (
              <Link 
                to={certificateUrl} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition flex items-center justify-center gap-2"
              >
                <AcademicCapIcon className="h-5 w-5"/> 
                Ver Certificado
              </Link>
            )}

            {/* Free Ticket Not Used Message */}
            {isFreeTicket && !ticketData.redeemed && !isCollection && (
              <p className="text-xs text-center text-slate-500 px-2">
                Certificado disponível após check-in.
              </p>
            )}

            {/* Collection View Message */}
            {isCollection && (
              <p className="text-xs text-center text-slate-500 px-2 italic">
                Este ingresso faz parte de uma coleção
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Acesso Seguro */}
      <SecureAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={ticket}
        eventImage={eventDetails.metadata.image}
      />
    </>
  );
}