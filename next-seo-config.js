const title = 'App | Web3 Decentralized Development'
const description = 'Autonomous Protocol for Decentralized Development'
const url = process.env.NEXT_PUBLIC_HOME_URL || 'https://development.bepro.network'

export default {
  title,
  description,
  openGraph: {
    type: 'website',
    locale: 'en',
    url,
    title,
    description,
    images: [
      {
        url: `${url}/images/meta-thumbnail.jpeg`
      },
    ],
    site_name: 'Bepro.network',
  },
  twitter: {
    handle: '@bepronet',
    cardType: 'summary_large_image'
  }
};