const path = require('path');
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: ['ipfs.infura.io'],
  },
  webpack5: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bepro',
        permanent: true
      }
    ]
  }
};
