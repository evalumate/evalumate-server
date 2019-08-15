import HttpException from "./HttpException";

class DetailHttpException extends HttpException {
  details: any;

  constructor(status: number, message: string, details?: any) {
    super(status, message);
    if (typeof details !== undefined) {
      this.details = details;
    }
  }
}

export default DetailHttpException;
