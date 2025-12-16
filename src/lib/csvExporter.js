import toast from 'react-hot-toast';

/**
 * Helper seguro para tentar fazer parse de JSON se for string
 */
const safeParseJSON = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data; // Já é objeto
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn("Erro ao fazer parse de responses:", e);
        return {};
    }
};

/**
 * Formata valores para CSV
 */
const formatValue = (val) => {
    if (val === null || val === undefined) return '';

    // Caso seja objeto (ex: Múltipla Escolha)
    if (typeof val === 'object') {
        return Object.keys(val)
            .filter(k => val[k] === true)
            .join(', ');
    }

    // Caso seja booleano
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';

    // Limpa strings
    return String(val).replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
};

/**
 * Prepara e "achata" os dados
 */
function prepareDataForCsv(participants) {
    if (!participants || participants.length === 0) return [];

    // 1. Descobrir colunas dinâmicas (com parse seguro)
    const dynamicHeadersSet = new Set();
    
    participants.forEach(p => {
        const responses = safeParseJSON(p.responses); // <--- CORREÇÃO AQUI
        Object.keys(responses).forEach(key => dynamicHeadersSet.add(key));
    });

    // Remove campos técnicos redundantes das colunas dinâmicas
    dynamicHeadersSet.delete('name');
    dynamicHeadersSet.delete('email');
    dynamicHeadersSet.delete('field-1'); // Removemos IDs genéricos se já tiver labels
    dynamicHeadersSet.delete('field-2');

    const dynamicHeaders = Array.from(dynamicHeadersSet);

    // 2. Mapear dados
    return participants.map(p => {
        const responses = safeParseJSON(p.responses); // <--- CORREÇÃO AQUI
        
        // Tenta pegar dados do User, ou do Form, ou vazio
        const userName = p.user?.name || responses['name'] || responses['Nome Completo'] || responses['field-1'] || '';
        const userEmail = p.user?.email || responses['email'] || responses['E-mail'] || responses['field-2'] || '';

        // Objeto base (Colunas Fixas)
        const flatObject = {
            'ID': p.id,
            'Nome': userName,
            'Email': userEmail,
            'Telefone': p.user?.phone_number || '', // Adicionado pra manter compatibilidade
            'Wallet': p.user?.wallet_address || '',
            'Ingresso': p.tier_name || '',
            'Preço (BRL)': p.price_brl_cents ? (p.price_brl_cents / 100).toFixed(2).replace('.', ',') : '0,00',
            'Status': p.status || '',
            'Check-in': p.is_redeemed ? 'Realizado' : 'Pendente',
            'Data Compra': p.purchase_date ? new Date(p.purchase_date).toLocaleString('pt-BR') : ''
        };

        // Adiciona Colunas Dinâmicas
        dynamicHeaders.forEach(header => {
            flatObject[header] = formatValue(responses[header]);
        });

        return flatObject;
    });
}

/**
 * Gera string CSV
 */
function convertToCsv(data) {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Header
    csvRows.push(headers.map(h => `"${h}"`).join(','));

    // Rows
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Função Principal exportada
 */
export function exportToCSV(rawParticipants, eventAddress = 'evento') {
    if (!rawParticipants || rawParticipants.length === 0) {
        toast.error("Não há participantes para exportar.");
        return;
    }

    try {
        const flatData = prepareDataForCsv(rawParticipants);
        const csvString = convertToCsv(flatData);
        
        // Download com BOM para acentuação correta no Excel
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `participantes_${dateStr}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Download iniciado!");
    } catch (error) {
        console.error("Erro exportação:", error);
        toast.error("Erro ao gerar arquivo.");
    }
}