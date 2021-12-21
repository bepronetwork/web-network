export const search = (txt: string, pattern: string): boolean => {
  const _txt = txt.toUpperCase()
  const _pattern = pattern.toUpperCase()
  
  const badMatchTable = {}
  const txtLength = _txt.length
  const patternLength = _pattern.length
  let shift = 0

  _pattern.split('').forEach((char, index) => {
    badMatchTable[char] = index
  })

  while (shift <= txtLength - patternLength) {
    let j = patternLength - 1

    while (j >= 0 && _pattern[j] === _txt[shift + j]) j--

    if (j < 0) return true
    else
      shift += badMatchTable[_txt[shift + j]]
        ? j - badMatchTable[_txt[shift + j]]
        : 1
  }

  return false
}
