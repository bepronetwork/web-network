import { BaseAPIError } from "server/errors/base-api-error";

export class HttpNotFoundError extends BaseAPIError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class HttpBadRequestError extends BaseAPIError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class HttpConflictError extends BaseAPIError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class HttpUnauthorizedError extends BaseAPIError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class HttpForbiddenError extends BaseAPIError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class HttpServerError extends BaseAPIError {
  constructor(message: string) {
    super(message, 500);
  }
}