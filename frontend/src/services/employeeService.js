/**
 * employeeService.js
 * API calls for employee CRUD and stats endpoints.
 */

import api from "./api";

const employeeService = {
  /**
   * Fetch all employees with optional filters.
   * @param {object} params - { search, page, limit, sortBy, order, department, status }
   */
  getEmployees: async (params = {}) => {
    const response = await api.get("/employees", { params });
    return response.data;
  },

  /** Fetch a single employee by ID */
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  /** Create a new employee */
  createEmployee: async (employeeData) => {
    const response = await api.post("/employees", employeeData);
    return response.data;
  },

  /** Update an existing employee */
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  /** Delete an employee by ID */
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  /** Get dashboard statistics */
  getStats: async () => {
    const response = await api.get("/employees/stats");
    return response.data;
  },
};

export default employeeService;
