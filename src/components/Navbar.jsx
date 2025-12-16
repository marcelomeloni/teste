import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    ArrowRightOnRectangleIcon, 
    ArrowLeftOnRectangleIcon,
    Bars3Icon, 
    XMarkIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    RectangleStackIcon,
    TicketIcon,
    WalletIcon
} from '@heroicons/react/24/outline';

/**
 * Componente Dropdown do Usuário
 */
const UserDropdown = () => {
    const { user, wallet, solanaWallet, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const handleItemClick = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Se não está autenticado, não mostra nada
    if (!user && !solanaWallet) return null;

    // Determina qual informação mostrar baseado no tipo de autenticação
    const displayName = user?.name || user?.email || 'Usuário Carteira';
    const displayEmail = user?.email || (solanaWallet?.publicKey ? `${solanaWallet.publicKey.slice(0, 8)}...${solanaWallet.publicKey.slice(-8)}` : '');
    const displayAvatar = user?.photoURL || '/default-avatar.png';
    const walletType = solanaWallet ? 'Solana Wallet' : 'Email';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botão do Avatar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
                {solanaWallet ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                        <WalletIcon className="h-4 w-4 text-white" />
                    </div>
                ) : (
                    <img
                        src={displayAvatar} 
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    />
                )}
                <span className="hidden md:inline text-sm font-medium text-blue-800 max-w-24 truncate">
                    {displayName}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/80 backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95">
                    {/* Header do Dropdown */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            {solanaWallet ? (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                    <WalletIcon className="h-6 w-6 text-white" />
                                </div>
                            ) : (
                                <img
                                    src={displayAvatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full border-2 border-blue-100"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {displayEmail}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {walletType}
                                    </span>
                                    {solanaWallet?.walletIcon && (
                                        <span className="text-xs">{solanaWallet.walletIcon}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itens do Menu */}
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => handleItemClick('/perfil')}
                            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                        >
                            <UserCircleIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            <span>Meu Perfil</span>
                        </button>

                        <button
                            onClick={() => handleItemClick('/my-events')}
                            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                        >
                            <RectangleStackIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            <span>Meus Eventos</span>
                        </button>
                        <button
                            onClick={() => handleItemClick('/my-tickets')}
                            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                        >
                            <TicketIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            <span>Meus Ingressos</span>
                        </button>

            
                    </div>

                    {/* Footer do Dropdown */}
                    <div className="p-2 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 group"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110" />
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Componente que decide qual botão de conexão/conta mostrar
 */
const ConnectionDisplay = ({ isMobile = false }) => {
    const { isAuthenticated, user, solanaWallet, logout } = useAuth();
    const navigate = useNavigate();

    // DEBUG: Verificar estado da autenticação
    console.log("Navbar - Auth State:", { isAuthenticated, user, solanaWallet });

    // --- ESTADO 1: Usuário está LOGADO (via email OU carteira Solana) ---
    if (isAuthenticated) {
        const displayName = user?.name || user?.email || 'Usuário Carteira';
        const displayEmail = user?.email || (solanaWallet?.publicKey ? `${solanaWallet.publicKey.slice(0, 8)}...${solanaWallet.publicKey.slice(-8)}` : '');
        const walletType = solanaWallet ? 'Solana Wallet' : 'Email';

        if (isMobile) {
            // Versão mobile expandida
            return (
                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        {solanaWallet ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                <WalletIcon className="h-5 w-5 text-white" />
                            </div>
                        ) : (
                            <img
                                src={user?.photoURL || '/default-avatar.png'} 
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border-2 border-white"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-blue-800 truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-blue-600 truncate">
                                {displayEmail}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {walletType}
                                </span>
                                {solanaWallet?.walletIcon && (
                                    <span className="text-xs">{solanaWallet.walletIcon}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to="/profile"
                            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">Perfil</span>
                        </Link>
                        
                        <Link
                            to="/my-events"
                            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                        >
                            <TicketIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">Eventos</span>
                        </Link>
                    </div>
                    
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-red-600/25 transition-all"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Sair</span>
                    </button>
                </div>
            );
        }

        // Versão desktop (dropdown)
        return <UserDropdown />;
    }
    
    // --- ESTADO 2: Usuário está DESLOGADO ---
    return (
        <Link
            to="/login"
            className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-blue-600/25 hover:scale-105 ${
                isMobile ? 'w-full justify-center' : ''
            }`}
        >
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            <span>Entrar</span>
        </Link>
    );
};

// Componente de partículas animadas para o background
const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-12 -left-4 w-6 h-6 bg-indigo-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-8 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
);

/**
 * Componente Navbar completo
 */
export function Navbar() {
    const { isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const closeMobileMenu = () => setIsMenuOpen(false);

    const activeStyle = {
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        boxShadow: '0 4px 15px 0 rgba(79, 70, 229, 0.3)'
    };

    const navItems = [
        { to: "/events", label: "Eventos" },
        { to: "/marketplace", label: "Marketplace" },
        { to: "/create-event", label: "Criar Evento" }
      
    ];

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/5 border-b border-slate-200/80' 
                : 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60'
        }`}>
            <AnimatedBackground />
            
            <div className="relative container mx-auto flex justify-between items-center h-20 px-4 lg:px-8">
                {/* Logo */}
                <NavLink 
                    to="/" 
                    className="flex items-center gap-3 group"
                    onClick={closeMobileMenu}
                >
                    <img 
                        src="/logo.png" 
                        alt="Ticketfy Logo" 
                        className="w-10 h-10 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" 
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Ticketfy
                        </span>
                        <span className="text-xs text-slate-500 font-medium">WEB3 TICKETS</span>
                    </div>
                </NavLink>

                {/* Navegação Desktop */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => (isActive ? activeStyle : undefined)}
                            className="relative px-6 py-3 text-sm font-semibold text-slate-700 rounded-2xl transition-all duration-300 hover:bg-slate-100 hover:scale-105 hover:shadow-lg mx-1"
                        >
                            {item.label}
                            {({ isActive }) => isActive && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Área do Usuário - Desktop */}
                <div className="hidden lg:flex items-center">
                    <ConnectionDisplay />
                </div>

                {/* Botão Menu Mobile */}
                <div className="lg:hidden">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300 hover:scale-105"
                    >
                        {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Menu Mobile Expandido */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-2xl">
                    <nav className="flex flex-col items-center space-y-2 py-6 px-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                style={({ isActive }) => (isActive ? activeStyle : undefined)}
                                className="w-full max-w-xs text-center px-6 py-4 text-base font-semibold text-slate-700 rounded-2xl transition-all duration-300 hover:bg-slate-100 hover:scale-105"
                            >
                                {item.label}
                            </NavLink>
                        ))}

                        <div className="pt-4 w-full max-w-xs">
                            <ConnectionDisplay isMobile={true} />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}