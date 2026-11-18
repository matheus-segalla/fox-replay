import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { autenticarTotem } from '@/lib/totemAuth';

/**
 * POST /api/totem/replays
 * Registra um replay já enviado para o bucket oficial `replays`,
 * vinculando-o exclusivamente à quadra do totem autenticado.
 */
export async function POST(request) {
  try {
    const { dispositivo, errorResponse } = await autenticarTotem(request, {
      exigirArenaAtiva: true,
    });
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    const videoUrl = typeof body?.video_url === 'string' ? body.video_url.trim() : '';
    const thumbnailUrl =
      typeof body?.thumbnail_url === 'string' ? body.thumbnail_url.trim() : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prefixoEsperado = `${supabaseUrl}/storage/v1/object/public/replays/${dispositivo.quadra_id}/`;

    if (
      !videoUrl ||
      !videoUrl.startsWith(prefixoEsperado) ||
      videoUrl.includes('..') ||
      !/\.mp4$/i.test(videoUrl)
    ) {
      return NextResponse.json(
        { error: 'URL de vídeo inválida ou fora do escopo autorizado da quadra.' },
        { status: 400 }
      );
    }

    let thumbValidada = null;
    if (thumbnailUrl) {
      if (
        !thumbnailUrl.startsWith(prefixoEsperado) ||
        thumbnailUrl.includes('..') ||
        !/\.(jpg|jpeg|webp|png)$/i.test(thumbnailUrl)
      ) {
        return NextResponse.json(
          { error: 'URL de thumbnail inválida.' },
          { status: 400 }
        );
      }
      thumbValidada = thumbnailUrl;
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('replays')
      .insert([
        {
          quadra_id: dispositivo.quadra_id,
          video_url: videoUrl,
          thumbnail_url: thumbValidada,
        },
      ])
      .select('id, quadra_id, video_url, thumbnail_url, criado_em')
      .single();

    if (error) {
      console.error('Erro ao inserir replay:', error);
      return NextResponse.json(
        { error: 'Falha ao registrar replay no banco.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Erro em POST /api/totem/replays:', err);
    return NextResponse.json(
      { error: 'Erro interno ao registrar replay.' },
      { status: 500 }
    );
  }
}
