// components/certificates/certificates.jsx
import { useState, useEffect } from 'react';
import { InstructionsBox } from './certificates/InstructionsBox';
import { ConfigBox } from './certificates/ConfigBox';
import { RadioOption } from './certificates/RadioOption';
import { CheckboxOption } from './certificates/CheckboxOption';
import { WarningBanner } from './certificates/WarningBanner';
import { MainToolbar } from './certificates/MainToolbar';
import { FormatToolbar } from './certificates/FormatToolbar';
import { CertificatePreview } from './certificates/CertificatePreview';
import { ActionButtons } from './certificates/ActionButtons';

// Estado inicial padrão para novos elementos de texto
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
        list: false
    }
};

// Tags disponíveis para inserção
// AQUI: Mantivemos o Tipo do Ingresso disponível no dropdown, caso precise
const availableTags = [
    { label: 'Nome do Participante', value: '#NOME-DO-PARTICIPANTE#' },
    { label: 'Nome do Evento', value: '#NOME-DO-EVENTO#' },
    { label: 'Carga Horária', value: '#CARGA-HORARIA#' },
    { label: 'Data do Evento', value: '#DATA-DO-EVENTO#' },
    { label: 'Nome do Organizador', value: '#NOME-DO-ORGANIZADOR#' },
    { label: 'Tipo do Ingresso', value: '#TIPO-DO-INGRESSO#' },
];

