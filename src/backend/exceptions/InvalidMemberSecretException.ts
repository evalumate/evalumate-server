import HttpException from "./HttpException";
import HttpStatus from "http-status-codes";

export default class InvalidMemberSecretException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided member secret is invalid.");
  }
}
