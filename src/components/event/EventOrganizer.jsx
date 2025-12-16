import React from 'react';

const EventOrganizer = ({ organizer }) => {
  if (!organizer || !organizer.name) return null;

  return (
    <section className="py-6 border-t border-gray-200 mt-6">
      {/* Título atualizado para corresponder à navegação */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
        Organizador
      </h2>
      <div className="flex items-center">
        <span className="text-lg font-medium text-gray-800">
          {organizer.name}
        </span>
      </div>
    </section>
  );
};

export default EventOrganizer;