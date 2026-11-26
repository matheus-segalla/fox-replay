/**
 * Utilitário de Composição de Vídeo com Patrocinadores e Logos (Client-Side)
 *
 * Renderiza em alta fidelidade um quadro vertical (9:16) contendo:
 * - Topo: Logo Fox Replay + Logo da Arena
 * - Centro: Vídeo do lance com aspect ratio preservado + trilha de áudio original
 * - Rodapé: Barra com 4 posições de patrocinadores (marcas ativas ou "ANUNCIE Aqui!")
 */

// Carrega imagem com CORS anônimo e timeout de segurança (nunca trava se URL externa cair)
function carregarImagem(url, timeoutMs = 5000) {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        let concluido = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const finalizar = (resultado) => {
            if (concluido) return;
            concluido = true;
            clearTimeout(timer);
            resolve(resultado);
        };

        const timer = setTimeout(() => finalizar(null), timeoutMs);
        img.onload = () => finalizar(img);
        img.onerror = () => finalizar(null);
        img.src = url;
    });
}

// Helper compatível com navegadores/WebViews mais antigos sem ctx.roundRect nativo
function desenharRetanguloArredondado(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
    }
    const raio = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + raio, y);
    ctx.arcTo(x + w, y, x + w, y + h, raio);
    ctx.arcTo(x + w, y + h, x, y + h, raio);
    ctx.arcTo(x, y + h, x, y, raio);
    ctx.arcTo(x, y, x + w, y, raio);
    ctx.closePath();
}

function selecionarMelhorMimeType() {
    const candidatos = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm',
    ];
    for (const tipo of candidatos) {
        if (MediaRecorder.isTypeSupported(tipo)) {
            return tipo;
        }
    }
    return '';
}

