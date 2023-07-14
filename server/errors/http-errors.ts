import { BaseAPIError } from "server/errors/base-api-error";

export class HttpNotFoundError extends BaseAPIError {
  constructor(message: string) {
    super(message, 404);
  }
}