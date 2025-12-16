
import { useState } from 'react';
import toast from 'react-hot-toast';

export const TicketDownloader = ({ ticket, eventDetails, children, className }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        if (!eventDetails) {
            return toast.error("Detalhes do evento não encontrados.");
        }
        
        setIsLoading(true);
        const loadingToast = toast.loading('Gerando PDF do ingresso...');

        try {
            const mintAddress = ticket.account.nftMint.toString();

            // ✨ Passo 1: Chamar sua nova API ✨
            const response = await fetch('/api/generate-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mintAddress: mintAddress,
                    eventDetails: eventDetails, // Envia todos os detalhes do evento
                }),
            });

            // ✨ Passo 2: Tratar a resposta ✨
            if (!response.ok) {
                // Tenta ler a mensagem de erro da API
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao gerar o PDF.');
            }

            // ✨ Passo 3: Receber o PDF (Blob) e forçar o download ✨
            const blob = await response.blob();
            
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Ingresso_${eventDetails.metadata.name.replace(/\s/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            
            toast.success('Ingresso baixado com sucesso!', { id: loadingToast });

        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            toast.error(error.message || 'Erro ao gerar PDF.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleDownload} disabled={isLoading} className={className}>
            {isLoading ? 'Gerando...' : children}
        </button>
    );
};