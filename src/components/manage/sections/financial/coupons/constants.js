import {
    ListChecks,
    CheckCircle,
    Ban,
    XCircle,
} from 'lucide-react';

export const statsData = [
    { 
        title: "TIPOS DE CUPONS CRIADOS", 
        value: "0", 
        Icon: ListChecks, 
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100"
    },
    { 
        title: "TIPOS DE CUPONS ATIVOS", 
        value: "0", 
        Icon: CheckCircle, 
        iconColor: "text-green-600",
        iconBg: "bg-green-100"
    },
    { 
        title: "TIPOS DE CUPONS INATIVOS", 
        value: "0", 
        Icon: Ban, 
        iconColor: "text-orange-600",
        iconBg: "bg-orange-100"
    },
    { 
        title: "TIPOS DE CUPONS FINALIZADOS", 
        value: "0", 
        Icon: XCircle, 
        iconColor: "text-red-600",
        iconBg: "bg-red-100"
    },
];

export const mockTiers = [
    "Lote Promocional",
    "1º Lote",
    "2º Lote",
    "3º Lote",
    "Lote Rep"
];