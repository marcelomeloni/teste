export function ActionButtons({ onReset, onPreview, onUpdate }) {
    return (
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
            <button 
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50"
                onClick={onReset}
            >
                Resetar Layout
            </button>
            <button 
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50"
                onClick={onPreview}
            >
                Pré-visualizar
            </button>
            <button 
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700"
                onClick={onUpdate}
            >
                Atualizar
            </button>
        </div>
    );
}