import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export default LoadingSpinner;
