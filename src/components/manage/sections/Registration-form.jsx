import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Dialog, Transition } from '@headlessui/react';
import { GripVertical, Trash2, Edit, Plus, Settings, Link as LinkIcon, Loader2, Save, Info } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';

// --- Wrapper para compatibilidade com React 18 StrictMode ---
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);
  if (!enabled) { return null; }
  return <Droppable {...props}>{children}</Droppable>;
};

// --- Tipos de Campo e Sub-Componentes ---
const genericFields = [
    { label: "Nome Completo", type: "text", required: true, isDefault: true, placeholder: 'Digite o nome completo' },
    { label: "E-mail", type: "email", required: true, isDefault: true, placeholder: 'exemplo@email.com' },
    { label: "Data de Nascimento", type: "date", required: false },
    { label: "CPF / CNPJ", type: "text", required: false, placeholder: '000.000.000-00' },
    { label: "Telefone / Celular", type: "tel", required: false, isDefault: true, placeholder: '(00) 00000-0000' },
];
const customFields = [
    { label: "Texto Simples", type: "text", required: false, placeholder: 'Sua resposta aqui' },
    { label: "Lista de Opções", type: "select", required: false, options: ['Opção 1', 'Opção 2'] },
    { label: "Múltipla Escolha", type: "checkbox", required: false, options: ['Opção A', 'Opção B'] },
    { label: "Eu aceito os Termos e Condições", type: "terms", required: true, link: 'https://seusite.com/termos' },
];

const FieldButton = ({ label, onAdd }) => ( <button onClick={onAdd} className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">{label}</button> );
const ToggleSwitch = ({ checked, onChange }) => ( <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`${checked ? 'bg-indigo-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full`}><span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/></button> );

