import { TFunction } from "next-i18next";

//The translation must have "bounty" initialized
export function getOriginLinkPlaceholder(translation: TFunction, type: string) {
  const placeholderPath = "bounty:fields.origin-link.placeholders";

  const placeholder = {
    code: translation(`${placeholderPath}.code`),
    design: translation(`${placeholderPath}.design`),
    other: translation(`${placeholderPath}.other`),
  };

  return placeholder[type] || translation(`${placeholderPath}.default`);
}
