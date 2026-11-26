/**
 * Utilitário de Composição de Vídeo com Patrocinadores e Logos (Client-Side)
 *
 * Renderiza em alta fidelidade um quadro vertical (9:16) contendo:
 * - Topo: Logo Fox Replay + Logo da Arena (pré-renderizado em offscreen canvas)
 * - Centro: Vídeo do lance (75% da altura = 960px) com trilha de áudio original
 * - Rodapé: 2 patrocinadores amplos alternando em loop de 4s (pré-renderizados em offscreen canvas)
 */

const cacheVideosExportados = new Map();
const MAX_CACHE_VIDEOS = 3;

function dispararDownloadBlob(blob, nomeArquivo, extensaoReal) {
    const nomeBase = nomeArquivo.replace(/\.(mp4|webm)$/i, '');
    const nomeFinal = `${nomeBase}.${extensaoReal}`;
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = nomeFinal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
}

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

// Pré-carrega o vídeo em Blob local para evitar buffering/travamentos no meio da gravação
async function preCarregarVideoBlob(videoUrl) {
    try {
        const res = await fetch(videoUrl, { mode: 'cors' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
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

function criarCanvasTopo(canvasWidth, alturaTopo, imgFox, imgArena, nomeArena) {
    const c = document.createElement('canvas');
    c.width = canvasWidth;
    c.height = alturaTopo;
    const tCtx = c.getContext('2d');

    tCtx.fillStyle = '#070709';
    tCtx.fillRect(0, 0, canvasWidth, alturaTopo);

    if (imgFox) {
        tCtx.save();
        desenharRetanguloArredondado(tCtx, 28, 20, 82, 82, 18);
        tCtx.clip();
        tCtx.drawImage(imgFox, 28, 20, 82, 82);
        tCtx.restore();

        tCtx.strokeStyle = 'rgba(255, 153, 0, 0.75)';
        tCtx.lineWidth = 2;
        desenharRetanguloArredondado(tCtx, 28, 20, 82, 82, 18);
        tCtx.stroke();
    } else {
        tCtx.fillStyle = '#FF9900';
        tCtx.font = '900 22px Inter, sans-serif';
        tCtx.fillText('FOX REPLAY', 28, 68);
    }

    if (imgArena) {
        tCtx.save();
        desenharRetanguloArredondado(tCtx, canvasWidth - 28 - 126, 20, 126, 82, 18);
        tCtx.clip();
        tCtx.drawImage(imgArena, canvasWidth - 28 - 126, 20, 126, 82);
        tCtx.restore();

        tCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        tCtx.lineWidth = 1.5;
        desenharRetanguloArredondado(tCtx, canvasWidth - 28 - 126, 20, 126, 82, 18);
        tCtx.stroke();
    } else {
        tCtx.save();
        tCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        tCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        tCtx.lineWidth = 1.5;
        desenharRetanguloArredondado(tCtx, canvasWidth - 28 - 220, 30, 220, 62, 16);
        tCtx.fill();
        tCtx.stroke();

        tCtx.fillStyle = '#ffffff';
        tCtx.font = '900 17px Inter, sans-serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(nomeArena.toUpperCase().substring(0, 18), canvasWidth - 28 - 110, 61);
        tCtx.restore();
    }

    return c;
}

function desenharSlotNoBanner(bCtx, slotIdx, slotX, slotY, larguraSlot, alturaSlot, imagensPatrocinadores, patrocinadores) {
    const imgPat = imagensPatrocinadores[slotIdx];
    const pat = patrocinadores?.[slotIdx];

    bCtx.save();
    bCtx.fillStyle = '#121318';
    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    bCtx.lineWidth = 1.5;
    desenharRetanguloArredondado(bCtx, slotX, slotY, larguraSlot, alturaSlot, 18);
    bCtx.fill();
    bCtx.stroke();
    bCtx.clip();

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
        bCtx.drawImage(imgPat, pX, pY, pW, pH);
    } else if (pat && pat.ativo && pat.nome) {
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillStyle = '#FFFFFF';
        bCtx.font = '900 24px Inter, sans-serif';
        bCtx.fillText(
            pat.nome.toUpperCase().substring(0, 16),
            slotX + larguraSlot / 2,
            slotY + alturaSlot / 2
        );
    } else {
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';

        bCtx.fillStyle = '#FFFFFF';
        bCtx.font = '900 20px Inter, sans-serif';
        bCtx.fillText('ANUNCIE', slotX + larguraSlot / 2, slotY + alturaSlot / 2 - 14);

        bCtx.fillStyle = '#FF9900';
        bCtx.font = '900 22px Inter, sans-serif';
        bCtx.fillText('Aqui!', slotX + larguraSlot / 2, slotY + alturaSlot / 2 + 16);
    }
    bCtx.restore();
}

function criarCanvasBannerPar(canvasWidth, alturaBanner, parIdx, imagensPatrocinadores, patrocinadores) {
    const c = document.createElement('canvas');
    c.width = canvasWidth;
    c.height = alturaBanner;
    const bCtx = c.getContext('2d');

    bCtx.fillStyle = '#070709';
    bCtx.fillRect(0, 0, canvasWidth, alturaBanner);

    bCtx.fillStyle = '#FF9900';
    bCtx.fillRect(0, 0, canvasWidth, 3);

    const margem = 20;
    const gap = 14;
    const larguraSlot = (canvasWidth - margem * 2 - gap) / 2;
    const alturaSlot = 148;
    const slotY = (alturaBanner - alturaSlot) / 2;
    const baseIdx = parIdx === 0 ? 0 : 2;

    desenharSlotNoBanner(bCtx, baseIdx, margem, slotY, larguraSlot, alturaSlot, imagensPatrocinadores, patrocinadores);
    desenharSlotNoBanner(
        bCtx,
        baseIdx + 1,
        margem + larguraSlot + gap,
        slotY,
        larguraSlot,
        alturaSlot,
        imagensPatrocinadores,
        patrocinadores
    );

    return c;
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

    // 1. Verifica cache em memória (download instantâneo se já gerou nesta sessão)
    const chaveCache = `${videoUrl}|${nomeArena}|${arenaLogoUrl || ''}|${JSON.stringify(patrocinadores || [])}`;
    const itemCache = cacheVideosExportados.get(chaveCache);
    if (itemCache) {
        onStatus('Replay recuperado do cache!');
        onProgresso(100);
        dispararDownloadBlob(itemCache.blob, nomeArquivo, itemCache.extensaoReal);
        return { ok: true, extensao: itemCache.extensaoReal };
    }

    onStatus('Carregando vídeo e marcas...');
    onProgresso(5);

    const [imgFox, imgArena, blobVideoUrl, ...imagensPatrocinadores] = await Promise.all([
        carregarImagem(foxLogoUrl),
        carregarImagem(arenaLogoUrl),
        preCarregarVideoBlob(videoUrl),
        ...Array.from({ length: 4 }).map(async (_, idx) => {
            const pat = patrocinadores?.[idx];
            if (pat && pat.ativo && pat.logo_url) {
                return await carregarImagem(pat.logo_url);
            }
            return null;
        }),
    ]);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.src = blobVideoUrl || videoUrl;

    let audioCtx = null;
    let streamCombinado = null;
    let canvasStream = null;
    let rafId = null;
    let vfcId = null;
    let fallbackIntervalId = null;
    let safetyTimeoutId = null;
    let wakeLockSentinel = null;

    try {
        if (navigator.wakeLock?.request) {
            wakeLockSentinel = await navigator.wakeLock.request('screen').catch(() => null);
        }

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
        const alturaTopo = 120;
        const areaPatH = 190;
        const areaPatY = canvasHeight - areaPatH;
        const areaVideoH = Math.round(canvasHeight * 0.6); // 768px = 60% da tela
        const areaVideoY = alturaTopo + Math.round((areaPatY - alturaTopo - areaVideoH) / 2);

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d', { alpha: false });

        // Pré-renderiza topo e os 2 pares de patrocinadores em canvas offscreen (zero redesenho por frame)
        const canvasTopo = criarCanvasTopo(canvasWidth, alturaTopo, imgFox, imgArena, nomeArena);
        const bannersPatrocinadores = [
            criarCanvasBannerPar(canvasWidth, areaPatH, 0, imagensPatrocinadores, patrocinadores),
            criarCanvasBannerPar(canvasWidth, areaPatH, 1, imagensPatrocinadores, patrocinadores),
        ];

        // Calcula recorte direto da fonte (9-arg drawImage, sem ctx.clip())
        const vW = video.videoWidth || 1920;
        const vH = video.videoHeight || 1080;
        const scale = Math.max(canvasWidth / vW, areaVideoH / vH);
        const sw = Math.min(vW, canvasWidth / scale);
        const sh = Math.min(vH, areaVideoH / scale);
        const sx = Math.max(0, (vW - sw) / 2);
        const sy = Math.max(0, (vH - sh) / 2);

        // Pinta fundo e topo estático 1 única vez antes de iniciar a captura
        ctx.fillStyle = '#070709';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(canvasTopo, 0, 0);
        ctx.drawImage(bannersPatrocinadores[0], 0, areaPatY);

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
            video.muted = true;
        }

        streamCombinado = new MediaStream(tracksFinais);

        const mimeType = selecionarMelhorMimeType();
        const recorderOptions = mimeType
            ? { mimeType, videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000 }
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
        recorder.start(250);
        video.currentTime = 0;

        try {
            await video.play();
        } catch {
            video.muted = true;
            await video.play();
        }

        let gravando = true;
        let ultimoParDesenhado = 0;
        let ultimoPctReportado = -1;

        function desenharFrameAtual() {
            if (!gravando) return;

            // 1. Desenha apenas a área do vídeo com recorte direto da fonte (sem clip, sem save/restore)
            ctx.drawImage(video, sx, sy, sw, sh, 0, areaVideoY, canvasWidth, areaVideoH);

            // 2. Só redesenha o rodapé quando trocar o par (ou durante os 0.35s de transição)
            const cicloSegundos = 4;
            const duracaoTransicao = 0.35;
            const tempoAtual = Math.max(0, video.currentTime || 0);
            const parAtual = Math.floor(tempoAtual / cicloSegundos) % 2;
            const tempoNoCiclo = tempoAtual % cicloSegundos;

            if (tempoAtual >= cicloSegundos && tempoNoCiclo < duracaoTransicao) {
                const progresso = tempoNoCiclo / duracaoTransicao;
                const parAnterior = parAtual === 0 ? 1 : 0;
                ctx.save();
                ctx.globalAlpha = 1 - progresso;
                ctx.drawImage(bannersPatrocinadores[parAnterior], 0, areaPatY);
                ctx.globalAlpha = progresso;
                ctx.drawImage(bannersPatrocinadores[parAtual], 0, areaPatY);
                ctx.restore();
                ultimoParDesenhado = -1;
            } else if (parAtual !== ultimoParDesenhado) {
                ctx.drawImage(bannersPatrocinadores[parAtual], 0, areaPatY);
                ultimoParDesenhado = parAtual;
            }

            // 3. Throttle no callback de progresso (atualiza React só a cada 2%)
            const pct = Math.min(95, Math.round((tempoAtual / duracaoTotal) * 100));
            if (pct >= ultimoPctReportado + 2) {
                ultimoPctReportado = pct;
                onProgresso(pct);
            }
        }

        const usaVideoFrameCallback = typeof video.requestVideoFrameCallback === 'function';

        function agendarProximoFrame() {
            if (!gravando || video.ended || video.paused) return;
            if (usaVideoFrameCallback) {
                vfcId = video.requestVideoFrameCallback(() => {
                    desenharFrameAtual();
                    agendarProximoFrame();
                });
            } else {
                rafId = requestAnimationFrame(() => {
                    desenharFrameAtual();
                    agendarProximoFrame();
                });
            }
        }

        desenharFrameAtual();
        agendarProximoFrame();

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

        const extensaoReal = tipoFinal.toLowerCase().includes('mp4') ? 'mp4' : 'webm';

        // Salva no cache da sessão (máximo 3 vídeos)
        if (cacheVideosExportados.size >= MAX_CACHE_VIDEOS) {
            const primeiraChave = cacheVideosExportados.keys().next().value;
            if (primeiraChave) cacheVideosExportados.delete(primeiraChave);
        }
        cacheVideosExportados.set(chaveCache, { blob: blobFinal, extensaoReal });

        dispararDownloadBlob(blobFinal, nomeArquivo, extensaoReal);
        return { ok: true, extensao: extensaoReal };
    } finally {
        if (rafId) cancelAnimationFrame(rafId);
        if (vfcId && typeof video.cancelVideoFrameCallback === 'function') {
            video.cancelVideoFrameCallback(vfcId);
        }
        if (fallbackIntervalId) clearInterval(fallbackIntervalId);
        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);

        if (wakeLockSentinel) {
            wakeLockSentinel.release().catch(() => {});
        }
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
        if (blobVideoUrl) {
            URL.revokeObjectURL(blobVideoUrl);
        }
    }
}
