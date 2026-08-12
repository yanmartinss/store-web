import { getBaseUrl } from "./get-base-url.js";

export const getAbsoluteImgUrl = (path: string) => {
  return `${getBaseUrl()}/${path}`;
};
