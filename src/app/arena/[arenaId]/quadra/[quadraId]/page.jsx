import { redirect } from 'next/navigation';

export default async function RedirecionarParaFeedUnificado({ params }) {
  const { arenaId, quadraId } = await params;

  if (arenaId && quadraId) {
    redirect(`/arena/${arenaId}?quadra=${encodeURIComponent(quadraId)}`);
  }

  if (arenaId) {
    redirect(`/arena/${arenaId}`);
  }

  redirect('/');
}
