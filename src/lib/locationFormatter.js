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