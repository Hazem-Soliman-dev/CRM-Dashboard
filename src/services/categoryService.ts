import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
}

const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    // Backend returns { success: true, data: [...] } or { success: true, data: { categories: [...] } }
    const data = response.data?.data;
    // Handle both direct array and object with categories property
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.categories)) {
      return data.categories;
    }
    return [];
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
