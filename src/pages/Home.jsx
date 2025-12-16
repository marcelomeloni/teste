import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '@/components/event/EventCard';
import { FeaturedEventCard } from '@/components/event/FeaturedEventCard';
import { API_URL } from '@/lib/constants';
import { 
  SparklesIcon, 
  TicketIcon, 
  ShieldCheckIcon, 
  StarIcon,
  BoltIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export function Home() {
    const [nextEvents, setNextEvents] = useState([]);
    const [featuredEvent, setFeaturedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasEvents, setHasEvents] = useState(false);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                console.log('🎯 Buscando 4 próximos eventos (API otimizada)...');
                
                // ✨ NOVA API SUPER RÁPIDA
                const eventsResponse = await fetch(`${API_URL}/api/events/active/next-four`);
                if (!eventsResponse.ok) throw new Error('Falha ao buscar eventos');
                const eventsData = await eventsResponse.json();
                
                console.log(`✅ ${eventsData.length} eventos carregados instantaneamente`);
                
                setNextEvents(eventsData);
                setHasEvents(eventsData.length > 0);
                
                // Primeiro evento vai para o destaque (se houver)
                if (eventsData.length > 0) {
                    setFeaturedEvent(eventsData[0]);
                }

            } catch (error) {
                console.error("Erro ao buscar dados para a home:", error);
                setHasEvents(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    // ✨ Recursos/Benefícios
    const features = [
        {
            icon: ShieldCheckIcon,
            title: "Segurança Blockchain",
            description: "Ingressos NFT únicos e impossíveis de falsificar na Solana"
        },
        {
            icon: BoltIcon,
            title: "Transações Rápidas",
            description: "Compra e venda de ingressos em segundos com taxas mínimas"
        },
        {
            icon: TicketIcon,
            title: "Reembolsos Automáticos",
            description: "Smart contracts garantem reembolsos seguros para eventos cancelados"
        },
        {
            icon: SparklesIcon,
            title: "Experiência Web3",
            description: "Posse real dos seus ingressos como ativos digitais"
        }
    ];

    // ✨ Estatísticas
    const stats = [
        { number: "50K+", label: "Ingressos Vendidos" },
        { number: "500+", label: "Eventos Realizados" },
        { number: "99.9%", label: "Satisfação dos Usuários" },
        { number: "2s", label: "Tempo Médio de Compra" }
    ];

    // Eventos para a grade (exclui o evento em destaque)
    const gridEvents = featuredEvent 
        ? nextEvents.filter(event => event.publicKey !== featuredEvent.publicKey)
        : nextEvents;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* === HERO SECTION === */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-black/40 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/50 to-slate-900"></div>
                
                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-6xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                            <SparklesIcon className="h-5 w-5 text-cyan-400" />
                            <span className="text-sm font-semibold text-white">
                                Viva experiências inesquecíveis!
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                            <span className="text-white">O Futuro dos Eventos é</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 animate-gradient-x">
                                Descentralizado
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
                            Descubra eventos incríveis e garanta seus ingressos NFT com segurança total na blockchain. 
                            <span className="text-cyan-400 font-semibold"> Possua seus ingressos de verdade.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                            <Link 
                                to="/events" 
                                className="group relative bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Explorar Eventos 
                                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {featuredEvent && (
    <section className="py-24 bg-white"> {/* Aumentado: py-16 para py-24 */}
        <div className="container mx-auto px-4">
            <div className="mb-12"> {/* Aumentado: mb-10 para mb-12 */}
                <h2 className="text-4xl font-bold text-slate-900"> {/* Aumentado: text-3xl para text-4xl */}
                    Em alta na <span className="text-purple-600">Ticketfy</span>
                </h2>
            </div>

            {/* Aqui chamamos o novo componente com o design correto */}
            <FeaturedEventCard featuredEvent={featuredEvent} />
            
            {/* Paginação Falsa (opcional, como no exemplo) */}
            <div className="flex justify-center gap-3 mt-8"> {/* Aumentado: gap-2/mt-6 para gap-3/mt-8 */}
                <div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div> {/* Aumentado: w-2 h-2 */}
                <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div> {/* Aumentado: w-2 h-2 */}
                <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div> {/* Aumentado: w-2 h-2 */}
            </div>
        </div>
    </section>
)}
            {/* === PRÓXIMOS EVENTOS === */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Eventos</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Descubra experiências incríveis que vão transformar sua rotina
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-slate-800 rounded-3xl h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Grade de Eventos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {gridEvents.map(event => (
                                    <EventCard key={event.publicKey} event={event} />
                                ))}
                            </div>

                            {/* Mensagem quando não há eventos */}
                            {!hasEvents && (
                                <div className="text-center text-slate-400 py-12">
                                    <p className="text-lg">Nenhum evento próximo encontrado.</p>
                                    <Link to="/create-event" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
                                        Seja o primeiro a criar um evento!
                                    </Link>
                                </div>
                            )}

                            {/* Link para ver todos os eventos (só mostra se temos eventos) */}
                            {hasEvents && (
                                <div className="text-center mt-12">
                                    <Link 
                                        to="/events" 
                                        className="inline-flex items-center gap-2 text-cyan-400 font-bold text-lg hover:text-cyan-300 transition-colors group"
                                    >
                                        Ver todos os eventos
                                        <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

           
        </div>
    );
}