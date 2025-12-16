export function RadioOption({ id, name, label, checked, onChange, value }) {
    return (
        <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
            <input 
                type="radio" 
                id={id} 
                name={name} 
                value={value}
                checked={checked} 
                onChange={onChange} 
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}