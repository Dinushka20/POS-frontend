import apiInstance from "./apiInstance";

export interface OrderItemInputDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreateOrderDto {
  branchId: number;
  customerId?: number;
  paymentMode: string;
  cashAmount?: number;
  cardAmount?: number;
  redeemPoints?: boolean;
  items: OrderItemInputDto[];
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  branchId: number;
  customerName?: string;
  cashierName: string;
  totalAmount: number;
  discountAmount: number;
  paymentMode: string;
  pointsEarned: number;
  pointsRedeemed: number;
  status: string;
  createdAt: string;
  items: OrderItemDto[];
}

export const ordersApi = {
  getAll: async (branchId?: number, from?: string, to?: string): Promise<OrderDto[]> => {
    const response = await apiInstance.get<OrderDto[]>("/orders", {
      params: { branchId, from, to }
    });
    return response.data;
  },
  getById: async (id: number): Promise<OrderDto> => {
    const response = await apiInstance.get<OrderDto>(`/orders/${id}`);
    return response.data;
  },
  create: async (order: CreateOrderDto): Promise<OrderDto> => {
    const response = await apiInstance.post<OrderDto>("/orders", order);
    return response.data;
  }
};
