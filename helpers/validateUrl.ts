export function isValidUrl(url: string) {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (err) {
    return false;
  }
}
