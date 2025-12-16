export const formatLocation = (locationObj) => {
    if (!locationObj) return 'Online';
    
    if (locationObj.type === 'presential') {
      const address = locationObj.address || {};
      const parts = [
        locationObj.venueName,
        address.street,
        address.number ? `Nº ${address.number}` : '',
        address.neighborhood,
        address.city,
        address.state
      ].filter(part => part && part.trim() !== '');
      
      return parts.join(', ');
    } else if (locationObj.type === 'online') {
      return locationObj.onlinePlatform ? `Online (${locationObj.onlinePlatform})` : 'Online';
    }
    
    return 'Local não especificado';
  };
  
  export const formatDate = (dateString, locale = 'pt-BR') => {
    if (!dateString) return 'Data não informada';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  export const getTicketStatus = (ticket, event) => {
    const isEventCanceled = event?.account?.canceled;
    const isListed = ticket.isListed;
    const isRedeemed = ticket.account.redeemed;
  
    if (isEventCanceled) return { text: 'Evento Cancelado', color: 'bg-red-100 text-red-800' };
    if (isRedeemed) return { text: 'Utilizado', color: 'bg-slate-100 text-slate-800' };
    if (isListed) return { text: 'À Venda', color: 'bg-blue-100 text-blue-800' };
    return { text: 'Disponível', color: 'bg-green-100 text-green-800' };
  };