export async function comporEBaixarVideoComPatrocinadores({
    videoUrl,
    nomeArena = 'Arena Parceira',
    arenaLogoUrl = null,
    foxLogoUrl = '/logo-fox.jpeg',
    patrocinadores = [],
    nomeArquivo = 'fox-replay-lance',
    onProgresso = () => {},
    onStatus = () => {},
}) {
    if (typeof window === 'undefined') return false;

    const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
    const canvas = document.createElement('canvas');
    const hasCaptureStream =
        typeof canvas.captureStream === 'function' || typeof canvas.mozCaptureStream === 'function';

    if (!hasMediaRecorder || !hasCaptureStream) {
        throw new Error('Navegador não suporta composição de vídeo em tempo real.');
    }

    onStatus('Carregando vídeo e marcas...');
    onProgresso(5);

    const [imgFox, imgArena] = await Promise.all([
        carregarImagem(foxLogoUrl),
        carregarImagem(arenaLogoUrl),
    ]);

    const imagensPatrocinadores = await Promise.all(
        Array.from({ length: 4 }).map(async (_, idx) => {
            const pat = patrocinadores?.[idx];
            if (pat && pat.ativo && pat.logo_url) {
                return await carregarImagem(pat.logo_url);
            }
            return null;
        })
    );

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.src = videoUrl;

    let audioCtx = null;
    let streamCombinado = null;
    let canvasStream = null;
    let rafId = null;
    let fallbackIntervalId = null;
    let safetyTimeoutId = null;

    try {
        await new Promise((resolve, reject) => {
            const timeoutMeta = setTimeout(
                () => reject(new Error('Tempo esgotado ao carregar metadados do vídeo.')),
                15000
            );
            video.onloadedmetadata = () => {
                clearTimeout(timeoutMeta);
                resolve();
            };
            video.onerror = () => {
                clearTimeout(timeoutMeta);
                reject(new Error('Não foi possível carregar o vídeo para composição.'));
            };
        });

        const duracaoTotal =
            Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 30;
        const canvasWidth = 720;
        const canvasHeight = 1280;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        canvasStream = canvas.captureStream
            ? canvas.captureStream(30)
            : canvas.mozCaptureStream(30);

        // Captura o áudio original do lance sem reproduzir som nos alto-falantes
        const tracksFinais = [...canvasStream.getVideoTracks()];
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                audioCtx = new AudioCtx();
                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }
                const sourceNode = audioCtx.createMediaElementSource(video);
                const destNode = audioCtx.createMediaStreamDestination();
                sourceNode.connect(destNode);
                const audioTracks = destNode.stream.getAudioTracks();
                if (audioTracks.length > 0) {
                    tracksFinais.push(...audioTracks);
                    video.muted = false;
                } else {
                    video.muted = true;
                }
            } else {
                video.muted = true;
            }
        } catch {
            // Fallback seguro caso o navegador restrinja Web Audio
            video.muted = true;
        }

        streamCombinado = new MediaStream(tracksFinais);

        const mimeType = selecionarMelhorMimeType();
        const recorderOptions = mimeType
            ? { mimeType, videoBitsPerSecond: 3500000, audioBitsPerSecond: 128000 }
            : {};

        const recorder = new MediaRecorder(streamCombinado, recorderOptions);
        const chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const conclusaoGravacao = new Promise((resolve) => {
            recorder.onstop = () => {
                const tipoFinal = recorder.mimeType || mimeType || 'video/mp4';
                resolve({
                    blob: new Blob(chunks, { type: tipoFinal }),
                    tipoFinal,
                });
            };
        });

        onStatus('Estilizando seu lance com áudio e patrocinadores...');
        recorder.start(150);
        video.currentTime = 0;

        try {
            await video.play();
        } catch {
            // Se autoplay sem mute for bloqueado, faz fallback mudo para garantir o download
            video.muted = true;
            await video.play();
        }

        let gravando = true;

        function desenharSlotPatrocinador(slotIdx, slotX, slotY, larguraSlot, alturaSlot) {
            const imgPat = imagensPatrocinadores[slotIdx];
            const pat = patrocinadores?.[slotIdx];

            ctx.save();
            ctx.fillStyle = '#121318';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = 1.5;
            desenharRetanguloArredondado(ctx, slotX, slotY, larguraSlot, alturaSlot, 18);
            ctx.fill();
            ctx.stroke();
            ctx.clip();

            if (imgPat) {
                const pAspect = imgPat.width / imgPat.height;
                let pW = larguraSlot - 28;
                let pH = pW / pAspect;
                if (pH > alturaSlot - 24) {
                    pH = alturaSlot - 24;
                    pW = pH * pAspect;
                }
                const pX = slotX + (larguraSlot - pW) / 2;
                const pY = slotY + (alturaSlot - pH) / 2;
                ctx.drawImage(imgPat, pX, pY, pW, pH);
            } else if (pat && pat.ativo && pat.nome) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '900 24px Inter, sans-serif';
                ctx.fillText(
                    pat.nome.toUpperCase().substring(0, 16),
                    slotX + larguraSlot / 2,
                    slotY + alturaSlot / 2
                );
            } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '900 20px Inter, sans-serif';
                ctx.fillText('ANUNCIE', slotX + larguraSlot / 2, slotY + alturaSlot / 2 - 14);

                ctx.fillStyle = '#FF9900';
                ctx.font = '900 22px Inter, sans-serif';
                ctx.fillText('Aqui!', slotX + larguraSlot / 2, slotY + alturaSlot / 2 + 16);
            }
            ctx.restore();
        }

        function desenharParPatrocinadores(parIdx, alpha, slotY, larguraSlot, alturaSlot, margem, gap) {
            if (alpha <= 0) return;
            const baseIdx = parIdx === 0 ? 0 : 2;
            ctx.save();
            ctx.globalAlpha = alpha;
            desenharSlotPatrocinador(baseIdx, margem, slotY, larguraSlot, alturaSlot);
            desenharSlotPatrocinador(baseIdx + 1, margem + larguraSlot + gap, slotY, larguraSlot, alturaSlot);
            ctx.restore();
        }

        function desenharFrameAtual() {
            if (!gravando) return;

            // A. Fundo escuro esportivo
            ctx.fillStyle = '#070709';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // B. Área Principal do Jogo (85% da altura: 720x1090 com crop cover centralizado)
            const areaVideoH = 1090;
            const vW = video.videoWidth || 1920;
            const vH = video.videoHeight || 1080;
            const scale = Math.max(canvasWidth / vW, areaVideoH / vH);
            const dW = vW * scale;
            const dH = vH * scale;
            const dX = (canvasWidth - dW) / 2;
            const dY = (areaVideoH - dH) / 2;

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvasWidth, areaVideoH);
            ctx.clip();
            ctx.drawImage(video, dX, dY, dW, dH);

            // Degradê superior sutil para legibilidade das logos sobre a quadra
            const gradTopo = ctx.createLinearGradient(0, 0, 0, 170);
            gradTopo.addColorStop(0, 'rgba(7, 7, 9, 0.85)');
            gradTopo.addColorStop(0.55, 'rgba(7, 7, 9, 0.35)');
            gradTopo.addColorStop(1, 'rgba(7, 7, 9, 0)');
            ctx.fillStyle = gradTopo;
            ctx.fillRect(0, 0, canvasWidth, 170);
            ctx.restore();

            // C. Topo Integrado: Logo Fox Replay (esquerda) + Arena (direita)
            if (imgFox) {
                ctx.save();
                desenharRetanguloArredondado(ctx, 28, 28, 86, 86, 18);
                ctx.clip();
                ctx.drawImage(imgFox, 28, 28, 86, 86);
                ctx.restore();

                ctx.strokeStyle = 'rgba(255, 153, 0, 0.75)';
                ctx.lineWidth = 2;
                desenharRetanguloArredondado(ctx, 28, 28, 86, 86, 18);
                ctx.stroke();
            } else {
                ctx.fillStyle = '#FF9900';
                ctx.font = '900 22px Inter, sans-serif';
                ctx.fillText('FOX REPLAY', 28, 76);
            }

            if (imgArena) {
                ctx.save();
                desenharRetanguloArredondado(ctx, canvasWidth - 28 - 132, 28, 132, 86, 18);
                ctx.clip();
                ctx.drawImage(imgArena, canvasWidth - 28 - 132, 28, 132, 86);
                ctx.restore();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1.5;
                desenharRetanguloArredondado(ctx, canvasWidth - 28 - 132, 28, 132, 86, 18);
                ctx.stroke();
            } else {
                ctx.save();
                ctx.fillStyle = 'rgba(17, 17, 17, 0.72)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1.5;
                desenharRetanguloArredondado(ctx, canvasWidth - 28 - 220, 40, 220, 62, 16);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '900 17px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(nomeArena.toUpperCase().substring(0, 18), canvasWidth - 28 - 110, 71);
                ctx.restore();
            }

            // D. Rodapé: 2 Patrocinadores Amplos alternando em loop a cada 4 segundos
            ctx.fillStyle = '#070709';
            ctx.fillRect(0, areaVideoH, canvasWidth, canvasHeight - areaVideoH);

            ctx.fillStyle = '#FF9900';
            ctx.fillRect(0, areaVideoH, canvasWidth, 3);

            const margem = 20;
            const gap = 14;
            const larguraSlot = (canvasWidth - margem * 2 - gap) / 2;
            const alturaSlot = 148;
            const slotY = areaVideoH + (canvasHeight - areaVideoH - alturaSlot) / 2;

            const cicloSegundos = 4;
            const duracaoTransicao = 0.35;
            const tempoAtual = Math.max(0, video.currentTime || 0);
            const parAtual = Math.floor(tempoAtual / cicloSegundos) % 2;
            const tempoNoCiclo = tempoAtual % cicloSegundos;

            if (tempoAtual >= cicloSegundos && tempoNoCiclo < duracaoTransicao) {
                const progresso = tempoNoCiclo / duracaoTransicao;
                const parAnterior = parAtual === 0 ? 1 : 0;
                desenharParPatrocinadores(parAnterior, 1 - progresso, slotY, larguraSlot, alturaSlot, margem, gap);
                desenharParPatrocinadores(parAtual, progresso, slotY, larguraSlot, alturaSlot, margem, gap);
            } else {
                desenharParPatrocinadores(parAtual, 1, slotY, larguraSlot, alturaSlot, margem, gap);
            }

            const pct = Math.min(95, Math.round((video.currentTime / duracaoTotal) * 100));
            onProgresso(pct);
        }

        function loopAnimacao() {
            if (!gravando) return;
            desenharFrameAtual();
            if (!video.ended && !video.paused) {
                rafId = requestAnimationFrame(loopAnimacao);
            }
        }

        loopAnimacao();

        // Garante continuidade caso a aba vá brevemente para segundo plano
        fallbackIntervalId = setInterval(() => {
            if (gravando && document.hidden && !video.ended && !video.paused) {
                desenharFrameAtual();
            }
        }, 50);

        await new Promise((resolve) => {
            let resolvido = false;
            const terminar = () => {
                if (resolvido) return;
                resolvido = true;
                resolve();
            };
            video.onended = terminar;
            video.ontimeupdate = () => {
                if (video.currentTime >= duracaoTotal - 0.15) {
                    terminar();
                }
            };
            safetyTimeoutId = setTimeout(terminar, (duracaoTotal + 5) * 1000);
        });

        gravando = false;
        onStatus('Finalizando exportação do arquivo...');
        onProgresso(98);
        video.pause();

        if (recorder.state !== 'inactive') {
            recorder.stop();
        }

        const { blob: blobFinal, tipoFinal } = await conclusaoGravacao;
        onProgresso(100);
        onStatus('Download pronto!');

        // Usa a extensão REAL do container gerado pelo navegador (nunca salva WebM como .mp4!)
        const extensaoReal = tipoFinal.toLowerCase().includes('mp4') ? 'mp4' : 'webm';
        const nomeBase = nomeArquivo.replace(/\.(mp4|webm)$/i, '');
        const nomeFinal = `${nomeBase}.${extensaoReal}`;

        const urlBlob = URL.createObjectURL(blobFinal);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = nomeFinal;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);

        return { ok: true, extensao: extensaoReal };
    } finally {
        if (rafId) cancelAnimationFrame(rafId);
        if (fallbackIntervalId) clearInterval(fallbackIntervalId);
        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);

        if (streamCombinado) {
            streamCombinado.getTracks().forEach((t) => t.stop());
        }
        if (canvasStream) {
            canvasStream.getTracks().forEach((t) => t.stop());
        }
        if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close().catch(() => {});
        }
        video.pause();
        video.removeAttribute('src');
        video.load();
    }
}
