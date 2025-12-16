import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '@/lib/constants';

export function useSecureQRCode(ticketMint) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const lastCallRef = useRef(0);
  const timerRef = useRef(null);

  // Adicionado parametro 'force' para o botão manual
  const generateSecureCode = useCallback(async (force = false) => {
    if (!ticketMint) return;

    const now = Date.now();
    
    // Lógica de Rate Limit Melhorada:
    // Se for automático (!force), espera 55s.
    // Se for manual (force), espera apenas 2s para evitar spam de cliques.
    const cooldown = force ? 2000 : 55000; 
    
    if (now - lastCallRef.current < cooldown) {
      console.log('⏳ Rate limit ativo. Aguardando...');
      return;
    }

    setLoading(true);
    // Não limpamos o erro imediatamente no refresh manual para manter a UI estável
    if (!qrData) setError(null); 
    
    lastCallRef.current = now;

    try {
      const response = await fetch(`${API_URL}/api/tickets/generate-access-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketMint })
      });

      const data = await response.json();

      if (data.success) {
        setQrData(data.signedPayload);
        setTimeLeft(data.expiresIn);
        setError(null);
        console.log(`✅ QR Code atualizado.`);
      } else {
        throw new Error(data.error || 'Falha ao gerar código');
      }
    } catch (err) {
      console.error('Erro:', err);
      // Só mostra erro na UI se não tivermos nenhum dado anterior
      if (!qrData) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketMint, qrData]);

  // Timer: Decrementa visualmente
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    // Limpa timer anterior para evitar sobreposição
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  // Renovação Automática quando timer chega a 0
  useEffect(() => {
    if (timeLeft === 0 && qrData && !loading) {
      console.log('🔄 Timer zerado, renovação auto...');
      generateSecureCode(false); // false = respeita os 55s
    }
  }, [timeLeft, qrData, loading, generateSecureCode]);

  return {
    qrData,
    loading,
    error,
    timeLeft,
    generateSecureCode,
    // A função refresh agora força a geração ignorando o timer longo
    refresh: () => generateSecureCode(true) 
  };
}