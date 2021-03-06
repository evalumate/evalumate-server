/**
 * Holds the data related to an EvaluMate session.
 */
export interface Session {
  uri: string;
  id: string;
  name: string;
  captchaRequired: boolean;
  key?: string;
}
