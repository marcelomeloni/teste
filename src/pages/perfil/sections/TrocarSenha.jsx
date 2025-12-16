// components/GerenciarConexao.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; 
import { API_URL } from '@/lib/constants';

// --- ÍCONES (Design Minimalista & Refinado) ---
const Icons = {
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10 7-10 7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Wallet: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Google: () => <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.424 44.599 -10.174 45.789 L -6.704 42.319 C -8.804 40.359 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
};

function GerenciarConexao() {
  const { user, solanaWallet, profile } = useAuth();
  const [showSensitive, setShowSensitive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyToDisplay, setKeyToDisplay] = useState('');
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  const [seedError, setSeedError] = useState(null);

  // 🔥 NOVA FUNÇÃO: Buscar seed phrase real do backend
  const fetchRealSeedPhrase = async () => {
    if (!user?.id && !profile?.firebase_uid) return;
    
    setIsLoadingSeed(true);
    setSeedError(null);
    
    try {
      console.log('🌱 Buscando seed phrase real do backend...');
      
      // Usar o firebase_uid do perfil
      const firebaseUid = profile?.firebase_uid || user?.id;
      
      const response = await fetch(`${API_URL}/api/auth/seed-phrase/${firebaseUid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar seed phrase');
      }

      const result = await response.json();
      
      if (result.success && result.seedPhrase) {
        console.log('✅ Seed phrase real recebida do backend');
        setKeyToDisplay(result.seedPhrase);
        setSeedPhrase(result.seedPhrase.split(' '));
      } else {
        throw new Error('Seed phrase não disponível');
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar seed phrase:', error);
      setSeedError(error.message);
      
      // Fallback: usar a chave privada encriptada do perfil
      if (profile?.encrypted_private_key) {
        console.log('🔄 Usando encrypted_private_key como fallback');
        setKeyToDisplay(profile.encrypted_private_key);
        setSeedPhrase([]);
      } else {
        // Último fallback: mock (apenas para desenvolvimento)
        const mockSeed = "witch collapse practice feed shame open despair creek road again ice least";
        setKeyToDisplay(mockSeed);
        setSeedPhrase(mockSeed.split(' '));
      }
    } finally {
      setIsLoadingSeed(false);
    }
  };

  useEffect(() => {
    if (solanaWallet?.connected) {
      // Para Solana Wallet: mostrar public key
      setKeyToDisplay(solanaWallet.publicKey);
      setSeedPhrase([]);
    } else if (user?.authProvider === 'google') {
      // Para Google: buscar seed phrase REAL
      fetchRealSeedPhrase();
    }
  }, [user, solanaWallet, profile]);

  const handleCopy = () => {
    if (!keyToDisplay) return;
    navigator.clipboard.writeText(keyToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGoogle = user?.authProvider === 'google';
  const isSolana = solanaWallet?.connected;

  if (!user && !solanaWallet) return null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header da Seção */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Gerenciamento de Credenciais</h2>
          <p className="text-gray-500 mt-2 text-lg">
            Visualize e gerencie suas chaves de acesso e conexões blockchain.
          </p>
        </div>
       
      </div>

      {/* --- MODO SOLANA WALLET --- */}
      {isSolana && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                <Icons.Wallet />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Carteira Solana</h3>
                <p className="text-gray-500">Conectado via {solanaWallet.walletName}</p>
              </div>
            </div>

            <div className="group relative">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                Endereço Público
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all rounded-xl p-5 font-mono text-gray-700 break-all text-base shadow-inner">
                  {keyToDisplay}
                </div>
                <button 
                  onClick={handleCopy}
                  className={`h-full aspect-square flex items-center justify-center rounded-xl border transition-all duration-200 shadow-sm
                    ${copied 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'bg-white border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-400'
                    }`}
                >
                  {copied ? <Icons.Check /> : <Icons.Copy />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODO GOOGLE (SEED PHRASE REAL) --- */}
      {isGoogle && !isSolana && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden relative">
          
          {/* Header do Card */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-full border border-gray-100 shadow-sm">
                <Icons.Google />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Conta Custodial</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500">{user.email}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {isLoadingSeed ? 'Carregando...' : 'Sincronizado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Pill */}
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-100 shadow-sm">
              <Icons.Shield />
              <span>Nunca compartilhe sua frase secreta</span>
            </div>
          </div>

          {/* Área da Seed Phrase */}
          <div className="relative p-8 bg-white min-h-[300px]">
            
            {/* Toolbar com Loading State */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Frase de Recuperação (12 Palavras)
                </h4>
                {seedError && (
                  <p className="text-red-500 text-sm mt-1">{seedError}</p>
                )}
              </div>
              
              {showSensitive && !isLoadingSeed && (
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${copied 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {copied ? <Icons.Check /> : <Icons.Copy />}
                  {copied ? "Copiado!" : "Copiar Frase"}
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoadingSeed && !showSensitive && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-500">Carregando sua seed phrase segura...</p>
              </div>
            )}

            {/* O Grid de Palavras (APENAS quando não está carregando) */}
            {!isLoadingSeed && (
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-700 ${!showSensitive ? 'blur-md opacity-40 scale-[0.99]' : 'blur-0 opacity-100 scale-100'}`}>
                {seedPhrase.length > 0 ? (
                  seedPhrase.map((word, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md hover:bg-white transition-all duration-200"
                    >
                      <span className="absolute top-2 left-3 text-[10px] font-bold text-gray-400 select-none font-mono">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="w-full text-center text-lg font-semibold text-gray-700 group-hover:text-gray-900 mt-2 select-all">
                        {word}
                      </span>
                    </div>
                  ))
                ) : (
                  // Se não temos seed phrase, mostrar a chave privada
                  <div className="col-span-full">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 font-mono text-gray-700 break-all text-sm">
                      {keyToDisplay}
                    </div>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      Chave privada (em base58) - Esta é sua chave de recuperação
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer de Segurança */}
            <div className={`mt-8 pt-6 border-t border-gray-100 text-center transition-opacity duration-500 ${!showSensitive ? 'opacity-20' : 'opacity-100'}`}>
              <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
                Estas 12 palavras permitem recuperar sua carteira em qualquer dispositivo. 
                Escreva-as em papel e guarde em local seguro. Não faça capturas de tela.
              </p>
              {profile?.wallet_address && (
                <p className="text-xs text-gray-500 mt-2">
                  Endereço público: {profile.wallet_address.slice(0, 20)}...{profile.wallet_address.slice(-8)}
                </p>
              )}
            </div>

            {/* OVERLAY DE BLOQUEIO */}
            {!showSensitive && !isLoadingSeed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-all duration-700"></div>
                
                <div className="relative z-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center mb-6">
                    <div className="text-gray-800">
                      <Icons.EyeOff />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visualização Protegida</h3>
                  <p className="text-gray-500 mb-8 text-center max-w-xs">
                    Certifique-se de que ninguém está olhando para sua tela antes de revelar.
                  </p>
                  
                  <button 
                    onClick={() => setShowSensitive(true)}
                    disabled={isLoadingSeed}
                    className="group relative px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Icons.Eye /> Revelar Minha Frase
                    </span>
                    <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Botão Flutuante de Ocultar */}
            {showSensitive && !isLoadingSeed && (
              <div className="absolute bottom-8 right-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setShowSensitive(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-full shadow-lg hover:shadow-xl text-sm font-bold transition-all"
                >
                  <span className="text-gray-400"><Icons.Eye /></span>
                  OCULTAR
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
}

export default GerenciarConexao;