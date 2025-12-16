export function CheckboxOption({ id, name, label, description, checked, onChange }) {
    return (
        <div className="flex items-start gap-3">
            <input 
                type="checkbox" 
                id={id} 
                name={name} 
                checked={checked} 
                onChange={onChange} 
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded mt-0.5"
            />
            <div>
                <label htmlFor={id} className="font-medium text-slate-800 cursor-pointer text-sm">
                    {label}
                </label>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    );
}