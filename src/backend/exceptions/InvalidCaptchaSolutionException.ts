import HttpStatus from "http-status-codes";

import HttpException from "./HttpException";

export default class InvalidCaptchaSolutionException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided captcha solution is invalid.");
  }
}
