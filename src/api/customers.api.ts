import apiInstance from "./apiInstance";

export interface CustomerDto {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  tier: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  phone: string;
  email?: string;
}

export const customersApi = {
  getAll: async (search?: string): Promise<CustomerDto[]> => {
    const response = await apiInstance.get<CustomerDto[]>("/customers", {
      params: { search }
    });
    return response.data;
  },
  getById: async (id: number): Promise<CustomerDto> => {
    const response = await apiInstance.get<CustomerDto>(`/customers/${id}`);
    return response.data;
  },
  create: async (customer: CreateCustomerDto): Promise<CustomerDto> => {
    const response = await apiInstance.post<CustomerDto>("/customers", customer);
    return response.data;
  },
  update: async (id: number, customer: Partial<CreateCustomerDto>): Promise<CustomerDto> => {
    const response = await apiInstance.put<CustomerDto>(`/customers/${id}`, customer);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiInstance.delete(`/customers/${id}`);
  }
};
