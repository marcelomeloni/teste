import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

/**
 * Ícone SVG da Solana
 */
const SolanaLogoIcon = (props) => (
  <svg 
    id="Layer_1" 
    width="24"
  height="24"
    data-name="Layer 1" // Corrigido de data-name
    xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" // Corrigido de xmlns:xlink
    viewBox="0 0 508.07 398.17"
    {...props} // Passa a className "w-5 h-5" e outras props
  >
    <defs>
      {/* A tag <style> foi removida. 
        As classes .cls-1, .cls-2, .cls-3 foram aplicadas diretamente 
        como `fill="url(#...)"` nos paths abaixo.
      */}
      <linearGradient id="linear-gradient" x1="463" y1="205.16" x2="182.39" y2="742.62" gradientTransform="translate(0 -198)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00ffa3"/>
        <stop offset="1" stopColor="#dc1fff"/>
      </linearGradient>
      <linearGradient id="linear-gradient-2" x1="340.31" y1="141.1" x2="59.71" y2="678.57" xlinkHref="#linear-gradient"/>
      <linearGradient id="linear-gradient-3" x1="401.26" y1="172.92" x2="120.66" y2="710.39" xlinkHref="#linear-gradient"/>
    </defs>
    {/* Corrigido de class="cls-1" para fill="url(...)" */}
    <path fill="url(#linear-gradient)" d="M84.53,358.89A16.63,16.63,0,0,1,96.28,354H501.73a8.3,8.3,0,0,1,5.87,14.18l-80.09,80.09a16.61,16.61,0,0,1-11.75,4.86H10.31A8.31,8.31,0,0,1,4.43,439Z" transform="translate(-1.98 -55)"/>
    {/* Corrigido de class="cls-2" para fill="url(...)" */}
    <path fill="url(#linear-gradient-2)" d="M84.53,59.85A17.08,17.08,0,0,1,96.28,55H501.73a8.3,8.3,0,0,1,5.87,14.18l-80.09,80.09a16.61,16.61,0,0,1-11.75,4.86H10.31A8.31,8.31,0,0,1,4.43,140Z" transform="translate(-1.98 -55)"/>
    {/* Corrigido de class="cls-3" para fill="url(...)" */}
    <path fill="url(#linear-gradient-3)" d="M427.51,208.42a16.61,16.61,0,0,0-11.75-4.86H10.31a8.31,8.31,0,0,0-5.88,14.18l80.1,80.09a16.6,16.6,0,0,0,11.75,4.86H501.73a8.3,8.3,0,0,0,5.87-14.18Z" transform="translate(-1.98 -55)"/>
  </svg>
);



export function LoginPage() {
  const { 
    loginWithGoogle,
    connectSolanaWallet,
    disconnectSolanaWallet,
    isLoading, 
    error, 
    isAuthenticated,
    solanaWallet,
    isSolanaWalletAvailable,
    // getWalletProvider // Não é mais necessário para o texto do botão
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [activeProvider, setActiveProvider] = useState(null);

  const from = location.state?.from?.pathname || '/';
  // const walletInfo = getWalletProvider(); // Não é mais necessário para o texto do botão

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleGoogleLogin = async () => {
    setActiveProvider('google');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(`Login com Google falhou:`, err);
    } finally {
      setActiveProvider(null);
    }
  };

  const handleSolanaLogin = async () => {
    setActiveProvider('solana');
    try {
      await connectSolanaWallet();
    } catch (err) {
      console.error("Falha na autenticação com Solana:", err);
    } finally {
      setActiveProvider(null);
    }
  };

  const handleSolanaDisconnect = async () => {
    await disconnectSolanaWallet();
  };

  if (isAuthenticated === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-12">
          
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Acesse sua conta
          </h1>
          <p className="text-gray-600">
            Escolha sua forma preferida de login
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {solanaWallet?.connected ? (
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-900 font-medium text-sm">
                      {solanaWallet.walletName}
                    </p>
                    <p className="text-blue-700 text-xs">
                      Conectado
                    </p>
                  </div>
                </div>
                <p className="text-blue-800 text-xs font-mono break-all bg-blue-100 rounded-lg p-2">
                  {solanaWallet.publicKey}
                </p>
              </div>
              <button
                onClick={handleSolanaDisconnect}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Desconectar carteira
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading || solanaWallet?.connected}
                className="w-full flex items-center justify-between gap-4 py-3.5 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-900 font-medium">
                    Continuar com Google
                  </span>
                </div>
                {isLoading && activeProvider === 'google' ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-gray-500 bg-white font-medium">
                    Ou
                  </span>
                </div>
              </div>

              {/* --- ⬇️ BOTÃO SOLANA MODIFICADO ⬇️ --- */}
              {
                !isSolanaWalletAvailable() ? (
                  // --- CASO A: Carteira NÃO instalada ---
                  // Ele vira um link <a> para a Solflare
                  <a
                    href="https://solflare.com/" // <-- Link direto para Solflare
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between gap-4 py-3.5 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <SolanaLogoIcon /> {/* <-- Novo Ícone */}
                      <span className="text-gray-900 font-medium">
                        Baixar carteira Solana {/* <-- Novo Texto */}
                      </span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </a>
                ) : (
                  // --- CASO B: Carteira INSTALADA ---
                  // É o botão normal que chama a lógica
                  <button
                    onClick={handleSolanaLogin}
                    disabled={isLoading || solanaWallet?.connected} // <-- Lógica de 'disabled' simplificada
                    className="w-full flex items-center justify-between gap-4 py-3.5 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <SolanaLogoIcon /> {/* <-- Novo Ícone */}
                      <span className="text-gray-900 font-medium">
                        Conectar com Solana {/* <-- Novo Texto */}
                      </span>
                    </div>
                    {isLoading && activeProvider === 'solana' ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                )
              }
              {/* --- ⬆️ FIM DA MODIFICAÇÃO ⬆️ --- */}


              {/* --- ⬇️ LINKS DE INSTALAÇÃO REMOVIDOS ⬇️ --- */}
              {/* O bloco {!isSolanaWalletAvailable() && ( ... )} que 
                continha as "Carteiras recomendadas" foi removido 
                conforme solicitado.
              */}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm text-center">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="font-medium text-gray-700 hover:text-gray-900 underline">Termos</a>
            {' '}e{' '}
            <a href="#" className="font-medium text-gray-700 hover:text-gray-900 underline">Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

