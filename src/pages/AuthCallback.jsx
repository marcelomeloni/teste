// src/pages/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          console.log('✅ OAuth callback bem-sucedido');
          navigate('/profile', { replace: true });
        } else {
          throw new Error('Nenhuma sessão encontrada após OAuth');
        }
      } catch (error) {
        console.error('❌ Erro no callback OAuth:', error);
        navigate('/login', { 
          replace: true,
          state: { error: 'Falha na autenticação com Google' }
        });
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Processando autenticação...</p>
      </div>
    </div>
  );
}

export default AuthCallback;