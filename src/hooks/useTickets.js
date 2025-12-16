import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { web3, BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

import { useAppWallet } from '@/hooks/useAppWallet';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/constants';

// --- Constantes ---
const LISTING_SEED = Buffer.from("listing");
const ESCROW_SEED = Buffer.from("escrow");
const REFUND_RESERVE_SEED = Buffer.from("refund_reserve");

export function useTickets() {
  const wallet = useAppWallet();
  const auth = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FUNÇÃO: Obter wallet do usuário (compatível com wallet e login externo)
  const getUserWallet = () => {
    console.log('🔍 Buscando wallet do usuário para MyTickets...');

    // 1. Tentar wallet do localStorage (usuários Google)
    try {
      const stored = localStorage.getItem('user_wallet_data');
      if (stored) {
        const walletData = JSON.parse(stored);
        console.log('✅ Wallet carregada do localStorage:', walletData);
        return walletData.address;
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar wallet do localStorage:', error);
    }

    // 2. Fallback: wallet Solana conectada
    if (wallet.connected && wallet.publicKey) {
      console.log('✅ Usando wallet Solana conectada:', wallet.publicKey.toString());
      return wallet.publicKey.toString();
    }

    // 3. Tentar obter do AuthContext se disponível
    if (auth.getUserWallet) {
      const authWallet = auth.getUserWallet();
      if (authWallet?.address) {
        console.log('✅ Wallet do AuthContext:', authWallet.address);
        return authWallet.address;
      }
    }

    console.log('❌ Nenhuma wallet disponível');
    return null;
  };

  // ✅ FUNÇÃO: Verificar se usuário está autenticado (qualquer método)
  const isUserAuthenticated = () => {
    return auth.isAuthenticated || wallet.connected;
  };

  // ✅ FUNÇÃO: Buscar ingressos usando wallet do usuário
  const fetchAllData = async () => {
    const userWallet = getUserWallet();
    
    if (!userWallet) {
      console.log('⏭️ Nenhuma wallet disponível, pulando busca de ingressos');
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎫 Buscando ingressos do usuário...', {
        userWallet,
        authType: auth.isAuthenticated ? 'google' : 'wallet'
      });

      const response = await fetch(`${API_URL}/api/tickets/user-tickets/${userWallet}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar ingressos na API.');
      }
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.error || 'Erro desconhecido da API.');
      }
    } catch (error) {
      console.error("Erro ao buscar dados via API:", error);
      toast.error("Não foi possível carregar seus ingressos.");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ EFFECT: Buscar ingressos quando autenticação mudar
  useEffect(() => {
    if (isUserAuthenticated()) {
      console.log('🔄 Usuário autenticado, buscando ingressos...');
      fetchAllData();
    } else {
      console.log('⏳ Aguardando autenticação para buscar ingressos...');
      setTickets([]);
      setIsLoading(false);
    }
  }, [auth.isAuthenticated, wallet.connected]);

  const handleListForSale = async (selectedTicket, priceInSol, program, wallet) => {
    if (!program || !selectedTicket) {
      toast.error('Programa ou ticket não disponível');
      return;
    }
    
    if (priceInSol <= 0) { 
      toast.error("O preço deve ser maior que zero."); 
      return; 
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Listando seu ingresso...");
    try {
      const priceInLamports = Math.round(priceInSol * web3.LAMPORTS_PER_SOL);
      const nftMint = new web3.PublicKey(selectedTicket.account.nftMint);
      
      const sellerTokenAccount = await getAssociatedTokenAddress(nftMint, wallet.publicKey);
      const [listingPda] = web3.PublicKey.findProgramAddressSync([LISTING_SEED, nftMint.toBuffer()], program.programId);
      const [escrowAccountPda] = web3.PublicKey.findProgramAddressSync([ESCROW_SEED, nftMint.toBuffer()], program.programId);
      const escrowTokenAccount = await getAssociatedTokenAddress(nftMint, escrowAccountPda, true);
      
      await program.methods
        .listForSale(new BN(priceInLamports))
        .accounts({
          seller: wallet.publicKey,
          event: new web3.PublicKey(selectedTicket.account.event),
          ticket: new web3.PublicKey(selectedTicket.publicKey),
          nftMint: nftMint,
          sellerTokenAccount: sellerTokenAccount,
          listing: listingPda,
          escrowAccount: escrowAccountPda,
          escrowTokenAccount: escrowTokenAccount,
        }).rpc();
      
      toast.success("Ingresso listado! Atualizando...", { id: loadingToast });
      return true;
    } catch (error) {
      console.error("Erro ao listar ingresso:", error);
      toast.error(`Falha ao listar: Verifique o console.`, { id: loadingToast });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelListing = async (ticket, program, wallet) => {
    if (!program) {
      toast.error('Programa não disponível');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Cancelando listagem...");
    try {
      const nftMint = new web3.PublicKey(ticket.account.nftMint);
      const [listingPda] = web3.PublicKey.findProgramAddressSync([LISTING_SEED, nftMint.toBuffer()], program.programId);
      const [escrowAccountPda] = web3.PublicKey.findProgramAddressSync([ESCROW_SEED, nftMint.toBuffer()], program.programId);
      const sellerTokenAccount = await getAssociatedTokenAddress(nftMint, wallet.publicKey);
      const escrowTokenAccount = await getAssociatedTokenAddress(nftMint, escrowAccountPda, true);
      
      await program.methods
        .cancelListing()
        .accounts({
          seller: wallet.publicKey,
          listing: listingPda,
          ticket: new web3.PublicKey(ticket.publicKey),
          nftMint: nftMint,
          escrowAccount: escrowAccountPda,
          sellerTokenAccount: sellerTokenAccount,
          escrowTokenAccount: escrowTokenAccount,
        }).rpc();

      toast.success("Listagem cancelada! Atualizando...", { id: loadingToast });
      return true;
    } catch (error) {
      console.error("Erro ao cancelar listagem:", error);
      toast.error(`Falha ao cancelar: Verifique o console.`, { id: loadingToast });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimRefund = async (ticket, program, wallet) => {
    if (!program) {
      toast.error('Programa não disponível');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Processando seu reembolso...");
    try {
      const eventKey = new web3.PublicKey(ticket.account.event);
      const nftMint = new web3.PublicKey(ticket.account.nftMint);

      const [refundReservePda] = web3.PublicKey.findProgramAddressSync(
        [REFUND_RESERVE_SEED, eventKey.toBuffer()], program.programId
      );
      const nftTokenAccount = await getAssociatedTokenAddress(nftMint, wallet.publicKey);
      await program.methods
        .claimRefund()
        .accounts({
          event: eventKey,
          buyer: wallet.publicKey,
          ticket: new web3.PublicKey(ticket.publicKey),
          nftToken: nftTokenAccount,
          nftMint: nftMint,
          refundReserve: refundReservePda,
        })
        .rpc();
      toast.success("Reembolso solicitado com sucesso! O ingresso foi queimado.", { id: loadingToast, duration: 4000 });
      return true;
    } catch (error) {
      console.error("Erro ao solicitar reembolso:", error);
      toast.error(`Falha ao solicitar reembolso: Verifique o console.`, { id: loadingToast });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ HANDLERS: Navegação para autenticação
  const handleConnectWallet = () => {
    if (wallet.connect) {
      wallet.connect();
    } else {
      toast.error('Função de conexão não disponível');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return {
    tickets,
    isLoading,
    isSubmitting,
    fetchAllData,
    handleListForSale,
    handleCancelListing,
    handleClaimRefund,
    getUserWallet,
    isUserAuthenticated,
    handleConnectWallet,
    handleLogin
  };
}