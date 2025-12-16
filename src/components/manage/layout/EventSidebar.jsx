import { 
    CalendarDaysIcon, ChartBarIcon, BanknotesIcon, 
    UserPlusIcon, TicketIcon, ChevronDownIcon, ChevronRightIcon,
    ArrowLeftIcon, CubeIcon, DocumentTextIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function EventSidebar({ activeSection, setActiveSection }) {
    const [openDropdowns, setOpenDropdowns] = useState({
        financial: false,
        participants: false
    });

    // Auto-open dropdown based on active section
    useEffect(() => {
        if (activeSection.startsWith('financial')) {
            setOpenDropdowns(prev => ({ ...prev, financial: true }));
        } else if (activeSection.startsWith('participants')) {
            setOpenDropdowns(prev => ({ ...prev, participants: true }));
        }
    }, [activeSection]);

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const menuItems = [
        { 
            id: 'event-info', 
            label: 'Painel do Evento', 
            icon: ChartBarIcon,
            description: 'Visão geral do evento'
        },
        { 
            id: 'financial', 
            label: 'Controle Financeiro', 
            icon: BanknotesIcon,
            description: 'Gestão financeira',
            dropdown: true,
            items: [
                { id: 'financial-panel', label: 'Painel Financeiro', icon: CubeIcon },
                { id: 'sales-summary', label: 'Resumo das Vendas', icon: DocumentTextIcon },
                { id: 'coupons', label: 'Cupons de Desconto', icon: TicketIcon },
                { id: 'cancellation-requests', label: 'Solicitações de Cancelamento', icon: ArrowLeftIcon }
            ]
        },
        { 
            id: 'registration-form', 
            label: 'Formulário de Inscrição', 
            icon: UserPlusIcon,
            description: 'Personalize o formulário'
        },
        { 
            id: 'participants', 
            label: 'Participantes', 
            icon: UserGroupIcon,
            description: 'Gerencie participantes',
            dropdown: true,
            items: [
                { id: 'participants-checkin', label: 'Check-in & Lista', icon: UserGroupIcon },
                { id: 'send-notification', label: 'Comunicações', icon: DocumentTextIcon },
                { id: 'certificates', label: 'Certificados', icon: DocumentTextIcon }
            ]
        },
        { 
            id: 'event-team', 
            label: 'Equipe do Evento', 
            icon: UserPlusIcon,
            description: 'Organize sua equipe'
        }
    ];

    const getMenuItemClass = (isActive, hasDropdown = false) => {
        const baseClasses = "w-full flex items-center p-3 rounded-xl transition-all duration-200 group border";
        
        if (isActive) {
            return `${baseClasses} bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100`;
        }
        
        if (hasDropdown) {
            return `${baseClasses} text-slate-700 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm`;
        }
        
        return `${baseClasses} text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200`;
    };

    const getSubItemClass = (isActive) => {
        const baseClasses = "w-full flex items-center gap-3 p-2 pl-10 rounded-lg text-left transition-all duration-200 group";
        
        if (isActive) {
            return `${baseClasses} bg-indigo-500 text-white shadow-sm shadow-indigo-200 transform scale-[1.02]`;
        }
        
        return `${baseClasses} text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:pl-12`;
    };

    return (
        // Alterado de min-h-screen para h-screen e adicionado sticky top-0
        <div className="w-80 bg-white border-r border-slate-100 h-screen flex flex-col sticky top-0">
            
            {/* Menu Navigation - flex-1 fará com que ocupe todo o espaço disponível, empurrando o footer */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <div key={item.id}>
                        {item.dropdown ? (
                            <div className="mb-2">
                                <button
                                    onClick={() => toggleDropdown(item.id)}
                                    className={getMenuItemClass(
                                        activeSection.startsWith(item.id), 
                                        true
                                    )}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`p-2 rounded-lg transition-colors ${
                                            activeSection.startsWith(item.id) 
                                                ? 'bg-indigo-100 text-indigo-600' 
                                                : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                        }`}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="font-semibold text-sm truncate">{item.label}</div>
                                            <div className="text-xs text-slate-500 truncate">{item.description}</div>
                                        </div>
                                    </div>
                                    
                                    {openDropdowns[item.id] ? 
                                        <ChevronDownIcon className="h-4 w-4 text-slate-400 transition-transform" /> : 
                                        <ChevronRightIcon className="h-4 w-4 text-slate-400 transition-transform" />
                                    }
                                </button>
                                
                                {openDropdowns[item.id] && (
                                    <div className="ml-4 mt-2 space-y-1 animate-fadeIn">
                                        {item.items.map((subItem) => (
                                            <button
                                                key={subItem.id}
                                                onClick={() => setActiveSection(subItem.id)}
                                                className={getSubItemClass(activeSection === subItem.id)}
                                            >
                                                <subItem.icon className={`h-4 w-4 transition-colors ${
                                                    activeSection === subItem.id ? 'text-white' : 'text-slate-400'
                                                }`} />
                                                <span className="text-sm font-medium truncate flex-1">{subItem.label}</span>
                                                
                                                {activeSection === subItem.id && (
                                                    <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveSection(item.id)}
                                className={getMenuItemClass(activeSection === item.id)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg transition-colors ${
                                        activeSection === item.id
                                            ? 'bg-indigo-100 text-indigo-600' 
                                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="font-semibold text-sm truncate">{item.label}</div>
                                        <div className="text-xs text-slate-500 truncate">{item.description}</div>
                                    </div>
                                </div>
                                
                                {activeSection === item.id && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer - mt-auto garante que fique no final, shrink-0 impede que seja esmagado */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto shrink-0 z-10">
                <Link 
                    to="/my-events" 
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm transition-all duration-200 group border border-transparent hover:border-slate-200"
                >
                    <div className="p-2 rounded-lg bg-slate-200 group-hover:bg-slate-300 transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                        <span className="font-semibold text-sm">Voltar para Eventos</span>
                        <p className="text-xs text-slate-500">Gerenciar todos os eventos</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}