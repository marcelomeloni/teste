import React from 'react';

const EventBanner = ({ imageUrl, eventName }) => {
  return (
    <img
      src={imageUrl}
      alt={`Banner do evento ${eventName}`}

      className="w-full h-full object-cover"
    />
  );
};

export default EventBanner;