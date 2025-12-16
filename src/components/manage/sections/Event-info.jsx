import React, { useState, Fragment, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image'; // Biblioteca para gerar a imagem
import { Dialog, Transition } from '@headlessui/react';
import {
    CheckCircleIcon,
    CurrencyDollarIcon,
    XCircleIcon,
    TicketIcon,
    PencilSquareIcon,
    ShareIcon,
    LinkIcon,
    PhotoIcon,
    DocumentDuplicateIcon,
    EyeIcon,
    TrashIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; 

// --- IMPORTAÇÃO DO TEMPLATE DO FLYER ---
// Ajuste o caminho se necessário. Baseado na sua estrutura: ../sections/financial/Event-info.jsx -> ../sections/flyer/EventFlyerTemplate.jsx
import EventFlyerTemplate from './flyer/EventFlyerTemplate';

// --- Sub-componente para os cartões de estatísticas ---
const StatCard = ({ icon: Icon, title, value, colorClass, helpText, isLoading }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center justify-between border border-slate-200">
        <div>
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
                {helpText && (
                    <div className="group relative">
                        <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-pointer" />
                        <span className="absolute bottom-full mb-2 w-48 hidden group-hover:block bg-slate-800 text-white text-xs rounded-lg p-2 text-center z-10">
                            {helpText}
                        </span>
                    </div>
                )}
            </div>
            {/* Adicionado estado de loading ao valor */}
            {isLoading ? (
              <div className="h-9 w-24 bg-slate-200 rounded-md animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            )}
        </div>
        <div className={`rounded-full p-3 ${colorClass}`}>
            <Icon className="h-7 w-7 text-white" />
        </div>
    </div>
);

// --- Sub-componente para os blocos de informação ---
const InfoBlock = ({ title, children, className = '' }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
        <div className="text-sm text-slate-800">{children}</div>
    </div>
);


export function EventInfo({ event, metadata, eventAddress }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // --- ESTADO E REF PARA O FLYER ---
    const flyerRef = useRef(null);
    const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);

    // --- ESTADO PARA ESTATÍSTICAS ---
    const [stats, setStats] = useState({
      approved_tickets: 0,
      pending_tickets: 0,
      cancelled_tickets: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    const isDraft = event?.is_draft;
    const totalCapacity = event?.total_tickets_supply || 0;
    
    // --- LÓGICA DE BUSCA DE DADOS (RPC) ---
    useEffect(() => {
        // Se for um rascunho, não precisamos buscar estatísticas de ingressos
        if (isDraft || !eventAddress) {
            setStatsLoading(false);
            return;
        }
        
        async function fetchEventStats() {
            setStatsLoading(true);
            
            // 1. Chamar a função SQL 'get_event_stats'
            const { data, error } = await supabase.rpc('get_event_stats', {
              p_event_address: eventAddress
            });
            
            // Debug Log
            console.log("🔍 Debug EventInfo:", {
                eventAddress,
                isDraft,
                totalCapacity,
                dataFromRPC: data,
                errorFromRPC: error
            });

            if (error) {
                console.error("Erro ao buscar estatísticas do evento:", error);
                toast.error("Não foi possível carregar as estatísticas de ingressos.");
            } else if (data && data.length > 0) {
                // 2. Atualizar o estado com os dados retornados
                setStats(data[0]); 
            }
            setStatsLoading(false);
        }

        fetchEventStats();
    }, [eventAddress, isDraft]);
    
    // Os valores agora vêm do estado 'stats' ou do 'event'
    const ticketsSold = stats.approved_tickets || 0;
    const ticketsRemaining = isDraft ? totalCapacity : (totalCapacity - ticketsSold);
    const eventLink = `${window.location.origin}/event/${eventAddress}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(eventLink);
        toast.success("Link da página do evento copiado!");
    };
    const handleCopyValidatorLink = () => {

        const validatorLink = `${window.location.origin}/event/${eventAddress}/validate`;
        
        navigator.clipboard.writeText(validatorLink);
        toast.success("Link de validação copiado!");
    };
    
    // --- FUNÇÃO CHAMADA AO CONFIRMAR A PUBLICAÇÃO ---
    const handlePublish = () => {
        console.log("Publicando evento...");
        toast.success("Evento publicado com sucesso!");
        setIsModalOpen(false); 
    };

    // --- FUNÇÃO PARA GERAR O FLYER ---
    const handleDownloadFlyer = async () => {
        if (!flyerRef.current) return;
        
        setIsGeneratingFlyer(true);
        const toastId = toast.loading('Criando arte do flyer...');

        try {
            // Gera a imagem a partir do componente renderizado off-screen
            const dataUrl = await toPng(flyerRef.current, { 
                cacheBust: true, 
                pixelRatio: 2, // Alta qualidade
                quality: 1.0,
                // backgroundColor: '#0f172a' // Opcional: força fundo escuro caso tenha transparência indesejada
            });
            
            // Cria link de download
            const link = document.createElement('a');
            const safeName = event?.name ? event.name.replace(/\s+/g, '-').toLowerCase() : 'evento';
            link.download = `flyer-${safeName}.png`;
            link.href = dataUrl;
            link.click();
            
            toast.success("Flyer baixado com sucesso!", { id: toastId });
        } catch (err) {
            console.error('Erro ao gerar flyer:', err);
            toast.error("Erro ao gerar a imagem. Tente novamente.", { id: toastId });
        } finally {
            setIsGeneratingFlyer(false);
        }
    };
    
    // Os valores dos cards vêm do estado 'stats'
    const pendingPaymentCount = stats.pending_tickets || 0;
    const approvedTicketsCount = stats.approved_tickets || 0;
    const cancelledTicketsCount = stats.cancelled_tickets || 0;
    
    const pageViews = isDraft ? 0 : (event?.statistics?.total_views || 0);
    const isPublished = event?.state === 1;

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-full">
            
            {/* --- COMPONENTE DO FLYER (Renderizado fora da visão do usuário) --- */}
            <EventFlyerTemplate ref={flyerRef} event={event} />

            <div className="max-w-7xl mx-auto">
                {/* --- SEÇÃO DE ESTATÍSTICAS (ATUALIZADA) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        icon={CheckCircleIcon} 
                        title="Ingressos Aprovados" 
                        value={approvedTicketsCount} 
                        colorClass="bg-green-500"
                        helpText="Ingressos com pagamento confirmado."
                        isLoading={statsLoading}
                    />
                    <StatCard 
                        icon={CurrencyDollarIcon} 
                        title="Pendente de Pagamento" 
                        value={pendingPaymentCount} 
                        colorClass="bg-amber-500"
                        helpText="Ingressos aguardando confirmação de pagamento."
                        isLoading={statsLoading}
                    />
                    <StatCard 
                        icon={XCircleIcon} 
                        title="Ingressos Cancelados" 
                        value={cancelledTicketsCount} 
                        colorClass="bg-red-500"
                        helpText="Ingressos que foram cancelados ou falharam."
                        isLoading={statsLoading}
                    />
                    <StatCard 
                        icon={TicketIcon} 
                        title="Ingressos Restantes" 
                        value={ticketsRemaining} 
                        colorClass="bg-slate-500"
                        helpText="Total de ingressos ainda disponíveis para venda."
                        isLoading={statsLoading}
                    />
                </div>

                {/* --- SEÇÃO DE INFORMAÇÕES GERAIS --- */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Informações gerais</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Coluna 1 */}
                        <div className="flex flex-col gap-6">
                            <InfoBlock title="Situação do Evento">
                                <div className={`flex items-center gap-2 ${isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                                    {isPublished ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                                    <span className="font-semibold">{isPublished ? 'Publicado' : 'Não publicado'}</span>
                                    {!isPublished && (
                                        <button 
                                            onClick={() => setIsModalOpen(true)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold ml-2"
                                        >
                                            (Publicar)
                                        </button>
                                    )}
                                </div>
                            </InfoBlock>
                            <InfoBlock title="Informações do evento (Detalhes, localização e etc.)">
                            <button
                                onClick={() => navigate(`/edit-event/${event.id}`)}
                                className="w-full sm:w-auto text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                            >
                                <PencilSquareIcon className="h-4 w-4" />
                                Editar evento
                            </button>
                            </InfoBlock>
                        </div>

                        {/* Coluna 2 */}
                        <div className="flex flex-col gap-6">
                            <InfoBlock title="Página do Evento">
                                <p className="text-sm text-slate-500 mb-3">
                                    {isDraft 
                                        ? "Veja como seu evento aparecerá para os visitantes antes de publicá-lo."
                                        : "Acesse e compartilhe a página pública do seu evento."
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a 
                                        href={eventLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        {isDraft ? 'Visualizar Prévia' : 'Ver Página'}
                                    </a>
                                    
                                    <button 
                                        onClick={handleCopyLink} 
                                        className="w-full sm:w-auto text-sm border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        Copiar Link
                                    </button>
                                </div>
                                {isDraft && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        Este é um link de pré-visualização. Apenas você pode acessá-lo.
                                    </p>
                                )}
                            </InfoBlock>
                        </div>
                        {/* Coluna 3 */}
                        <div className="flex flex-col gap-6">
                        <InfoBlock title="Link para Validadores">
        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-md border border-slate-200">
            <span className="text-xs text-slate-500 truncate mr-2 select-all">
                {window.location.origin}/event/{eventAddress && eventAddress.slice(0, 8)}.../validate
            </span>
            <button 
                onClick={handleCopyValidatorLink}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
                title="Copiar link completo"
            >
                <DocumentDuplicateIcon className="h-4 w-4" />
                Copiar
            </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
            Envie este link para quem fará o check-in na portaria.
        </p>
    </InfoBlock>
                             <InfoBlock title="Outras opções do evento">
                                 <div className="flex flex-wrap gap-2">
                                
                                     <button 
                                        onClick={handleDownloadFlyer}
                                        disabled={isGeneratingFlyer}
                                        className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                     >
                                         <PhotoIcon className="h-4 w-4" />
                                         {isGeneratingFlyer ? 'Gerando...' : 'Flyer'}
                                     </button>

                                     <button className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 flex items-center gap-2 transition-colors">
                                         <DocumentDuplicateIcon className="h-4 w-4" />
                                         Duplicar
                                     </button>
                               <button className="text-sm border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 flex items-center gap-2 transition-colors">
                                         <TrashIcon className="h-4 w-4" />
                                         Cancelar
                                     </button>
                                 </div>
                             </InfoBlock>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RENDERIZAÇÃO DO MODAL DE CONFIRMAÇÃO --- */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handlePublish}
                title="Publicar Evento"
                message="Você tem certeza que deseja publicar seu evento? Você poderá tornar ele privado posteriormente."
            />
        </div>
    );
}


// --- COMPONENTE REUTILIZÁVEL DE MODAL ---
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start gap-4">
                                     <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-0 flex-1">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-slate-500">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                   </button>
                                   <button
                                       type="button"
                                       className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                       onClick={onConfirm}
                                   >
                                       Sim, publicar
                                   </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}