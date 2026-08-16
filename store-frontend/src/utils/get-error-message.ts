import { isAxiosError } from "axios";

// Axios rejects on non-2xx responses, so the backend's { error: "..." }
// body lands in err.response.data, not in a resolved .data — this pulls
// it back out, falling back only for network errors / unexpected shapes.
export const getErrorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
};
