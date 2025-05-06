export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
  text: () => Promise<string>;
  data: T;
}

export function apiFetch(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse>;