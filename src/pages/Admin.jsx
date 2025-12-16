import { useState, useMemo, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import toast from 'react-hot-toast';
import idl from '@/idl/ticketing_system.json';
import { AdminCard } from '@/components/ui/AdminCard';
import { InputField } from '@/components/ui/InputField';
import { ActionButton } from '@/components/ui/ActionButton';
import { InfoBox } from '@/components/ui/InfoBox';
import { Spinner } from '@/components/ui/Spinner';
import { PROGRAM_ID } from '@/lib/constants';
import { useAppWallet } from '@/hooks/useAppWallet';

// --- Constantes ---
const GLOBAL_CONFIG_SEED = Buffer.from("config");
const WHITELIST_SEED = Buffer.from("whitelist");

// --- Ícones (autocontidos para facilitar o copiar/colar) ---
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

// --- Componente Modal (autocontido) ---
const Modal = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
            </div>
            {children}
        </div>
    </div>
);


export function Admin() {
    // --- Hooks e Estados ---
    const { connection } = useConnection();
    const wallet = useAppWallet();
    
    // Estados de transação
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados de UI e Modais
    const [isAdmin, setIsAdmin] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const [isFetchingWhitelist, setIsFetchingWhitelist] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Dados
    const [globalConfigData, setGlobalConfigData] = useState(null);
    const [whitelistedWallets, setWhitelistedWallets] = useState([]);
    const [editingOrganizer, setEditingOrganizer] = useState(null); // Para o modal de edição

    // Campos de Formulário
    const [tfyTokenMint, setTfyTokenMint] = useState('');
    // Para o modal de ADIÇÃO
    const [newOrganizerAddress, setNewOrganizerAddress] = useState('');
    const [newOrganizerFee, setNewOrganizerFee] = useState('500');
    // Para o modal de EDIÇÃO
    const [editFee, setEditFee] = useState('');


    // --- Configuração Anchor ---
    const provider = useMemo(() => {
        if (!wallet || !wallet.connected || !wallet.publicKey) return null;
        return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    }, [connection, wallet]);

    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(idl, PROGRAM_ID, provider);
    }, [provider]);

    
    // --- Funções de Busca de Dados ---
    const fetchWhitelistedWallets = useCallback(async () => {
        if (!program) return;
        setIsFetchingWhitelist(true);
        try {
            const allWhitelistAccounts = await program.account.whitelist.all();
            const activeWallets = allWhitelistAccounts
                .filter(acc => acc.account.isWhitelisted)
                .map(acc => ({
                    wallet: acc.account.wallet.toString(),
                    platformFeeBps: acc.account.platformFeeBps,
                }));
            setWhitelistedWallets(activeWallets);
        } catch (error) {
            console.error("Erro ao buscar a whitelist:", error);
            toast.error("Não foi possível carregar a whitelist.");
        } finally {
            setIsFetchingWhitelist(false);
        }
    }, [program]);

    const checkPermissions = useCallback(async () => {
        if (!program || !wallet || !wallet.connected) {
            setIsAdmin(false);
            setIsLoadingPermissions(false);
            return;
        }
        setIsLoadingPermissions(true);
        try {
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
            const globalConfig = await program.account.globalConfig.fetch(globalConfigPda);
            
            setGlobalConfigData(globalConfig);
            setIsInitialized(true);
            const isAdminUser = globalConfig.authority.equals(wallet.publicKey);
            setIsAdmin(isAdminUser);

            if (isAdminUser) {
                await fetchWhitelistedWallets();
            }
        } catch (error) {
            if (error.message.includes("Account does not exist") || error.message.includes("could not be found")) {
                setIsInitialized(false);
                setIsAdmin(false);
            } else {
                console.error("Erro ao verificar permissões:", error);
                setIsAdmin(false);
                setIsInitialized(true); // O config existe mas falhou por outra razão
            }
        } finally {
            setIsLoadingPermissions(false);
        }
    }, [wallet, program, fetchWhitelistedWallets]);

    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    
    // --- Handlers de Transação ---
    const handleInitialize = async (event) => {
        event.preventDefault();
        if (!program || !wallet.connected || !tfyTokenMint) {
            toast.error("Preencha todos os campos e conecte a carteira.");
            return;
        }
        setIsSubmitting(true);
        const loadingToast = toast.loading("Inicializando protocolo...");
        try {
            const tfyTokenMintPubkey = new web3.PublicKey(tfyTokenMint);
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
    
            await program.methods
                .initialize(wallet.publicKey, tfyTokenMintPubkey)
                .accounts({
                    authority: wallet.publicKey,
                    globalConfig: globalConfigPda,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();
            
            toast.success("Protocolo inicializado com sucesso!", { id: loadingToast });
            await checkPermissions();
        } catch (error) {
            console.error("Erro na inicialização:", error);
            const errorMessage = error.message.includes('already in use') ? 'Protocolo já foi inicializado' : 'Falha na transação.';
            toast.error(`Erro: ${errorMessage}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleTogglePause = async () => {
        if (!program || !wallet.connected || globalConfigData === null) return;

        const newPausedState = !globalConfigData.paused;
        const actionText = newPausedState ? 'pausar' : 'reativar';

        if (!confirm(`Tem certeza que deseja ${actionText} o protocolo?`)) return;

        setLoading(true);
        const loadingToast = toast.loading(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ndo protocolo...`);
        try {
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
            await program.methods.togglePause(newPausedState)
                .accounts({
                    globalConfig: globalConfigPda,
                    authority: wallet.publicKey
                })
                .rpc();

            toast.success(`Protocolo ${newPausedState ? 'pausado' : 'reativado'} com sucesso.`, { id: loadingToast });
            await checkPermissions();
        } catch (error) {
            console.error(`Erro ao ${actionText} o protocolo:`, error);
            toast.error(`Falha ao ${actionText} o protocolo.`, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddOrganizer = async (event) => {
        event.preventDefault();
        if (!program || !wallet.connected || !newOrganizerAddress || !newOrganizerFee) {
            toast.error("Preencha todos os campos.");
            return;
        }
        setIsSubmitting(true);
        const loadingToast = toast.loading("Adicionando organizador...");
        try {
            const walletPubkey = new web3.PublicKey(newOrganizerAddress);
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
            const [whitelistPda] = web3.PublicKey.findProgramAddressSync([WHITELIST_SEED, walletPubkey.toBuffer()], program.programId);

            await program.methods
                .manageWhitelist(walletPubkey, true, new BN(parseInt(newOrganizerFee)))
                .accounts({
                    globalConfig: globalConfigPda,
                    authority: wallet.publicKey,
                    whitelist: whitelistPda,
                    wallet: walletPubkey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            toast.success("Organizador adicionado com sucesso!", { id: loadingToast });
            await fetchWhitelistedWallets();
            setIsAddModalOpen(false);
            setNewOrganizerAddress('');
            setNewOrganizerFee('500');
        } catch (error) {
            console.error("Erro ao adicionar organizador:", error);
            toast.error("Endereço inválido ou falha na transação.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateFee = async (event) => {
        event.preventDefault();
        if (!program || !wallet.connected || !editingOrganizer || !editFee) {
            toast.error("Dados inválidos para atualização.");
            return;
        }
        setIsSubmitting(true);
        const loadingToast = toast.loading("Atualizando taxa...");
        try {
            const walletPubkey = new web3.PublicKey(editingOrganizer.wallet);
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
            const [whitelistPda] = web3.PublicKey.findProgramAddressSync([WHITELIST_SEED, walletPubkey.toBuffer()], program.programId);

            await program.methods
                .updateRoyalty(walletPubkey, new BN(parseInt(editFee)))
                .accounts({
                    globalConfig: globalConfigPda,
                    authority: wallet.publicKey,
                    whitelist: whitelistPda,
                    wallet: walletPubkey,
                })
                .rpc();
            
            toast.success("Taxa atualizada com sucesso.", { id: loadingToast });
            await fetchWhitelistedWallets();
            setIsEditModalOpen(false);
            setEditingOrganizer(null);
        } catch (error) {
            console.error("Erro ao atualizar taxa:", error);
            toast.error("Falha ao atualizar a taxa.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveOrganizer = async (walletToRemove) => {
        if (!program || !wallet.connected) return;

        if (!confirm(`Tem certeza que deseja remover este organizador? Esta ação não pode ser desfeita.`)) return;

        const loadingToast = toast.loading("Removendo organizador...");
        try {
            const walletPubkey = new web3.PublicKey(walletToRemove);
            const [globalConfigPda] = web3.PublicKey.findProgramAddressSync([GLOBAL_CONFIG_SEED], program.programId);
            const [whitelistPda] = web3.PublicKey.findProgramAddressSync([WHITELIST_SEED, walletPubkey.toBuffer()], program.programId);

            await program.methods
                .manageWhitelist(walletPubkey, false, new BN(0)) // isWhitelisted = false
                .accounts({
                    globalConfig: globalConfigPda,
                    authority: wallet.publicKey,
                    whitelist: whitelistPda,
                    wallet: walletPubkey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            toast.success("Organizador removido com sucesso.", { id: loadingToast });
            await fetchWhitelistedWallets();
        } catch (error) {
            console.error("Erro ao remover organizador:", error);
            toast.error("Falha ao remover o organizador.", { id: loadingToast });
        }
    };

    // --- Funções de UI ---
    const handleOpenEditModal = (organizer) => {
        setEditingOrganizer(organizer);
        setEditFee(organizer.platformFeeBps.toString());
        setIsEditModalOpen(true);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Endereço copiado!");
    };

    // --- Renderização ---
    const renderContent = () => {
        if (isLoadingPermissions) {
            return (
                <div className="flex justify-center py-20">
                    <Spinner />
                    <span className="ml-3 text-slate-600">Verificando permissões...</span>
                </div>
            );
        }

        if (!wallet?.connected) {
            return <InfoBox title="Carteira Não Conectada" message="Por favor, conecte uma carteira para acessar o painel." status="warning" />;
        }

        if (!isInitialized) {
            return (
                <>
                    <InfoBox title="Ação Necessária: Inicializar Protocolo" message="O contrato precisa ser inicializado. A carteira que fizer isso se tornará a administradora." status="info" />
                    <div className="max-w-md mx-auto mt-8">
                        <AdminCard title="Inicialização do Protocolo" subtitle="(Apenas uma vez)">
                            <form onSubmit={handleInitialize} className="space-y-4">
                                <InputField label="Endereço do Token da Plataforma" value={tfyTokenMint} onChange={(e) => setTfyTokenMint(e.target.value)} required placeholder="Endereço do token SPL..." />
                                <ActionButton type="submit" loading={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!tfyTokenMint}>
                                    Tornar-se Admin e Inicializar
                                </ActionButton>
                            </form>
                        </AdminCard>
                    </div>
                </>
            );
        }

        if (!isAdmin) {
            return <InfoBox title="Acesso Negado" message="Sua carteira não tem permissão de administrador." status="error" />;
        }

        // --- O DASHBOARD PRINCIPAL ---
        return (
            <>
                {/* --- HEADER COM KPIs --- */}
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 text-center">Painel do Administrador</h1>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm font-semibold text-slate-500">STATUS DO SISTEMA</div>
                            <div className={`mt-1 text-2xl font-bold flex items-center ${globalConfigData?.paused ? 'text-amber-600' : 'text-green-600'}`}>
                                <span className={`h-3 w-3 rounded-full mr-2 ${globalConfigData?.paused ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                {globalConfigData?.paused ? 'Pausado' : 'Ativo'}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm font-semibold text-slate-500">ORGANIZADORES ATIVOS</div>
                            <div className="mt-1 text-2xl font-bold text-slate-800">{whitelistedWallets.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm font-semibold text-slate-500">TAXA PADRÃO</div>
                            <div className="mt-1 text-2xl font-bold text-slate-800">
                                {globalConfigData ? `${(globalConfigData.defaultPlatformFeeBps / 100).toFixed(1)}%` : 'N/A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* --- COLUNA ESQUERDA: Ações --- */}
                    <div className="lg:col-span-1 space-y-8">
                        <AdminCard title="Controle do Protocolo">
                             <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                <span className="font-semibold text-slate-700">Pausar Novas Vendas</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={globalConfigData?.paused} onChange={handleTogglePause} className="sr-only peer" disabled={loading} />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                                Ao pausar, a criação de eventos e a compra de ingressos são desativadas temporariamente.
                            </p>
                        </AdminCard>
                    </div>

                    {/* --- COLUNA DIREITA: Tabela --- */}
                    <div className="lg:col-span-2">
                        <AdminCard title="Gerenciamento de Organizadores">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-600">{whitelistedWallets.length} organizador(es) ativo(s).</p>
                                <ActionButton onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-sm py-2 px-3">
                                    + Adicionar Organizador
                                </ActionButton>
                            </div>
                            
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Carteira</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Taxa</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {isFetchingWhitelist ? (
                                            <tr><td colSpan="3" className="text-center py-10"><Spinner /></td></tr>
                                        ) : whitelistedWallets.length > 0 ? (
                                            whitelistedWallets.map(org => (
                                                <tr key={org.wallet}>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="font-mono text-sm text-slate-700">
                                                                {`${org.wallet.slice(0, 6)}...${org.wallet.slice(-6)}`}
                                                            </span>
                                                            <button onClick={() => handleCopy(org.wallet)} className="ml-2 text-slate-400 hover:text-blue-600"><CopyIcon /></button>
                                                        </div>
                                                         {org.wallet === wallet.publicKey?.toString() && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Você</span>
                                                         )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-800">
                                                        {(org.platformFeeBps / 100).toFixed(1)}%
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button onClick={() => handleOpenEditModal(org)} className="p-1 text-slate-500 hover:text-blue-700" title="Editar Taxa"><EditIcon /></button>
                                                            {org.wallet !== wallet.publicKey?.toString() && (
                                                                <button onClick={() => handleRemoveOrganizer(org.wallet)} className="p-1 text-slate-500 hover:text-red-700" title="Remover Organizador"><TrashIcon /></button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3" className="text-center py-10 text-slate-500">Nenhum organizador registrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </AdminCard>
                    </div>
                </div>

                {/* --- MODAIS --- */}
                {isAddModalOpen && (
                    <Modal title="Adicionar Novo Organizador" onClose={() => setIsAddModalOpen(false)}>
                        <form onSubmit={handleAddOrganizer} className="space-y-4">
                            <InputField label="Endereço da Carteira" value={newOrganizerAddress} onChange={e => setNewOrganizerAddress(e.target.value)} required placeholder="Cole o endereço da carteira Solana..." />
                            <InputField label="Taxa de Plataforma (BPS)" type="number" value={newOrganizerFee} onChange={e => setNewOrganizerFee(e.target.value)} required min="0" max="10000" />
                            <p className="text-sm text-slate-500 -mt-2">Ex: 500 para 5.0%. O valor é em basis points.</p>
                            <div className="flex justify-end space-x-3 pt-2">
                                <ActionButton onClick={() => setIsAddModalOpen(false)} type="button" className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancelar</ActionButton>
                                <ActionButton type="submit" loading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">Adicionar</ActionButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {isEditModalOpen && editingOrganizer && (
                     <Modal title="Editar Taxa do Organizador" onClose={() => setIsEditModalOpen(false)}>
                        <form onSubmit={handleUpdateFee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Carteira</label>
                                <p className="font-mono text-sm bg-slate-100 p-2 rounded-md break-all">{editingOrganizer.wallet}</p>
                            </div>
                            <InputField label="Nova Taxa de Plataforma (BPS)" type="number" value={editFee} onChange={e => setEditFee(e.target.value)} required min="0" max="10000" />
                            <p className="text-sm text-slate-500 -mt-2">Ex: 250 para 2.5%.</p>
                             <div className="flex justify-end space-x-3 pt-2">
                                <ActionButton onClick={() => setIsEditModalOpen(false)} type="button" className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancelar</ActionButton>
                                <ActionButton type="submit" loading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">Salvar Alterações</ActionButton>
                            </div>
                        </form>
                    </Modal>
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            {renderContent()}
        </div>
    );
}