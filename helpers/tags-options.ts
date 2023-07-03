import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

export const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({
  label: tag,
  value: tag,
}));
