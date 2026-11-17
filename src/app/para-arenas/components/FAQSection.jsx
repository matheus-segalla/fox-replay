'use client';

import React, { useState } from 'react';

const PERGUNTAS = [
    {
        id: 1,
        pergunta: 'Preciso comprar uma câmera nova para a quadra?',
        resposta: 'Não obrigatoriamente. O FOX Replay é compatível com a grande maioria das câmeras IP de mercado que suportam o protocolo padrão RTSP (como Intelbras, Hikvision e CFTV convencional). Durante a avaliação técnica, analisamos seus equipamentos atuais. Se você já tiver câmeras adequadas, aproveitamos sua estrutura existente.'
    },
    {
        id: 2,
        pergunta: 'O FOX Replay funciona se a internet da arena cair?',
        resposta: 'A captação contínua e a comunicação com o botão físico de acionamento operam no ambiente local da sua arena. A internet é necessária apenas para transferir o corte de 30 segundos para a nuvem e viabilizar o escaneamento do QR Code pelo celular do atleta.'
    },
    {
        id: 3,
        pergunta: 'Posso instalar em várias quadras do complexo?',
        resposta: 'Sim. A tecnologia é totalmente escalável. Você pode começar com uma ou duas quadras na fase inicial de implantação e expandir gradualmente para 4, 6 ou 10+ quadras, gerenciando todas centralmente no painel administrativo da arena.'
    },
    {
        id: 4,
        pergunta: 'O jogador precisa baixar algum aplicativo?',
        resposta: 'Não! Essa é uma das maiores vantagens do FOX Replay: barreira zero para o atleta. Ele não precisa baixar nenhum app na App Store ou Google Play, nem preencher formulários longos. Basta apontar a câmera do celular para o QR Code da quadra e o replay abre diretamente no navegador.'
    },
    {
        id: 5,
        pergunta: 'Quanto custa o projeto de implantação?',
        resposta: 'O valor exato depende do número de quadras contratadas, se o complexo já possui câmeras IP compatíveis e das distâncias de cabeamento. Nosso modelo é composto por uma taxa inicial de implantação (hardware + instalação física + configuração) somada a uma mensalidade de operação e infraestrutura em nuvem. Elaboramos um orçamento sob medida logo após a avaliação inicial.'
    },
    {
        id: 6,
        pergunta: 'Como funciona a manutenção e suporte?',
        resposta: 'Realizamos monitoramento preventivo remoto de conexão das câmeras e dos módulos de botão. Além disso, a arena conta com suporte assistido direto da equipe para esclarecer dúvidas da equipe de recepção e manter o sistema sempre ativo.'
    },
    {
        id: 7,
        pergunta: 'Por quanto tempo os vídeos ficam disponíveis para os atletas?',
        resposta: 'Os vídeos ficam hospedados na nuvem em links seguros de alta velocidade por um período configurado no pacote da arena, permitindo que os jogadores assistam na hora ou no dia seguinte com total tranquilidade para salvar na galeria.'
    },
    {
        id: 8,
        pergunta: 'O sistema funciona em qualquer modalidade esportiva?',
        resposta: 'Nossa fase inicial está concentrada em esportes de areia (Beach Tennis, Futevôlei, Vôlei de areia) e Tênis. Não vendemos compatibilidade genérica sem antes analisar tecnicamente a altura de rede, iluminação e velocidade de jogo da sua quadra.'
    }
];

export default function FAQSection() {
    const [abertaId, setAbertaId] = useState(1);

    const toggle = (id) => {
        setAbertaId(abertaId === id ? null : id);
    };

    return (
        <section id="faq" className="scroll-mt-28 space-y-10 max-w-4xl mx-auto">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Transparência Total
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Perguntas Frequentes
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
                    Respostas diretas e honestas sobre a tecnologia, funcionamento e processo de instalação na sua arena.
                </p>
            </div>

            {/* ACORDEÃO */}
            <div className="space-y-3">
                {PERGUNTAS.map((item) => {
                    const isAberta = abertaId === item.id;
                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl transition-all border ${
                                isAberta
                                    ? 'glass-card-dark border-amber-500/40 shadow-lg'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => toggle(item.id)}
                                className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 cursor-pointer"
                            >
                                <span className={`text-sm sm:text-base font-bold transition-colors ${
                                    isAberta ? 'text-amber-400' : 'text-zinc-200 hover:text-white'
                                }`}>
                                    {item.pergunta}
                                </span>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 text-xs font-bold ${
                                    isAberta
                                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 rotate-180'
                                        : 'border-white/10 bg-white/5 text-zinc-400'
                                }`}>
                                    ↓
                                </span>
                            </button>

                            {isAberta && (
                                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 mt-1">
                                    <p className="pt-3">{item.resposta}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
