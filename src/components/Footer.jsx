// Em: src/components/Footer.jsx

import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaDiscord, FaLinkedin } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

// Um componente simples para os ícones sociais
function SocialIcon({ href, icon: Icon, 'aria-label': ariaLabel }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="text-slate-400 hover:text-blue-500 transition-colors"
    >
      <Icon size={20} />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-12">
          
          {/* Coluna 1: Branding e Social */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="text-2xl font-bold text-white">
              Ticketfy
            </Link>
            <p className="text-sm text-slate-400 mt-3 max-w-xs">
              A plataforma definitiva para eventos e ingressos tokenizados na rede Solana.
            </p>
            <div className="flex space-x-5 mt-6">
              <SocialIcon href="https://twitter.com/ticketfy" icon={FaTwitter} aria-label="Twitter da Ticketfy" />
              <SocialIcon href="https://instagram.com/ticketfy" icon={FaInstagram} aria-label="Instagram da Ticketfy" />
              <SocialIcon href="https://discord.gg/ticketfy" icon={FaDiscord} aria-label="Discord da Ticketfy" />
              <SocialIcon href="https://linkedin.com/company/ticketfy" icon={FaLinkedin} aria-label="LinkedIn da Ticketfy" />
            </div>
          </div>

          {/* Coluna 2: Links da Plataforma */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Plataforma
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/events" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Explorar Eventos
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Criar Evento
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Meus Ingressos
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links de Recursos */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Recursos
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/help" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Links Legais */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior: Copyright e "Powered by" */}
        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col-reverse md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} Ticketfy. Todos os direitos reservados.
          </p>
          <div className="flex items-center text-sm text-slate-500">
            <span className="mr-2">Powered by</span>
            <SiSolana size={16} className="text-purple-400" />
            <span className="ml-1 font-medium text-slate-400">Solana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}