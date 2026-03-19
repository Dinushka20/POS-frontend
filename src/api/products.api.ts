import apiInstance from "./apiInstance";

export interface ProductDto {
  id: number;
  name: string;
  barcode: string;
  price: number;
  costPrice: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  barcode: string;
  price: number;
  costPrice: number;
  categoryId: number;
}

export const productsApi = {
  getAll: async (search?: string, barcode?: string): Promise<ProductDto[]> => {
    const response = await apiInstance.get<ProductDto[]>("/products", {
      params: { search, barcode }
    });
    return response.data;
  },
  getById: async (id: number): Promise<ProductDto> => {
    const response = await apiInstance.get<ProductDto>(`/products/${id}`);
    return response.data;
  },
  create: async (dto: CreateProductDto): Promise<ProductDto> => {
    const response = await apiInstance.post<ProductDto>("/products", dto);
    return response.data;
  },
  update: async (id: number, dto: Partial<ProductDto>): Promise<void> => {
    await apiInstance.put(`/products/${id}`, dto);
  },
  delete: async (id: number): Promise<void> => {
    await apiInstance.delete(`/products/${id}`);
  }
};
