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

        function desenharFrameAtual() {
            if (!gravando) return;

            // A. Fundo escuro esportivo
            ctx.fillStyle = '#070709';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const gradTopo = ctx.createRadialGradient(
                canvasWidth / 2, 80, 20,
                canvasWidth / 2, 80, 400
            );
            gradTopo.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
            gradTopo.addColorStop(1, 'rgba(7, 7, 9, 0)');
            ctx.fillStyle = gradTopo;
            ctx.fillRect(0, 0, canvasWidth, 220);

            // B. Topo: Logo Fox Replay + Logo da Arena
            if (imgFox) {
                ctx.save();
                desenharRetanguloArredondado(ctx, 40, 36, 96, 96, 18);
                ctx.clip();
                ctx.drawImage(imgFox, 40, 36, 96, 96);
                ctx.restore();

                ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
                ctx.lineWidth = 2;
                desenharRetanguloArredondado(ctx, 40, 36, 96, 96, 18);
                ctx.stroke();
            } else {
                ctx.fillStyle = '#f59e0b';
                ctx.font = '900 24px Inter, sans-serif';
                ctx.fillText('FOX REPLAY', 40, 85);
            }

            if (imgArena) {
                ctx.save();
                desenharRetanguloArredondado(ctx, canvasWidth - 40 - 140, 36, 140, 96, 18);
                ctx.clip();
                ctx.drawImage(imgArena, canvasWidth - 40 - 140, 36, 140, 96);
                ctx.restore();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.5;
                desenharRetanguloArredondado(ctx, canvasWidth - 40 - 140, 36, 140, 96, 18);
                ctx.stroke();
            } else {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.5;
                desenharRetanguloArredondado(ctx, canvasWidth - 40 - 240, 48, 240, 68, 16);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '900 18px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(nomeArena.toUpperCase().substring(0, 18), canvasWidth - 40 - 120, 88);
                ctx.restore();
            }

            // C. Centro: Vídeo da Quadra
            const areaVideoY = 170;
            const areaVideoH = 910;
            const vW = video.videoWidth || 1920;
            const vH = video.videoHeight || 1080;
            const aspect = vW / vH;

            let dW = canvasWidth;
            let dH = dW / aspect;

            if (dH > areaVideoH) {
                dH = areaVideoH;
                dW = dH * aspect;
            }

            const dX = (canvasWidth - dW) / 2;
            const dY = areaVideoY + (areaVideoH - dH) / 2;

            ctx.save();
            desenharRetanguloArredondado(ctx, dX, dY, dW, dH, 16);
            ctx.clip();
            ctx.drawImage(video, dX, dY, dW, dH);
            ctx.restore();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            desenharRetanguloArredondado(ctx, dX, dY, dW, dH, 16);
            ctx.stroke();

            // D. Rodapé: 4 Patrocinadores
            const areaPatY = 1100;
            const areaPatH = 150;
            const margem = 24;
            const espacoTotal = canvasWidth - margem * 2;
            const gap = 12;
            const larguraSlot = (espacoTotal - gap * 3) / 4;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(24, areaPatY - 14);
            ctx.lineTo(canvasWidth - 24, areaPatY - 14);
            ctx.stroke();

            for (let i = 0; i < 4; i++) {
                const slotX = margem + i * (larguraSlot + gap);
                const slotY = areaPatY;
                const imgPat = imagensPatrocinadores[i];
                const pat = patrocinadores?.[i];

                ctx.save();
                ctx.fillStyle = 'rgba(18, 19, 24, 0.85)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1.5;
                desenharRetanguloArredondado(ctx, slotX, slotY, larguraSlot, areaPatH, 16);
                ctx.fill();
                ctx.stroke();
                ctx.clip();

                if (imgPat) {
                    const pAspect = imgPat.width / imgPat.height;
                    let pW = larguraSlot - 20;
                    let pH = pW / pAspect;
                    if (pH > areaPatH - 20) {
                        pH = areaPatH - 20;
                        pW = pH * pAspect;
                    }
                    const pX = slotX + (larguraSlot - pW) / 2;
                    const pY = slotY + (areaPatH - pH) / 2;
                    ctx.drawImage(imgPat, pX, pY, pW, pH);
                } else if (pat && pat.ativo && pat.nome) {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '900 16px Inter, sans-serif';
                    ctx.fillText(
                        pat.nome.toUpperCase().substring(0, 12),
                        slotX + larguraSlot / 2,
                        slotY + areaPatH / 2
                    );
                } else {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '900 18px Inter, sans-serif';
                    ctx.fillText('ANUNCIE', slotX + larguraSlot / 2, slotY + 60);

                    ctx.fillStyle = '#F59E0B';
                    ctx.font = '900 20px Inter, sans-serif';
                    ctx.fillText('Aqui!', slotX + larguraSlot / 2, slotY + 88);
                }
                ctx.restore();
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
