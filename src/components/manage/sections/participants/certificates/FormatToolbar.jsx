// components/certificates/FormatToolbar.jsx
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { FormatButton } from './FormatButton';

export function FormatToolbar({ 
    fontSize, 
    onFontSizeChange, 
    fontFamily, 
    onFontFamilyChange,
    activeFormats = {},
    onFormatToggle,
    onDelete,
    hasSelection = false
}) {
    // Se não houver elemento selecionado, mostra toolbar desabilitada
    if (!hasSelection) {
        return (
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 border border-slate-200 p-3 rounded-lg shadow-sm">
                <select 
                    disabled
                    className="border border-slate-300 rounded-md px-2 py-1.5 text-sm text-slate-400 bg-slate-100"
                >
                    <option>Tamanho</option>
                </select>
                <select 
                    disabled
                    className="border border-slate-300 rounded-md px-2 py-1.5 text-sm text-slate-400 bg-slate-100"
                >
                    <option>Fonte</option>
                </select>
                
                <FormatButton 
                    icon={Bold} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                <FormatButton 
                    icon={Italic} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                <FormatButton 
                    icon={Underline} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                
                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                
                <FormatButton 
                    icon={AlignLeft} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                <FormatButton 
                    icon={AlignCenter} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                <FormatButton 
                    icon={AlignRight} 
                    active={false} 
                    onClick={() => {}}
                    disabled
                />
                
                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                
                <button
                    disabled
                    className="p-1.5 rounded-md text-slate-400 cursor-not-allowed"
                    title="Selecione um elemento para deletar"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
            {/* Tamanho da Fonte */}
            <select 
                value={fontSize} 
                onChange={onFontSizeChange}
                className="border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                title="Tamanho da fonte"
            >
                <option value="12">Pequeno (12px)</option>
                <option value="14">Normal (14px)</option>
                <option value="16">Médio (16px)</option>
                <option value="18">Grande (18px)</option>
                <option value="24">Extra Grande (24px)</option>
                <option value="32">Título (32px)</option>
            </select>

            {/* Família da Fonte */}
            <select 
                value={fontFamily} 
                onChange={onFontFamilyChange}
                className="border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                title="Família da fonte"
            >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
            </select>

            {/* Estilos de Texto */}
            <FormatButton 
                icon={Bold} 
                active={activeFormats.bold} 
                onClick={() => onFormatToggle?.('bold')}
                title="Negrito (Ctrl+B)"
            />
            <FormatButton 
                icon={Italic} 
                active={activeFormats.italic} 
                onClick={() => onFormatToggle?.('italic')}
                title="Itálico (Ctrl+I)"
            />
            <FormatButton 
                icon={Underline} 
                active={activeFormats.underline} 
                onClick={() => onFormatToggle?.('underline')}
                title="Sublinhado (Ctrl+U)"
            />

            <div className="w-px h-5 bg-slate-300 mx-1"></div>

            {/* Alinhamento */}
            <FormatButton 
                icon={AlignLeft} 
                active={activeFormats.alignLeft} 
                onClick={() => onFormatToggle?.('alignLeft')}
                title="Alinhar à esquerda"
            />
            <FormatButton 
                icon={AlignCenter} 
                active={activeFormats.alignCenter} 
                onClick={() => onFormatToggle?.('alignCenter')}
                title="Centralizar texto"
            />
            <FormatButton 
                icon={AlignRight} 
                active={activeFormats.alignRight} 
                onClick={() => onFormatToggle?.('alignRight')}
                title="Alinhar à direita"
            />

       
            <div className="w-px h-5 bg-slate-300 mx-1"></div>

            {/* Botão Deletar */}
            <button
                onClick={onDelete}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                title="Deletar elemento (Delete)"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}