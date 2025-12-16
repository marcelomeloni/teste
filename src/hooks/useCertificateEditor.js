// hooks/useCertificateEditor.js
import { useState, useCallback } from 'react';

const defaultFormatState = {
  fontSize: '16',
  fontFamily: 'Helvetica',
  activeFormats: {
    bold: false,
    italic: false,
    underline: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  }
};

export function useCertificateEditor() {
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [editingElementId, setEditingElementId] = useState(null);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const addTextElement = useCallback(() => {
    const newElement = {
      id: `el-${Date.now()}`,
      type: 'text',
      content: 'Clique para editar',
      x: 150,
      y: 150,
      style: { ...defaultFormatState }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setEditingElementId(newElement.id); // Começa editando automaticamente
  }, []);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    if (editingElementId === id) setEditingElementId(null);
  }, [selectedElementId, editingElementId]);

  const clearAll = useCallback(() => {
    setElements([]);
    setSelectedElementId(null);
    setEditingElementId(null);
  }, []);

  return {
    elements,
    selectedElementId,
    editingElementId,
    selectedElement,
    setSelectedElementId,
    setEditingElementId,
    addTextElement,
    updateElement,
    deleteElement,
    clearAll
  };
}