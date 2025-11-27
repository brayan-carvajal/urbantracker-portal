export interface CrudResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  operation?: string;
  entityType?: string;
  timestamp: string; // El backend devuelve LocalDateTime que se serializa como string
  validationErrors?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}