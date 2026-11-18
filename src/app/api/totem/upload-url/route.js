import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { autenticarTotem } from '@/lib/totemAuth';

/**
 * POST /api/totem/upload-url
 * Autentica o totem via Bearer token e gera URLs assinadas de curta duração
 * para upload direto do vídeo MP4 e thumbnail JPG no bucket `replays`.
 */
export async function POST(request) {
  try {
    const { dispositivo, errorResponse } = await autenticarTotem(request, {
      exigirArenaAtiva: true,
    });
    if (errorResponse) return errorResponse;

    let incluirThumbnail = true;
    try {
      const body = await request.json();
      if (typeof body?.incluirThumbnail === 'boolean') {
        incluirThumbnail = body.incluirThumbnail;
      }
    } catch {
      // Corpo vazio é permitido
    }

    const supabaseAdmin = getSupabaseAdmin();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const baseNome = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const videoPath = `${dispositivo.quadra_id}/${baseNome}.mp4`;

    const { data: videoUpload, error: errVideo } = await supabaseAdmin.storage
      .from('replays')
      .createSignedUploadUrl(videoPath);

    if (errVideo || !videoUpload) {
      console.error('Erro ao gerar Signed Upload URL de vídeo:', errVideo);
      return NextResponse.json(
        { error: 'Não foi possível autorizar o upload do vídeo.' },
        { status: 500 }
      );
    }

    const resposta = {
      video: {
        path: videoPath,
        token: videoUpload.token,
        signedUrl: videoUpload.signedUrl,
        publicUrl: `${supabaseUrl}/storage/v1/object/public/replays/${videoPath}`,
      },
      thumbnail: null,
    };

    if (incluirThumbnail) {
      const thumbPath = `${dispositivo.quadra_id}/${baseNome}.jpg`;
      const { data: thumbUpload, error: errThumb } = await supabaseAdmin.storage
        .from('replays')
        .createSignedUploadUrl(thumbPath);

      if (!errThumb && thumbUpload) {
        resposta.thumbnail = {
          path: thumbPath,
          token: thumbUpload.token,
          signedUrl: thumbUpload.signedUrl,
          publicUrl: `${supabaseUrl}/storage/v1/object/public/replays/${thumbPath}`,
        };
      }
    }

    return NextResponse.json(resposta);
  } catch (err) {
    console.error('Erro em POST /api/totem/upload-url:', err);
    return NextResponse.json(
      { error: 'Erro interno ao autorizar upload.' },
      { status: 500 }
    );
  }
}
