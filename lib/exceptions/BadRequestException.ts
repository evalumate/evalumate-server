import HttpException from "./HttpException";

class MalformedRequestException extends HttpException {
  constructor() {
    super(
      403,
      "The request's data format does not comply with the API specification."
    );
  }
}

export default MalformedRequestException;
