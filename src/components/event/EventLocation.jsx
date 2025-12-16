import React from 'react';

// Helper para formatar o endereço (Mantido igual)
const formatAddress = (address) => {
  if (!address || !address.street || Object.keys(address).length === 0) {
    return 'Endereço não disponível';
  }
  
  const parts = [
    address.street,
    address.number ? `, ${address.number}` : '',
    address.complement ? ` - ${address.complement}` : '',
    address.neighborhood ? `, ${address.neighborhood}` : '',
    address.city ? `, ${address.city}` : '',
    address.state ? ` - ${address.state}` : '',
    address.cep ? `, ${address.cep}` : ''
  ].filter(part => part !== '');

  return parts.join('') || 'Endereço não disponível';
};

const EventLocation = ({ location, properties }) => {
  // Priorizar properties.location se disponível
  const actualLocation = properties?.location || location;
  
  // Endereço formatado para exibição visual
  const fullAddress = formatAddress(actualLocation?.address);

  // Lógica para gerar a busca no mapa
  // DICA: Concatenar o nome do local (Venue) com a cidade ajuda o Google a ser mais preciso
  const venueName = actualLocation?.venueName || '';
  const city = actualLocation?.address?.city || '';
  
  // Preferimos buscar pelo Nome do Local + Cidade (ex: "Cidade do Rock, Rio de Janeiro")
  // Se não tiver nome do local, usamos o endereço completo.
  const queryText = venueName && city 
    ? `${venueName}, ${city}` 
    : fullAddress;

  const encodedQuery = encodeURIComponent(queryText);

  // URL "Hack" do Google Maps (Gratuito, não requer API Key para visualização simples)
  const mapUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
        Localização
      </h2>
      <p className="text-gray-700 mb-1 font-semibold">{actualLocation?.venueName}</p>
      <p className="text-gray-700 mb-4">{fullAddress}</p>

      {/* Renderização do Mapa */}
      <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        {fullAddress !== 'Endereço não disponível' ? (
          <iframe 
            title="Mapa do Evento"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={mapUrl}
            className="w-full h-full"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>Mapa indisponível (Endereço não encontrado)</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventLocation;