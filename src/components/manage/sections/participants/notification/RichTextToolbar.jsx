import { 
    Bold, Italic, Underline, Strikethrough, 
    List, ListOrdered, Link2, AlignCenter,
    Smile
} from 'lucide-react';

export function RichTextToolbar({ onFormat }) {
    const formatButtons = [
        { 
            icon: Bold, 
            command: 'bold', 
            title: 'Negrito',
            description: '**texto**'
        },
        { 
            icon: Italic, 
            command: 'italic', 
            title: 'Itálico',
            description: '*texto*'
        },
        { 
            icon: Underline, 
            command: 'underline', 
            title: 'Sublinhado',
            description: '__texto__'
        },
        { 
            icon: Strikethrough, 
            command: 'strikethrough', 
            title: 'Tachado',
            description: '~~texto~~'
        },
        { 
            icon: List, 
            command: 'list', 
            title: 'Lista',
            description: '- item'
        },
        { 
            icon: ListOrdered, 
            command: 'listOrdered', 
            title: 'Lista ordenada',
            description: '1. item'
        },
        { 
            icon: Link2, 
            command: 'link', 
            title: 'Link',
            description: '[texto](url)'
        },
        { 
            icon: AlignCenter, 
            command: 'alignCenter', 
            title: 'Centralizar',
            description: '→texto←'
        },
    ];

    const handleFormat = (command) => {
        if (onFormat) {
            onFormat(command);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-300 p-3 bg-slate-50 rounded-t-lg">
            {formatButtons.map((btn, index) => (
                <button 
                    key={index}
                    onClick={() => handleFormat(btn.command)}
                    className="p-2 rounded-md hover:bg-slate-200 text-slate-700 transition-colors relative group"
                    title={`${btn.title}: ${btn.description}`}
                >
                    <btn.icon size={18} />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        <div className="font-semibold">{btn.title}</div>
                        <div className="text-slate-300">{btn.description}</div>
                    </div>
                </button>
            ))}
            
            <div className="h-6 w-px bg-slate-300 mx-1"></div>

    
        </div>
    );
}