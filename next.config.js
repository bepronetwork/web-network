const path = require('path');
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack5: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bepro',
        permanent: true,
        locale: false
      }
    ]
  }
};