// Template base do certificado como elementos editáveis
const baseTemplate = [
    {
        id: 'title',
        type: 'text',
        content: 'CERTIFICADO DE PARTICIPAÇÃO',
        // Texto muito largo. 400 - 270 = 130
        x: 130, y: 50,
        style: { 
            fontSize: '32', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'text1',
        type: 'text',
        content: 'Certificamos que o participante',
        // Texto médio. 400 - 120 = 280
        x: 280, y: 140,
        style: { 
            fontSize: '16', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'name',
        type: 'text',
        content: '#NOME-DO-PARTICIPANTE#',
        // Texto grande e em negrito. 400 - 180 = 220
        x: 220, y: 180,
        style: { 
            fontSize: '24', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    // NOTA: Aqui foram removidos o 'text2' (portador do ingresso) e 'ticket' (#TAG#)
    {
        id: 'text3',
        type: 'text',
        content: 'participou integralmente do evento',
        // Texto médio. 400 - 130 = 270
        // Ajustado Y para subir (era 320)
        x: 270, y: 240, 
        style: { 
            fontSize: '16', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'event',
        type: 'text',
        content: '#NOME-DO-EVENTO#',
        // Tag média. 400 - 110 = 290
        // Ajustado Y para subir (era 350)
        x: 290, y: 270, 
        style: { 
            fontSize: '20', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'text_hours',
        type: 'text',
        content: 'com carga horária total de',
        // Texto médio. 400 - 100 = 300
        x: 300, y: 320, 
        style: { 
            fontSize: '16', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'hours',
        type: 'text',
        content: '#CARGA-HORARIA#',
        // Tag curta. 400 - 80 = 320
        x: 320, y: 350, 
        style: { 
            fontSize: '18', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'text4',
        type: 'text',
        content: 'realizado na data de',
        // Texto curto. 400 - 80 = 320
        x: 320, y: 400, 
        style: { 
            fontSize: '16', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'date',
        type: 'text',
        content: '#DATA-DO-EVENTO#',
        // Tag média. 400 - 90 = 310
        x: 310, y: 430, 
        style: { 
            fontSize: '18', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    },
    {
        id: 'organizer',
        type: 'text',
        content: '#NOME-DO-ORGANIZADOR#',
        // Tag longa. 400 - 125 = 275
        x: 275, y: 500,
        style: { 
            fontSize: '18', 
            fontFamily: 'Helvetica', 
            activeFormats: { 
                bold: true, 
                alignCenter: true,
                alignLeft: false,
                alignRight: false 
            } 
        }
    }
];

export function Certificates() {
    const [participantScope, setParticipantScope] = useState('all');
    const [deliveryMethod, setDeliveryMethod] = useState({
        auto: false,
        manual: false
    });

    // Estados do editor - Inicializa com o template base
    const [elements, setElements] = useState(baseTemplate);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [editingElementId, setEditingElementId] = useState(null);
    const [formatState, setFormatState] = useState(defaultFormatState);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    // Efeito para sincronizar a barra de ferramentas com o elemento selecionado
    useEffect(() => {
        if (selectedElementId) {
            const selectedElement = elements.find(el => el.id === selectedElementId);
            if (selectedElement && selectedElement.style) {
                setFormatState(selectedElement.style);
            }
        } else {
            setFormatState(defaultFormatState);
        }
    }, [selectedElementId, elements]);

    const handleDeliveryChange = (e) => {
        const { name, checked } = e.target;
        setDeliveryMethod(prev => ({ ...prev, [name]: checked }));
    };

    // Função para atualizar o estilo do elemento selecionado
    const updateSelectedElementStyle = (newStyleProps) => {
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === selectedElementId
                    ? { ...el, style: { ...el.style, ...newStyleProps } }
                    : el
            )
        );
    };

    const handleFormatToggle = (format) => {
        if (!selectedElementId) return;

        // Lógica de Posicionamento Global (Esquerda, Centro, Direita)
        if (['alignLeft', 'alignCenter', 'alignRight'].includes(format)) {
            
            // 1. Encontra o elemento no DOM para saber a largura atual dele
            const domElement = document.getElementById(`element-${selectedElementId}`);
            
            if (domElement) {
                const elementWidth = domElement.offsetWidth; // Largura real do texto
                const CANVAS_WIDTH = 800; // Largura fixa que definimos
                const MARGIN = 50; // Margem de segurança lateral

                let newX = 0;

                if (format === 'alignCenter') {
                    // Matemática: (LarguraTotal - LarguraDoElemento) / 2
                    newX = (CANVAS_WIDTH - elementWidth) / 2;
                } else if (format === 'alignRight') {
                    // Matemática: LarguraTotal - LarguraDoElemento - Margem
                    newX = CANVAS_WIDTH - elementWidth - MARGIN;
                } else { // alignLeft
                    newX = MARGIN;
                }

                // Atualiza APENAS a posição X e mantém o ícone ativo visualmente
                const newActiveFormats = {
                    ...formatState.activeFormats,
                    alignLeft: format === 'alignLeft',
                    alignCenter: format === 'alignCenter',
                    alignRight: format === 'alignRight',
                };
                
                setFormatState(prev => ({ ...prev, activeFormats: newActiveFormats }));
                
                // Salva a nova posição X e o novo estilo
                updateSelectedElementStyle({ activeFormats: newActiveFormats });
                handleElementUpdate(selectedElementId, { x: newX });
            }
            return;
        }

        // Lógica padrão para Negrito, Itálico, Sublinhado (Mantida)
        const newActiveFormats = {
            ...formatState.activeFormats,
            [format]: !formatState.activeFormats[format],
        };

        setFormatState(prev => ({ ...prev, activeFormats: newActiveFormats }));
        updateSelectedElementStyle({ activeFormats: newActiveFormats });
    };

    const handleFontSizeChange = (e) => {
        if (!selectedElementId) return;
        const newSize = e.target.value;
        setFormatState(prev => ({ ...prev, fontSize: newSize }));
        updateSelectedElementStyle({ fontSize: newSize });
    };

    const handleFontFamilyChange = (e) => {
        if (!selectedElementId) return;
        const newFamily = e.target.value;
        setFormatState(prev => ({ ...prev, fontFamily: newFamily }));
        updateSelectedElementStyle({ fontFamily: newFamily });
    };

    // Função para deletar elemento
    const handleDeleteElement = () => {
        if (selectedElementId) {
            // Não permite deletar elementos do template base
            const elementToDelete = elements.find(el => el.id === selectedElementId);
            if (elementToDelete && baseTemplate.some(baseEl => baseEl.id === elementToDelete.id)) {
                alert('Elementos do template base não podem ser deletados. Use o botão "Resetar" para voltar ao original.');
                return;
            }
            
            setElements(prev => prev.filter(el => el.id !== selectedElementId));
            setSelectedElementId(null);
            setEditingElementId(null);
        }
    };

    // Função para inserir tag no elemento atual
    const handleInsertTag = (tagValue) => {
        if (selectedElementId) {
            const selectedElement = elements.find(el => el.id === selectedElementId);
            if (selectedElement) {
                const newContent = selectedElement.content + tagValue;
                handleElementUpdate(selectedElementId, { content: newContent });
                
                // Se não estava editando, inicia a edição
                if (!editingElementId) {
                    setEditingElementId(selectedElementId);
                }
            }
        } else {
            // Se não há elemento selecionado, cria um novo com a tag
            handleAddTextWithContent(tagValue);
        }
        setShowTagDropdown(false);
    };

    // Funções da toolbar principal
    const handleAddText = () => {
        handleAddTextWithContent('Novo texto (clique para editar)');
    };

    const handleAddTextWithContent = (content) => {
        const newElement = {
            id: `el-${Date.now()}`,
            type: 'text',
            content: content,
            x: 100,
            y: 100,
            style: { ...defaultFormatState },
        };

        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        setEditingElementId(newElement.id);
    };

    const handleAddSignature = () => {
        const newElement = {
            id: `signature-${Date.now()}`,
            type: 'signature',
            content: 'Assinatura',
            // Posicionada mais abaixo e centralizada (400 - 60)
            x: 340, 
            y: 460, 
            style: {
                ...defaultFormatState,
                fontFamily: "'Dancing Script', cursive",
                fontSize: '28',
                activeFormats: {
                    ...defaultFormatState.activeFormats,
                    alignCenter: true,
                }
            },
        };

        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        setEditingElementId(newElement.id);
    };

    const handleAddTag = () => {
        setShowTagDropdown(!showTagDropdown);
    };

    const handleChangeBackground = () => {
        // Função futura para alterar plano de fundo
        console.log('Alterar plano de fundo');
    };

    // Handler para atualizar elementos
    const handleElementUpdate = (id, newProps) => {
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === id ? { ...el, ...newProps } : el
            )
        );
    };

    // Handler para deletar elemento específico
    const handleDeleteSpecificElement = (id) => {
        // Não permite deletar elementos do template base
        const elementToDelete = elements.find(el => el.id === id);
        if (elementToDelete && baseTemplate.some(baseEl => baseEl.id === elementToDelete.id)) {
            alert('Elementos do template base não podem ser deletados. Use o botão "Resetar" para voltar ao original.');
            return;
        }

        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
        if (editingElementId === id) setEditingElementId(null);
    };

    // Handlers de Ações
    const handleReset = () => {
        if (confirm('Isso irá resetar todas as alterações e voltar ao template original. Continuar?')) {
            setElements([...baseTemplate]);
            setSelectedElementId(null);
            setEditingElementId(null);
        }
    };
    
    const handlePreview = () => {
        console.log('Pré-visualizar certificado');
        // Aqui você pode implementar a lógica de preview
    };

    const handleUpdate = () => {
        console.log('Atualizar certificado');
        // Aqui você pode implementar a lógica de salvar
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">
                    Editor de Certificados
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Coluna Esquerda: Configurações */}
                    <div className="lg:col-span-2 space-y-6">
                        <InstructionsBox />
                        
                        <ConfigBox title="Para quais participantes serão gerados certificados?">
                            <RadioOption
                                id="scopeAll"
                                name="participantScope"
                                label="Todos os participantes inscritos no evento"
                                value="all"
                                checked={participantScope === 'all'}
                                onChange={(e) => setParticipantScope(e.target.value)}
                            />
                            <RadioOption
                                id="scopeCheckedIn"
                                name="participantScope"
                                label="Apenas os participantes com check-in realizado"
                                value="checkedIn"
                                checked={participantScope === 'checkedIn'}
                                onChange={(e) => setParticipantScope(e.target.value)}
                            />
                        </ConfigBox>

                        <ConfigBox title="Como os certificados serão fornecidos aos participantes?">
                            <CheckboxOption
                                id="deliveryAuto"
                                name="auto"
                                label="Automaticamente via e-mail"
                                description="Será enviado um e-mail para cada participante contendo o certificado. Este envio ocorrerá às 12:00 do dia seguinte ao término do evento."
                                checked={deliveryMethod.auto}
                                onChange={handleDeliveryChange}
                            />
                            
                            <div className="mt-4">
                                <CheckboxOption
                                    id="deliveryManual"
                                    name="manual"
                                    label="Acesso manual pelos participantes"
                                    description='Será disponibilizado o acesso aos certificados por meio da aba "Meus Ingressos" o download do certificado referente à cada ingresso do pedido de compra do participante.'
                                    checked={deliveryMethod.manual}
                                    onChange={handleDeliveryChange}
                                />
                            </div>
                        </ConfigBox>

                    
                    </div>

                    {/* Coluna Direita: Editor */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="relative">
                            <MainToolbar 
                                onAddText={handleAddText}
                                onAddSignature={handleAddSignature}
                                onAddTag={handleAddTag}
                                onChangeBackground={handleChangeBackground}
                            />
                            
                            {/* Dropdown de Tags */}
                            {showTagDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                                    <div className="p-2">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Inserir Tag</h3>
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag.value}
                                                onClick={() => handleInsertTag(tag.value)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md transition-colors mb-1 last:mb-0"
                                            >
                                                <div className="font-medium text-slate-800">{tag.label}</div>
                                                <div className="text-slate-500 text-xs">{tag.value}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <FormatToolbar 
                            fontSize={formatState.fontSize}
                            onFontSizeChange={handleFontSizeChange}
                            fontFamily={formatState.fontFamily}
                            onFontFamilyChange={handleFontFamilyChange}
                            activeFormats={formatState.activeFormats}
                            onFormatToggle={handleFormatToggle}
                            onDelete={handleDeleteElement}
                            hasSelection={!!selectedElementId}
                        />
                        
                        <CertificatePreview 
                            elements={elements}
                            selectedElementId={selectedElementId}
                            onSelectElement={setSelectedElementId}
                            onElementUpdate={handleElementUpdate}
                            editingElementId={editingElementId}
                            onSetEditingElementId={setEditingElementId}
                            onDeleteElement={handleDeleteSpecificElement}
                        />
                    </div>
                </div>

                <ActionButtons 
                    onReset={handleReset}
                    onPreview={handlePreview}
                    onUpdate={handleUpdate}
                />
            </div>
        </div>
    );
}