// --- Modal de Edição de Campo ---
function EditFieldModal({ field, isOpen, onClose, onSave }) {
    const [editedField, setEditedField] = useState(null);
    useEffect(() => { if (field) setEditedField({ ...field }); }, [field]);
    if (!editedField) return null;
    const handleInputChange = (e) => setEditedField({ ...editedField, [e.target.name]: e.target.value });
    const handleOptionChange = (index, value) => { const options = [...editedField.options]; options[index] = value; setEditedField({ ...editedField, options }); };
    const addOption = () => { const options = editedField.options ? [...editedField.options] : []; setEditedField({ ...editedField, options: [...options, `Nova Opção ${options.length + 1}`] }); };
    const removeOption = (index) => setEditedField({ ...editedField, options: editedField.options.filter((_, i) => i !== index) });
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/30" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings size={20} /> Editar Campo</Dialog.Title>
                            <div className="mt-4 space-y-4">
                                <div><label className="text-sm font-medium text-slate-700">Nome/Texto do Campo</label><input type="text" name="label" value={editedField.label} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md"/></div>
                                {editedField.type === 'text' && (<div><label className="text-sm font-medium text-slate-700">Texto de Ajuda (Placeholder)</label><input type="text" name="placeholder" value={editedField.placeholder || ''} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md"/></div>)}
                                {(editedField.type === 'select' || editedField.type === 'checkbox') && (<div><label className="text-sm font-medium text-slate-700">Opções</label><div className="space-y-2 mt-2">{(editedField.options || []).map((option, index) => (<div key={index} className="flex items-center gap-2"><input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" /><button onClick={() => removeOption(index)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button></div>))}<button onClick={addOption} className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><Plus size={16}/> Adicionar Opção</button></div></div>)}
                                {editedField.type === 'terms' && (<div><label className="text-sm font-medium text-slate-700">Link para a página de Termos</label><div className="relative mt-1"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LinkIcon className="h-5 w-5 text-slate-400" /></div><input type="url" name="link" value={editedField.link || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md" placeholder="https://seusite.com/termos"/></div></div>)}
                            </div>
                            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancelar</button><button type="button" onClick={() => onSave(editedField)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Salvar Alterações</button></div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
}

// --- Componente Principal ---
export function RegistrationForm({ event, eventAddress }) {
    const [fields, setFields] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Efeito para carregar os dados do formulário da API
    useEffect(() => {
        const defaultFields = [
            { id: 'field-1', label: 'Nome Completo', type: 'text', required: true, isDefault: true, placeholder: 'Digite o nome completo' },
            { id: 'field-2', label: 'E-mail', type: 'email', required: true, isDefault: true, placeholder: 'exemplo@email.com' },
        ];
    
        // 1. Define uma função para buscar os dados do formulário
        const fetchFormFields = async () => {
            if (!event || !event.id) {
                setFields(defaultFields);
                setIsLoading(false);
                return;
            }
    
            setIsLoading(true);
            try {
                // 2. Chama a sua API para obter os campos salvos
                const response = await fetch(`${API_URL}/api/manage/${event.id}/form`);
                if (!response.ok) {
                    // Se falhar (ex: 404), usa os campos padrão
                    console.warn('Não foram encontrados campos salvos para este evento.');
                    setFields(defaultFields);
                    return;
                }
    
                const result = await response.json();
                
                // 3. Atualiza o estado com os dados recebidos ou com os padrões se estiver vazio
                if (result.success && result.data && result.data.length > 0) {
                    setFields(result.data);
                } else {
                    setFields(defaultFields);
                }
    
            } catch (error) {
                console.error("Falha ao buscar os campos do formulário:", error);
                toast.error("Não foi possível carregar os campos do formulário.");
                setFields(defaultFields); // Garante que o formulário não fique em branco em caso de erro
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchFormFields(); // Executa a função
    
    }, [event]);

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFields(items);
    };
    
    const addField = (field) => setFields(prev => [...prev, { ...field, id: `field-${Date.now()}`, isDefault: false }]);
    const removeField = (id) => setFields(prev => prev.filter(f => f.id !== id));
    const toggleRequired = (id) => setFields(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
    
    const openEditModal = (field) => setEditingField(field);
    const closeEditModal = () => setEditingField(null);

    const saveFieldChanges = (updatedField) => {
        setFields(prev => prev.map(f => f.id === updatedField.id ? updatedField : f));
        closeEditModal();
    };

    const handleSave = async () => {
        setIsSaving(true);
        toast.loading('Salvando formulário...', { id: 'save-form' });
        try {
            
            const response = await fetch(`${API_URL}/api/manage/${event.id}/form`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }, // Não precisa mais do Authorization
                body: JSON.stringify({ fields }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Falha ao salvar formulário.");
            }
            toast.success("Formulário salvo com sucesso!", { id: 'save-form' });
        } catch (error) {
            toast.error(error.message, { id: 'save-form' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center text-slate-600">
                <Loader2 className="animate-spin inline-block mb-2" />
                <p>Carregando configuração do formulário...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Campos do formulário de inscrição</h2>
                    <p className="text-sm text-slate-500 mt-1">Personalize as informações que você deseja coletar dos participantes na compra.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="p-6">
                <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3">Adicionar campos</h3>
                    <div className="space-y-4">
                        <div><h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Campos Padrão</h4><div className="flex flex-wrap gap-2">{genericFields.map(f => <FieldButton key={f.label} label={f.label} onAdd={() => addField(f)} />)}</div></div>
                        <div><h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Campos Personalizados</h4><div className="flex flex-wrap gap-2">{customFields.map(f => <FieldButton key={f.label} label={f.label} onAdd={() => addField(f)} />)}</div></div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <StrictModeDroppable droppableId="fields">
                            {(provided) => (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="w-12"></th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nome do Campo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Obrigatório</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                        {fields.length > 0 ? fields.map((field, index) => (
                                            <Draggable key={field.id} draggableId={field.id} index={index}>
                                                {(provided) => (
                                                    <tr ref={provided.innerRef} {...provided.draggableProps} className="bg-white hover:bg-slate-50 border-b last:border-b-0 border-slate-200">
                                                        <td className="w-12 text-center text-slate-400 cursor-grab" {...provided.dragHandleProps}><GripVertical className="inline-block" size={20} /></td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{field.label}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{field.type}</td>
                                                        <td className="px-4 py-3"><ToggleSwitch checked={field.required} onChange={() => toggleRequired(field.id)} /></td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-4">
                                                                <button onClick={() => openEditModal(field)} className="text-slate-400 hover:text-indigo-600"><Edit size={18} /></button>
                                                                {!field.isDefault && <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-10 text-slate-500">
                                                    <Info size={20} className="mx-auto mb-2" />
                                                    Nenhum campo adicionado. Comece clicando nos botões acima.
                                                </td>
                                            </tr>
                                        )}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                            )}
                        </StrictModeDroppable>
                    </DragDropContext>
                </div>
            </div>

            <EditFieldModal 
                isOpen={!!editingField} 
                onClose={closeEditModal}
                field={editingField}
                onSave={saveFieldChanges}
            />
        </div>
    );
}