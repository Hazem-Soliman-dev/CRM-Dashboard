import api from "./api";

export interface Item {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  min_stock_level: number;
  status: "Active" | "Inactive" | "Discontinued";
  created_at: string;
  updated_at: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  price: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
}

const itemService = {
  getAllItems: async (): Promise<Item[]> => {
    const response = await api.get("/items");
    // Backend returns { success: true, data: { items: [...], pagination: {...} } }
    const data = response.data?.data;
    // Handle both direct array and object with items property
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  },

  getItemById: async (id: string): Promise<Item> => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },

  createItem: async (data: CreateItemData): Promise<Item> => {
    const response = await api.post("/items", data);
    return response.data.data;
  },

  updateItem: async (
    id: string,
    data: Partial<CreateItemData>
  ): Promise<Item> => {
    const response = await api.put(`/items/${id}`, data);
    return response.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  updateItemStatus: async (
    id: string,
    status: "Active" | "Inactive" | "Discontinued"
  ): Promise<Item> => {
    const response = await api.patch(`/items/${id}/status`, { status });
    return response.data.data;
  },

  updateItemStock: async (id: string, quantity: number): Promise<Item> => {
    const response = await api.patch(`/items/${id}/stock`, { quantity });
    return response.data.data;
  },
};

export default itemService;
