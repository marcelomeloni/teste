import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-red-500">
    <FiAlertTriangle className="text-4xl mb-2" />
    <h3 className="text-lg font-semibold">Ocorreu um erro</h3>
    <p>{message || 'Não foi possível carregar os dados do evento.'}</p>
  </div>
);

export default ErrorDisplay;