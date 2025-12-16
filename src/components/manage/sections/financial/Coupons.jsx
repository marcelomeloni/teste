import React, { useState } from 'react';
import StatCard from './coupons/StatCard';
import CreateCouponModal from './coupons/CreateCouponModal';
import CouponsList from './coupons/CouponsList';
import { statsData } from './coupons/constants';

export const Coupons = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
            
                {/* Grid de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {statsData.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            Icon={stat.Icon}
                            iconColor={stat.iconColor}
                            iconBg={stat.iconBg}
                        />
                    ))}
                </div>
                
                {/* Lista de Cupons */}
                <CouponsList onOpenModal={() => setIsModalOpen(true)} />
            </div>

            {/* Modal de Criação */}
            {isModalOpen && (
                <CreateCouponModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

