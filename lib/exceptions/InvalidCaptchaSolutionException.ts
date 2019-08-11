import HttpException from "./HttpException";

class InvalidCaptchaSolutionException extends HttpException {
  constructor() {
    super(403, "The provided captcha solution is invalid.");
  }
}

export default InvalidCaptchaSolutionException;
