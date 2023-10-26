const title = "Task-Based Marketplace";
const description = "Connecting organizations and builders through task-based work.";
const url =
  process.env.NEXT_PUBLIC_HOME_URL || "https://app.bepro.network";

export default {
  title,
  description,
  openGraph: {
    type: "website",
    locale: "en",
    url,
    title,
    description,
    images: [
      {
        url: `${url}/images/meta-thumbnail.jpeg`
      }
    ],
    site_name: "Bepro.network"
  },
  twitter: {
    handle: "@bepronet",
    cardType: "summary_large_image"
  }
};
