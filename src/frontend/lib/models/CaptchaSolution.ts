/**
 * The solution of a captcha as it has to be provided to the server for validation.
 */
export interface CaptchaSolution {
  token: string;
  solution: string;
}
