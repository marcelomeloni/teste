import { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';
import Perfil from './pages/perfil/Perfil';

// Contextos e Hooks
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAppWallet } from './hooks/useAppWallet';

// Componentes
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Páginas
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { Marketplace } from './pages/Marketplace';
import { MyTickets } from './pages/MyTickets';
import { CreateEvent } from './pages/events/CreateEvent';
import { MyEvents } from './pages/events/MyEvents';
import { LoginPage } from './pages/LoginPage';
import { AuthCallback } from './pages/AuthCallback';
import { Admin } from './pages/Admin';
import { ValidatorPage } from './pages/ValidatorPage';
import { ManageEvent } from './pages/ManageEvent';
import { CertificatePage } from './pages/CertificatePage';
import { EditEvent } from './pages/EditEvent';
import EventDetailsPage from './pages/EventDetailsPage';
import CheckoutPage from './pages/CheckoutPage';

// Estilos
import '@solana/wallet-adapter-react-ui/styles.css';
import 'leaflet/dist/leaflet.css';

// --- Componente para rotas protegidas com histórico de navegação ---
const ProtectedRoute = ({ children, requireWallet = false }) => {
  const auth = useAuth();
  const wallet = useAppWallet();
  const location = useLocation();
  
  console.log('🔐 ProtectedRoute - Estado:', {
    authLoading: auth.isLoading,
    authAuthenticated: auth.isAuthenticated,
    walletConnected: wallet.connected,
    walletType: wallet.walletType,
    requireWallet,
    user: auth.user,
    solanaWallet: auth.solanaWallet,
    currentPath: location.pathname
  });

  // Se ainda está carregando
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se está autenticado (qualquer método)
  const isAuthenticated = auth.isAuthenticated || wallet.connected;
  
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Usuário não autenticado, redirecionando para login');
    console.log('📍 Salvando localização atual para redirecionamento de volta:', location.pathname);
    // Salva a localização atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: Acesso permitido');
  return children;
};

// --- Componente para rotas públicas com redirecionamento inteligente ---
const PublicRoute = ({ children }) => {
  const auth = useAuth();
  const wallet = useAppWallet();
  const location = useLocation();

  console.log('🔓 PublicRoute - Estado:', {
    authLoading: auth.isLoading,
    authAuthenticated: auth.isAuthenticated,
    walletConnected: wallet.connected,
    locationState: location.state
  });

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuthenticated = auth.isAuthenticated || wallet.connected;
  
  if (isAuthenticated) {
    // Verifica se existe um estado de origem (de onde o usuário tentou acessar)
    // Se não existir, redireciona para /my-tickets por padrão
    const from = location.state?.from?.pathname || "/my-tickets";
    
    console.log(`✅ PublicRoute: Usuário já autenticado, redirecionando para: ${from}`);
    console.log('📌 Origem do redirecionamento:', location.state?.from?.pathname || 'padrão (/my-tickets)');
    return <Navigate to={from} replace />;
  }

  console.log('✅ PublicRoute: Acesso permitido (usuário não autenticado)');
  return children;
};

function AppContent() {
  const auth = useAuth();
  const wallet = useAppWallet();

  // Debug do estado de autenticação
  useEffect(() => {
    console.log('🏠 AppContent - Estado Global:', {
      auth: {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        solanaWallet: auth.solanaWallet
      },
      wallet: {
        connected: wallet.connected,
        publicKey: wallet.publicKey?.toString(),
        walletType: wallet.walletType
      }
    });
  }, [auth, wallet]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-grow w-full">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:eventAddress" element={<EventDetailsPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/certificate/:mintAddress" element={<CertificatePage />} />
          <Route path="/event/:eventAddress/checkout" element={<CheckoutPage />} />
          
          {/* Rotas de autenticação (só para não autenticados) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Rotas Protegidas (qualquer tipo de autenticação) */}
          <Route 
            path="/my-tickets" 
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute> 
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-event/:eventId" 
            element={
              <ProtectedRoute> 
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-events" 
            element={
              <ProtectedRoute> 
                <MyEvents />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Admin (ainda requerem carteira) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireWallet={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/manage-event/:eventAddress" 
            element={
              <ProtectedRoute requireWallet={true}>
                <ManageEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventAddress/validate" 
            element={
              <ProtectedRoute requireWallet={true}>
                <ValidatorPage />
              </ProtectedRoute>
            } 
          />

          {/* Rota fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(), 
      new SolflareWalletAdapter({ network })
    ],
    [network]
  );

  return (
    <Router>
      <Toaster 
        position="top-center"
        containerStyle={{
          position: 'fixed',
          top: '20px',
          zIndex: 9999,
        }}
        toastOptions={{ 
          duration: 4000, 
          style: { 
            background: '#363636', 
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }, 
          success: { 
            duration: 3000, 
            iconTheme: { 
              primary: '#10B981', 
              secondary: '#fff' 
            },
            style: {
              background: '#10B981',
              border: '1px solid #059669',
            }
          }, 
          error: { 
            duration: 5000, 
            iconTheme: { 
              primary: '#EF4444', 
              secondary: '#fff' 
            },
            style: {
              background: '#EF4444',
              border: '1px solid #DC2626',
            }
          },
          loading: {
            style: {
              background: '#6B7280',
              border: '1px solid #4B5563',
            }
          }
        }} 
      />

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Router>
  );
}

export default App;
