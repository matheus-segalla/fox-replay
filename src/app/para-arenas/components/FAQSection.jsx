'use client';

import React, { useState } from 'react';

const PERGUNTAS = [
    {
        id: 1,
        pergunta: 'Preciso comprar uma câmera nova?',
        resposta: 'Não obrigatoriamente. O FOX Replay é compatível com a grande maioria das câmeras IP de mercado que suportam o protocolo padrão RTSP (como Intelbras, Hikvision e CFTV convencional). Durante a avaliação técnica, analisamos seus equipamentos atuais para aproveitar a estrutura existente sempre que possível.',
    },
    {
        id: 2,
        pergunta: 'O FOX Replay funciona se a internet cair?',
        resposta: 'A captação contínua e a comunicação com o botão físico de acionamento operam no ambiente local da sua arena. A internet é necessária apenas para transferir o corte de 30 segundos para a nuvem e viabilizar o acesso pelo QR Code no celular do atleta.',
    },
    {
        id: 3,
        pergunta: 'Posso instalar em várias quadras?',
        resposta: 'Sim. A tecnologia é totalmente escalável. Você pode começar com uma ou duas quadras na fase inicial de implantação e expandir gradualmente para 4, 6 ou mais quadras, gerenciando todas centralmente no painel administrativo da arena.',
    },
    {
        id: 4,
        pergunta: 'O jogador precisa instalar um aplicativo?',
        resposta: 'Não. Essa é uma das maiores vantagens do FOX Replay: barreira zero para o atleta. Basta apontar a câmera do celular para o QR Code da quadra e o replay abre diretamente no navegador, pronto para assistir e baixar.',
    },
    {
        id: 5,
        pergunta: 'Quanto custa a implantação?',
        resposta: 'O valor depende do número de quadras contratadas, da compatibilidade das câmeras existentes e das distâncias de cabeamento. Nosso modelo combina um investimento inicial de implantação somado à mensalidade de operação em nuvem. Elaboramos uma proposta sob medida após a avaliação técnica.',
    },
    {
        id: 6,
        pergunta: 'Como funciona a manutenção?',
        resposta: 'Realizamos monitoramento preventivo remoto da conexão dos dispositivos e módulos de botão, além de suporte assistido direto com a nossa equipe para orientar a recepção e manter a operação estável.',
    },
    {
        id: 7,
        pergunta: 'Por quanto tempo os vídeos ficam disponíveis?',
        resposta: 'Os lances gerais da quadra ficam disponíveis na nuvem por 5 dias para visualização e download. Caso o atleta salve a jogada no seu perfil gratuito, o vídeo permanece protegido permanentemente na galeria dele.',
    },
    {
        id: 8,
        pergunta: 'O sistema funciona em qualquer modalidade?',
        resposta: 'Nossa atuação principal está concentrada em esportes de areia (Beach Tennis, Futevôlei, Vôlei de Areia) e Tênis Tradicional. Realizamos um diagnóstico prévio da altura de rede, iluminação e dinâmica do jogo antes de confirmar a implantação.',
    },
];

export default function FAQSection() {
    const [abertaId, setAbertaId] = useState(1);

    const toggle = (id) => {
        setAbertaId(abertaId === id ? null : id);
    };

    return (
        <section id="faq" className="scroll-mt-24 space-y-10 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Transparência Total
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Perguntas Frequentes
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed max-w-xl mx-auto">
                    Respostas diretas sobre a tecnologia, funcionamento e processo de instalação na sua arena.
                </p>
            </div>

            <div className="space-y-3">
                {PERGUNTAS.map((item) => {
                    const isAberta = abertaId === item.id;
                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl transition-all duration-200 bg-white border ${
                                isAberta
                                    ? 'border-[#FF9900] shadow-[0_10px_28px_-14px_rgba(255,153,0,0.25)]'
                                    : 'border-[#EAE8E5] hover:border-[#FF9900]/45'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => toggle(item.id)}
                                aria-expanded={isAberta}
                                className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 cursor-pointer min-h-[56px]"
                            >
                                <span
                                    className={`text-sm sm:text-base font-bold transition-colors ${
                                        isAberta ? 'text-[#111111]' : 'text-[#111111]/85'
                                    }`}
                                >
                                    {item.pergunta}
                                </span>
                                <span
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 text-xs font-bold ${
                                        isAberta
                                            ? 'border-[#FF9900] bg-[#FF9900] text-[#111111] rotate-180'
                                            : 'border-[#EAE8E5] bg-[#FCFBF9] text-[#68666B]'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>

                            <div
                                className={`grid transition-all duration-200 ease-out ${
                                    isAberta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-[#68666B] leading-relaxed border-t border-[#EAE8E5]">
                                        <p className="pt-3.5">{item.resposta}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
