import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

/**
 * Retrieves the user data from the request object in the context of an HTTP request.
 *
 * @param {string | undefined} data - The specific user data to retrieve. If not provided, the entire user object is returned.
 * @param {ExecutionContext} ctx - The execution context that provides details about the current request.
 *
 * @returns {any} - Returns the requested user data if `data` is provided, otherwise returns the entire user object.
 *
 * @throws {Error} - Throws an error if the user data is not available or if there are issues accessing the request.
 */

export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ) => {
    const request: Express.Request = ctx
      .switchToHttp()
      .getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
