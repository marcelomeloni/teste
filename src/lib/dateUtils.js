// lib/dateUtils.js
export function formatEventDate(startDate, endDate) {
    if (!startDate || !endDate) return 'Datas não definidas';
    
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const formatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const startFormatted = start.toLocaleDateString('pt-BR', formatOptions);
        const endFormatted = end.toLocaleDateString('pt-BR', formatOptions);
        
        return `${startFormatted} - ${endFormatted}`;
    } catch (error) {
        return 'Erro ao formatar datas';
    }
}

export function formatEventLocation(location) {
    if (!location) return 'Local não definido';
    
    const { venueName, address, type } = location;
    
    if (type === 'online' && location.onlineEventLink) {
        return `Online - ${location.onlineEventLink}`;
    }
    
    if (venueName && address) {
        const { street, number, neighborhood, city, state } = address;
        const addressParts = [street, number, neighborhood].filter(Boolean);
        return `${venueName} - ${addressParts.join(', ')}, ${city} - ${state}`;
    }
    
    return venueName || 'Local não definido';
}