export function psReadAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();

    fr.onload = () => {
      resolve(fr.result.toString());
    };

    fr.onerror = reject;

    fr?.readAsText(file);
  });
}
