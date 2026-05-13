export type Role = "admin" | "dentist" | "patient";

export type SessionPayload = {
  userId: string;
  role: Role;
  email: string;
  name?: string;
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};
