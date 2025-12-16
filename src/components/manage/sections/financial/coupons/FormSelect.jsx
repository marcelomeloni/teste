import React from 'react';
import { ChevronDown } from 'lucide-react';

const FormSelect = ({ label, name, value, onChange, options, helpText }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
                {label}
                {helpText && <span className="inline-block ml-1 text-slate-400">?</span>}
            </label>
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <ChevronDown size={18} className="text-slate-400" />
                </div>
            </div>
        </div>
    );
};

export default FormSelect;