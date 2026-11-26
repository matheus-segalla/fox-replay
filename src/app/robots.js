const BASE_URL = 'https://www.foxreplay.com.br';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/para-arenas', '/arena/', '/jogada'],
        disallow: [
          '/api/',
          '/admin',
          '/dashboard',
          '/ativar',
          '/login',
          '/cadastro',
          '/entrar',
          '/perfil',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
