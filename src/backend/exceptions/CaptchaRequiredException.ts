import HttpException from "./HttpException";
import HttpStatus from "http-status-codes";

export default class CaptchaRequiredException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The requested action requires a captcha solution.");
  }
}
