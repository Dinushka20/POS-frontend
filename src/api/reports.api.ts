import apiInstance from "./apiInstance";

export interface SummaryReportDto {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

export interface DailyReportDto {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductDto {
  productId: number;
  productName: string;
  totalQtySold: number;
  totalRevenue: number;
}

export interface HourlyReportDto {
  hour: number;
  orderCount: number;
  revenue: number;
}

export const reportsApi = {
  getSummary: async (branchId: number, date: string): Promise<SummaryReportDto> => {
    const response = await apiInstance.get<SummaryReportDto>("/reports/summary", {
      params: { branchId, date }
    });
    return response.data;
  },
  getDaily: async (branchId: number, from: string, to: string): Promise<DailyReportDto[]> => {
    const response = await apiInstance.get<DailyReportDto[]>("/reports/daily", {
      params: { branchId, from, to }
    });
    return response.data;
  },
  getTopProducts: async (branchId: number, limit: number = 10): Promise<TopProductDto[]> => {
    const response = await apiInstance.get<TopProductDto[]>("/reports/top-products", {
      params: { branchId, limit }
    });
    return response.data;
  },
  getHourly: async (branchId: number, date: string): Promise<HourlyReportDto[]> => {
    const response = await apiInstance.get<HourlyReportDto[]>("/reports/hourly", {
      params: { branchId, date }
    });
    return response.data;
  },
  getDailyPdf: async (branchId: number, date: string): Promise<Blob> => {
    // Using arraybuffer for raw binary integrity across all environments
    const response = await apiInstance.get("/reports/daily-pdf", {
      params: { branchId, date },
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return new Blob([response.data], { type: 'application/pdf' });
  }
};
