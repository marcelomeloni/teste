import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/solid';

const EventFlyerTemplate = forwardRef(({ event }, ref) => {
  // --- 1. PREPARAÇÃO DOS DADOS ---
  const bannerImage = event?.image_url || event?.metadata?.bannerImage || '';
  const eventName = event?.name || 'Nome do Evento';
  
  // Link para o QR Code
  const eventId = event?.id || event?.eventAddress;
  const eventLink = `${window.location.origin}/event/${eventId}`;

  // Datas
  const startDate = event?.event_start_date ? new Date(event.event_start_date) : new Date();
  const day = startDate.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = startDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
  const time = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Localização
  const venueName = event?.location_name || event?.metadata?.properties?.location?.venueName || 'Local a definir';
  const city = event?.metadata?.properties?.location?.address?.city;
  const fullLocation = city ? `${venueName}, ${city}` : venueName;

  return (
    // Container Pai (Invisível na tela)
    <div style={{ position: 'absolute', top: 0, left: '-9999px' }}>
      
      {/* --- ÁREA DO CANVAS (1080x1920 - Story) --- */}
      <div 
        ref={ref}
        id="flyer-content"
        className="w-[1080px] h-[1920px] relative bg-slate-950 text-white overflow-hidden font-sans flex flex-col"
      >
        {/* =================================================================================
            BACKGROUND LAYER
           ================================================================================= */}
        <div className="absolute inset-0 z-0">
          {bannerImage && (
            <img 
              src={bannerImage} 
              alt="Background" 
              className="w-full h-full object-cover opacity-40 filter blur-xl scale-125"
              crossOrigin="anonymous" 
            />
          )}
          {/* Gradientes intensos para garantir leitura */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950" />
        </div>

        {/* =================================================================================
            CONTENT LAYER
           ================================================================================= */}
        <div className="relative z-10 h-full flex flex-col justify-between p-[60px]">
          
          {/* --- HEADER --- */}
          <div className="flex justify-between items-start pt-10">
            {/* Logo Ticketfy (AUMENTADO) */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-5 rounded-full flex items-center gap-5 shadow-2xl">
                {/* Logo aumentada para h-12 */}
                <img src="/logo.png" alt="Ticketfy" className="h-12 w-auto" /> 
                <div className="h-10 w-px bg-white/30 mx-2"></div>
                {/* Texto aumentado para 3xl */}
                <span className="font-bold tracking-[0.2em] text-3xl uppercase text-white shadow-black drop-shadow-md">TICKETFY</span>
            </div>

            {/* Badge de Data */}
            <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 min-w-[140px] shadow-2xl">
              <span className="text-3xl font-medium text-indigo-400 uppercase tracking-wider">{month}</span>
              <span className="text-7xl font-black text-white leading-none mt-2">{day}</span>
            </div>
          </div>

          {/* --- CENTRO --- */}
          <div className="flex-1 flex flex-col justify-center space-y-10">
            
            {/* 1. Imagem de Destaque (Mantida 3:1) */}
            <div className="w-full aspect-[3/1] rounded-[40px] overflow-hidden shadow-2xl border-[3px] border-white/10 relative group mx-auto bg-slate-900">
               {bannerImage ? (
                 <img 
                   src={bannerImage} 
                   className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000" 
                   crossOrigin="anonymous"
                   alt="Banner Evento" 
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-600 text-3xl font-bold uppercase tracking-widest">
                   Banner do Evento
                 </div>
               )}
               <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[40px] pointer-events-none"></div>
            </div>

            {/* 2. Título e Informações Principais */}
            <div className="px-4 space-y-8">
              {/* Título */}
              <h1 className="text-[85px] font-black text-white leading-[1.05] drop-shadow-2xl line-clamp-3">
                {eventName}
              </h1>

              {/* Informações Principais (Subiram para cá) */}
              <div className="flex flex-col gap-5 pt-2">
                  {/* Data e Hora (Sem dia da semana) */}
                  <div className="flex items-center gap-4">
                      <CalendarIcon className="h-10 w-10 text-indigo-400" />
                      <span className="text-4xl font-bold text-indigo-100 tracking-tight">
                        {day} {month} • {time}
                      </span>
                  </div>

                  {/* Nome do Local */}
                  <div className="flex items-center gap-4">
                      <MapPinIcon className="h-10 w-10 text-teal-400" />
                      <span className="text-4xl font-medium text-white truncate">
                        {venueName}
                      </span>
                  </div>
              </div>
            </div>

            {/* 3. Linhas Abaixo (Detalhes Extras com separador) */}
            <div className="mx-4 border-t border-white/15 pt-8 space-y-6">
                
                {/* Endereço Completo (Extraído do JSON) */}
                {(() => {
                    const addr = event?.metadata?.properties?.location?.address || {};
                    // Monta string: "Rua X, 123 - Bairro - Cidade/UF"
                    const streetPart = addr.street ? `${addr.street}, ${addr.number}` : '';
                    const fullAddr = [streetPart, addr.neighborhood, addr.city ? `${addr.city}/${addr.state}` : '']
                        .filter(Boolean)
                        .join(' - ');
                    
                    if (!fullAddr) return null;

                    return (
                        <p className="text-3xl text-slate-300 font-light leading-snug">
                           {fullAddr}
                        </p>
                    );
                })()}

                {/* Categoria */}
                {event?.metadata?.properties?.category && (
                    <p className="text-3xl text-slate-400 font-light">
                       Categoria: <span className="text-white font-medium capitalize">{event.metadata.properties.category}</span>
                    </p>
                )}
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="mt-8 space-y-12 pb-10">
            
            {/* CTA Box com QR Code */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-[40px] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
              {/* Efeito de luz sutil no fundo do card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <div className="flex flex-col gap-3 relative z-10">
                <p className="text-teal-400 text-xl font-bold uppercase tracking-[0.25em]">Acesso Exclusivo</p>
                <p className="text-white text-[42px] font-bold leading-tight">Garanta seu NFT<br/>do evento</p>
                <p className="text-slate-400 text-lg mt-2 truncate max-w-[450px] font-mono opacity-80">{eventLink}</p>
              </div>
              
              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-3xl shadow-xl shrink-0 relative z-10">
                <QRCode 
                    value={eventLink} 
                    size={150} 
                    fgColor="#0F172A"
                    bgColor="#FFFFFF"
                    level="Q"
                />
              </div>
            </div>
            
            {/* Powered By Solana & Logo */}
            <div className="flex items-center justify-center gap-4 opacity-60 pt-4">
                <span className="text-slate-400 text-xl font-medium uppercase tracking-widest">Powered by</span>
                <div className="flex items-center gap-3">
                    
                    {/* NOVO ÍCONE SOLANA (Substituído conforme solicitado) */}
                    <svg className="h-9 w-auto" viewBox="0 0 508.07 398.17" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="solana_grad_1" x1="463" y1="205.16" x2="182.39" y2="742.62" gradientTransform="translate(0 -198)" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#00ffa3"/>
                                <stop offset="1" stopColor="#dc1fff"/>
                            </linearGradient>
                            <linearGradient id="solana_grad_2" x1="340.31" y1="141.1" x2="59.71" y2="678.57" gradientTransform="translate(0 -198)" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#00ffa3"/>
                                <stop offset="1" stopColor="#dc1fff"/>
                            </linearGradient>
                            <linearGradient id="solana_grad_3" x1="401.26" y1="172.92" x2="120.66" y2="710.39" gradientTransform="translate(0 -198)" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#00ffa3"/>
                                <stop offset="1" stopColor="#dc1fff"/>
                            </linearGradient>
                        </defs>
                        <path fill="url(#solana_grad_1)" d="M84.53,358.89A16.63,16.63,0,0,1,96.28,354H501.73a8.3,8.3,0,0,1,5.87,14.18l-80.09,80.09a16.61,16.61,0,0,1-11.75,4.86H10.31A8.31,8.31,0,0,1,4.43,439Z" transform="translate(-1.98 -55)"/>
                        <path fill="url(#solana_grad_2)" d="M84.53,59.85A17.08,17.08,0,0,1,96.28,55H501.73a8.3,8.3,0,0,1,5.87,14.18l-80.09,80.09a16.61,16.61,0,0,1-11.75,4.86H10.31A8.31,8.31,0,0,1,4.43,140Z" transform="translate(-1.98 -55)"/>
                        <path fill="url(#solana_grad_3)" d="M427.51,208.42a16.61,16.61,0,0,0-11.75-4.86H10.31a8.31,8.31,0,0,0-5.88,14.18l80.1,80.09a16.6,16.6,0,0,0,11.75,4.86H501.73a8.3,8.3,0,0,0,5.87-14.18Z" transform="translate(-1.98 -55)"/>
                    </svg>

                    <span className="text-white text-2xl font-bold tracking-tight">SOLANA</span>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
});

EventFlyerTemplate.displayName = 'EventFlyerTemplate';

export default EventFlyerTemplate;