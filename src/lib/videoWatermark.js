/**
 * Utilitário de Composição de Vídeo com Patrocinadores e Logos (Client-Side)
 * 
 * Renderiza em alta fidelidade um quadro vertical (9:16) contendo:
 * - Topo: Logo Fox Replay + Logo da Arena
 * - Centro: Vídeo do lance com aspect ratio preservado
 * - Rodapé: Barra com 4 posições de patrocinadores (marcas ativas ou "ANUNCIE Aqui!")
 */

// Helper para carregar imagens assincronamente com CORS anônimo
function carregarImagem(url) {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

export async function comporEBaixarVideoComPatrocinadores({
    videoUrl,
    nomeArena = 'Arena Parceira',
    arenaLogoUrl = null,
    foxLogoUrl = '/logo-fox.jpeg',
    patrocinadores = [],
    nomeArquivo = 'fox-replay-lance.mp4',
    onProgresso = () => {},
    onStatus = () => {},
}) {
    // 1. Verificação de compatibilidade da API
    if (typeof window === 'undefined') return false;

    const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
    const canvas = document.createElement('canvas');
    const hasCaptureStream = typeof canvas.captureStream === 'function' || typeof canvas.mozCaptureStream === 'function';

    if (!hasMediaRecorder || !hasCaptureStream) {
        throw new Error('Navegador não suporta composição de vídeo em tempo real.');
    }

    onStatus('Carregando vídeo e marcas...');
    onProgresso(5);

    // 2. Pré-carregar imagens de marca
    const [imgFox, imgArena] = await Promise.all([
        carregarImagem(foxLogoUrl),
        carregarImagem(arenaLogoUrl)
    ]);

    // Pré-carregar até 4 patrocinadores
    const imagensPatrocinadores = await Promise.all(
        Array.from({ length: 4 }).map(async (_, idx) => {
            const pat = patrocinadores?.[idx];
            if (pat && pat.ativo && pat.logo_url) {
                return await carregarImagem(pat.logo_url);
            }
            return null;
        })
    );

    // 3. Preparar o elemento de vídeo
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = true; // Necessário para autoplay em background
    video.preload = 'auto';
    video.src = videoUrl;

    await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = (e) => reject(new Error('Não foi possível carregar o vídeo para composição.'));
    });

    const duracaoTotal = video.duration || 30;
    const canvasWidth = 720;
    const canvasHeight = 1280;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // 4. Configurar MediaRecorder com o melhor formato suportado
    const stream = canvas.captureStream ? canvas.captureStream(30) : canvas.mozCaptureStream(30);

    let mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
            mimeType = 'video/webm;codecs=h264';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
        } else {
            mimeType = '';
        }
    }

    const recorderOptions = mimeType ? { mimeType, videoBitsPerSecond: 3500000 } : {};
    const recorder = new MediaRecorder(stream, recorderOptions);
    const chunks = [];

    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const conclusaoGravacao = new Promise((resolve) => {
        recorder.onstop = () => {
            const blobFinal = new Blob(chunks, { type: mimeType || 'video/mp4' });
            resolve(blobFinal);
        };
    });

    // 5. Iniciar Renderização e Gravação Frame a Frame
    onStatus('Estilizando seu lance com patrocinadores...');
    recorder.start(100);
    video.currentTime = 0;
    await video.play();

    let gravando = true;

    function desenharQuadro() {
        if (!gravando) return;

        // A. Fundo escuro esportivo
        ctx.fillStyle = '#070709';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Brilho âmbar sutil no topo e rodapé
        const gradTopo = ctx.createRadialGradient(canvasWidth / 2, 80, 20, canvasWidth / 2, 80, 400);
        gradTopo.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
        gradTopo.addColorStop(1, 'rgba(7, 7, 9, 0)');
        ctx.fillStyle = gradTopo;
        ctx.fillRect(0, 0, canvasWidth, 220);

        // B. Topo: Logos e Marcas (Altura: 180px)
        // 1. Logo Fox Replay (Esquerda)
        if (imgFox) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(40, 36, 96, 96, 18);
            ctx.clip();
            ctx.drawImage(imgFox, 40, 36, 96, 96);
            ctx.restore();

            // Borda dourada sutil na logo da Fox
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(40, 36, 96, 96, 18);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#f59e0b';
            ctx.font = '900 24px Inter, sans-serif';
            ctx.fillText('FOX REPLAY', 40, 85);
        }

        // 2. Logo da Arena (Direita)
        if (imgArena) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(canvasWidth - 40 - 140, 36, 140, 96, 18);
            ctx.clip();
            ctx.drawImage(imgArena, canvasWidth - 40 - 140, 36, 140, 96);
            ctx.restore();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(canvasWidth - 40 - 140, 36, 140, 96, 18);
            ctx.stroke();
        } else {
            // Emblema estilizado com o nome da arena
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(canvasWidth - 40 - 240, 48, 240, 68, 16);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(nomeArena.toUpperCase().substring(0, 18), canvasWidth - 40 - 120, 82);
            ctx.restore();
        }

        // C. Centro: Vídeo da Quadra (Área Y: 180 até 1080 -> 900px)
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

        // Fundo do vídeo com borda suave
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(dX, dY, dW, dH, 16);
        ctx.clip();
        ctx.drawImage(video, dX, dY, dW, dH);
        ctx.restore();

        // Borda elegante no vídeo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(dX, dY, dW, dH, 16);
        ctx.stroke();

        // D. Rodapé: 4 Patrocinadores (Área Y: 1100 até 1260)
        const areaPatY = 1100;
        const areaPatH = 150;
        const margem = 24;
        const espacoTotal = canvasWidth - (margem * 2);
        const gap = 12;
        const larguraSlot = (espacoTotal - (gap * 3)) / 4;

        // Linha divisória fina superior
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(24, areaPatY - 14);
        ctx.lineTo(canvasWidth - 24, areaPatY - 14);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
            const slotX = margem + (i * (larguraSlot + gap));
            const slotY = areaPatY;
            const imgPat = imagensPatrocinadores[i];

            // Card do Patrocinador
            ctx.save();
            ctx.fillStyle = 'rgba(18, 19, 24, 0.85)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(slotX, slotY, larguraSlot, areaPatH, 16);
            ctx.fill();
            ctx.stroke();
            ctx.clip();

            if (imgPat) {
                // Desenhar logo do patrocinador centralizada
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
            } else {
                // Placeholder padrão oficial: "ANUNCIE Aqui!"
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '900 18px Inter, sans-serif';
                ctx.fillText('ANUNCIE', slotX + (larguraSlot / 2), slotY + 60);

                ctx.fillStyle = '#F59E0B';
                ctx.font = '900 20px Inter, sans-serif';
                ctx.fillText('Aqui!', slotX + (larguraSlot / 2), slotY + 88);
            }
            ctx.restore();
        }

        // Atualizar progresso
        const pct = Math.min(95, Math.round((video.currentTime / duracaoTotal) * 100));
        onProgresso(pct);

        if (!video.ended && !video.paused) {
            requestAnimationFrame(desenharQuadro);
        }
    }

    desenharQuadro();

    // Aguardar o vídeo chegar ao final
    await new Promise((resolve) => {
        video.onended = () => resolve();
        video.ontimeupdate = () => {
            if (video.currentTime >= duracaoTotal - 0.2) {
                resolve();
            }
        };
        // Timeout de segurança (caso o vídeo não acione onended)
        setTimeout(() => resolve(), (duracaoTotal + 4) * 1000);
    });

    gravando = false;
    onStatus('Finalizando exportação do arquivo...');
    onProgresso(98);
    video.pause();
    recorder.stop();

    const blobFinal = await conclusaoGravacao;
    onProgresso(100);
    onStatus('Download pronto!');

    // Disparar o download no navegador
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const nomeFinal = nomeArquivo.endsWith('.mp4') ? nomeArquivo : `${nomeArquivo}.${ext}`;
    const urlBlob = URL.createObjectURL(blobFinal);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = nomeFinal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(urlBlob), 5000);

    return true;
}
