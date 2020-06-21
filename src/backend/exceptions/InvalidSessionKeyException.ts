import HttpStatus from "http-status-codes";

import HttpException from "./HttpException";

export default class InvalidSessionKeyException extends HttpException {
  constructor() {
    super(HttpStatus.FORBIDDEN, "The provided session key is invalid.");
  }
}
