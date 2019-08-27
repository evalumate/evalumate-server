import HttpException from "./HttpException";

export default class DetailHttpException extends HttpException {
  details: any;

  constructor(status: number, message: string, details?: any) {
    super(status, message);
    if (typeof details !== undefined) {
      this.details = details;
    }
  }
}
