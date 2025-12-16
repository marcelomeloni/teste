import toast from 'react-hot-toast';

// ------------------------------------------------------------------
// HELPERS VISUAIS (Mantidos para a tabela visual funcionar)
// ------------------------------------------------------------------

export const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return 'Data Inválida';
    }
};

export const formatPrice = (cents) => {
    if (cents === null || cents === undefined || isNaN(cents)) return 'N/A';
    if (cents === 0) return 'Grátis';
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const truncateAddress = (address, chars = 4) => {
    if (!address) return 'N/A';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ------------------------------------------------------------------
// NOVA LÓGICA DE EXPORTAÇÃO CSV (DADOS COMPLETOS / RAW DATA)
// ------------------------------------------------------------------

// Helper interno para ler o JSON do banco sem quebrar
const safeParseJSON = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data) || {};
    } catch (e) {
        return {};
    }
};

// Helper interno para formatar valores dinâmicos para CSV (Excel)
const formatCsvValue = (val) => {
    if (val === null || val === undefined) return '';
    
    // Objetos (ex: Múltipla escolha)
    if (typeof val === 'object') {
        return Object.keys(val).filter(k => val[k] === true).join(', ');
    }
    
    // Booleanos
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    
    // Texto (remove aspas e quebras de linha para não quebrar o CSV)
    return String(val).replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
};

export const exportToCSV = (participants, eventAddress = 'export') => {
    if (!participants || participants.length === 0) {
        toast.error("Não há dados para exportar.");
        return;
    }

    try {
        // 1. Descobrir TODAS as colunas possíveis dentro de 'responses' de todos os usuários
        const allResponseKeys = new Set();
        
        participants.forEach(p => {
            const responses = safeParseJSON(p.responses);
            Object.keys(responses).forEach(key => allResponseKeys.add(key));
        });

        // Ordenar colunas dinâmicas alfabeticamente para ficar organizado
        const dynamicHeaders = Array.from(allResponseKeys).sort();

        // 2. Definir Cabeçalhos Fixos
        // Incluímos dados da Conta (User) e dados do Ticket separadamente
        const fixedHeaders = [
            'ID Ticket',
            'Nome (Conta)',
            'Email (Conta)',
            'Telefone (Conta)',
            'Wallet',
            'Tipo Ingresso',
            'Valor',
            'Status Pagto',
            'Status Transação',
            'Data Compra',
            'Check-in',
            'Data Check-in',
            'NFT Mint'
        ];

        // Cabeçalho Final = Fixos + Dinâmicos
        const headers = [...fixedHeaders, ...dynamicHeaders];
        const csvRows = [];

        // Adiciona a linha de títulos (com BOM para acentuação no Excel)
        csvRows.push(headers.map(h => `"${h}"`).join(','));

        // 3. Mapear cada participante linha por linha
        participants.forEach(p => {
            const responses = safeParseJSON(p.responses);
            const price = p.price_brl_cents || 0;

            // Dados Fixos
            const rowData = [
                p.id,
                p.user?.name || '',
                p.user?.email || '',
                p.user?.phone_number || '',
                p.user?.wallet_address || 'Não vinculada',
                p.tier_name || '',
                price === 0 ? 'Grátis' : (price / 100).toFixed(2).replace('.', ','),
                price > 0 && p.status === 'confirmed' ? 'Pago' : 'Grátis',
                p.status || '',
                p.purchase_date ? new Date(p.purchase_date).toLocaleString('pt-BR') : '',
                p.is_redeemed ? 'Realizado' : 'Pendente',
                p.redeemed_at ? new Date(p.redeemed_at).toLocaleString('pt-BR') : '',
                p.nft_mint_address || ''
            ];

            // Dados Dinâmicos (Preenche colunas do formulário)
            dynamicHeaders.forEach(key => {
                rowData.push(formatCsvValue(responses[key]));
            });

            // Formata a linha para CSV
            csvRows.push(rowData.map(v => `"${v}"`).join(','));
        });

        // 4. Gerar arquivo
        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `participantes_${eventAddress}_${dateStr}.csv`;

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Download iniciado com dados completos!");

    } catch (error) {
        console.error("Erro na exportação CSV:", error);
        toast.error("Erro ao gerar o arquivo CSV.");
    }
};

// ------------------------------------------------------------------
// ESTATÍSTICAS (Mantido original para não quebrar seus Cards)
// ------------------------------------------------------------------

export const calculateStats = (participants) => {
    const total = participants.length;
    if (total === 0) return { redeemedCount: 0, totalCount: 0, percentage: 0, paidCount: 0, freeCount: 0, confirmedCount: 0 };

    const redeemed = participants.filter(p => p.is_redeemed).length;
    const paid = participants.filter(p => p.price_brl_cents > 0 && p.status === 'confirmed').length;
    const free = participants.filter(p => p.price_brl_cents === 0).length;
    const confirmed = participants.filter(p => p.status === 'confirmed').length;
    const perc = total > 0 ? Math.round((redeemed / total) * 100) : 0;

    return { 
        redeemedCount: redeemed, 
        totalCount: total, 
        percentage: perc, 
        paidCount: paid, 
        freeCount: free,
        confirmedCount: confirmed
    };
};