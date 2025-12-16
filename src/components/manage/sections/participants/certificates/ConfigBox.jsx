export function ConfigBox({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5">
                <h3 className="text-md font-semibold text-slate-800">{title}</h3>
            </div>
            <div className="p-5 border-t border-slate-200 space-y-4">
                {children}
            </div>
        </div>
    );
}