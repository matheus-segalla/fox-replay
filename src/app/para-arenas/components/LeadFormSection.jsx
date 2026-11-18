'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { montarUrlWhatsAppSuporte } from '@/lib/auth';

const OPCOES_QUADRAS = [
    { id: '1', label: '1 Quadra', desc: 'Piloto Solo' },
    { id: '2', label: '2 Quadras', desc: 'Recomendado' },
    { id: '3-4', label: '3 a 4 Quadras', desc: 'Complexo Médio' },
    { id: '5+', label: '5+ Quadras', desc: 'Grande Porte / Rede' }
];

const MODALIDADES_LISTA = [
    'Beach Tennis',
    'Futevôlei',
    'Vôlei de Areia',
    'Tênis Tradicional',
    'Complexo Poliesportivo'
];

export default function LeadFormSection() {
    const router = useRouter();

    const [nomeArena, setNomeArena] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('SP');
    const [modalidade, setModalidade] = useState('Beach Tennis');
    const [quadras, setQuadras] = useState('2');
    const [nomeContato, setNomeContato] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleSolicitarAvaliacao = (e) => {
        e.preventDefault();
        setEnviando(true);

        const opcaoQuadraObj = OPCOES_QUADRAS.find(o => o.id === quadras);
        const quadrasTexto = opcaoQuadraObj ? `${opcaoQuadraObj.label} (${opcaoQuadraObj.desc})` : quadras;

        const texto =
            `🏟️ *SOLICITAÇÃO DE AVALIAÇÃO — FOX REPLAY (ARENA PARCEIRA)*\n\n` +
            `📍 *Complexo Esportivo:* ${nomeArena}\n` +
            `🌎 *Localização:* ${cidade} - ${estado.toUpperCase()}\n` +
            `🎾 *Modalidade Principal:* ${modalidade}\n` +
            `🔢 *Quantidade de Quadras:* ${quadrasTexto}\n` +
            `👤 *Responsável:* ${nomeContato}\n` +
            `📱 *WhatsApp:* ${whatsapp}\n\n` +
            `Olá equipe Fox Replay! Gostaria de solicitar a avaliação da infraestrutura da minha arena para participar da fase inicial de implantação.`;

        const urlWhatsApp = montarUrlWhatsAppSuporte(texto);
        window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        setEnviando(false);
    };

    return (
        <section id="contato" className="scroll-mt-28 space-y-6">
            <div className="max-w-3xl mx-auto w-full glass-card-dark text-white rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl border border-white/10 relative z-10">
                {/* CABEÇALHO */}
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Image
                            src="/logo-fox.jpeg"
                            alt="Logo Fox Replay"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-cover rounded-lg border border-white/10 shadow-xs bg-zinc-900"
                        />
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
                            Fase Inicial &bull; Arenas Parceiras
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-wider uppercase">
                        SEJA UMA <span className="text-amber-500">ARENA PARCEIRA</span>
                    </h2>

                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                        O próximo grande momento pode começar na sua quadra. Estamos selecionando arenas para a fase inicial de implantação do FOX Replay. Preencha os dados para iniciar o diagnóstico da sua estrutura.
                    </p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSolicitarAvaliacao} className="space-y-4">
                    {/* 1. SELETOR DE QUANTIDADE DE QUADRAS */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            1. Quantidade de Quadras para Avaliação
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {OPCOES_QUADRAS.map((opcao) => {
                                const selecionado = quadras === opcao.id;
                                return (
                                    <button
                                        type="button"
                                        key={opcao.id}
                                        onClick={() => setQuadras(opcao.id)}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                            selecionado
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                                : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        <span className="block text-xs font-black">{opcao.label}</span>
                                        <span className="block text-[9px] text-zinc-500 mt-0.5 truncate">{opcao.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* GRID DE CAMPOS EM 2 COLUNAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* COLUNA 1: DADOS DO COMPLEXO */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    2. Nome do Complexo Esportivo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nomeArena}
                                    onChange={(e) => setNomeArena(e.target.value)}
                                    placeholder="Ex: Arena Sunset Beach Tennis"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white/[0.08]"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Ex: Campinas"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white/[0.08]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                        UF
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={2}
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value.toUpperCase())}
                                        placeholder="SP"
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-center uppercase placeholder-zinc-500 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white/[0.08]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COLUNA 2: MODALIDADE & CONTATO */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    3. Modalidade Principal
                                </label>
                                <select
                                    value={modalidade}
                                    onChange={(e) => setModalidade(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b23] border border-white/10 text-white text-xs font-medium transition-all focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                    {MODALIDADES_LISTA.map((mod) => (
                                        <option key={mod} value={mod} className="bg-zinc-900 text-white">
                                            {mod}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                        Responsável
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nomeContato}
                                        onChange={(e) => setNomeContato(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white/[0.08]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                        WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white/[0.08]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTÃO DE ENVIO */}
                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Solicitar Avaliação da Arena ↗</span>
                    </button>
                </form>

                {/* RODAPÉ DO CARD */}
                <div className="text-center pt-2 border-t border-white/10">
                    <p className="text-[11px] text-zinc-400 font-normal">
                        Já possui implantação e conta ativa?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                        >
                            Acessar painel administrativo da arena ➔
                        </button>
                    </p>
                </div>
            </div>
        </section>
    );
}
