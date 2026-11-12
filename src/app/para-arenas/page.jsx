'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaginaParaArenas() {
    const router = useRouter();

    // Formulário de contato comercial rápido
    const [nomeArena, setNomeArena] = useState('');
    const [nomeContato, setNomeContato] = useState('');
    const [cidade, setCidade] = useState('');
    const [qtdQuadras, setQtdQuadras] = useState('2');
    const [whatsapp, setWhatsapp] = useState('');

    const enviarInteresseWhatsApp = (e) => {
        e.preventDefault();
        const texto = encodeURIComponent(
            `Olá equipe Fox Replay! Gostaria de uma demonstração comercial do sistema de replays para o meu complexo:\n\n` +
            `🏢 *Complexo:* ${nomeArena}\n` +
            `👤 *Responsável:* ${nomeContato}\n` +
            `📍 *Cidade:* ${cidade}\n` +
            `🎾 *Quantidade de Quadras:* ${qtdQuadras}\n` +
            `📱 *WhatsApp:* ${whatsapp}\n\n` +
            `Gostaria de saber os valores dos planos e prazos de instalação dos totens.`
        );

        // Abre conversa comercial
        window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=${texto}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden flex flex-col justify-between">
            {/* EFEITOS DE GLOW AMBIENTAL */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />

            {/* HEADER COMERCIAL */}
            <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center z-10 border-b border-zinc-800/80 backdrop-blur-md bg-zinc-950/70 sticky top-0 shadow-sm">
                <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-9 w-9 object-cover rounded-xl border border-zinc-800 shadow-sm bg-zinc-900"
                    />
                    <h1 className="text-lg font-black tracking-widest uppercase text-white">
                        FOX <span className="text-amber-500">REPLAY</span>
                        <span className="text-[10px] ml-2 text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">B2B</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs font-bold text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
                    >
                        ← Portal dos Atletas
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs font-black bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-500 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        Entrar no Painel 🔑
                    </button>
                </div>
            </header>

            {/* HERO SECTION B2B */}
            <main className="w-full max-w-5xl mx-auto px-5 py-14 md:py-20 z-10 flex-1 flex flex-col space-y-20">

                <div className="text-center space-y-6 max-w-3xl mx-auto animate-fadeIn">
                    <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                            Tecnologia & Hardware para Complexos Esportivos
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white uppercase">
                        Transforme sua arena e fature com <br />
                        <span className="bg-gradient-to-r from-white via-zinc-200 to-amber-500 bg-clip-text text-transparent">
                            Patrocínios nos Replays
                        </span>
                    </h2>

                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto">
                        Seus atletas gravam e compartilham seus lances nas redes sociais com a marca do seu complexo, enquanto você monetiza os espaços publicitários em cada vídeo gerado.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <a
                            href="#contato"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                        >
                            Solicitar Demonstração Comercial 🚀
                        </a>
                        <a
                            href="#como-funciona"
                            className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-800 transition-all"
                        >
                            Ver Como Funciona ⬇️
                        </a>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 1. COMO FUNCIONA O TOTEM NA QUADRA                           */}
                {/* ============================================================ */}
                <div id="como-funciona" className="space-y-8">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                            Infraestrutura Plug & Play
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Simples de Instalar, Sem Dor de Cabeça
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="text-3xl">📹</div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wide">1. Câmera Hikvision</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Aproveite a câmera IP existente na sua quadra. O sistema se conecta via fluxo RTSP com custo zero de infraestrutura.
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="text-3xl">🔘</div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wide">2. Botão na Grade</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Botão industrial resistente a sol e impacto na grade. O atleta bateu o ponto e apertou o botão.
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="text-3xl">🍓</div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wide">3. Totem Inteligente</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Nosso mini hardware costura os últimos 15 a 30 segundos do lance e sobe automaticamente para o servidor.
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="text-3xl">📱</div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wide">4. QR Code & Stories</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                O QR Code aparece na tela. O jogador aponta a câmera, baixa na hora e posta nos Stories marcando a sua arena.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. MATEMÁTICA DO ROI: COMO O SISTEMA SE PAGA E DÁ LUCRO      */}
                {/* ============================================================ */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/30 border border-amber-500/20 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-2xl space-y-3 relative z-10">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Modelo de Monetização Comprovado 💰
                        </span>
                        <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                            O Sistema se Paga Sozinho e Vira Uma Nova Fonte de Lucro
                        </h3>
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                            Cada vídeo reproduzido pelos atletas possui **4 slots de patrocínio** de alta visibilidade. Você pode vender cada cota para empresas locais da sua cidade (lojas de suplemento, marcas de beach tennis, restaurantes, clínicas ortopédicas).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
                        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
                            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Cota de Patrocínio Média</span>
                            <p className="text-2xl md:text-3xl font-black text-white">R$ 500 <span className="text-xs text-zinc-400 font-normal">/mês cada</span></p>
                            <p className="text-[10px] text-zinc-400">4 cotas vendidas na sua quadra</p>
                        </div>

                        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
                            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Receita Bruta Gerada</span>
                            <p className="text-2xl md:text-3xl font-black text-emerald-400">+ R$ 2.000 <span className="text-xs text-zinc-400 font-normal">/mês</span></p>
                            <p className="text-[10px] text-emerald-500/80 font-bold">Direto no caixa da sua arena</p>
                        </div>

                        <div className="bg-zinc-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-1 bg-amber-500/5">
                            <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider">Lucro Líquido Estimado</span>
                            <p className="text-2xl md:text-3xl font-black text-amber-400">+ R$ 1.600 <span className="text-xs text-zinc-400 font-normal">/mês</span></p>
                            <p className="text-[10px] text-amber-500 font-bold">Já descontado o plano do Fox Replay</p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. TABELA DE PLANOS                                          */}
                {/* ============================================================ */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                            Planos Transparentes
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Escolha o Modelo Ideal para a Sua Arena
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Plano 1 */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                    Software Only
                                </span>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase">Plano Starter</h4>
                                    <p className="text-xs text-zinc-400 mt-1">Para arenas que já possuem hardware ou mini PC próprio.</p>
                                </div>
                                <div className="text-3xl font-black text-white">
                                    R$ 199 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">✓ Gravações ilimitadas em nuvem</li>
                                    <li className="flex items-center gap-2">✓ Painel administrativo multi-quadras</li>
                                    <li className="flex items-center gap-2">✓ 4 slots de patrocinadores</li>
                                    <li className="flex items-center gap-2">✓ Suporte técnico por chamado</li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Selecionar Starter
                            </a>
                        </div>

                        {/* Plano 2: Destaque */}
                        <div className="bg-gradient-to-b from-amber-500/10 to-zinc-900 border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-amber-500/10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                                Mais Escolhido ★
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                    Totem + Software Plug & Play
                                </span>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase">Plano Pro Totem</h4>
                                    <p className="text-xs text-zinc-400 mt-1">Enviamos o totem configurado pronto para ligar na tomada.</p>
                                </div>
                                <div className="text-3xl font-black text-amber-400">
                                    R$ 399 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-200 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">✓ <strong>Totem de hardware incluso em comodato</strong></li>
                                    <li className="flex items-center gap-2">✓ Botão físico industrial com fio reforçado</li>
                                    <li className="flex items-center gap-2">✓ Conexão direta com sua Câmera Hikvision</li>
                                    <li className="flex items-center gap-2">✓ QR Code em tempo real na tela</li>
                                    <li className="flex items-center gap-2">✓ Suporte VIP direto no WhatsApp</li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md text-center"
                            >
                                Contratar Pro Totem ➔
                            </a>
                        </div>

                        {/* Plano 3 */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                    Franquias e Redes
                                </span>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase">Plano Enterprise</h4>
                                    <p className="text-xs text-zinc-400 mt-1">Para complexos com 4 ou mais quadras ou múltiplas unidades.</p>
                                </div>
                                <div className="text-3xl font-black text-white">
                                    Sob Medida
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">✓ Desconto progressivo por volume de quadras</li>
                                    <li className="flex items-center gap-2">✓ Personalização de domínio (suaarena.com.br)</li>
                                    <li className="flex items-center gap-2">✓ Gestor de conta dedicado</li>
                                    <li className="flex items-center gap-2">✓ Treinamento da equipe do complexo</li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Falar com Consultor
                            </a>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 4. FORMULÁRIO DE CONTATO / DEMONSTRAÇÃO                      */}
                {/* ============================================================ */}
                <div id="contato" className="max-w-xl mx-auto w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                            Fale Conosco
                        </span>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase">
                            Solicite uma Demonstração Sem Compromisso
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">
                            Preencha abaixo para receber nossa proposta comercial e tirar dúvidas diretamente no WhatsApp com nossos especialistas.
                        </p>
                    </div>

                    <form onSubmit={enviarInteresseWhatsApp} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Nome do Complexo / Arena
                            </label>
                            <input
                                type="text"
                                required
                                value={nomeArena}
                                onChange={(e) => setNomeArena(e.target.value)}
                                placeholder="Ex: Arena Fox Beach"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Seu Nome / Cargo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nomeContato}
                                    onChange={(e) => setNomeContato(e.target.value)}
                                    placeholder="Ex: Alexandre (Proprietário)"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-bold focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Cidade / Estado
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={cidade}
                                    onChange={(e) => setCidade(e.target.value)}
                                    placeholder="Ex: Campinas - SP"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-bold focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Quantas Quadras?
                                </label>
                                <select
                                    value={qtdQuadras}
                                    onChange={(e) => setQtdQuadras(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                    <option value="1">1 Quadra</option>
                                    <option value="2">2 Quadras</option>
                                    <option value="3 a 5">3 a 5 Quadras</option>
                                    <option value="Mais de 5">Mais de 5 Quadras</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Seu WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-bold focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            <span>Enviar Proposta no WhatsApp</span>
                            <span>💬</span>
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-zinc-800/80">
                        <p className="text-[11px] text-zinc-500 font-medium">
                            Já fechou contrato com a nossa equipe?{' '}
                            <button
                                onClick={() => router.push('/cadastro')}
                                className="text-amber-400 font-bold hover:underline"
                            >
                                Ativar sua conta de gestor ➔
                            </button>
                        </p>
                    </div>
                </div>

            </main>

            {/* FOOTER B2B */}
            <footer className="w-full border-t border-zinc-800 py-6 text-center z-10 bg-zinc-950">
                <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-bold">
                    © {new Date().getFullYear()} FOX REPLAY • Soluções de Câmera e IA para Arenas
                </p>
            </footer>
        </div>
    );
}
