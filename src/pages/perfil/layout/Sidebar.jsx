import React from 'react';
import Header from './Header'; // Assumindo que Header é um componente de logo/título
import { FaUser, FaLock, FaCog, FaPlug, FaTrash } from 'react-icons/fa';

// Componente NavLink aprimorado
const NavLink = ({ icon, children, active, onClick }) => {
  const baseClasses = "flex items-center w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-sm font-medium";
  const defaultClasses = "text-gray-700 hover:bg-gray-100 hover:text-blue-600";
  const activeClasses = "bg-blue-600 text-white shadow-md"; // Estilo mais proeminente para ativo

  return (
    <li onClick={onClick}>
      <div className={`${baseClasses} ${active ? activeClasses : defaultClasses}`}>
        {icon}
        <span className="ml-3">{children}</span> {/* Espaçamento melhor para o texto */}
      </div>
    </li>
  );
};

function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: 'pessoais', icon: <FaUser className="text-lg" />, text: 'Informações Pessoais' },
    { id: 'senha', icon: <FaLock className="text-lg" />, text: 'Segurança' },
    { id: 'eventos', icon: <FaCog className="text-lg" />, text: 'Configurações de Eventos' },
    { id: 'apis', icon: <FaPlug className="text-lg" />, text: 'Integrações e APIs' },
    { id: 'apagar', icon: <FaTrash className="text-lg" />, text: 'Apagar Conta' },
  ];

  return (
    <aside className="w-72 flex-shrink-0 bg-white p-6 shadow-xl rounded-2xl h-screen sticky top-0 overflow-y-auto"> {/* Sidebar com sombra e cantos arredondados */}
      <div className="mb-8 mt-4">
        {/* Assumindo que Header contém um logo ou título atraente */}
        <Header /> 
      </div>
      <nav>
        <ul className="space-y-3"> {/* Espaçamento ligeiramente maior entre itens */}
          {menuItems.map(item => (
            <NavLink
              key={item.id}
              icon={item.icon}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            >
              {item.text}
            </NavLink>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;