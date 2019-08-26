import HttpException from "./HttpException";
import HttpStatus from "http-status-codes";

export default class InvalidSessionKeyException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided session key is invalid.");
  }
}
