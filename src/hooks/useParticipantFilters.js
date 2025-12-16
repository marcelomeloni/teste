import { useState, useMemo } from 'react';

export const useParticipantFilters = (participants, favorites) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        paymentStatus: 'all',
        checkinStatus: 'all',
        transactionStatus: 'all',
        tierType: ''
    });

    const filteredParticipants = useMemo(() => {
        let filtered = participants;

        // Filtro de busca
        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.user?.name?.toLowerCase().includes(lowercasedFilter) ||
                p.user?.email?.toLowerCase().includes(lowercasedFilter) ||
                p.tier_name?.toLowerCase().includes(lowercasedFilter) ||
                p.nft_mint_address?.toLowerCase().includes(lowercasedFilter) ||
                p.user?.wallet_address?.toLowerCase().includes(lowercasedFilter) ||
                p.user?.phone_number?.toLowerCase().includes(lowercasedFilter)
            );
        }

        // Filtros avançados
        if (filters.paymentStatus !== 'all') {
            filtered = filtered.filter(p => 
                filters.paymentStatus === 'paid' 
                    ? (p.price_brl_cents > 0 && p.status === 'confirmed')
                    : p.price_brl_cents === 0
            );
        }

        if (filters.checkinStatus !== 'all') {
            filtered = filtered.filter(p => 
                filters.checkinStatus === 'checked' ? p.is_redeemed : !p.is_redeemed
            );
        }

        if (filters.transactionStatus !== 'all') {
            filtered = filtered.filter(p => 
                filters.transactionStatus === p.status
            );
        }

        if (filters.tierType) {
            filtered = filtered.filter(p => 
                p.tier_name?.toLowerCase().includes(filters.tierType.toLowerCase())
            );
        }

        // Favoritos primeiro
        filtered.sort((a, b) => {
            const aFav = favorites.has(a.id);
            const bFav = favorites.has(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
        });

        return filtered;
    }, [participants, searchTerm, filters, favorites]);

    return {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        filteredParticipants
    };
};