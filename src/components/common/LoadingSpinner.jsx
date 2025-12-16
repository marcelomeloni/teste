import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <FiLoader className="animate-spin text-4xl text-gray-500" />
  </div>
);

export default LoadingSpinner;