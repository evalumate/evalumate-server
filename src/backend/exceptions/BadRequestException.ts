import HttpStatus from "http-status-codes";

import DetailHttpException from "./DetailHttpException";

export default class MalformedRequestException extends DetailHttpException {
  constructor(details: any) {
    super(
      HttpStatus.BAD_REQUEST,
      "The request's data format does not comply with the API specification.",
      details
    );
  }
}
