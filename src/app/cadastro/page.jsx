import { redirect } from 'next/navigation';

/**
 * O credenciamento de novas arenas parceiras é realizado mediante implantação
 * física e ativação pelo time Fox Replay. Redireciona para o formulário comercial.
 */
export default function RedirectCadastroComercial() {
  redirect('/para-arenas#contato');
}
