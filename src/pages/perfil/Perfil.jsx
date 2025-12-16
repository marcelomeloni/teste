import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';

function Perfil() {
  // O estado que controla qual seção está visível. 'pessoais' é o valor inicial.
  const [activeSection, setActiveSection] = useState('pessoais');

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      <MainContent 
        activeSection={activeSection} 
      />
    </div>
  );
}

export default Perfil;