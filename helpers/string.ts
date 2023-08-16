// Implementation of Boyer–Moore–Horspool algorithm for search a sub-string in a string
// It returns true at the first ocurrence found, if there's no ocurrences it returns false
// Reference: https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/
export const searchPatternInText = (txt: string, pattern: string): boolean => {
  const _txt = txt.toUpperCase();
  const _pattern = pattern.toUpperCase();

  const badMatchTable = {};

  const txtLength = _txt.length;
  const patternLength = _pattern.length;

  let shift = 0;

  Array(..._pattern).forEach((char, index) => {
    badMatchTable[char] = index;
  });

  while (shift <= txtLength - patternLength) {
    let j = patternLength - 1;

    while (j >= 0 && _pattern[j] === _txt[shift + j]) j--;

    if (j < 0) return true;
    else shift += Math.max(1, j - (badMatchTable[_txt[shift + j]] || j + 1));
  }

  return false;
};

export const getQueryableText = (text: string): string => {
  return text
    .toLowerCase()
    .trimStart()
    .trimEnd()
    .replaceAll(" ", "-")
    .replaceAll("--", "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const urlWithoutProtocol = (url: string): string => {
  return url.toLowerCase().replace("http://", "").replace("https://", "");
};

/**
 * Replace string between *value* to a span styled
 * @param str string to be replaced
 * @param className class to style span
 * @returns string inner html
 */

export const highlightText = (str: string, className?: string) => {
  if (!str) {
    return "";
  }

  const regex = /\*([\0-9a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]*?)\*/g;
  const subst = `<span class=' ${
    className || "text-purple text-uppercase"
  }'>$1</span>`;
  return str.replaceAll(regex, subst);
};

export const trimString = (string: string, at = 15) => string.length > at ? string.substring(0, at) + '...' : string;

export const toLower = (str: string) => str?.toLowerCase();

export const isTrue = (str: string) => str === "true";

export const lowerCaseCompare = (str: string, strToCompare: string) => toLower(str) === toLower(strToCompare);