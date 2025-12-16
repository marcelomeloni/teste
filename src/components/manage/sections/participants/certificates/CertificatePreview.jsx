import Draggable from 'react-draggable';
import { X } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';


function CertificateElement({
    element,
    isSelected,
    isEditing,
    onSelect,
    onUpdate,
    onSetEditing,
    onDeleteElement,
    isBaseElement = false,
    scale = 1
}) {
    // Converte o estado de formato em estilo CSS
    const style = {
        fontFamily: element.style.fontFamily,
        fontSize: `${element.style.fontSize}px`,
        fontWeight: element.style.activeFormats.bold ? 'bold' : 'normal',
        fontStyle: element.style.activeFormats.italic ? 'italic' : 'normal',
        textDecoration: element.style.activeFormats.underline ? 'underline' : 'none',
        // Nota: O textAlign aqui é visual interno, o posicionamento global é feito via X/Y no pai
        textAlign: element.style.activeFormats.alignCenter ? 'center' :
                   element.style.activeFormats.alignRight ? 'right' : 'left',
        color: '#1e293b', // slate-800
        lineHeight: '1.2',
        cursor: isEditing ? 'text' : 'grab',
        // MUDANÇA IMPORTANTE: Removemos larguras fixas. 
        // Usamos max-content para a caixa abraçar o texto exatamente, facilitando o cálculo de centro.
        width: 'max-content',
        maxWidth: '700px' // Limite de segurança
    };

    const nodeRef = useRef(null);

    const handleBlur = (e) => {
        onUpdate(element.id, { content: e.target.value });
        onSetEditing(null);
    };

    const handleKeyDown = (e) => {
        // Permite Shift+Enter para quebra de linha, apenas Enter finaliza
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            handleBlur(e);
        }
        if (e.key === 'Escape') {
            onSetEditing(null);
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing && !isBaseElement) {
            e.preventDefault();
            onDeleteElement(element.id);
        }
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onSetEditing(element.id);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            position={{ x: element.x, y: element.y }}
            onStart={() => onSelect(element.id)}
            onStop={(e, data) => onUpdate(element.id, { x: data.x, y: data.y })}
            disabled={isEditing}
            scale={scale}
        >
            <div
                // ID crucial para o cálculo de largura no posicionamento global
                id={`element-${element.id}`} 
                ref={nodeRef}
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(element.id);
                }}
                onDoubleClick={handleDoubleClick}
                onKeyDown={handleKeyDown}
                className={`
                    absolute transition-colors duration-200 whitespace-pre-wrap
                    ${isSelected 
                        ? 'z-50 border-2 border-blue-500 bg-blue-50/20' 
                        : 'z-10 border-2 border-transparent hover:border-slate-300'
                    }
                    ${isEditing ? 'cursor-text border-green-500 bg-white' : ''}
                `}
                tabIndex={0}
            >
                {/* Interface de Seleção (Handles e Botão Deletar) */}
                {isSelected && !isEditing && (
                    <>
                        {/* Handle de movimento visual */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-t-sm w-8 h-3 flex items-center justify-center cursor-move">
                           <div className="w-4 h-0.5 bg-white/50 rounded"></div>
                        </div>

                        {/* Botão de deletar - apenas para elementos não-base */}
                        {!isBaseElement && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteElement(element.id);
                                }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors z-50 hover:scale-110"
                                title="Remover elemento"
                            >
                                <X size={10} strokeWidth={3} />
                            </button>
                        )}
                    </>
                )}

                {/* Conteúdo Editável vs Visualização */}
                {isEditing ? (
                    <textarea
                        value={element.content}
                        onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        // O textarea deve preencher o container pai que agora tem tamanho do conteúdo
                        className="w-full h-full bg-transparent outline-none resize-none overflow-hidden m-0 p-0 block min-w-[50px]"
                        style={{ ...style, width: '100%', height: 'auto' }}
                        autoFocus
                        rows={1}
                    />
                ) : (
                    <div className="px-1 py-0.5 pointer-events-none">
                        {element.content}
                    </div>
                )}
            </div>
        </Draggable>
    );
}


export function CertificatePreview({ 
    elements, 
    selectedElementId, 
    onSelectElement, 
    onElementUpdate,
    editingElementId,
    onSetEditingElementId,
    onDeleteElement
}) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Largura fixa base para o certificado (padrão A4 web)
    // Isso garante que x=400 seja SEMPRE o centro
    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 565; // Aprox A4 Landscape ratio

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.offsetWidth;
                // Subtrai padding (64px) para calcular area util
                const availableWidth = parentWidth - 64; 
                // Calcula escala para caber na tela
                const newScale = Math.min(availableWidth / BASE_WIDTH, 1);
                setScale(newScale > 0.4 ? newScale : 0.4);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget || e.target.className?.includes?.('certificate-background')) {
            onSelectElement(null);
            onSetEditingElementId(null);
        }
    };

    const baseElementIds = ['title', 'text1', 'name', 'text2', 'ticket', 'text3', 'event', 'text4', 'date', 'organizer'];

    return (
        <div 
            className="flex justify-center items-start bg-slate-100/50 rounded-xl border border-slate-200 p-8 overflow-hidden min-h-[600px]" 
            ref={containerRef}
        >
            <div 
                style={{
                    width: `${BASE_WIDTH}px`,
                    height: `${BASE_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
                className="relative bg-white shadow-2xl transition-transform duration-200 ease-out flex-shrink-0"
            >
                {/* Borda interna do design */}
                <div className="absolute inset-0 m-4 border-4 border-slate-800 bg-white certificate-background overflow-hidden">
                    
                    {/* Elementos Decorativos de Fundo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 transform translate-x-16 -translate-y-16 rotate-45 opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-900 transform -translate-x-16 translate-y-16 rotate-45 opacity-20 pointer-events-none"></div>

                    {/* Área Interativa */}
                    <div 
                        className="absolute inset-0 z-10 certificate-background"
                        onClick={handleBackgroundClick}
                    >
                        {elements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 select-none pointer-events-none">
                                <span className="text-6xl mb-2">+</span>
                                <p>Arraste elementos para cá</p>
                            </div>
                        ) : (
                            elements.map(el => (
                                <CertificateElement
                                    key={el.id}
                                    element={el}
                                    isSelected={el.id === selectedElementId}
                                    isEditing={el.id === editingElementId}
                                    onSelect={onSelectElement}
                                    onUpdate={onElementUpdate}
                                    onSetEditing={onSetEditingElementId}
                                    onDeleteElement={onDeleteElement}
                                    isBaseElement={baseElementIds.includes(el.id)}
                                    scale={scale} 
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}