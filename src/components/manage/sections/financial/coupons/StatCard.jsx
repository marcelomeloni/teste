import React from 'react';

const StatCard = ({ title, value, Icon, iconColor, iconBg }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
            <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
                <Icon size={24} className={iconColor} />
            </div>
        </div>
    );
};

export default StatCard;