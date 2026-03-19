import apiInstance from "./apiInstance";

export interface StockDto {
  productId: number;
  productName: string;
  branchId: number;
  quantity: number;
  lowStockThreshold: number;
  status: string;
}

export const stockApi = {
  getByBranch: async (branchId: number): Promise<StockDto[]> => {
    const response = await apiInstance.get<StockDto[]>("/stock", {
      params: { branchId }
    });
    return response.data;
  }
};
