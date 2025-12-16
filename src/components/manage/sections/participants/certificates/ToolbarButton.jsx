export function ToolbarButton({ icon: Icon, label, onClick }) {
    return (
        <button 
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClick}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}