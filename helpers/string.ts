// Implementation of Boyer–Moore–Horspool algorithm for search a sub-string in a string
// It returns true at the first ocurrence found, if there's no ocurrences it returns false
// Reference: https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/
export const searchPatternInText = (txt: string, pattern: string): boolean => {
  const _txt = txt.toUpperCase()
  const _pattern = pattern.toUpperCase()

  const badMatchTable = {}

  const txtLength = _txt.length
  const patternLength = _pattern.length

  let shift = 0

  Array(..._pattern).forEach((char, index) => {
    badMatchTable[char] = index
  })

  while (shift <= txtLength - patternLength) {
    let j = patternLength - 1

    while (j >= 0 && _pattern[j] === _txt[shift + j]) j--

    if (j < 0) return true
    else shift += Math.max(1, j - (badMatchTable[_txt[shift + j]] || j + 1))
  }

  return false
}

export const hexadecimalToRGB = (hexadecimal: string): string => {
  return hexadecimal
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16)).join(',')
}
