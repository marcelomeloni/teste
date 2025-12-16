import { Plus, PenTool, Tag, Palette } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

export function MainToolbar({ onAddText, onAddSignature, onAddTag, onChangeBackground }) {
    return (
        <div className="flex flex-wrap items-center gap-3 p-1 mb-4">
            <ToolbarButton 
                icon={Plus} 
                label="Adicionar Texto" 
                onClick={onAddText} 
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            />
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <ToolbarButton 
                icon={PenTool} 
                label="Assinatura" 
                onClick={onAddSignature} 
            />
            <ToolbarButton 
                icon={Tag} 
                label="Tags Dinâmicas" 
                onClick={onAddTag} 
            />
            <ToolbarButton 
                icon={Palette} 
                label="Fundo" 
                onClick={onChangeBackground} 
            />
        </div>
    );
}