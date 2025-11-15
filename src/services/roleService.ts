import api from './api';

const roleService = {
  // Get all roles
  getAllRoles: async (params = {}) => {
    // const response = await api.get('/roles', { params });
    // return response.data;
    console.warn("Returning mock role data. Endpoint does not exist.");
    return Promise.resolve({
      roles: [
        { id: "admin", name: "Admin" },
        { id: "manager", name: "Manager" },
        { id: "agent", name: "Agent" },
        { id: "customer", name: "Customer" },
      ],
    });
  },

  // Get a single role by ID
  getRoleById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create a new role
  createRole: async (roleData: any) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Update a role
  updateRole: async (id: string, roleData: any) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete a role
  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

export default roleService;
