const AUTH_URL = 'https://auth.leandrosouza.info'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: `${AUTH_URL}/login`,
        permanent: false,
      },
      {
        source: '/login/:path*',
        destination: `${AUTH_URL}/login/:path*`,
        permanent: false,
      },
      {
        source: '/auth/callback',
        destination: `${AUTH_URL}/auth/callback`,
        permanent: false,
      },
      {
        source: '/auth/redefinir-senha',
        destination: `${AUTH_URL}/auth/redefinir-senha`,
        permanent: false,
      },
      {
        source: '/perfil',
        destination: `${AUTH_URL}/perfil`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
