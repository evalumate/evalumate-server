import HttpStatus from "http-status-codes";

import HttpException from "./HttpException";

export default class CaptchaRequiredException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The requested action requires a captcha solution.");
  }
}
