import HttpStatus from "http-status-codes";

import HttpException from "./HttpException";

export default class InvalidMemberSecretException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided member secret is invalid.");
  }
}
