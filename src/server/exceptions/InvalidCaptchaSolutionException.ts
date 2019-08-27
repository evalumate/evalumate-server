import HttpException from "./HttpException";
import HttpStatus from "http-status-codes";

export default class InvalidCaptchaSolutionException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided captcha solution is invalid.");
  }
}
