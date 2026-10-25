export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "unauthorized" | "forbidden" | "not_found" | "validation" | "conflict" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const isServiceError = (error: unknown): error is ServiceError => error instanceof ServiceError;

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
