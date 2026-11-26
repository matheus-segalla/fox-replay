import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { compararSeguro } from '@/lib/totemAuth';

function extrairCaminhoBucket(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  const marcador = '/storage/v1/object/public/replays/';
  const idx = publicUrl.indexOf(marcador);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marcador.length).split('?')[0]);
}

async function executarExpurgo(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET não configurado no servidor.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!compararSeguro(token, cronSecret)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Expurga registros de replays > 5 dias (preservando os favoritados)
    const { data: removidos, error: errExpurgo } = await supabaseAdmin.rpc(
      'expurgar_replays_antigos'
    );

    if (errExpurgo) throw errExpurgo;

    const listaRemovidos = Array.isArray(removidos) ? removidos : [];

    // 2. Remove arquivos .mp4 e .jpg correspondentes do Supabase Storage em lotes de 100
    const caminhosStorage = [];
    for (const item of listaRemovidos) {
      const pathVideo = extrairCaminhoBucket(item.video_url);
      if (pathVideo) caminhosStorage.push(pathVideo);
      const pathThumb = extrairCaminhoBucket(item.thumbnail_url);
      if (pathThumb) caminhosStorage.push(pathThumb);
    }

    let arquivosRemovidosStorage = 0;
    for (let i = 0; i < caminhosStorage.length; i += 100) {
      const lote = caminhosStorage.slice(i, i + 100);
      const { error: errStorage } = await supabaseAdmin.storage
        .from('replays')
        .remove(lote);
      if (!errStorage) {
        arquivosRemovidosStorage += lote.length;
      } else {
        console.error('Erro ao remover lote do Storage:', errStorage);
      }
    }

    // 3. Limpa sessões antigas de pareamento expiradas (> 24h)
    const limitePareamento = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: pareamentosRemovidos } = await supabaseAdmin
      .from('pareamentos')
      .delete()
      .lt('expira_em', limitePareamento)
      .select('id');

    return NextResponse.json({
      ok: true,
      replaysRemovidos: listaRemovidos.length,
      arquivosRemovidosStorage,
      pareamentosLimpos: pareamentosRemovidos?.length || 0,
    });
  } catch (err) {
    console.error('Erro em /api/cron/expurgo:', err);
    return NextResponse.json(
      { error: 'Falha ao executar rotina de expurgo.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return executarExpurgo(request);
}

export async function POST(request) {
  return executarExpurgo(request);
}
