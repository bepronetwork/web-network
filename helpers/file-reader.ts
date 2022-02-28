export function psReadAsText(file: File) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()

    fr.onload = () => {
      resolve(fr.result)
    }

    fr.onerror = reject

    fr.readAsText(file)
  })
}
