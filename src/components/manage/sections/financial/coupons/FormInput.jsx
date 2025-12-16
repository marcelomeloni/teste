import React from 'react';
import { HelpCircle } from 'lucide-react';

const FormInput = ({ label, name, value, onChange, placeholder, helpText, type = "text", disabled = false }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
                {label}
                {helpText && <HelpCircle size={14} className="inline-block ml-1 text-slate-400" />}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${disabled ? 'bg-slate-100 text-slate-500' : ''}`}
            />
        </div>
    );
};

export default FormInput;