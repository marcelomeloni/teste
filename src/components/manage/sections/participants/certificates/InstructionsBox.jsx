export function InstructionsBox() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-md font-semibold text-slate-800">Instruções iniciais</h3>
            <p className="text-sm text-slate-600">
                Ao personalizar seu certificado, você poderá adicionar novos textos (com as formatações que você desejar), 
                alterar o plano de fundo (dimensões 29,7cm de largura e 21cm de altura, padrão papel A4, e tamanho máximo de 2MB) 
                e ainda fazer uso das tags de preenchimento automático.
            </p>
            <p className="text-sm text-slate-600">
                Estas tags são úteis para preencher certos campos com informações já existentes e referentes ao seu evento, 
                o organizador dele, e também dados do participante.
            </p>
            <p className="text-sm text-slate-600">
                As tags existentes são: nome do evento, data do evento, nome do organizador, tipo do ingresso que o participante 
                comprou (nome do ingresso) e nome do participante.
            </p>
        </div>
    );
}