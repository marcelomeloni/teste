// components/certificates/FormatButton.jsx
export function FormatButton({ icon: Icon, active, onClick, disabled = false, title = "" }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                p-2 rounded-md transition-all duration-200 border
                ${active 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                }
                ${disabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'cursor-pointer hover:shadow-sm'
                }
            `}
        >
            <Icon size={18} />
        </button>
    );
}