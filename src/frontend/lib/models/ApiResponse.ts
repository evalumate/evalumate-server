export interface ApiResponse<D = any> {
  apiVersion: string;
  data?: D;
  error?: {
    code: number;
    name: string;
    message: string;
    details?: string;
  };
}
