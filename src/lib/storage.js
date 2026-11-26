/**
 * Wrappers seguros para leitura e gravação no localStorage do navegador.
 */

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function isValidSafeId(id) {
  return typeof id === 'string' && SAFE_ID_REGEX.test(id);
}

export function getUltimaArena() {
  try {
    const raw = localStorage.getItem('fox_ultima_arena');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && isValidSafeId(parsed.id)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setUltimaArena(arena) {
  if (!arena || !isValidSafeId(arena.id)) return;
  try {
    localStorage.setItem(
      'fox_ultima_arena',
      JSON.stringify({
        id: arena.id,
        nome: arena.nome,
        cidade: arena.cidade,
        estado: arena.estado,
      })
    );
  } catch {}
}

export function getLancesSalvos() {
  try {
    const raw = localStorage.getItem('fox_lances_salvos') || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLancesSalvos(lances) {
  try {
    localStorage.setItem('fox_lances_salvos', JSON.stringify(Array.isArray(lances) ? lances : []));
  } catch {}
}

export function getArenaAtivaId() {
  try {
    const id = localStorage.getItem('fox_arena_id');
    return isValidSafeId(id) ? id : null;
  } catch {
    return null;
  }
}

export function setArenaAtivaId(id) {
  if (!isValidSafeId(id)) return;
  try {
    localStorage.setItem('fox_arena_id', id);
  } catch {}
}

export function clearArenaAtivaId() {
  try {
    localStorage.removeItem('fox_arena_id');
  } catch {}
}
