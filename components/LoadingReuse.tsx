import React from 'react';

export default function LoadingReuse() {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="loader spinner-border text-[#ff4e00] w-16 h-16 border-4 border-t-4 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}