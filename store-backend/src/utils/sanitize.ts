// Strips HTML tags and angle brackets from free-text input so stored/echoed
// values can never carry markup, regardless of how a client renders them.
export const sanitizeString = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
