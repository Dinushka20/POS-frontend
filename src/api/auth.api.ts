import apiInstance from "./apiInstance";

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  role: string;
  branchId: number;
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const response = await apiInstance.post<AuthResponse>("/auth/login", dto);
    return response.data;
  },
  // Add register if needed
};
