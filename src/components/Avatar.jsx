import React from 'react';
import { FaCamera } from 'react-icons/fa';

function Avatar({ imageUrl }) {
  const handleUploadClick = () => {
    // Em um app real, isso abriria um seletor de arquivos
    alert('Funcionalidade de upload de imagem aqui!');
  };

  return (
    <div className="flex flex-col items-center flex-shrink-0 group relative">
      <img
        src={imageUrl}
        alt="Foto de perfil"
        className="w-[150px] h-[150px] rounded-full object-cover border-4 border-white shadow-md"
      />
      <div 
        onClick={handleUploadClick}
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 cursor-pointer"
      >
        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
            <FaCamera size={24} />
            <span className="text-sm font-semibold mt-1">Alterar foto</span>
        </div>
      </div>
    </div>
  );
}

export default Avatar;