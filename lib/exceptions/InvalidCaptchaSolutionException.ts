import HttpException from "./HttpException";
import HttpStatus from "http-status-codes";

class InvalidCaptchaSolutionException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided captcha solution is invalid.");
  }
}

export default InvalidCaptchaSolutionException;
