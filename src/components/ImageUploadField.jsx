'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { validarUrlHttp } from '@/lib/auth';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function ImageUploadField({
  arenaId,
  prefixo = 'imagem',
  value = '',
  onChange,
  label = 'Imagem',
  hint = 'PNG, JPG ou WebP até 5MB',
  compact = false,
}) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarUrlManual, setMostrarUrlManual] = useState(false);

  const handleSelecionarArquivo = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErro('');

    if (!arenaId) {
      setErro('Selecione uma arena antes de enviar imagens.');
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setErro('Formato inválido. Envie PNG, JPG ou WebP.');
      return;
    }

    if (arquivo.size > MAX_BYTES) {
      setErro('Imagem muito grande. Limite máximo: 5MB.');
      return;
    }

    setEnviando(true);
    try {
      const ext =
        arquivo.type === 'image/png'
          ? 'png'
          : arquivo.type === 'image/webp'
          ? 'webp'
          : 'jpg';
      const caminho = `${arenaId}/${prefixo}_${Date.now()}.${ext}`;

      const { error: errUpload } = await supabase.storage
        .from('midia-arenas')
        .upload(caminho, arquivo, {
          contentType: arquivo.type,
          upsert: true,
        });

      if (errUpload) throw errUpload;

      const { data: urlData } = supabase.storage
        .from('midia-arenas')
        .getPublicUrl(caminho);

      if (urlData?.publicUrl) {
        onChange(urlData.publicUrl);
      }
    } catch (err) {
      console.error('Erro no upload de imagem:', err);
      setErro(
        err.message?.includes('Bucket')
          ? 'Bucket midia-arenas ainda não foi criado (execute a Migração SQL V3).'
          : err.message || 'Falha ao enviar imagem.'
      );
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const temPreviewValido = Boolean(value && validarUrlHttp(value));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            {label}
          </span>
          {hint && !compact && (
            <span className="text-[10px] text-zinc-400 font-normal">{hint}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {temPreviewValido && (
          <div className="w-10 h-10 rounded-xl border border-zinc-200 bg-white p-1 shrink-0 relative overflow-hidden">
            <Image src={value} alt={label} fill unoptimized className="object-contain p-0.5" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleSelecionarArquivo}
          className="hidden"
        />

        <button
          type="button"
          disabled={enviando || !arenaId}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
            temPreviewValido
              ? 'bg-white border-zinc-200 text-zinc-700 hover:border-amber-500 hover:text-amber-700'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 hover:bg-amber-500/20'
          }`}
        >
          {enviando ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <span>{temPreviewValido ? 'Trocar imagem' : 'Enviar imagem'}</span>
          )}
        </button>

        {temPreviewValido && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remover imagem"
            aria-label="Remover imagem"
            className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[11px] font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMostrarUrlManual((v) => !v)}
          className="text-[10px] text-zinc-400 hover:text-zinc-700 underline cursor-pointer"
        >
          {mostrarUrlManual ? 'Ocultar campo de URL' : 'Ou colar URL externa'}
        </button>
      </div>

      {mostrarUrlManual && (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.png"
          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500"
        />
      )}

      {erro && <p className="text-[11px] text-red-600 font-medium">{erro}</p>}
    </div>
  );
}
