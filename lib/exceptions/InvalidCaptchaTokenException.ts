import HttpException from "./HttpException";

class InvalidCaptchaTokenException extends HttpException {
  constructor() {
    super(403, "The provided captcha token is invalid or has expired.");
  }
}

export default InvalidCaptchaTokenException;
