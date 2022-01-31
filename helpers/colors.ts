export const hexadecimalToRGB = (
  hexadecimal: string
): [number, number, number] => {
  return hexadecimal
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16)) as [number, number, number]
}

export const luminance = (r: number, g: number, b: number): number => {
  // Algorithm by kirilloid at https://stackoverflow.com/a/9733420

  const a = [r, g, b].map(function (v) {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export const contrastRatioBetweenHexColors = (
  colorA: string,
  colorB: string
): number => {
  const rgbA = hexadecimalToRGB(colorA)
  const rgbB = hexadecimalToRGB(colorB)

  const luminanceA = luminance(...rgbA)
  const luminanceB = luminance(...rgbB)

  return luminanceA > luminanceB
    ? (luminanceB + 0.05) / (luminanceA + 0.05)
    : (luminanceA + 0.05) / (luminanceB + 0.05)
}

export const isColorsSimilar = (colors): boolean => {

  return false
}
