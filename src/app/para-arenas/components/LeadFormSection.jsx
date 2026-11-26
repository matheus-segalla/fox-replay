'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { montarUrlWhatsAppSuporte } from '@/lib/auth';
import CustomSelect from '@/components/CustomSelect';

const OPCOES_QUADRAS = [
    { id: '1', label: '1 Quadra', desc: 'Piloto Solo' },
    { id: '2', label: '2 Quadras', desc: 'Recomendado' },
    { id: '3-4', label: '3 a 4 Quadras', desc: 'Complexo Médio' },
    { id: '5+', label: '5+ Quadras', desc: 'Grande Porte' },
];

const MODALIDADES_LISTA = [
    'Beach Tennis',
    'Futevôlei',
    'Vôlei de Areia',
    'Tênis Tradicional',
    'Complexo Poliesportivo',
];

function aplicarMascaraTelefone(valor) {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function LeadFormSection() {
    const [nomeArena, setNomeArena] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('SP');
    const [modalidade, setModalidade] = useState('Beach Tennis');
    const [quadras, setQuadras] = useState('2');
    const [nomeContato, setNomeContato] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [erroValidacao, setErroValidacao] = useState('');
    const [ultimoLinkWhatsapp, setUltimoLinkWhatsapp] = useState('');

    const handleSolicitarAvaliacao = (e) => {
        e.preventDefault();
        setErroValidacao('');

        const digitosTel = whatsapp.replace(/\D/g, '');
        if (!nomeArena.trim() || !cidade.trim() || estado.trim().length !== 2 || !nomeContato.trim() || digitosTel.length < 10) {
            setErroValidacao('Preencha todos os campos obrigatórios, informe a UF com 2 letras e um WhatsApp válido com DDD.');
            return;
        }

        setEnviando(true);

        const opcaoQuadraObj = OPCOES_QUADRAS.find((o) => o.id === quadras);
        const quadrasTexto = opcaoQuadraObj ? `${opcaoQuadraObj.label} (${opcaoQuadraObj.desc})` : quadras;

        const texto =
            `🏟️ *SOLICITAÇÃO DE AVALIAÇÃO — FOX REPLAY (ARENA PARCEIRA)*\n\n` +
            `📍 *Complexo Esportivo:* ${nomeArena.trim()}\n` +
            `🌎 *Localização:* ${cidade.trim()} - ${estado.trim().toUpperCase()}\n` +
            `🎾 *Modalidade Principal:* ${modalidade}\n` +
            `🔢 *Quantidade de Quadras:* ${quadrasTexto}\n` +
            `👤 *Responsável:* ${nomeContato.trim()}\n` +
            `📱 *WhatsApp:* ${whatsapp}\n\n` +
            `Olá equipe Fox Replay! Gostaria de solicitar a avaliação da infraestrutura da minha arena para participar da fase inicial de implantação.`;

        const urlWhatsApp = montarUrlWhatsAppSuporte(texto);
        setUltimoLinkWhatsapp(urlWhatsApp);
        window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        setEnviando(false);
    };

    return (
        <section id="contato" className="scroll-mt-24">
            <div className="max-w-3xl mx-auto w-full bg-white text-[#111111] rounded-3xl p-6 sm:p-10 space-y-6 shadow-[0_18px_50px_-22px_rgba(17,17,17,0.12)] border border-[#EAE8E5]">
                {/* CABEÇALHO */}
                <div className="flex flex-col items-center justify-center text-center space-y-2.5">
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/logo-fox.jpeg"
                            alt="Logo FOX Replay"
                            width={34}
                            height={34}
                            className="h-8 w-8 object-cover rounded-lg border border-[#EAE8E5] bg-[#111111]"
                        />
                        <span className="text-[10px] font-mono tracking-widest text-[#111111] uppercase bg-[#F7EBD7] px-3 py-1 rounded-full border border-[#EAE8E5] font-bold">
                            Diagnóstico Comercial
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight uppercase">
                        Seja uma <span className="text-[#FF9900]">Arena Parceira</span>
                    </h2>

                    <p className="text-[#68666B] text-xs sm:text-sm leading-relaxed max-w-lg">
                        Preencha os dados da sua arena para iniciarmos o diagnóstico técnico e elaborarmos uma proposta sob medida. Campos marcados com <span className="text-[#FF9900] font-bold">*</span> são obrigatórios.
                    </p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSolicitarAvaliacao} noValidate className="space-y-5">
                    {/* 1. QUANTIDADE DE QUADRAS */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#111111] mb-2 uppercase tracking-wider">
                            1. Quantidade de Quadras <span className="text-[#FF9900]">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {OPCOES_QUADRAS.map((opcao) => {
                                const selecionado = quadras === opcao.id;
                                return (
                                    <button
                                        type="button"
                                        key={opcao.id}
                                        onClick={() => setQuadras(opcao.id)}
                                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[56px] ${
                                            selecionado
                                                ? 'bg-[#F7EBD7]/80 border-[#FF9900] text-[#111111] font-bold shadow-xs'
                                                : 'bg-[#FCFBF9] border-[#EAE8E5] text-[#68666B] hover:border-[#FF9900]/50 hover:text-[#111111]'
                                        }`}
                                    >
                                        <span className="block text-xs font-black">{opcao.label}</span>
                                        <span className="block text-[10px] text-[#68666B] mt-0.5 truncate">{opcao.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* AGRUPAMENTO EM 2 COLUNAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* COLUNA 1: DADOS DA ARENA */}
                        <div className="space-y-3.5">
                            <div>
                                <label htmlFor="nome-arena" className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    2. Nome do Complexo Esportivo <span className="text-[#FF9900]">*</span>
                                </label>
                                <input
                                    id="nome-arena"
                                    type="text"
                                    required
                                    maxLength={80}
                                    value={nomeArena}
                                    onChange={(e) => setNomeArena(e.target.value)}
                                    placeholder="Ex: Arena Sunset Beach Tennis"
                                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] placeholder-[#68666B]/60 text-sm font-medium transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="col-span-2">
                                    <label htmlFor="cidade-arena" className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                        Cidade <span className="text-[#FF9900]">*</span>
                                    </label>
                                    <input
                                        id="cidade-arena"
                                        type="text"
                                        required
                                        maxLength={60}
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Ex: Campinas"
                                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] placeholder-[#68666B]/60 text-sm font-medium transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uf-arena" className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                        UF <span className="text-[#FF9900]">*</span>
                                    </label>
                                    <input
                                        id="uf-arena"
                                        type="text"
                                        required
                                        maxLength={2}
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                                        placeholder="SP"
                                        className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] text-center uppercase placeholder-[#68666B]/60 text-sm font-bold transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COLUNA 2: MODALIDADE E CONTATO */}
                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    3. Modalidade Principal <span className="text-[#FF9900]">*</span>
                                </label>
                                <CustomSelect
                                    value={modalidade}
                                    onChange={(val) => setModalidade(val)}
                                    options={MODALIDADES_LISTA}
                                    variant="light"
                                    buttonClassName="!min-h-[44px] !bg-[#FCFBF9] !border-[#EAE8E5] !text-[#111111] focus:!border-[#FF9900]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label htmlFor="responsavel-arena" className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                        Responsável <span className="text-[#FF9900]">*</span>
                                    </label>
                                    <input
                                        id="responsavel-arena"
                                        type="text"
                                        required
                                        maxLength={80}
                                        value={nomeContato}
                                        onChange={(e) => setNomeContato(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] placeholder-[#68666B]/60 text-sm font-medium transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="whatsapp-arena" className="block text-[11px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">
                                        WhatsApp <span className="text-[#FF9900]">*</span>
                                    </label>
                                    <input
                                        id="whatsapp-arena"
                                        type="tel"
                                        required
                                        inputMode="numeric"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(aplicarMascaraTelefone(e.target.value))}
                                        placeholder="(11) 99999-9999"
                                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] placeholder-[#68666B]/60 text-sm font-medium transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {erroValidacao && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                            {erroValidacao}
                        </div>
                    )}

                    {ultimoLinkWhatsapp && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                            <p className="font-bold">
                                Solicitação pronta! Abrimos o WhatsApp com os dados da sua arena.
                            </p>
                            <p className="text-emerald-800">
                                Se a janela não abriu automaticamente no seu navegador,{' '}
                                <a
                                    href={ultimoLinkWhatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline font-extrabold text-emerald-950"
                                >
                                    clique aqui para enviar pelo WhatsApp
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full min-h-[50px] py-4 px-6 bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                    >
                        {enviando ? 'Preparando solicitação...' : 'Solicitar avaliação da minha arena'}
                    </button>
                </form>
            </div>
        </section>
    );
}
